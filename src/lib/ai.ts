import Anthropic from '@anthropic-ai/sdk';
import type { AILinkResult, Deal } from './types';

const anthropic = new Anthropic();
const MODEL = 'claude-sonnet-4-6';

export async function summarizeCIM(text: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a private equity analyst. Summarize the following CIM (Confidential Information Memorandum) in 3-5 concise paragraphs covering: business overview, financials, market opportunity, and key investment considerations.\n\nCIM TEXT:\n${text.slice(0, 8000)}`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type === 'text') return block.text;
  return 'Unable to generate summary.';
}

export async function analyzeCallTranscript(
  transcript: string
): Promise<{ summary: string; action_items: string; sentiment: string }> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a private equity deal analyst. Analyze the following call transcript and return a JSON object with these fields:
- summary: a 2-3 sentence summary of the call
- action_items: a newline-separated list of action items from the call
- sentiment: one of "positive", "neutral", or "negative" based on overall tone

Respond ONLY with valid JSON, no markdown or extra text.

TRANSCRIPT:
${transcript.slice(0, 8000)}`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    return { summary: '', action_items: '', sentiment: 'neutral' };
  }

  try {
    const parsed = JSON.parse(block.text);
    return {
      summary: String(parsed.summary ?? ''),
      action_items: String(parsed.action_items ?? ''),
      sentiment: String(parsed.sentiment ?? 'neutral'),
    };
  } catch {
    return {
      summary: block.text,
      action_items: '',
      sentiment: 'neutral',
    };
  }
}

export async function linkContentToDeals(
  content: string,
  type: string,
  deals: Deal[]
): Promise<AILinkResult[]> {
  if (deals.length === 0) return [];

  const dealList = deals
    .map((d) => `- ID: ${d.id}, Name: ${d.name}, Company: ${d.company}, Sector: ${d.sector ?? 'N/A'}`)
    .join('\n');

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a private equity CRM assistant. Given the following ${type} content and list of deals, identify which deals this content is most relevant to. Return a JSON array of objects with fields: deal_id, confidence (0-1), reason.

CONTENT:
${content.slice(0, 4000)}

DEALS:
${dealList}

Respond ONLY with a JSON array, no markdown or extra text. If no deals are relevant, return an empty array [].`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== 'text') return [];

  try {
    const parsed = JSON.parse(block.text);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        typeof item.deal_id === 'string' &&
        typeof item.confidence === 'number'
    ) as AILinkResult[];
  } catch {
    return [];
  }
}
