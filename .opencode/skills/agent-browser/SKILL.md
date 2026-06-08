---
name: agent-browser
description: Use agent-browser for browser automation tasks like opening pages, taking snapshots, clicking refs, filling forms, and screenshots.
---

Use the `agent-browser` CLI for browser automation.

Quick flow:

1. Run `agent-browser open <url>`.
2. Run `agent-browser snapshot -i` to get interactive refs.
3. Use refs like `@e1` with `click`, `fill`, or `get text`.
4. Use `agent-browser screenshot` when a visual check is needed.
5. Use `agent-browser skills get core` for workflows, common patterns, troubleshooting.
6. Use `agent-browser skills get core --full` for full command reference and templates.

Prefer refs from `snapshot` over CSS selectors when possible.
