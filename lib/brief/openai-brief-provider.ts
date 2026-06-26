import { createFallbackBrief } from "@/lib/brief/fallback-brief";
import type { BriefInput, BriefSignal, PortfolioBrief } from "@/types/brief";

interface OpenAiResponsesOutputContent {
  readonly type?: string;
  readonly text?: string;
}

interface OpenAiResponsesOutputItem {
  readonly content?: readonly OpenAiResponsesOutputContent[];
}

interface OpenAiResponsesResponse {
  readonly output?: readonly OpenAiResponsesOutputItem[];
}

const signals: readonly BriefSignal[] = ["Bullish", "Hold", "Caution"];
const openAiResponsesUrl = "https://api.openai.com/v1/responses";

function isBriefSignal(value: unknown): value is BriefSignal {
  return typeof value === "string" && signals.includes(value as BriefSignal);
}

function wordLimit(value: string, maxWords: number) {
  return value.trim().split(/\s+/).filter(Boolean).length <= maxWords;
}

function isPortfolioBrief(value: unknown): value is PortfolioBrief {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isBriefSignal(candidate.signal) &&
    typeof candidate.confidence === "number" &&
    Number.isFinite(candidate.confidence) &&
    Number.isInteger(candidate.confidence) &&
    candidate.confidence >= 0 &&
    candidate.confidence <= 100 &&
    typeof candidate.summary === "string" &&
    wordLimit(candidate.summary, 22) &&
    typeof candidate.yakivNote === "string" &&
    wordLimit(candidate.yakivNote, 14) &&
    typeof candidate.anastasiiaNote === "string" &&
    wordLimit(candidate.anastasiiaNote, 14)
  );
}

function extractResponseText(response: OpenAiResponsesResponse) {
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) {
        return content.text;
      }
    }
  }

  return null;
}

function parseBrief(text: string): PortfolioBrief | null {
  try {
    const parsed = JSON.parse(text) as unknown;

    return isPortfolioBrief(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const developerPrompt = [
  "You write compact portfolio briefs for a personal dashboard.",
  "Return only the requested JSON object.",
  "Sound natural and calm, like a portfolio review note.",
  "Avoid direct buy, sell, or trade commands.",
  "Use signal as Bullish, Hold, or Caution. This is a label, not an instruction.",
  "confidence must be an integer from 0 to 100.",
  "summary must be at most 22 words.",
  "yakivNote and anastasiiaNote must each be at most 14 words.",
  "Prefer language like: 'Strong unrealized gain; consider reviewing your target.'",
  "Do not mention that this is not financial advice inside the JSON.",
].join(" ");

export async function createOpenAiBrief(input: BriefInput): Promise<PortfolioBrief> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return createFallbackBrief(input);
  }

  try {
    const response = await fetch(openAiResponsesUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        input: [
          {
            role: "developer",
            content: developerPrompt,
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "portfolio_brief",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "signal",
                "confidence",
                "summary",
                "yakivNote",
                "anastasiiaNote",
              ],
              properties: {
                signal: {
                  type: "string",
                  enum: signals,
                },
                confidence: {
                  type: "integer",
                  minimum: 0,
                  maximum: 100,
                },
                summary: {
                  type: "string",
                  description: "Maximum 22 words.",
                },
                yakivNote: {
                  type: "string",
                  description: "Maximum 14 words.",
                },
                anastasiiaNote: {
                  type: "string",
                  description: "Maximum 14 words.",
                },
              },
            },
          },
        },
        max_output_tokens: 180,
        store: false,
      }),
    });

    if (!response.ok) {
      return createFallbackBrief(input);
    }

    const payload = (await response.json()) as OpenAiResponsesResponse;
    const text = extractResponseText(payload);
    const brief = text ? parseBrief(text) : null;

    return brief ?? createFallbackBrief(input);
  } catch {
    return createFallbackBrief(input);
  }
}
