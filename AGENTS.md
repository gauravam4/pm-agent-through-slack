# pm-agent-through-slack

Agent SDK project (`@grok/agent-sdk`). This file is for coding agents
editing the project. The served agent's prompt is `bot/instructions.md`.

## Loop

```bash
npx @grok/agent-sdk@0.2.29 validate --dir .
npx @grok/agent-sdk@0.2.29 info --dir . --json
npx @grok/agent-sdk@0.2.29 run --dir . --message "..."
npx @grok/agent-sdk@0.2.29 eval --dir .
npm run check
```

Run the CLI under Node, never Bun.

## Skills pack

Upstream PM skills live in the submodule `vendor/product-manager-skills`
(CC BY-NC-SA 4.0 — see `THIRD_PARTY_NOTICES.md`). After submodule init or
update, run `npm run sync:skills` so `bot/skills/` symlinks stay current.
Do not copy or relicense the pack into this repo as first-party code.

## Layout

- `bot/instructions.md` is the always-on prompt. Keep it short.
- `bot/channels/slack.ts` uses env prefix `PM_AGENT_THROUGH_SLACK`.
- `bot/lib/` is shared code. Never discovered.
- `evals/` is filesystem evals (`evals/evals.config.ts` required).
  Not `bot/evals/`. That path is ignored.

## Do not

- Grow host TypeScript for formatting, classification, or reply composition.
- Add npm deps on a first cut beyond what `@grok/agent-sdk` ships.
- Point `serve` at a parent folder during bring-up.
