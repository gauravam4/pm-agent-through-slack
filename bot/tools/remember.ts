import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";

const itemSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe("Stable id. The same id and kind update one record."),
  summary: z.string().min(1),
  owner: z.string().min(1).optional(),
});

const inputSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("store"),
    kind: z.enum(["decision", "open_loop"]),
    item: itemSchema,
  }),
  z.object({
    action: z.literal("list"),
    kind: z.enum(["decision", "open_loop"]).optional(),
  }),
]);

const JOURNAL_KEY = "pm-agent:decisions-and-open-loops";

type MemoryKind = "decision" | "open_loop";

type MemoryItem = {
  id: string;
  kind: MemoryKind;
  summary: string;
  owner?: string;
};

type RememberResult = {
  action: "store" | "list";
  unchanged: boolean;
  items: MemoryItem[];
};

function isMemoryKind(value: unknown): value is MemoryKind {
  return value === "decision" || value === "open_loop";
}

function isMemoryItem(value: unknown): value is MemoryItem {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    isMemoryKind(record.kind) &&
    typeof record.id === "string" &&
    typeof record.summary === "string" &&
    (record.owner === undefined || typeof record.owner === "string")
  );
}

function readItems(value: unknown): MemoryItem[] {
  if (value === null || typeof value !== "object" || !("items" in value)) {
    return [];
  }
  const items = (value as { items: unknown }).items;
  if (!Array.isArray(items)) {
    return [];
  }
  return items.filter(isMemoryItem);
}

function sameItem(left: MemoryItem, right: MemoryItem): boolean {
  return (
    left.id === right.id &&
    left.kind === right.kind &&
    left.summary === right.summary &&
    left.owner === right.owner
  );
}

export default defineTool({
  description: prompt`
    Store and list decisions and open loops for this PM agent.
    Use store when a decision is settled or an owner still owes a follow-up.
    Repeat the same id and kind to update that record. Identical arguments leave it unchanged.
    Use list before answering what was decided or what is still open.
  `,
  execution: "server",
  inputSchema,
  effect: (input) => (input.action === "list" ? "read" : "idempotent"),
  async execute(input, ctx): Promise<RememberResult> {
    const current = readItems(await ctx.host.kv.get(JOURNAL_KEY));

    if (input.action === "list") {
      const items =
        input.kind === undefined
          ? current
          : current.filter((item) => item.kind === input.kind);
      return { action: "list", unchanged: true, items };
    }

    const next: MemoryItem = {
      id: input.item.id,
      kind: input.kind,
      summary: input.item.summary,
      ...(input.item.owner === undefined ? {} : { owner: input.item.owner }),
    };
    const index = current.findIndex(
      (item) => item.kind === next.kind && item.id === next.id,
    );
    if (index >= 0 && sameItem(current[index], next)) {
      return { action: "store", unchanged: true, items: [current[index]] };
    }

    const items = current.slice();
    if (index >= 0) {
      items[index] = next;
    } else {
      items.push(next);
    }
    // Upsert by kind + id so the same arguments do not add a second record.
    // A lost race can drop a different concurrent item; repeating that store repairs it.
    await ctx.host.kv.put(JOURNAL_KEY, { items });
    return { action: "store", unchanged: false, items: [next] };
  },
});
