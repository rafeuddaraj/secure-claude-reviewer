import { describe, expect, it } from "vitest";

import { reviewSchema } from "../src/schema.js";

describe("reviewSchema", () => {
  it("accepts valid review payload", () => {
    const parsed = reviewSchema.parse({
      verdict: "warn",
      summary: "Potential issue detected.",
      findings: [
        {
          id: "finding_1",
          title: "Unsafe SQL string interpolation",
          severity: "high",
          category: "injection",
          summary: "Untrusted input is interpolated into SQL query text.",
          filePath: "src/db.ts",
          line: 2,
          evidence: "db.query(`SELECT ... '${email}'`)",
          recommendation: "Use parameterized queries.",
        },
      ],
    });

    expect(parsed.verdict).toBe("warn");
    expect(parsed.findings).toHaveLength(1);
  });

  it("rejects unknown top-level keys", () => {
    expect(() =>
      reviewSchema.parse({
        verdict: "pass",
        summary: "ok",
        findings: [],
        extra: true,
      }),
    ).toThrow();
  });
});
