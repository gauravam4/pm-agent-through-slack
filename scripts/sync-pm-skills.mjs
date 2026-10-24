#!/usr/bin/env node
/**
 * Copy deanpeters/Product-Manager-Skills into bot/skills for Agent SDK discovery.
 * (Discovery uses Dirent.isDirectory(), which is false for symlinks to dirs.)
 * Run after `git submodule update --init`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vendorSkills = path.join(root, "vendor/product-manager-skills/skills");
const vendorCommands = path.join(root, "vendor/product-manager-skills/commands");
const dest = path.join(root, "bot/skills");
const managedMarker = "<!-- synced-from: product-manager-skills -->";
const handAuthored = new Set(["pm-router.md"]);

if (!fs.existsSync(vendorSkills)) {
  const msg =
    "Missing vendor/product-manager-skills. Run: git submodule update --init --recursive && npm run sync:skills";
  if (process.env.npm_lifecycle_event === "postinstall") {
    console.warn(`[sync-pm-skills] ${msg}`);
    process.exit(0);
  }
  console.error(msg);
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });

for (const entry of fs.readdirSync(dest, { withFileTypes: true })) {
  if (handAuthored.has(entry.name)) continue;
  const full = path.join(dest, entry.name);
  if (entry.isSymbolicLink() || entry.isDirectory()) {
    fs.rmSync(full, { recursive: true, force: true });
    continue;
  }
  if (entry.isFile() && entry.name.endsWith(".md")) {
    const text = fs.readFileSync(full, "utf8");
    if (text.includes("synced-from: product-manager-skills") || entry.name.startsWith("cmd-")) {
      fs.unlinkSync(full);
    }
  }
  if (entry.name === ".gitkeep") fs.unlinkSync(full);
}

let copied = 0;
for (const name of fs.readdirSync(vendorSkills)) {
  const src = path.join(vendorSkills, name);
  if (!fs.statSync(src).isDirectory()) continue;
  if (!fs.existsSync(path.join(src, "SKILL.md"))) continue;
  fs.cpSync(src, path.join(dest, name), { recursive: true });
  copied++;
}

let commands = 0;
for (const file of fs.readdirSync(vendorCommands)) {
  if (!file.endsWith(".md")) continue;
  const base = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(vendorCommands, file), "utf8");
  const wrapped = raw.replace(
    /^---\n[\s\S]*?\n---\n/,
    (fm) => `${fm}\n${managedMarker}\n`,
  );
  const withMarker = wrapped.includes(managedMarker)
    ? wrapped
    : `${managedMarker}\n${raw}`;
  fs.writeFileSync(path.join(dest, `cmd-${base}.md`), withMarker);
  commands++;
}

console.log(
  `Copied ${copied} skills; wrote ${commands} command wrappers into bot/skills/`,
);
