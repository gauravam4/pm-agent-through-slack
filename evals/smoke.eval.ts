import { defineEval, includes } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke", "prd"],
  description: "Outlines a PRD with core sections for a PM task.",
  async test(t) {
    await t.send(
      "Outline a PRD for a self-serve workspace provisioning feature for mid-market B2B SaaS. Keep it concise. Include problem, users, solution overview, success metrics, and out of scope. Label any assumptions.",
    );
    t.succeeded();
    t.check(
      t.reply,
      includes(/problem|users?|persona|solution|success|metric|scope/i),
    );
  },
});
