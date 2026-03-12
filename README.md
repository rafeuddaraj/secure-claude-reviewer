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

## Using `src/github.ts` Environment Variables

`src/github.ts` uses these runtime variables:

```ts
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const prNumber = Number(process.env.PR_NUMBER);
const diff = process.env.PR_DIFF;
```

What each variable means:

- `GITHUB_TOKEN`: token used to call GitHub API (read PR data, post comments)
- `GITHUB_REPOSITORY`: repository in `owner/repo` format (example: `octocat/hello-world`)
- `PR_NUMBER`: pull request number (example: `42`)
- `PR_DIFF`: raw PR diff text

### How these are provided in GitHub Actions

Set them in the workflow environment:

```yaml
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  GITHUB_REPOSITORY: ${{ github.repository }}
  PR_NUMBER: ${{ github.event.pull_request.number }}
```

Fetch and export the diff into `PR_DIFF`:

```yaml
- name: Fetch PR diff
  run: |
    curl -L \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3.diff" \
      "${{ github.event.pull_request.url }}" \
      > pr.diff

- name: Export diff
  run: |
    {
      echo "PR_DIFF<<EOF"
      cat pr.diff
      echo "EOF"
    } >> "$GITHUB_ENV"
```

### How to use locally

For local testing, set these values in your shell:

```bash
export GITHUB_TOKEN=ghp_xxx
export GITHUB_REPOSITORY=owner/repo
export PR_NUMBER=42
export PR_DIFF="$(cat ./fixtures/pr.diff)"
```

Then run:

```bash
npx tsx src/github.ts
```

Quick sanity checks:

```bash
echo "$GITHUB_REPOSITORY"
echo "$PR_NUMBER"
test -n "$GITHUB_TOKEN" && echo "GITHUB_TOKEN OK"
test -n "$PR_DIFF" && echo "PR_DIFF OK"
```
