import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "The remember tool stores a decision.",
  async test(t) {
    await t.send(
      'Use the remember tool to store a decision with id "ship-slack" and summary "Ship the PM agent on Slack first."',
    );
    t.succeeded();
    t.calledTool("remember");
  },
});
