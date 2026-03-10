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
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { CodeSnippetDto } from "@/lib/types";

// ─── Language registry ────────────────────────────────────────────────────────

type LangMeta = {
  label: string;
  badge: string;
  text: string;
  icon: string;
  prismLang: string; 
};

const LANG_META: Record<string, LangMeta> = {
  javascript: { label: "JavaScript", badge: "bg-yellow-400",  text: "text-black",  icon: "⚡", prismLang: "javascript" },
  js:         { label: "JavaScript", badge: "bg-yellow-400",  text: "text-black",  icon: "⚡", prismLang: "javascript" },
  typescript: { label: "TypeScript", badge: "bg-blue-600",    text: "text-white",  icon: "🔷", prismLang: "typescript" },
  ts:         { label: "TypeScript", badge: "bg-blue-600",    text: "text-white",  icon: "🔷", prismLang: "typescript" },
  jsx:        { label: "JSX",        badge: "bg-cyan-500",    text: "text-black",  icon: "⚛️", prismLang: "jsx"        },
  tsx:        { label: "TSX",        badge: "bg-sky-500",     text: "text-white",  icon: "⚛️", prismLang: "tsx"        },
  html:       { label: "HTML",       badge: "bg-orange-500",  text: "text-white",  icon: "🌐", prismLang: "html"       },
  css:        { label: "CSS",        badge: "bg-blue-400",    text: "text-white",  icon: "🎨", prismLang: "css"        },
  java:       { label: "Java",       badge: "bg-red-600",     text: "text-white",  icon: "☕", prismLang: "java"       },
  python:     { label: "Python",     badge: "bg-green-600",   text: "text-white",  icon: "🐍", prismLang: "python"     },
  py:         { label: "Python",     badge: "bg-green-600",   text: "text-white",  icon: "🐍", prismLang: "python"     },
  bash:       { label: "Bash",       badge: "bg-slate-600",   text: "text-white",  icon: "🖥️", prismLang: "bash"       },
  shell:      { label: "Shell",      badge: "bg-slate-600",   text: "text-white",  icon: "🖥️", prismLang: "bash"       },
  sh:         { label: "Shell",      badge: "bg-slate-600",   text: "text-white",  icon: "🖥️", prismLang: "bash"       },
  json:       { label: "JSON",       badge: "bg-gray-500",    text: "text-white",  icon: "📦", prismLang: "json"       },
  sql:        { label: "SQL",        badge: "bg-indigo-600",  text: "text-white",  icon: "🗄️", prismLang: "sql"        },
  docker:     { label: "Dockerfile", badge: "bg-blue-700",    text: "text-white",  icon: "🐳", prismLang: "docker"     },
  dockerfile: { label: "Dockerfile", badge: "bg-blue-700",    text: "text-white",  icon: "🐳", prismLang: "docker"     },
  yaml:       { label: "YAML",       badge: "bg-pink-600",    text: "text-white",  icon: "📄", prismLang: "yaml"       },
  yml:        { label: "YAML",       badge: "bg-pink-600",    text: "text-white",  icon: "📄", prismLang: "yaml"       },
  xml:        { label: "XML",        badge: "bg-orange-600",  text: "text-white",  icon: "📋", prismLang: "xml"        },
  php:        { label: "PHP",        badge: "bg-violet-600",  text: "text-white",  icon: "🐘", prismLang: "php"        },
  go:         { label: "Go",         badge: "bg-cyan-600",    text: "text-white",  icon: "🔵", prismLang: "go"         },
  rust:       { label: "Rust",       badge: "bg-orange-700",  text: "text-white",  icon: "🦀", prismLang: "rust"       },
  kotlin:     { label: "Kotlin",     badge: "bg-purple-600",  text: "text-white",  icon: "🟣", prismLang: "kotlin"     },
  swift:      { label: "Swift",      badge: "bg-orange-500",  text: "text-white",  icon: "🍎", prismLang: "swift"      },
  dart:       { label: "Dart",       badge: "bg-teal-500",    text: "text-white",  icon: "📱", prismLang: "dart"       },
  default:    { label: "Code",       badge: "bg-slate-500",   text: "text-white",  icon: "💻", prismLang: "text"       },
};

function getLangMeta(lang?: string): LangMeta {
  if (!lang) return LANG_META.default;
  return LANG_META[lang.toLowerCase()] ?? LANG_META.default;
}


const HIGHLIGHTER_STYLE: React.CSSProperties = {
  margin: 0,
  padding: "0.75rem 1rem",
  background: "transparent",
  fontSize: "13px",
  lineHeight: "1.65",
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
};

const LINE_NUMBER_STYLE: React.CSSProperties = {
  minWidth: "2.25rem",
  paddingRight: "1rem",
  color: "#4b5563",     
  fontSize: "11px",
  userSelect: "none",
};

const COLLAPSE_THRESHOLD = 20;
const PREVIEW_LINES = 12;

// ─── CodeBlock ────────────────────────────────────────────────────────────────

export function CodeBlock({ snippet }: { snippet: CodeSnippetDto }) {
  const [copied,    setCopied]    = useState(false);
  const [wrapped,   setWrapped]   = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expanded,  setExpanded]  = useState(false);

  const lang     = (snippet.language || "").toLowerCase();
  const meta     = getLangMeta(lang);
  const rawCode  = (snippet.code || "").trim();
  const lines    = rawCode.split("\n");
  const isTall   = lines.length > COLLAPSE_THRESHOLD;

  // When collapsed show only first PREVIEW_LINES
  const displayCode = collapsed
    ? lines.slice(0, PREVIEW_LINES).join("\n")
    : rawCode;

  async function handleCopy() {
    await navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Shared highlighter used in both main block and modal
  function Highlighter({ code, wrapLong = false }: { code: string; wrapLong?: boolean }) {
    return (
      <SyntaxHighlighter
        language={meta.prismLang}
        style={vscDarkPlus}
        showLineNumbers
        wrapLines
        wrapLongLines={wrapLong}
        customStyle={HIGHLIGHTER_STYLE}
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${meta.badge} ${meta.text}`}>
                  {meta.icon} {meta.label}
                </span>
                {snippet.title && (
                  <span className="text-sm text-slate-300 font-medium">{snippet.title}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost" size="sm"
                  onClick={handleCopy}
                  className="h-8 px-2.5 text-slate-400 hover:text-white hover:bg-slate-700 gap-1.5 text-xs"
                >
                  {copied
                    ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
                    : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </Button>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setExpanded(false)}
                  className="h-8 px-2.5 text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Modal code */}
            <div className="overflow-auto flex-1 bg-slate-900">
              <Highlighter code={rawCode} />
            </div>
          </div>
        </div>
      )}

      {/* ── Main block ────────────────────────────────────────────── */}
      <div className="group rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-lg shadow-black/20 my-6">

        {/* Title bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-800 border-b border-slate-700/80">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mac traffic lights */}
            <div className="flex gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-red-500/90" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/90" />
              <span className="w-3 h-3 rounded-full bg-green-500/90" />
            </div>
            <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold tracking-wide ${meta.badge} ${meta.text}`}>
              {meta.icon} {meta.label}
            </span>
            {snippet.title && (
              <span className="text-sm text-slate-400 font-medium truncate">
                {snippet.title}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost" size="sm"
              title="Word wrap"
              onClick={() => setWrapped((w) => !w)}
              className={`h-7 w-7 p-0 rounded hover:bg-slate-700 ${
                wrapped ? "text-violet-400" : "text-slate-500 hover:text-slate-200"
              }`}
            >
              <WrapText className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="sm"
              title="Expand"
              onClick={() => setExpanded(true)}
              className="h-7 w-7 p-0 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-700"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="sm"
              onClick={handleCopy}
              className={`h-7 px-2.5 rounded text-xs font-medium gap-1.5 transition-colors hover:bg-slate-700 ${
                copied ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {copied
                ? <><Check className="h-3.5 w-3.5" /> Copied!</>
                : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </Button>
          </div>
        </div>

        {/* Line count bar */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-800/50 border-b border-slate-700/50">
          <Terminal className="h-3 w-3 text-slate-600" />
          <span className="text-[11px] text-slate-500 font-mono">
            {lines.length} line{lines.length !== 1 ? "s" : ""}
          </span>
          {isTall && (
            <span className="ml-auto text-[11px] text-slate-600">
              Scroll or{" "}
              <button
                className="text-violet-400 hover:text-violet-300 underline-offset-2 hover:underline"
                onClick={() => setExpanded(true)}
              >
                expand ↗
              </button>
            </span>
          )}
        </div>

        {/* Code area */}
        <div
          className={`bg-slate-900 ${
            isTall && collapsed
              ? "max-h-[260px] overflow-hidden relative"
              : "overflow-x-auto"
          }`}
        >
          <Highlighter code={displayCode} wrapLong={wrapped} />

          {/* Fade gradient when collapsed */}
          {isTall && collapsed && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Collapse / expand toggle */}
        {isTall && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800/70 border-t border-slate-700/50 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {collapsed ? (
              <><ChevronDown className="h-3.5 w-3.5" /> Show all {lines.length} lines</>
            ) : (
              <><ChevronUp className="h-3.5 w-3.5" /> Collapse code</>
            )}
          </button>
        )}

        {/* Explanation */}
        {snippet.explanation && (
          <div className="flex items-start gap-3 px-4 py-3 bg-slate-800/40 border-t border-slate-700/50">
            <Code2 className="h-4 w-4 mt-0.5 shrink-0 text-violet-400" />
            <p className="text-sm leading-relaxed text-slate-300">
              {snippet.explanation}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Multi-snippet tabbed viewer ──────────────────────────────────────────────

export function CodeSnippetTabs({ snippets }: { snippets: CodeSnippetDto[] }) {
  const sorted = [...snippets].sort((a, b) => a.orderIndex - b.orderIndex);
  const [activeIdx, setActiveIdx] = useState(0);

  if (sorted.length === 1) return <CodeBlock snippet={sorted[0]} />;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-lg my-6">
      {/* Tab bar */}
      <div className="flex overflow-x-auto bg-slate-800 border-b border-slate-700/80">
        {sorted.map((s, i) => {
          const meta = getLangMeta(s.language);
          const isActive = i === activeIdx;
          return (
            <button
              key={s.id ?? i}
              onClick={() => setActiveIdx(i)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-violet-500 text-white bg-slate-900/50"
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-700/30"
              }`}
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