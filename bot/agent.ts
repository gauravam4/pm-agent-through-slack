import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  name: "pm-agent",
  model: {
    id: "grok-4.5",
    params: [
      { id: "effort", value: "high" },
      { id: "fast", value: "true" },
    ],
  },
});
