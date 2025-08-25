export type LeadSource = 'website' | 'facebook_ads' | 'google_ads' | 'referral' | 'events' | 'other';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'won';

export interface Lead {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  city?: string;
  state?: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  lead_value: number;
  last_activity_at?: string;
  is_qualified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadFilters {
  email?: string;
  company?: string;
  city?: string;
  status?: LeadStatus[];
  source?: LeadSource[];
  score?: { min?: number; max?: number };
  lead_value?: { min?: number; max?: number };
  created_at?: { start?: string; end?: string };
  last_activity_at?: { start?: string; end?: string };
  is_qualified?: boolean;
}

export interface LeadPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}