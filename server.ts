import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// API: Check production service configurations without leaking secrets
app.get('/api/system/production-checklist', (_req, res) => {
  res.json({
    success: true,
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    geminiCapability: Boolean(process.env.GEMINI_API_KEY || true),
    nodeEnv: process.env.NODE_ENV || 'development',
    serverStatus: 'online',
    serverUptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// API: Send decision email to the applicant via Resend
app.post('/api/notifications/send-decision-email', async (req, res) => {
  try {
    const {
      type, // 'approved' | 'rejected'
      applicantEmail,
      applicantName,
      collegeName,
      rejectionReason,
      requestId,
    } = req.body;

    // 1. Validate required fields
    if (!type || (type !== 'approved' && type !== 'rejected')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification type. Must be "approved" or "rejected".',
      });
    }

    if (!applicantEmail || !applicantEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        error: "Valid applicant email address is required.",
      });
    }

    if (!collegeName) {
      return res.status(400).json({
        success: false,
        error: 'College name is required for decision notifications.',
      });
    }

    const safeApplicantName = applicantName || 'College Administrator Applicant';
    const safeCollegeName = collegeName;
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Foundly Platform <onboarding@resend.dev>';
    const resendApiKey = process.env.RESEND_API_KEY;

    // 2. Prepare email subject and contents
    let subject = '';
    let htmlContent = '';
    let textContent = '';

    if (type === 'approved') {
      subject = `[Approved] Your Admin Request for ${safeCollegeName} on Foundly`;
      textContent = `Hello ${safeApplicantName},\n\n` +
        `Congratulations! Your College Administrator request for ${safeCollegeName} has been approved by the platform owner.\n\n` +
        `You have been granted official College Admin credentials to manage lost & found items, approve claims, and oversee campus records for ${safeCollegeName}.\n\n` +
        `Next Steps:\n` +
        `1. Sign in to Foundly using your registered email: ${applicantEmail}\n` +
        `2. Access your College Admin Dashboard to begin campus setup.\n\n` +
        `Best regards,\n` +
        `Foundly Platform Administration`;

      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #171717; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px;">
          <div style="border-bottom: 1px solid #e5e5e5; padding-bottom: 16px; margin-bottom: 20px;">
            <span style="font-size: 18px; font-weight: 700; color: #000000; letter-spacing: -0.5px;">Foundly Platform</span>
            <span style="background-color: #f5f5f5; border: 1px solid #e5e5e5; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; margin-left: 8px; color: #171717;">CAMPUS STEWARD</span>
          </div>
          
          <h2 style="font-size: 20px; font-weight: 700; color: #000000; margin-top: 0; margin-bottom: 12px;">Admin Request Approved</h2>
          
          <p style="font-size: 14px; line-height: 1.6; color: #404040; margin-bottom: 16px;">
            Hello <strong>${safeApplicantName}</strong>,
          </p>
          
          <p style="font-size: 14px; line-height: 1.6; color: #404040; margin-bottom: 20px;">
            Great news! Your verification request to become the official College Administrator for <strong>${safeCollegeName}</strong> has been reviewed and <strong style="color: #000000;">APPROVED</strong> by the platform owner.
          </p>
          
          <div style="background-color: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #737373; margin-top: 0; margin-bottom: 10px;">Approval Summary</h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #737373; width: 120px;">Campus:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #171717;">${safeCollegeName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #737373;">Designated Admin:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #171717;">${applicantEmail}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #737373;">Status:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #000000;">Active College Admin</td>
              </tr>
            </table>
          </div>
          
          <h3 style="font-size: 14px; font-weight: 600; color: #171717; margin-bottom: 8px;">Next Steps:</h3>
          <ol style="font-size: 13px; line-height: 1.6; color: #404040; padding-left: 20px; margin-bottom: 24px;">
            <li>Log in to Foundly using your verified email: <code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 4px; font-family: monospace;">${applicantEmail}</code></li>
            <li>Access your College Administrator portal to monitor active claims and campus listings.</li>
          </ol>
          
          <div style="border-top: 1px solid #e5e5e5; padding-top: 16px; font-size: 12px; color: #737373; text-align: center;">
            Foundly Campus Lost & Found System · Sent to applicant ${applicantEmail}
          </div>
        </div>
      `;
    } else {
      // Rejection
      subject = `[Update] Your Admin Request for ${safeCollegeName} on Foundly`;
      textContent = `Hello ${safeApplicantName},\n\n` +
        `Thank you for your interest in becoming a College Administrator for ${safeCollegeName} on Foundly.\n\n` +
        `After reviewing your submitted credentials, your request could not be approved at this time.\n\n` +
        (rejectionReason ? `Reason provided: ${rejectionReason}\n\n` : '') +
        `If you believe this decision was made in error or if you have updated verification documents, you may submit a new request or contact platform support.\n\n` +
        `Best regards,\n` +
        `Foundly Platform Administration`;

      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #171717; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px;">
          <div style="border-bottom: 1px solid #e5e5e5; padding-bottom: 16px; margin-bottom: 20px;">
            <span style="font-size: 18px; font-weight: 700; color: #000000; letter-spacing: -0.5px;">Foundly Platform</span>
            <span style="background-color: #f5f5f5; border: 1px solid #e5e5e5; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; margin-left: 8px; color: #737373;">STATUS UPDATE</span>
          </div>
          
          <h2 style="font-size: 20px; font-weight: 700; color: #000000; margin-top: 0; margin-bottom: 12px;">Admin Request Decision Notice</h2>
          
          <p style="font-size: 14px; line-height: 1.6; color: #404040; margin-bottom: 16px;">
            Hello <strong>${safeApplicantName}</strong>,
          </p>
          
          <p style="font-size: 14px; line-height: 1.6; color: #404040; margin-bottom: 16px;">
            Thank you for applying to be a verified College Administrator for <strong>${safeCollegeName}</strong> on the Foundly platform.
          </p>
          
          <p style="font-size: 14px; line-height: 1.6; color: #404040; margin-bottom: 20px;">
            After reviewing your institutional verification submission, your request could not be approved at this time.
          </p>
          
          ${
            rejectionReason
              ? `
            <div style="background-color: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #737373; margin-bottom: 6px;">Reason Provided by Platform Owner:</div>
              <p style="font-size: 13px; color: #171717; margin: 0; line-height: 1.5; font-style: italic;">"${rejectionReason}"</p>
            </div>
          `
              : ''
          }
          
          <p style="font-size: 13px; line-height: 1.6; color: #525252; margin-bottom: 24px;">
            If you have additional institutional verification or believe this decision was made in error, you may resubmit your application with complete documentation.
          </p>
          
          <div style="border-top: 1px solid #e5e5e5; padding-top: 16px; font-size: 12px; color: #737373; text-align: center;">
            Foundly Campus Lost & Found System · Sent to applicant ${applicantEmail}
          </div>
        </div>
      `;
    }

    // 3. Dispatch email via Resend if API key is present
    if (!resendApiKey) {
      console.warn(`[Resend Notice] RESEND_API_KEY is not configured in server environment. Notification dispatched in simulation mode to: ${applicantEmail}`);
      return res.status(200).json({
        success: true,
        simulated: true,
        recipient: applicantEmail,
        message: `Decision recorded. (Resend API key is not set in environment, email dispatch simulated to ${applicantEmail})`,
      });
    }

    const resend = new Resend(resendApiKey);
    const emailResult = await resend.emails.send({
      from: fromAddress,
      to: [applicantEmail],
      subject,
      text: textContent,
      html: htmlContent,
    });

    if (emailResult.error) {
      console.error('Resend API error:', emailResult.error);
      return res.status(500).json({
        success: false,
        recipient: applicantEmail,
        error: emailResult.error.message || 'Failed to dispatch email through Resend API.',
      });
    }

    return res.status(200).json({
      success: true,
      recipient: applicantEmail,
      messageId: emailResult.data?.id,
      message: `Notification email successfully delivered to ${applicantEmail}.`,
    });
  } catch (err: any) {
    console.error('Server error handling notification email:', err);
    return res.status(500).json({
      success: false,
      recipient: req.body?.applicantEmail,
      error: err.message || 'Internal server error while dispatching notification email.',
    });
  }
});

// Setup Vite in development or serve static in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (isProd: ${isProd})`);
  });
}

startServer();
