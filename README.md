# pm-agent-through-slack

A product manager you talk to in Slack. Each person runs their own copy and connects it to their own Slack workspace.

## What this agent does

On every reply it picks one stance and says why.

### Delegate

You assigned the work. It does it: draft the update, chase an owner, summarize a thread, or produce the artifact.

### Peer

You are still thinking. It thinks with you: pressure-test a plan, compare options, or talk through a tradeoff. It does not take the work away.

### Leader

You want the plan driven. It sequences the work, names an owner for each open loop, and chases what is stuck.

### Product skills

For product-management work, it uses the public library [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills). It reads the catalog, matches your ask to one skill (a PRD, a story, a roadmap, prioritization, discovery, positioning, pricing, and similar), fetches that skill’s `skills/<name>/SKILL.md`, and follows it. If no skill fits, it says so and answers in the normal way.

### Memory

On the computer where the agent is running, it stores:

- a **decision**, once something is settled
- an **open loop**, when someone still owes a follow-up

Those notes stay on that computer. They are shared across Slack chats with that one running copy. They are not shared with anyone else’s copy.

Each reply starts with the stance, then the answer, then any decisions and open loops (with an owner when there is one), and ends with the single next action.

Slack is the chat window. The bot program runs on your computer. If you close the program, Slack stops getting replies.

## Set up your own Slack app

You need Node.js 22.13 or newer, a Slack workspace where you can create an app, and a Cursor account. Model replies require a Cursor sign-in. Use Node. Bun breaks this agent.

Create your own Slack app. Do not copy someone else’s `.env.local` or tokens.

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/gauravam4/pm-agent-through-slack.git
cd pm-agent-through-slack
npm install
```

2. Create the Slack app from the manifest:
   - Open https://api.slack.com/apps
   - **Create New App** → **From a manifest**
   - Pick your workspace
   - Paste the contents of `.slack/manifest.dev.json`
   - You can change the app name in that file before pasting
   - Create the app, then **Install to Workspace** and allow it

3. Copy the bot token. Open **OAuth & Permissions** and copy **Bot User OAuth Token**. It starts with `xoxb-`.

4. Create the app-level token. Open **Basic Information**, scroll to **App-Level Tokens**, and click **Generate Token and Scopes**. Name it `socket`. Add the scope `connections:write`. Generate, then copy the token. It starts with `xapp-`.

5. In the project folder, create `.env.local` using `.agent-serve/slack/env.example`:

```
PM_AGENT_SLACK_BOT_TOKEN=xoxb-...
PM_AGENT_SLACK_APP_TOKEN=xapp-...
```

Git ignores `.env.local`.

6. Sign in to Cursor from that folder:

```bash
npx --yes "@grok/agent-sdk@0.2.29" login
```

7. Check the Slack connection:

```bash
npx --yes "@grok/agent-sdk@0.2.29" slack doctor --prefix PM_AGENT --dir .
```

These should pass: `app_token`, `connections_open`, `bot_token`, `auth_test`.

8. Start the bot and leave that window open:

```bash
npx --yes "@grok/agent-sdk@0.2.29" serve --dir . --dev
```

Open the playground address printed in that window.

9. In Slack, open a DM with the bot and send `How can you help me?` To use it in a channel, invite the bot, then @mention it.

On Windows PowerShell, if `npx` is blocked, use `npx.cmd` in place of `npx`.
