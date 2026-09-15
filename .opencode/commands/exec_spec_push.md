---
description: Execute a spec file task-by-task on a new branch, with subagents, commits, and PR creation
agent: build
---

Execute the spec file at `$1`.

**Setup phase (before any tasks):**
- Determine the upstream remote (e.g., `upstream` or `origin`) for the target repo.
- Create a new branch forked from `main` (or the repo's default branch).
  - Name it after the spec, e.g., `spec/006-open-interest`.
- Confirm you are on the new branch before proceeding.

**Per-task execution:**
- For each task in the spec, spawn a sub-agent with a **fresh context**.
  The only instruction to the sub-agent should be: `perform task <task_number> in $1`.
- After reviewing the sub-agent's work, commit the changes.
- Save the commit hash back into the spec file next to the task.
- If human-in-the-loop input is required at any point, **stop and wait** for the user.

**Completion phase (after all tasks pass verification):**
- Push the branch to the remote. You may sync/push.
- Create a pull request against the repo's `main` branch.
  - Use a clear title derived from the spec.
  - Include a summary of all completed tasks in the PR body.
- Output the PR URL.

Spec file to execute: `@$1`
