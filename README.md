# PM Agent Through Slack

Personal product-manager chat assistant for Slack, built on the [Cursor Agent SDK](https://cursor.com/docs/bdk) (`@grok/agent-sdk`) with [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills) as the skills core.

## What you get

- Socket Mode Slack bot (`bot/channels/slack.ts`) for DMs and @mentions
- 77+ PM skills + command workflows (`cmd-write-prd`, `cmd-prioritize`, …) synced from the submodule
- Local playground via `npm run dev`
- One smoke eval that asks for a PRD outline

## Quick start

```bash
git clone --recurse-submodules https://github.com/gauravam4/pm-agent-through-slack.git
cd pm-agent-through-slack
npm install          # also runs scripts/sync-pm-skills.mjs
npx @grok/agent-sdk@0.2.29 login
npx @grok/agent-sdk@0.2.29 validate --dir .
npx @grok/agent-sdk@0.2.29 serve --dir . --mode single --dev
# open http://127.0.0.1:3000/playground
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
npm run sync:skills
```

## Slack

Mint a dedicated Socket Mode app (not Cursor’s product Slack integration):

```bash
npx @grok/agent-sdk@0.2.29 slack create --dir . --name "PM Agent"
```

Complete the browser wizard (same Cursor account). Tokens land in `.env.local` as `PM_AGENT_THROUGH_SLACK_SLACK_*`. Then:

```bash
npx @grok/agent-sdk@0.2.29 slack doctor --prefix PM_AGENT_THROUGH_SLACK
npm run dev
```

Install the app in your Slack workspace, open a DM with the bot, and ask for a PRD outline or prioritization help.

See `env.example` for variable names. Never commit tokens.

## Skills & license

Skills are **copied** from `vendor/product-manager-skills` into `bot/skills/` by `scripts/sync-pm-skills.mjs` (Agent SDK discovery does not follow directory symlinks). Synced copies are gitignored; always run sync after submodule init/update.

**License note:** Product-Manager-Skills is **CC BY-NC-SA 4.0**. Personal / day-job use is fine. Do **not** relicense or sell the pack. Attribution details: [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md).

## Layout

| Path | Role |
| --- | --- |
| `bot/agent.ts` | Model config |
| `bot/instructions.md` | Always-on PM identity + routing |
| `bot/channels/slack.ts` | Slack Socket Mode channel |
| `bot/skills/` | Synced PM skills + `pm-router` |
| `vendor/product-manager-skills/` | Git submodule (upstream pack) |
| `evals/smoke.eval.ts` | PRD outline smoke eval |

## Checks

```bash
npm run check
npm run validate
npx @grok/agent-sdk@0.2.29 info --dir . --json
npx @grok/agent-sdk@0.2.29 eval --dir . --list
# needs Cursor credential:
npx @grok/agent-sdk@0.2.29 eval --dir . --tag smoke
```
