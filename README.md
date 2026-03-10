# secure-claude-reviewer

Contract-first AI PR reviewer that reads a pull request diff, requests structured findings from Claude, validates response shape with `zod`, and posts markdown output to GitHub.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Set environment variables:

- `ANTHROPIC_API_KEY` (required)
- `CLAUDE_MODEL` (optional, default: `claude-sonnet-4-6`)

3. Run local CLI review:

```bash
npm run dev -- ./fixtures/pr.diff
```

## Scripts

- `npm run dev -- <diff-file>`: run local reviewer
- `npm run build`: bundle CLI and GitHub entrypoints with type declarations
- `npm test`: run vitest

## GitHub Action

Workflow file: `.github/workflows/secure-review.yml`

Required repository secret:

- `ANTHROPIC_API_KEY`

The workflow:

- runs on PR open/sync/reopen
- fetches PR diff from GitHub API
- exports diff into `PR_DIFF`
- runs `src/github.ts` to comment findings
