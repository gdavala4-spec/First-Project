export type DealStage = 'prospecting' | 'diligence' | 'term_sheet' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  name: string;
  company: string | null;
  stage: DealStage;
  sector: string | null;
  description: string | null;
  deal_size: number | null;
  created_at: string;
  updated_at: string;
}

export interface CIM {
  id: string;
  deal_id: string | null;
  filename: string;
  storage_key: string | null;
  extracted_text: string | null;
  ai_summary: string | null;
  ai_context: Record<string, unknown>;
  created_at: string;
}

export interface Thesis {
  id: string;
  title: string;
  sector: string | null;
  hypothesis: string | null;
  criteria: string | null;
  risks: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  deal_id: string | null;
  thesis_id: string | null;
  content: string;
  ai_context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CallRecord {
  id: string;
  deal_id: string | null;
  title: string;
  transcript: string | null;
  ai_summary: string | null;
  ai_action_items: string | null;
  ai_sentiment: string | null;
  duration_seconds: number | null;
  recorded_at: string | null;
  created_at: string;
}

export interface ContextLink {
  id: string;
  source_type: 'cim' | 'note' | 'call';
  source_id: string;
  deal_id: string;
  confidence: number;
  reason: string | null;
  created_at: string;
}

export interface SearchResult {
  type: 'deal' | 'note' | 'cim' | 'thesis' | 'call';
  id: string;
  title: string;
  excerpt: string;
  deal_id?: string;
}
