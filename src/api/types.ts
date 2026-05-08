export interface Paginated<T> {
  items: T[];
  total_count: number;
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
