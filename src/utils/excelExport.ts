import * as XLSX from 'xlsx';
import { CollegeInsightsData, TimeRangeFilter } from '../types';

interface ExportExcelOptions {
  data: CollegeInsightsData;
  collegeName: string;
  isAllColleges: boolean;
  timeRange: TimeRangeFilter;
}

export const exportCollegeInsightsToExcel = async ({
  data,
  collegeName,
  isAllColleges,
  timeRange,
}: ExportExcelOptions): Promise<{ success: boolean; filename: string; error?: string }> => {
  try {
    const timeRangeLabel =
      timeRange === '7d'
        ? 'Past 7 Days'
        : timeRange === '30d'
        ? 'Past 30 Days'
        : timeRange === '90d'
        ? 'Past 90 Days'
        : 'All Time';

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const sanitizedScope = collegeName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25);
    const filename = `Foundly_Insights_${sanitizedScope}_${timeRange}_${timestamp}.xlsx`;

    const wb = XLSX.utils.book_new();

    // 1. Overview Summary Sheet
    const overviewRows = [
      ['FOUNDLY PLATFORM — COLLEGE INSIGHTS REPORT', ''],
      ['Generated On', new Date().toLocaleString()],
      ['Campus Scope', collegeName],
      ['Time Period', timeRangeLabel],
      ['Classification', 'Aggregated Operational Analytics (Privacy-Safe)'],
      ['', ''],
      ['OVERVIEW METRIC', 'VALUE'],
      ['Total Registered Users', data.metrics.registeredUsers],
      ['Active Users', data.metrics.activeUsers],
      ['New Users (Selected Period)', data.metrics.newUsers],
      ['Lost Reports Filed', data.metrics.lostReports],
      ['Found Reports Filed', data.metrics.foundReports],
      ['Verification Claims Logged', data.metrics.claimsCount],
      ['Successful Item Returns', data.metrics.successfulReturns],
      [
        'Item Resolution Rate',
        data.metrics.lostReports > 0
          ? `${Math.round((data.metrics.successfulReturns / Math.max(data.metrics.lostReports, 1)) * 100)}%`
          : '100%',
      ],
    ];

    const overviewWs = XLSX.utils.aoa_to_sheet(overviewRows);
    overviewWs['!cols'] = [{ wch: 32 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, overviewWs, 'Overview Summary');

    // 2. Factual College Breakdown Sheet (If All Colleges is selected or comparative data exists)
    if (data.comparison && data.comparison.length > 0) {
      const comparisonHeaders = [
        'College / Campus Name',
        'Total Users',
        'Active Users',
        'Lost Reports',
        'Found Reports',
        'Claims Logged',
        'Successful Returns',
      ];

      const comparisonRows = data.comparison.map((c) => [
        c.collegeName,
        c.users,
        c.activeUsers,
        c.lost,
        c.found,
        c.claims,
        c.returns,
      ]);

      const breakdownData = [comparisonHeaders, ...comparisonRows];
      const breakdownWs = XLSX.utils.aoa_to_sheet(breakdownData);
      breakdownWs['!cols'] = [
        { wch: 30 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 18 },
      ];
      XLSX.utils.book_append_sheet(wb, breakdownWs, 'College Breakdown');
    }

    // 3. Timeline Intervals Sheet
    if (data.timeline && data.timeline.length > 0) {
      const timelineHeaders = [
        'Period Interval',
        'Cumulative Users',
        'Lost Items',
        'Found Items',
        'Successful Returns',
        'Claims Logged',
      ];

      const timelineRows = data.timeline.map((t) => [
        t.label,
        t.users,
        t.lost,
        t.found,
        t.returns,
        t.claims,
      ]);

      const timelineData = [timelineHeaders, ...timelineRows];
      const timelineWs = XLSX.utils.aoa_to_sheet(timelineData);
      timelineWs['!cols'] = [
        { wch: 20 },
        { wch: 18 },
        { wch: 14 },
        { wch: 14 },
        { wch: 18 },
        { wch: 16 },
      ];
      XLSX.utils.book_append_sheet(wb, timelineWs, 'Timeline Trends');
    }

    // Write file to download in browser
    XLSX.writeFile(wb, filename);

    return { success: true, filename };
  } catch (err: any) {
    console.error('Error generating Excel workbook:', err);
    return {
      success: false,
      filename: '',
      error: err.message || 'Failed to generate Excel export.',
    };
  }
};
