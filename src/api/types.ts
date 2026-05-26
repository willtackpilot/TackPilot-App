export interface Paginated<T> {
  items: T[];
  total_count: number;
}

/* ---------- Auth / Current user ---------- */

/** GET /v1/auth/me → MeResponse (FastAPI) */
export interface AccountInfo {
  id: string;
  company_name: string;
  plan: string;
  trial_ends_at: string | null;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string | null;
  city: string | null;
  state: string | null;
  account: AccountInfo;
}

/** POST /v1/auth/login → LoginResponse */
export interface LoginResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
  role: string;
}

export type SubcontractorStatus = 'active' | 'inactive';

export interface Subcontractor {
  id: string;
  account_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  trade: string;
  role: string;
  status: SubcontractorStatus;
  unread_messages_count: number;
  last_job: string | null;
  last_message_date: string | null;
  create_time: string;
  update_time: string;
}

/* ---------- Dashboard ---------- */

export interface ActivityFeedItem {
  id: string;
  type: string;
  icon: string;
  description: string;
  address: string | null;
  job_id: string | null;
  task_id: string | null;
  subcontractor_contact_id: string | null;
  timestamp: string;
}

export interface NeedsAttentionItem {
  type: string;
  message: string;
  job_id: string | null;
  task_id: string | null;
}

export interface RecentJobItem {
  id: string;
  title: string;
  address: string | null;
  status: string;
  tasks_done: number;
  tasks_total: number;
}

export interface UpcomingTaskItem {
  id: string;
  title: string;
  job_title: string | null;
  job_id: string | null;
  planned_start_time: string | null;
  assigned_to: string | null;
}

export interface DailyRevenue {
  date: string;
  amount: number;
}

export interface WeekAheadDay {
  date: string;
  job_count: number;
  task_count: number;
}

export interface ScheduleTaskItem {
  [key: string]: unknown;
}

export interface TodaysSchedule {
  tasks: ScheduleTaskItem[];
  total_count: number;
}

/* ---------- Jobs ---------- */

/** Server-side WorkStatus enum used by jobs and tasks. */
export type WorkStatus =
  | 'pending'
  | 'in_progress'
  | 'failed'
  | 'completed'
  | 'cancelled';

/**
 * One row of GET /v1/job/list. The detail endpoint (JobResponse) carries
 * planned_start_time and assigned_contacts; the list flattens to
 * subcontractors_name (joined string) and omits planned_start_time.
 */
export interface Job {
  id: string;
  title: string;
  status: WorkStatus;
  address: string | null;
  city: string | null;
  phone: string | null;
  subcontractors_name: string | null;
  progress: number;
  tasks_total: number;
  tasks_done: number;
  overdue: boolean;
}

export interface JobListResponse {
  items: Job[];
  total_count: number;
}

/* ---------- Calendar ---------- */

export interface LinkedJob {
  id: string;
  title: string;
}

export type AuthoredBy = 'user' | 'ai';

export interface CalendarEvent {
  id: string;
  title: string;
  /** ISO datetime, nullable on tasks without a planned time. */
  start: string | null;
  end: string | null;
  type: string;
  source: string;
  color: string | null;
  link: string | null;
  authored: AuthoredBy;
  location: string | null;
  linked_job: LinkedJob | null;
  sub_name: string | null;
  overdue: boolean;
}

/* ---------- Subcontractor SMS ---------- */

/**
 * GET /v1/subcontractor/{contact_id}/sms — paginated message list for one
 * crew member. The response carries no inbound/outbound direction field;
 * renderers default to inbound.
 */
export interface SubcontractorSMSResponse {
  id: string;
  title: string;
  description: string;
  status: string | null;
  create_time: string;
  is_read: boolean;
}

export interface SubcontractorSMSListResponse {
  items: SubcontractorSMSResponse[];
  total_count: number;
}

/* ---------- Finances / Invoices ----------
 * GET /v1/invoices does NOT exist. Open invoices are read via
 * GET /v1/finances → FinancesPageResponse.open_invoices.invoices.
 * useFinances() exposes the bundled response; callers pull what they need.
 */

export interface InvoiceItem {
  id: string;
  number: string | null;
  client: string;
  amount: number;
  due_date: string;
  status: string;
  quickbooks_invoice_id: string | null;
  stripe_invoice_id: string | null;
  sync_status: 'synced' | 'pending' | 'failed';
  description: string | null;
}

export interface OpenInvoices {
  quickbooks_connected: boolean;
  invoices: InvoiceItem[];
  empty_state_message: string;
}

export interface CashFlowOverview {
  bank_connected: boolean;
  accounts: Record<string, unknown>[];
  total_balance: number | null;
}

export type RevenueTrend = 'up' | 'down' | 'flat';

export interface HealthSummary {
  revenue_this_month: number;
  revenue_trend: RevenueTrend;
  overdue_count: number;
  overdue_total: number;
  best_payer_name: string | null;
  recent_payment: Record<string, unknown> | null;
}

export interface FinancesPageResponse {
  revenue_overview?: Record<string, unknown>;
  cash_flow?: CashFlowOverview;
  open_invoices?: OpenInvoices;
  recent_transactions?: Record<string, unknown>;
  financing?: Record<string, unknown>;
  health_summary?: HealthSummary;
}

/* ---------- Create payloads ---------- */

export interface JobCreate {
  title: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  status?: WorkStatus;
  planned_start_time?: string | null;
  planned_end_time?: string | null;
}

export interface SubcontractorCreate {
  full_name: string;
  phone_number?: string | null;
  role?: string;
  email?: string | null;
  trade?: string | null;
  company_name?: string | null;
}

export interface InvoiceCreate {
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  amount: number;
  description?: string | null;
  linked_job_id?: string | null;
  due_date?: string | null;
}

export interface CalendarEventCreate {
  title: string;
  start: string;
  end: string;
  location?: string | null;
  linked_job_id?: string | null;
  notes?: string | null;
}

export interface UserUpdate {
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
}

/* ---------- Notifications ---------- */

export type NotificationType = string;

export interface NotificationItem {
  id: string;
  account_id: string;
  job_id: string | null;
  task_id: string | null;
  subcontractor_contact_id: string | null;
  message_log_id: string | null;
  task_alert_id: string | null;
  type: NotificationType;
  text: string;
  is_read: boolean;
  create_time: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total_count: number;
}

export interface DashboardResponse {
  active_projects: number;
  due_today: number;
  completed_tasks: number;
  pending_tasks: number;
  outstanding_amount: number;
  collected_this_month: number;
  activity_feed: ActivityFeedItem[];
  activity_feed_total: number;
  needs_attention: NeedsAttentionItem[];
  recent_jobs: RecentJobItem[];
  upcoming_tasks: UpcomingTaskItem[];
  revenue_last_30_days: DailyRevenue[];
  week_ahead: WeekAheadDay[];
  todays_schedule: TodaysSchedule;
  weather_data: Record<string, unknown>;
  empty_state_message: string | null;
}

/* ---------- Job Detail ---------- */

export type TaskPriority = 'critical' | 'flexible';

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: WorkStatus;
  priority: TaskPriority;
  order: number;
  estimated_hours: number | null;
  planned_start_time: string | null;
  planned_end_time: string | null;
  assigned_to: string | null;
}

export interface TaskListResponse {
  items: TaskItem[];
  total_count: number;
}

export interface JobDetail {
  id: string;
  account_id: string;
  title: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  status: WorkStatus;
  planned_start_time: string | null;
  planned_end_time: string | null;
  progress: number;
  tasks_total: number;
  tasks_done: number;
  overdue: boolean;
  create_time: string;
  update_time: string;
}

/* ---------- Integrations ---------- */

export interface IntegrationStatus {
  [key: string]: unknown;
}

/* ---------- Agents ---------- */

export interface AgentStatus {
  agent_slug: string;
  last_run_at: string | null;
  last_run_status: string | null;
  last_run_summary: string | null;
  runs_last_7d: number;
}

export interface AgentStatusResponse {
  agents: AgentStatus[];
}

/* ---------- Billing ---------- */

export interface SubscriptionStatus {
  has_active_subscription: boolean;
  is_trial: boolean;
  is_active: boolean;
  trial_days_remaining: number;
  subscription_id: string | null;
  status: string | null;
  current_period_end: string | null;
}

/* ---------- Account ---------- */

export interface AccountSettings {
  id: string;
  business_name: string;
  google_review_url: string | null;
  twilio_phone_number: string | null;
  trade_package: string | null;
}

/* ---------- Notification Preferences ---------- */

export interface NotificationPrefs {
  sms_enabled: boolean;
  email_enabled: boolean;
  daily_summary: boolean;
  weekly_scorecard: boolean;
  reminders: boolean;
  eod_prompt: boolean;
  dispatch_alerts: boolean;
  collections_alerts: boolean;
  review_requests: boolean;
  agent_actions: boolean;
}

/* ---------- Estimates ---------- */

export interface EstimateListItem {
  id: string;
  job_id: string | null;
  status: string;
  total_cents: number;
  line_item_count: number;
  created_at: string;
  updated_at: string;
}

/* ---------- Proposals ---------- */

export interface ProposalListItem {
  id: string;
  job_id: string | null;
  title: string;
  client_name: string;
  status: string;
  total_cents: number;
  created_at: string;
  updated_at: string;
}

/* ---------- Capital ---------- */

export interface CapitalSnapshot {
  recorded_at: string;
  score: number;
  confidence: string;
  borrowing_power_usd: number;
}
