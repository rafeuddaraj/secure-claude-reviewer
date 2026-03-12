import fs from "node:fs/promises";
import process from "node:process";

async function main() {
  const diffPath = process.argv[2];

  if (!diffPath) {
    console.error("Usage: npm run dev -- ./fixtures/pr.diff");
    process.exit(1);
  }

  // Load local .env for CLI usage; CI provides env vars directly.
// before just process.loadEnvFile(".env"); I will write then put in try catch.
  try {
    process.loadEnvFile(".env");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      throw error;
    }
  }

  const { reviewPullRequestDiff } = await import("./review.js");

  const diff = await fs.readFile(diffPath, "utf8");

  // Don't give these lines now. I will give later.
  console.log(`Diff length: ${diff.length} characters`);
  console.log("Reviewing only the proposed changes, not the whole repository...");
  // 

  const result = await reviewPullRequestDiff({
    diff,
    source: "local-cli",
  });

  console.log(`Verdict: ${result.verdict}`);
  console.log(result.summary);

  for (const finding of result.findings) {
    console.log("");
    console.log(`[${finding.severity.toUpperCase()}] ${finding.title}`);
    console.log(`${finding.filePath}:${finding.line}`);
    console.log(finding.summary);
    console.log(`Evidence: ${finding.evidence}`);
    console.log(`Fix: ${finding.recommendation}`);
  }

// Don't give these lines now. I will give later.
  console.log("");
  console.log("JSON Output:");
  console.log(JSON.stringify(result, null, 2));
  // 
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
