// Shared plumbing for the two things the playground's code panel hands a
// developer:
//
//   1. A self-contained HTML + CSS block. It carries its own <style>, so it
//      renders correctly pasted into any page with no dependency on a Loka
//      package, a framework, or a token file that doesn't exist yet.
//   2. A markdown spec written to be pasted into a coding agent, so the
//      developer gets the component in their own stack and conventions rather
//      than in ours.
//
// Both are generated from the same spec functions the live previews render
// from, which is the point: what you copy is what you see, and neither can
// drift from the component on the canvas.

import { tokenForHex } from "../../data/palette.js";

// Matches --sans in global.css. Written out rather than referenced because a
// var() would resolve to nothing in the page the snippet is pasted into.
export const FONT_STACK = "'Alliance No.2', 'Inter', -apple-system, system-ui, sans-serif";

// The framing an agent reads before the values. It's doing two jobs: stopping
// the agent from inventing a "close enough" palette, and stopping it from
// pasting our reference markup over a project that already has a component
// layer of its own.
const PROMPT_INTRO =
  "Build this component using the framework, styling approach, and file layout this " +
  "project already uses. The values below are the published Loka spec — match them " +
  "exactly rather than approximating. Where this project already defines an equivalent " +
  "design token, use the token; otherwise use the literal value given.";

// A rule is one piece of guidance in two registers. `rule` is the whole point,
// short enough to scan in the specs column; `why` is the reasoning an agent
// needs to implement it correctly and a designer reading the panel doesn't.
//
// The specs panel renders the headlines, the AI prompt renders both — so a rule
// is written once and can't drift between the two surfaces that state it.
export function ruleText({ rule, why }) {
  return why ? `${rule} ${why}` : rule;
}

// Full text, for the prompt's Rules section.
export function ruleTexts(rules) {
  return rules.map(ruleText);
}

// Headlines only, for the panel.
export function ruleHeadlines(rules) {
  return rules.map((r) => r.rule);
}

// "#186BF3 · blue-100 · var(--color-blue-100)" for a value the palette names,
// the bare value for one it doesn't. The custom property is the same name the
// Color section publishes, so a developer can grep for it.
export function tokenRef(value) {
  const token = tokenForHex(value);
  return token ? `${value} · ${token.name} · var(${token.cssVar})` : value;
}

// The short form, for places already dense with values.
export function namedColor(value) {
  const token = tokenForHex(value);
  return token ? `${value} (${token.name})` : value;
}

// A CSS rule from an ordered list of [property, value] pairs. Pairs with a null
// value are dropped, so callers can inline their conditionals instead of
// building the array up imperatively; a rule left with no declarations returns
// "" and falls out of blocks() below.
export function rule(selector, decls) {
  const body = decls
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join("\n");
  return body ? `${selector} {\n${body}\n}` : "";
}

// Joins rules or sections, dropping the empty ones so a variant that skips a
// rule doesn't leave a blank gap behind it.
export function blocks(...parts) {
  return parts.filter(Boolean).join("\n\n");
}

export function indent(text, by = 2) {
  const pad = " ".repeat(by);
  return text
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n");
}

// Wraps generated markup in its own stylesheet and a provenance comment, which
// is what makes the block self-contained.
export function htmlDocument({ title, css, markup }) {
  return `<!-- Loka Design System · ${title} -->\n<style>\n${css}\n</style>\n\n${markup}`;
}

// Assembles the agent-facing markdown. `sections` is a list of
// [title, rows] where rows are [label, value] pairs; `states` and `notes` are
// plain sentences. The reference implementation goes last so the agent reads
// the intent before it sees an implementation it might otherwise just copy.
export function specPrompt({ component, config, sections, states = [], notes = [], reference }) {
  const out = [`# Loka Design System — ${component}`, `**Configuration:** ${config}`, PROMPT_INTRO];

  for (const [title, rows] of sections) {
    if (!rows?.length) continue;
    out.push(`## ${title}\n${rows.map(([key, value]) => `- **${key}:** ${value}`).join("\n")}`);
  }
  if (states.length) out.push(`## States\n${states.map((s) => `- ${s}`).join("\n")}`);
  if (notes.length) out.push(`## Rules\n${notes.map((n) => `- ${n}`).join("\n")}`);
  if (reference) {
    out.push(
      "## Reference implementation\n\n" +
        "Framework-agnostic HTML + CSS matching the spec above. Port it to this project's " +
        "conventions — only paste it as-is if the project has no component layer to put it in.\n\n" +
        "```html\n" +
        reference.trimEnd() +
        "\n```",
    );
  }
  return out.join("\n\n");
}
