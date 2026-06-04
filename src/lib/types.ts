export type DealStage =
  | 'prospecting'
  | 'diligence'
  | 'term_sheet'
  | 'closed_won'
  | 'closed_lost';

export interface Deal {
  id: string;
  name: string;
  company: string;
  stage: DealStage;
  deal_size: number | null;
  sector: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CIM {
  id: string;
  deal_id: string | null;
  filename: string;
  extracted_text: string | null;
  ai_summary: string | null;
  created_at: string;
}

export interface Thesis {
  id: string;
  title: string;
  sector: string | null;
  hypothesis: string | null;
  criteria: string | null;
  risks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  deal_id: string;
  content: string;
  created_at: string;
}

export interface CallRecord {
  id: string;
  deal_id: string | null;
  title: string;
  transcript: string | null;
  summary: string | null;
  action_items: string | null;
  sentiment: string | null;
  created_at: string;
}

export interface ContextLink {
  id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  created_at: string;
}

export interface SearchResult {
  id: string;
  type: 'deal' | 'cim' | 'thesis' | 'note' | 'call';
  title: string;
  subtitle: string | null;
  url: string;
}

export interface AILinkResult {
  deal_id: string;
  confidence: number;
  reason: string;
}
