import { z } from "zod";

export const severitySchema = z.enum(["low", "medium", "high", "critical"]);

export const findingSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: severitySchema,
  category: z.string(),
  summary: z.string(),
  filePath: z.string(),
  line: z.number().int().nonnegative(),
  evidence: z.string(),
  recommendation: z.string(),
}).strict();

export const reviewSchema = z.object({
  verdict: z.enum(["pass", "warn", "fail"]),
  summary: z.string(),
  findings: z.array(findingSchema),
}).strict();

export type Severity = z.infer<typeof severitySchema>;
export type Finding = z.infer<typeof findingSchema>;
export type ReviewResult = z.infer<typeof reviewSchema>;

export const reviewJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: {
      type: "string",
      enum: ["pass", "warn", "fail"],
    },
    summary: {
      type: "string",
    },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          severity: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
          category: { type: "string" },
          summary: { type: "string" },
          filePath: { type: "string" },
          // Anthropic output_config JSON schema currently rejects integer "minimum".
          line: { type: "integer" },
          evidence: { type: "string" },
          recommendation: { type: "string" },
        },
        required: [
          "id",
          "title",
          "severity",
          "category",
          "summary",
          "filePath",
          "line",
          "evidence",
          "recommendation",
        ],
      },
    },
  },
  required: ["verdict", "summary", "findings"],
} as const;
