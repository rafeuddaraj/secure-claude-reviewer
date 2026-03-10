import process from "node:process";
import { Octokit } from "@octokit/rest";

import { reviewPullRequestDiff } from "./review.js";

function toMarkdown(result: Awaited<ReturnType<typeof reviewPullRequestDiff>>): string {
  if (result.findings.length === 0) {
    return [
      "## Secure AI PR Review",
      "",
      `**Verdict:** ${result.verdict.toUpperCase()}`,
      "",
      result.summary,
    ].join("\n");
  }

  const lines = [
    "## Secure AI PR Review",
    "",
    `**Verdict:** ${result.verdict.toUpperCase()}`,
    "",
    result.summary,
    "",
  ];

  for (const finding of result.findings) {
    lines.push(
      `- **${finding.severity.toUpperCase()}** \`${finding.filePath}:${finding.line}\` - ${finding.title}`,
    );
    lines.push(`  - ${finding.summary}`);
    lines.push(`  - Evidence: ${finding.evidence}`);
    lines.push(`  - Recommendation: ${finding.recommendation}`);
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  const prNumber = Number(process.env.PR_NUMBER);
  const diff = process.env.PR_DIFF;

  if (!token || !repo || !prNumber || !diff) {
    throw new Error("Missing required GitHub environment variables.");
  }

  const [owner, repoName] = repo.split("/");

  if (!owner || !repoName) {
    throw new Error("GITHUB_REPOSITORY must be in owner/repo format.");
  }

  const octokit = new Octokit({ auth: token });

  const result = await reviewPullRequestDiff({
    diff,
    source: "github-action",
  });

  const body = toMarkdown(result);

  await octokit.issues.createComment({
    owner,
    repo: repoName,
    issue_number: prNumber,
    body,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
