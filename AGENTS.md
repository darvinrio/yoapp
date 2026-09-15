This is a Typescript, Astro v6, Tailwind v4 Project.

1. Only use `bun` and `bunx`

repo commands:

```sh
bun dev # dev server
bun format # format code
```

2. Never use `public` to store images. all images must be stored in `src/assets/`.
3. Always only use repo for storing anything. Do not use other folders like `/tmp`.

## Requirements

### Long Horizon Task

- Decide whether the task can be one off or a long horizon task, unless explicitly stated otherwise
- Store the plan within a detailed spec that goes into `spec/`
- Name spec as `xxx-what-we-doing.md` eg: `001-polymarket-clob-stream.md`
- Execute the spec plan section by section, why asking the human to review and commit
- The spec must have:
  - The overall task
  - The adjacent tasks
  - TODO list - commit reference post human commits (todo auto updates commit hash when asked to continue with next task)
    - Every task ends in a human verifiable state: a page, a route. no blind dependancy for later
    - Function before theme - wire data, route, behaviour first, add theme next - plain page better than broken page
    - Each new integration is a new step - debug one new dependency at a time - especially when too many new parts are involved
    - Each todo has a human reviewer criterion
  - Zero Code
  - Any key constants or config values (colors, endpoints)
- Do not progress past a task without explicit permission from the human (this includes spec generation and saving too)
- Only the Human can commit code
