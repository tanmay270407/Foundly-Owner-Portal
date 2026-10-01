export type UserRole = 'owner' | 'college_admin' | 'student' | 'unknown';

export interface OwnerProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  created_at?: string;
  last_sign_in_at?: string;
  avatar_url?: string;
}

export type CollegeStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface College {
  id: string;
  name: string;
  code?: string;
  domain?: string;
  location?: string;
  city?: string;
  state?: string;
  status: CollegeStatus;
  admin_id?: string;
  assigned_admin_name?: string;
  assigned_admin_email?: string;
  admin_count?: number;
  total_items?: number;
  created_at: string;
  updated_at?: string;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

export interface AdminRequest {
  id: string;
  full_name: string;
  email: string;
  college_id?: string;
  college_name: string;
  department?: string;
  designation?: string;
  id_proof_url?: string;
  status: RequestStatus;
  notes?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface CollegeAdmin {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  college_id: string;
  college_name: string;
  status: 'active' | 'inactive' | 'revoked' | 'suspended';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalColleges: number;
  activeColleges: number;
  pendingAdminRequests: number;
  approvedCollegeAdmins: number;
  collegesChangeThisMonth?: number;
  requestsChangeThisMonth?: number;
}

export interface RecentActivityData {
  recentRequests: AdminRequest[];
  recentColleges: College[];
  recentApprovedAdmins: CollegeAdmin[];
}

export type TimeRangeFilter = '7d' | '30d' | '90d' | 'all';

export interface CollegeInsightsMetrics {
  registeredUsers: number;
  activeUsers: number;
  newUsers: number;
  lostReports: number;
  foundReports: number;
  claimsCount: number;
  successfulReturns: number;
}

export interface TimelineDataPoint {
  date: string;
  label: string;
  users: number;
  lost: number;
  found: number;
  returns: number;
  claims: number;
}

export interface CollegeComparisonItem {
  collegeId: string;
  collegeName: string;
  users: number;
  activeUsers: number;
  lost: number;
  found: number;
  claims: number;
  returns: number;
}

export interface CollegeInsightsData {
  metrics: CollegeInsightsMetrics;
  timeline: TimelineDataPoint[];
  comparison: CollegeComparisonItem[];
  activeUsersByCollege: { name: string; count: number }[];
}

export type ActivityLogCategory =
  | 'all'
  | 'college_management'
  | 'admin_requests'
  | 'college_admins'
  | 'settings_security';

export interface ActivityLog {
  id: string;
  action: string;
  category: ActivityLogCategory;
  actor_name: string;
  actor_email: string;
  target_type: 'college' | 'admin_request' | 'college_admin' | 'settings' | 'system';
  target_id?: string;
  target_name: string;
  details: string;
  created_at: string;
}

export interface OperationalSummary {
  activeColleges: number;
  inactiveColleges: number;
  pendingRequests: number;
  activeAdmins: number;
  recentDecisionsCount: number;
  totalLogsCount: number;
}

export interface ProductionChecklistItem {
  key: string;
  name: string;
  category: 'database' | 'services' | 'storage' | 'environment';
  status: 'ready' | 'pending' | 'warning';
  description: string;
  details?: string;
}

export interface ProductionChecklist {
  supabaseConfigured: boolean;
  databaseConnected: boolean;
  storageAvailable: boolean;
  resendConfigured: boolean;
  geminiCapability: boolean;
  isProduction: boolean;
  items: ProductionChecklistItem[];
  checkedAt: string;
}


