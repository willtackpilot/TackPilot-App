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
