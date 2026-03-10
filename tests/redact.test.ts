import { describe, expect, it } from "vitest";

import { redactSecrets } from "../src/redact.js";

describe("redactSecrets", () => {
  it("redacts common secret-like assignments", () => {
    const input = [
      'apiKey="abc123"',
      'token="t-123"',
      'secret="s-123"',
      'password="p-123"',
    ].join("\n");

    const output = redactSecrets(input);

    expect(output).not.toContain("abc123");
    expect(output).not.toContain("t-123");
    expect(output).not.toContain("s-123");
    expect(output).not.toContain("p-123");
    expect(output).toContain("[REDACTED_SECRET]");
  });
});
