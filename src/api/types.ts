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
