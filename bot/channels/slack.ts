import { slackChannel } from "@grok/agent-sdk/channels/slack";

export default slackChannel({
  envPrefix: "PM_AGENT_THROUGH_SLACK",
  suggestedPrompts: [
    {
      title: "Outline a PRD",
      message:
        "Outline a PRD for a self-serve workspace provisioning feature for mid-market SaaS. Call out assumptions.",
    },
    {
      title: "Prioritize this backlog",
      message:
        "Help me prioritize three initiatives: faster onboarding, billing clarity, and admin audit logs. Ask what context you need.",
    },
    {
      title: "Prep discovery interviews",
      message:
        "Prepare a discovery interview guide for PMs who struggle to ship PRDs on time.",
    },
  ],
});
