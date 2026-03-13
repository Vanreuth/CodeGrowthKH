"use client";

import { useState, useRef } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Maximize2,
  Minimize2,
  Terminal,
  WrapText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { CodeSnippetDto } from "@/types/codeSnippetType";

// ─── Custom "GrowCode" syntax theme ──────────────────────────────────────────
// Inspired by Tokyo Night + Catppuccin Mocha. Deep navy base, vibrant token
// colours with deliberate semantic mapping:
//   keywords  → soft violet-pink  (#bb9af7)
//   types     → sky blue          (#7dcfff)
//   functions → warm chartreuse   (#9ece6a)
//   strings   → peach/apricot     (#e0af68)  ← warm to distinguish from numbers
//   numbers   → bright cyan-mint  (#2ac3de)
//   booleans  → deep pink-rose    (#f7768e)
//   comments  → steel-blue muted  (#565f89)
//   operators → lavender          (#c0caf5 60%)
//   props     → sea-foam teal     (#73daca)
//   regex     → amber yellow      (#ff9e64)
//   tags      → coral             (#f7768e)
//   attr-name → powder blue       (#7aa2f7)
//   attr-val  → warm green        (#9ece6a)

const GROW_CODE_THEME: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "#c0caf5",
    background: "transparent",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
    fontSize: "13px",
    lineHeight: "1.7",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    tabSize: "2",
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#c0caf5",
    background: "transparent",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: "0",
    padding: "0.75rem 1rem",
    overflow: "auto",
    tabSize: "2",
  },
  comment:     { color: "#565f89", fontStyle: "italic" },
  prolog:      { color: "#565f89" },
  doctype:     { color: "#565f89" },
  cdata:       { color: "#565f89" },
  // Punctuation — slightly muted base text
  punctuation: { color: "#9aa5ce" },
  // Namespace
  namespace:   { opacity: "0.7" },
  // KEYWORDS — violet-pink (the most eye-catching token)
  keyword:     { color: "#bb9af7", fontWeight: "500" },
  important:   { color: "#bb9af7", fontWeight: "600" },
  bold:        { fontWeight: "700" },
  italic:      { fontStyle: "italic" },
  // TYPES & CLASS NAMES — sky blue
  "class-name":    { color: "#7dcfff" },
  builtin:         { color: "#7dcfff" },
  "maybe-class-name": { color: "#7dcfff" },
  // FUNCTIONS — chartreuse-green
  function:        { color: "#9ece6a" },
  "function-variable": { color: "#9ece6a" },
  // STRINGS — warm apricot/peach
  string:          { color: "#e0af68" },
  char:            { color: "#e0af68" },
  "template-string":   { color: "#e0af68" },
  "template-punctuation": { color: "#9aa5ce" },
  // NUMBERS — bright cyan-mint
  number:          { color: "#2ac3de" },
  // BOOLEANS & NULL — rose-pink
  boolean:         { color: "#f7768e" },
  constant:        { color: "#f7768e" },
  symbol:          { color: "#f7768e" },
  deleted:         { color: "#f7768e" },
  // OPERATORS — soft lavender
  operator:        { color: "#89b4fa", opacity: "0.85" },
  // PROPERTIES — sea-foam teal
  property:        { color: "#73daca" },
  "attr-name":     { color: "#7aa2f7" },
  // REGEX / URL — amber
  regex:           { color: "#ff9e64" },
  url:             { color: "#ff9e64" },
  // TAGS (HTML/JSX) — coral
  tag:             { color: "#f7768e" },
  // ATTRIBUTE VALUES
  "attr-value":    { color: "#9ece6a" },
  // ANNOTATION / DECORATOR
  annotation:      { color: "#e0af68" },
  decorator:       { color: "#e0af68" },
  // VARIABLE
  variable:        { color: "#c0caf5" },
  // SELECTOR (CSS)
  selector:        { color: "#bb9af7" },
  "atrule":        { color: "#bb9af7" },
  "rule":          { color: "#73daca" },
  // INSERTED (diff)
  inserted:        { color: "#9ece6a" },
  // ENTITY
  entity:          { color: "#73daca", cursor: "help" },
};

// ─── Language registry ────────────────────────────────────────────────────────

type LangMeta = {
  label: string;
  /** Background of the pill badge */
  badgeBg: string;
  /** Text colour of the pill badge */
  badgeText: string;
  /** Faint header glow tint */
  headerTint: string;
  /** Left accent border on the block */
  accent: string;
  icon: string;
  prismLang: string;
};

const LANG_META: Record<string, LangMeta> = {
  javascript: {
    label: "JavaScript", icon: "⚡", prismLang: "javascript",
    badgeBg: "#f0a500", badgeText: "#1a0f00",
    headerTint: "rgba(240,165,0,0.08)", accent: "#f0a500",
  },
  js: {
    label: "JavaScript", icon: "⚡", prismLang: "javascript",
    badgeBg: "#f0a500", badgeText: "#1a0f00",
    headerTint: "rgba(240,165,0,0.08)", accent: "#f0a500",
  },
  typescript: {
    label: "TypeScript", icon: "🔷", prismLang: "typescript",
    badgeBg: "#3178c6", badgeText: "#e8f4ff",
    headerTint: "rgba(49,120,198,0.08)", accent: "#3b82f6",
  },
  ts: {
    label: "TypeScript", icon: "🔷", prismLang: "typescript",
    badgeBg: "#3178c6", badgeText: "#e8f4ff",
    headerTint: "rgba(49,120,198,0.08)", accent: "#3b82f6",
  },
  jsx: {
    label: "JSX", icon: "⚛️", prismLang: "jsx",
    badgeBg: "#00b4d8", badgeText: "#001a22",
    headerTint: "rgba(0,180,216,0.08)", accent: "#22d3ee",
  },
  tsx: {
    label: "TSX", icon: "⚛️", prismLang: "tsx",
    badgeBg: "#0ea5e9", badgeText: "#001a22",
    headerTint: "rgba(14,165,233,0.08)", accent: "#38bdf8",
  },
  html: {
    label: "HTML", icon: "🌐", prismLang: "html",
    badgeBg: "#e44d26", badgeText: "#fff0ec",
    headerTint: "rgba(228,77,38,0.08)", accent: "#f97316",
  },
  css: {
    label: "CSS", icon: "🎨", prismLang: "css",
    badgeBg: "#268fe4", badgeText: "#e8f4ff",
    headerTint: "rgba(38,143,228,0.08)", accent: "#60a5fa",
  },
  java: {
    label: "Java", icon: "☕", prismLang: "java",
    badgeBg: "#e76f51", badgeText: "#1a0500",
    headerTint: "rgba(231,111,81,0.08)", accent: "#fb923c",
  },
  python: {
    label: "Python", icon: "🐍", prismLang: "python",
    badgeBg: "#3572a5", badgeText: "#e8f2ff",
    headerTint: "rgba(53,114,165,0.08)", accent: "#60a5fa",
  },
  py: {
    label: "Python", icon: "🐍", prismLang: "python",
    badgeBg: "#3572a5", badgeText: "#e8f2ff",
    headerTint: "rgba(53,114,165,0.08)", accent: "#60a5fa",
  },
  bash: {
    label: "Bash", icon: "🖥️", prismLang: "bash",
    badgeBg: "#475569", badgeText: "#e2e8f0",
    headerTint: "rgba(71,85,105,0.10)", accent: "#94a3b8",
  },
  shell: {
    label: "Shell", icon: "🖥️", prismLang: "bash",
    badgeBg: "#475569", badgeText: "#e2e8f0",
    headerTint: "rgba(71,85,105,0.10)", accent: "#94a3b8",
  },
  sh: {
    label: "Shell", icon: "🖥️", prismLang: "bash",
    badgeBg: "#475569", badgeText: "#e2e8f0",
    headerTint: "rgba(71,85,105,0.10)", accent: "#94a3b8",
  },
  json: {
    label: "JSON", icon: "📦", prismLang: "json",
    badgeBg: "#6b7280", badgeText: "#f3f4f6",
    headerTint: "rgba(107,114,128,0.08)", accent: "#9ca3af",
  },
  sql: {
    label: "SQL", icon: "🗄️", prismLang: "sql",
    badgeBg: "#7c3aed", badgeText: "#f5f0ff",
    headerTint: "rgba(124,58,237,0.08)", accent: "#a78bfa",
  },
  docker: {
    label: "Dockerfile", icon: "🐳", prismLang: "docker",
    badgeBg: "#0284c7", badgeText: "#e0f2fe",
    headerTint: "rgba(2,132,199,0.08)", accent: "#38bdf8",
  },
  dockerfile: {
    label: "Dockerfile", icon: "🐳", prismLang: "docker",
    badgeBg: "#0284c7", badgeText: "#e0f2fe",
    headerTint: "rgba(2,132,199,0.08)", accent: "#38bdf8",
  },
  yaml: {
    label: "YAML", icon: "📄", prismLang: "yaml",
    badgeBg: "#db2777", badgeText: "#fff0f7",
    headerTint: "rgba(219,39,119,0.08)", accent: "#f472b6",
  },
  yml: {
    label: "YAML", icon: "📄", prismLang: "yaml",
    badgeBg: "#db2777", badgeText: "#fff0f7",
    headerTint: "rgba(219,39,119,0.08)", accent: "#f472b6",
  },
  xml: {
    label: "XML", icon: "📋", prismLang: "xml",
    badgeBg: "#c2410c", badgeText: "#fff7ed",
    headerTint: "rgba(194,65,12,0.08)", accent: "#fb923c",
  },
  php: {
    label: "PHP", icon: "🐘", prismLang: "php",
    badgeBg: "#7e22ce", badgeText: "#faf5ff",
    headerTint: "rgba(126,34,206,0.08)", accent: "#c084fc",
  },
  go: {
    label: "Go", icon: "🔵", prismLang: "go",
    badgeBg: "#0891b2", badgeText: "#ecfeff",
    headerTint: "rgba(8,145,178,0.08)", accent: "#22d3ee",
  },
  rust: {
    label: "Rust", icon: "🦀", prismLang: "rust",
    badgeBg: "#b45309", badgeText: "#fffbeb",
    headerTint: "rgba(180,83,9,0.08)", accent: "#fbbf24",
  },
  kotlin: {
    label: "Kotlin", icon: "🟣", prismLang: "kotlin",
    badgeBg: "#7c3aed", badgeText: "#f5f0ff",
    headerTint: "rgba(124,58,237,0.08)", accent: "#a78bfa",
  },
  swift: {
    label: "Swift", icon: "🍎", prismLang: "swift",
    badgeBg: "#f97316", badgeText: "#fff7ed",
    headerTint: "rgba(249,115,22,0.08)", accent: "#fb923c",
  },
  dart: {
    label: "Dart", icon: "📱", prismLang: "dart",
    badgeBg: "#0d9488", badgeText: "#f0fdfa",
    headerTint: "rgba(13,148,136,0.08)", accent: "#2dd4bf",
  },
  default: {
    label: "Code", icon: "💻", prismLang: "text",
    badgeBg: "#334155", badgeText: "#e2e8f0",
    headerTint: "rgba(51,65,85,0.08)", accent: "#64748b",
  },
};

function getLangMeta(lang?: string): LangMeta {
  if (!lang) return LANG_META.default;
  return LANG_META[lang.toLowerCase()] ?? LANG_META.default;
}

const LINE_NUMBER_STYLE: React.CSSProperties = {
  minWidth: "2.5rem",
  paddingRight: "1.25rem",
  color: "#3d4255",
  fontSize: "11px",
  userSelect: "none",
  borderRight: "1px solid rgba(255,255,255,0.04)",
  marginRight: "0.75rem",
};

const COLLAPSE_THRESHOLD = 20;
const PREVIEW_LINES = 12;

// ─── CodeBlock ────────────────────────────────────────────────────────────────

export function CodeBlock({ snippet }: { snippet: CodeSnippetDto }) {
  const [copied,    setCopied]    = useState(false);
  const [wrapped,   setWrapped]   = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expanded,  setExpanded]  = useState(false);

  const lang    = (snippet.language || "").toLowerCase();
  const meta    = getLangMeta(lang);
  const rawCode = (snippet.code || "").trim();
  const lines   = rawCode.split("\n");
  const isTall  = lines.length > COLLAPSE_THRESHOLD;

  const displayCode = collapsed
    ? lines.slice(0, PREVIEW_LINES).join("\n")
    : rawCode;

  async function handleCopy() {
    await navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Code body background — deep navy (matches Tokyo Night / Catppuccin Mocha)
  const codeBg = "#0d1117";

  function Highlighter({ code, wrapLong = false }: { code: string; wrapLong?: boolean }) {
    return (
      <SyntaxHighlighter
        language={meta.prismLang}
        style={GROW_CODE_THEME}
        showLineNumbers
        wrapLines
        wrapLongLines={wrapLong}
        customStyle={{
          margin: 0,
          padding: "0.85rem 1rem",
          background: "transparent",
          fontSize: "13px",
          lineHeight: "1.7",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
        }}
        lineNumberStyle={LINE_NUMBER_STYLE}
        codeTagProps={{ style: { fontFamily: "inherit" } }}
      >
        {code}
      </SyntaxHighlighter>
    );
  }

  return (
    <>
      {/* ── Full-screen modal ─────────────────────────────────────── */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setExpanded(false)}
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            style={{
              borderRadius: "14px",
              border: `1px solid ${meta.accent}40`,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.6), 0 0 40px ${meta.accent}18`,
              background: "#0d1117",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between gap-3 px-5 py-3 shrink-0"
              style={{
                background: `linear-gradient(to bottom, #161b22, #0d1117)`,
                borderBottom: `1px solid ${meta.accent}30`,
              }}
            >
              <div className="flex items-center gap-3">
                <LangPill meta={meta} />
                {snippet.title && (
                  <span className="text-sm font-medium" style={{ color: "#8b949e" }}>
                    {snippet.title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost" size="sm"
                  onClick={handleCopy}
                  className="h-8 px-3 text-xs gap-1.5"
                  style={{ color: copied ? "#3fb950" : "#8b949e" }}
                >
                  {copied
                    ? <><Check className="h-3.5 w-3.5" /> Copied!</>
                    : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </Button>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setExpanded(false)}
                  className="h-8 w-8 p-0"
                  style={{ color: "#8b949e" }}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Modal code */}
            <div className="overflow-auto flex-1" style={{ background: codeBg }}>
              <Highlighter code={rawCode} />
            </div>
          </div>
        </div>
      )}

      {/* ── Main block ────────────────────────────────────────────── */}
      <div
        className="group my-6"
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          border: `1px solid rgba(255,255,255,0.06)`,
          borderLeft: `3px solid ${meta.accent}`,
          boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03)`,
          background: codeBg,
        }}
      >
        {/* ── Title bar ── */}
        <div
          className="flex items-center justify-between gap-3 px-4 py-2.5"
          style={{
            background: `linear-gradient(to right, ${meta.headerTint.replace("0.08", "0.15")}, #161b22 60%)`,
            borderBottom: `1px solid rgba(255,255,255,0.05)`,
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Mac traffic lights */}
            <div className="flex gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
            </div>
            <LangPill meta={meta} />
            {snippet.title && (
              <span
                className="text-sm font-medium truncate"
                style={{ color: "#8b949e", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}
              >
                {snippet.title}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <ActionBtn
              title="Word wrap"
              onClick={() => setWrapped((w) => !w)}
              active={wrapped}
              activeColor={meta.accent}
            >
              <WrapText className="h-3.5 w-3.5" />
            </ActionBtn>
            <ActionBtn title="Expand" onClick={() => setExpanded(true)}>
              <Maximize2 className="h-3.5 w-3.5" />
            </ActionBtn>
            <ActionBtn
              title={copied ? "Copied!" : "Copy"}
              onClick={handleCopy}
              active={copied}
              activeColor="#3fb950"
            >
              {copied
                ? <><Check className="h-3.5 w-3.5" /><span className="text-xs ml-1">Copied!</span></>
                : <><Copy className="h-3.5 w-3.5" /><span className="text-xs ml-1">Copy</span></>}
            </ActionBtn>
          </div>
        </div>

        {/* ── Meta bar (line count) ── */}
        <div
          className="flex items-center gap-2 px-4 py-1"
          style={{
            background: "#0d1117",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
          }}
        >
          <Terminal className="h-3 w-3" style={{ color: "#3d4255" }} />
          <span style={{ fontSize: "11px", color: "#3d4255", fontFamily: "'JetBrains Mono', monospace" }}>
            {lines.length} {lines.length !== 1 ? "lines" : "line"}
          </span>
          {isTall && (
            <span className="ml-auto" style={{ fontSize: "11px", color: "#3d4255" }}>
              Scroll or{" "}
              <button
                style={{ color: meta.accent, fontSize: "11px" }}
                className="hover:underline underline-offset-2"
                onClick={() => setExpanded(true)}
              >
                expand ↗
              </button>
            </span>
          )}
        </div>

        {/* ── Code area ── */}
        <div
          style={{
            background: codeBg,
            ...(isTall && collapsed
              ? { maxHeight: "260px", overflow: "hidden", position: "relative" }
              : { overflowX: "auto" }),
          }}
        >
          <Highlighter code={displayCode} wrapLong={wrapped} />

          {isTall && collapsed && (
            <div
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "72px",
                background: `linear-gradient(to top, ${codeBg}, transparent)`,
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* ── Collapse toggle ── */}
        {isTall && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center justify-center gap-2 py-2"
            style={{
              background: "#0d1117",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#3d4255",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = meta.accent)}
            onMouseLeave={e => (e.currentTarget.style.color = "#3d4255")}
          >
            {collapsed
              ? <><ChevronDown className="h-3.5 w-3.5" /> Show all {lines.length} lines</>
              : <><ChevronUp className="h-3.5 w-3.5" /> Collapse</>}
          </button>
        )}

        {/* ── Explanation ── */}
        {snippet.explanation && (
          <div
            className="flex items-start gap-3 px-4 py-3"
            style={{
              background: "rgba(187,154,247,0.06)",
              borderTop: `1px solid ${meta.accent}20`,
            }}
          >
            <Code2
              className="h-4 w-4 mt-0.5 shrink-0"
              style={{ color: meta.accent }}
            />
            <p className="text-sm leading-relaxed" style={{ color: "#8b949e" }}>
              {snippet.explanation}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function LangPill({ meta }: { meta: LangMeta }) {
  return (
    <span
      className="shrink-0 text-xs font-bold tracking-wide px-2 py-0.5 rounded-md"
      style={{
        background: meta.badgeBg,
        color: meta.badgeText,
        fontSize: "10px",
        letterSpacing: "0.06em",
        boxShadow: `0 0 10px ${meta.badgeBg}44`,
      }}
    >
      {meta.icon} {meta.label}
    </span>
  );
}

function ActionBtn({
  title,
  onClick,
  active,
  activeColor,
  children,
}: {
  title?: string;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="flex items-center px-2 h-7 rounded text-xs transition-colors"
      style={{
        background: active ? `${activeColor}20` : "transparent",
        color: active ? activeColor : "#484f58",
        border: "none",
        cursor: "pointer",
        gap: "3px",
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#c0caf5";
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#484f58";
      }}
    >
      {children}
    </button>
  );
}

// ─── Multi-snippet tabbed viewer ──────────────────────────────────────────────

export function CodeSnippetTabs({ snippets }: { snippets: CodeSnippetDto[] }) {
  const sorted   = [...snippets].sort((a, b) => a.orderIndex - b.orderIndex);
  const [activeIdx, setActiveIdx] = useState(0);

  if (sorted.length === 1) return <CodeBlock snippet={sorted[0]} />;

  return (
    <div
      className="rounded-xl overflow-hidden my-6"
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        background: "#0d1117",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Tab bar */}
      <div
        className="flex overflow-x-auto"
        style={{
          background: "#161b22",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {sorted.map((s, i) => {
          const meta   = getLangMeta(s.language);
          const isActive = i === activeIdx;
          return (
            <button
              key={s.id ?? i}
              onClick={() => setActiveIdx(i)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                borderBottom: isActive ? `2px solid ${meta.accent}` : "2px solid transparent",
                color: isActive ? "#c0caf5" : "#484f58",
                background: isActive ? `${meta.accent}10` : "transparent",
                cursor: "pointer",
                border: "none",
              }}
            >
              <span>{meta.icon}</span>
              <span>{s.title || meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active snippet */}
      <div className="[&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none [&>div]:my-0">
        <CodeBlock snippet={sorted[activeIdx]} />
      </div>
    </div>
  );
}