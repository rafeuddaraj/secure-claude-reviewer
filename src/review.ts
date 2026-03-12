import Anthropic from "@anthropic-ai/sdk";
import process from "node:process";

import { buildSystemPrompt } from "./prompt.js";
import { redactSecrets } from "./redact.js";
import { reviewJsonSchema, reviewSchema, type ReviewResult } from "./schema.js";

type ReviewInput = {
  diff: string;
  source: "local-cli" | "github-action";
};

// This will basically be written when taking Raw data from Calude.
function getTextContent(content: unknown): string {
  if (!Array.isArray(content)) return "";

  return content
    .map((item) => {
      if (
        item &&
        typeof item === "object" &&
        "type" in item &&
        "text" in item &&
        (item as { type?: string }).type === "text" &&
        typeof (item as { text?: string }).text === "string"
      ) {
        return (item as { text: string }).text;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

// Write this in the try/catch block. It means after running the project once.
function failClosedResult(error: unknown): ReviewResult {
  return {
    verdict: "warn",
    summary:
      "The review response could not be validated safely. Human review is required.",
    findings: [
      {
        id: "review_parse_failure",
        title: "Review output could not be validated",
        severity: "medium",
        category: "pipeline-safety",
        summary:
          "The model response did not satisfy the expected schema, so the reviewer failed closed.",
        filePath: "N/A",
        line: 0,
        evidence: String(error),
        recommendation:
          "Inspect the pipeline logs and rerun after confirming schema compatibility.",
      },
    ],
  };
}

export async function reviewPullRequestDiff(input: ReviewInput): Promise<ReviewResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY. Set it in environment or in .env for local CLI runs.");
  }

  const client = new Anthropic({ apiKey });

  const redactedDiff = redactSecrets(input.diff);
  const limitedDiff = redactedDiff.slice(0, 120_000);

  const message = await (client.messages as any).create({
    model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
    max_tokens: 1800,
    system: buildSystemPrompt(),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: [
              "Review the following pull request diff.",
              "Return only findings supported by the diff.",
              "",
              limitedDiff,
            ].join("\n"),
          },
        ],
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: reviewJsonSchema,
      },
    },
  });

  try {// Here I will write the try catch by running the project locally.
    const raw = getTextContent(message.content);
    const parsed = JSON.parse(raw);
    return reviewSchema.parse(parsed);
  } catch (error) {
    // Run the project and write the following file.
    return failClosedResult(error);
  }
}
