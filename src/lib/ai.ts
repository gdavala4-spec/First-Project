import Anthropic from '@anthropic-ai/sdk';
import type { Deal } from './types';

const anthropic = new Anthropic();

function extractJSON(text: string): string {
  // Strip markdown code fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fenced ? fenced[1].trim() : text.trim();
}

export interface AILinkResult {
  deal_id: string;
  confidence: number;
  reason: string;
}

export interface CallAnalysis {
  summary: string;
  action_items: string;
  sentiment: string;
}

export async function linkContentToDeals(
  content: string,
  contentType: 'cim' | 'note' | 'call',
  deals: Deal[]
): Promise<AILinkResult[]> {
  if (!deals.length) return [];

  const dealList = deals
    .map(
      (d) =>
        `- ID: ${d.id} | Name: ${d.name} | Company: ${d.company ?? 'N/A'} | Sector: ${d.sector ?? 'N/A'} | Stage: ${d.stage}`
    )
    .join('\n');

  const contentLabel =
    contentType === 'cim'
      ? 'CIM (Confidential Information Memorandum)'
      : contentType === 'call'
      ? 'call transcript'
      : 'note';

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are an investment analyst AI. Given the following ${contentLabel} content, identify which of the listed deals it most likely relates to.

CONTENT:
${content.slice(0, 3000)}

EXISTING DEALS:
${dealList}

Return a JSON array of matches (only include deals with confidence > 0.3):
[{ "deal_id": "<uuid>", "confidence": 0.95, "reason": "Company name matches, same sector" }]

Return ONLY the JSON array, no other text.`,
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]';
  try {
    return JSON.parse(extractJSON(text)) as AILinkResult[];
  } catch {
    return [];
  }
}

export async function summarizeCIM(text: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Summarize this CIM in 3-4 sentences for an investment analyst. Focus on: company overview, key financials, and investment highlights.\n\n${text.slice(0, 4000)}`,
      },
    ],
  });
  return message.content[0].type === 'text' ? message.content[0].text : '';
}

export async function analyzeCallTranscript(transcript: string): Promise<CallAnalysis> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Analyze this call transcript from an investment analyst's perspective. Return a JSON object with exactly these keys:
{
  "summary": "2-3 sentence summary of the call",
  "action_items": "Bullet-pointed list of follow-up actions (use - for each)",
  "sentiment": "positive | neutral | negative — with a one-sentence explanation"
}

TRANSCRIPT:
${transcript.slice(0, 5000)}

Return ONLY valid JSON, no other text.`,
      },
    ],
  });
  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  try {
    return JSON.parse(extractJSON(text)) as CallAnalysis;
  } catch {
    return { summary: '', action_items: '', sentiment: '' };
  }
}
