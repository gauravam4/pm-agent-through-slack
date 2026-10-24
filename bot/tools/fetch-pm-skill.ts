import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";

const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATALOG_ENTRY = /^- `([a-z0-9]+(?:-[a-z0-9]+)*)` - (.+)$/;
const CATALOG_URL =
  "https://raw.githubusercontent.com/deanpeters/Product-Manager-Skills/main/catalog/skills-by-type.md";
const RAW_SKILL_PREFIX =
  "https://raw.githubusercontent.com/deanpeters/Product-Manager-Skills/main/skills/";
const MAX_MARKDOWN = 150_000;

const inputSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("catalog"),
  }),
  z.object({
    action: z.literal("get"),
    name: z
      .string()
      .regex(SKILL_NAME)
      .describe("Folder name under skills/<name>/SKILL.md."),
  }),
]);

type SkillSummary = {
  name: string;
  purpose: string;
};

type CatalogResult = {
  action: "catalog";
  source: string;
  count: number;
  skills: SkillSummary[];
};

type GetResult = {
  action: "get";
  found: boolean;
  name: string;
  source: string;
  markdown: string;
  truncated: boolean;
};

type FetchPmSkillResult = CatalogResult | GetResult;

function skillUrl(name: string): string {
  return `${RAW_SKILL_PREFIX}${name}/SKILL.md`;
}

function parseCatalog(markdown: string): SkillSummary[] {
  const skills: SkillSummary[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    const match = CATALOG_ENTRY.exec(line.trim());
    if (match === null || match[1] === undefined || match[2] === undefined) {
      continue;
    }
    skills.push({ name: match[1], purpose: match[2] });
  }
  return skills;
}

async function fetchText(url: string): Promise<{ status: number; text: string }> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
      headers: { accept: "text/plain" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`fetch-pm-skill could not reach GitHub (${message})`);
  }
  if (response.status === 404) {
    return { status: 404, text: "" };
  }
  if (!response.ok) {
    throw new Error(`fetch-pm-skill GitHub returned HTTP ${response.status}`);
  }
  const text = await response.text();
  if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
    throw new Error("fetch-pm-skill received HTML instead of skill text");
  }
  return { status: response.status, text };
}

export default defineTool({
  description: prompt`
    Read the Product-Manager-Skills catalog, or one skills/<name>/SKILL.md, from github.com/deanpeters/Product-Manager-Skills.
    Use catalog to match a product-management request to a skill name and what it is for.
    Use get only for a name the catalog matched, then follow the returned markdown.
  `,
  execution: "server",
  inputSchema,
  effect: "read",
  async execute(input): Promise<FetchPmSkillResult> {
    if (input.action === "catalog") {
      const { text } = await fetchText(CATALOG_URL);
      const skills = parseCatalog(text);
      if (skills.length === 0) {
        throw new Error("fetch-pm-skill catalog had no skill entries");
      }
      return {
        action: "catalog",
        source: "https://github.com/deanpeters/Product-Manager-Skills",
        count: skills.length,
        skills,
      };
    }

    const source = skillUrl(input.name);
    const { status, text } = await fetchText(source);
    if (status === 404 || text.trim() === "") {
      return {
        action: "get",
        found: false,
        name: input.name,
        source,
        markdown: "",
        truncated: false,
      };
    }
    const truncated = text.length > MAX_MARKDOWN;
    return {
      action: "get",
      found: true,
      name: input.name,
      source,
      markdown: truncated ? text.slice(0, MAX_MARKDOWN) : text,
      truncated,
    };
  },
});
