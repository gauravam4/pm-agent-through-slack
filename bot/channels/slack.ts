import { slackChannel } from "@grok/agent-sdk/channels/slack";

/**
 * Slack channel (Socket Mode).
 *
 * Tokens: PM_AGENT_SLACK_BOT_TOKEN + PM_AGENT_SLACK_APP_TOKEN
 * (see .agent-serve/slack/env.example).
 *
 * Full setup: agent-sdk slack setup
 */
export default slackChannel({
  envPrefix: "PM_AGENT",
  // Streaming and thinking steps default to true.
  suggestedPrompts: [
    { title: "Help", message: "How can you help me?" },
    { title: "Status", message: "What are you working on?" },
  ],
});
