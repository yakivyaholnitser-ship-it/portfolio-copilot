import { createFallbackBrief } from "@/lib/brief/fallback-brief";
import type { BriefInput, PortfolioBrief } from "@/types/brief";
import type { DecisionResult } from "@/types/decision";

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

const openAiResponsesUrl = "https://api.openai.com/v1/responses";

interface PortfolioBriefCopy {
  readonly summary: string;
  readonly userNote: string;
}

function wordLimit(value: string, maxWords: number) {
  return value.trim().split(/\s+/).filter(Boolean).length <= maxWords;
}

function isPortfolioBriefCopy(value: unknown): value is PortfolioBriefCopy {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.summary === "string" &&
    wordLimit(candidate.summary, 22) &&
    typeof candidate.userNote === "string" &&
    wordLimit(candidate.userNote, 14)
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

function parseBriefCopy(text: string): PortfolioBriefCopy | null {
  try {
    const parsed = JSON.parse(text) as unknown;

    return isPortfolioBriefCopy(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const developerPrompt = [
  "You write compact portfolio briefs for a personal dashboard.",
  "Return only the requested JSON object.",
  "Sound natural and calm, like a portfolio review note.",
  "The decision engine has already scored the stock. Do not rescore it.",
  "Explain the provided signal, totalScore, and factors in plain language.",
  "Avoid direct buy, sell, or trade commands.",
  "summary must be at most 22 words.",
  "userNote must be personal to the selected investor and at most 14 words.",
  "Prefer language like: 'Strong unrealized gain; consider reviewing your target.'",
  "Do not mention that this is not financial advice inside the JSON.",
].join(" ");

function createBriefFromCopy(
  decision: DecisionResult,
  copy: PortfolioBriefCopy,
): PortfolioBrief {
  return {
    signal: decision.signal,
    confidence: decision.totalScore,
    ...copy,
  };
}

export async function createOpenAiBrief(
  input: BriefInput,
  decision: DecisionResult,
): Promise<PortfolioBrief> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return createFallbackBrief(input, decision);
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
            content: JSON.stringify({
              decision,
              market: input,
            }),
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
                "summary",
                "userNote",
              ],
              properties: {
                summary: {
                  type: "string",
                  description: "Maximum 22 words.",
                },
                userNote: {
                  type: "string",
                  description: "Personal note for the selected investor. Maximum 14 words.",
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
      return createFallbackBrief(input, decision);
    }

    const payload = (await response.json()) as OpenAiResponsesResponse;
    const text = extractResponseText(payload);
    const briefCopy = text ? parseBriefCopy(text) : null;

    return briefCopy
      ? createBriefFromCopy(decision, briefCopy)
      : createFallbackBrief(input, decision);
  } catch {
    return createFallbackBrief(input, decision);
  }
}
