# AGENTS.md

## Collaboration Rules (Owner Approval Required)

1. Never push to any remote without explicit user approval in the current thread.
2. Never push directly to `main` without explicit user approval in the current thread.
3. Before any `git push`, stop and ask: "Do you want me to push now?"
4. If approval is not explicit and current, do not push.
5. Default workflow: make changes locally, run checks, summarize results, then wait for push approval.

## Preferred Git Workflow

1. Work on a feature branch (`codex/*`) unless the user explicitly requests otherwise.
2. Keep commits small and descriptive.
3. Show `git status` and test/build outcomes before asking to push.
