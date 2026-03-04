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
import type { CodeSnippetDto } from "@/lib/types";

// ─── Language registry ────────────────────────────────────────────────────────

type LangMeta = {
  label: string;
  badge: string;    // tailwind bg colour
  text: string;     // tailwind text colour
  icon: string;     // emoji
  comment: string;  // comment prefix for the language
};

const LANG_META: Record<string, LangMeta> = {
  javascript: { label: "JavaScript", badge: "bg-yellow-400",  text: "text-black",       icon: "⚡", comment: "//" },
  js:         { label: "JavaScript", badge: "bg-yellow-400",  text: "text-black",       icon: "⚡", comment: "//" },
  typescript: { label: "TypeScript", badge: "bg-blue-600",    text: "text-white",       icon: "🔷", comment: "//" },
  ts:         { label: "TypeScript", badge: "bg-blue-600",    text: "text-white",       icon: "🔷", comment: "//" },
  jsx:        { label: "JSX",        badge: "bg-cyan-500",    text: "text-black",       icon: "⚛️", comment: "//" },
  tsx:        { label: "TSX",        badge: "bg-sky-500",     text: "text-white",       icon: "⚛️", comment: "//" },
  html:       { label: "HTML",       badge: "bg-orange-500",  text: "text-white",       icon: "🌐", comment: "<!--" },
  css:        { label: "CSS",        badge: "bg-blue-400",    text: "text-white",       icon: "🎨", comment: "/*" },
  java:       { label: "Java",       badge: "bg-red-600",     text: "text-white",       icon: "☕", comment: "//" },
  python:     { label: "Python",     badge: "bg-green-600",   text: "text-white",       icon: "🐍", comment: "#"  },
  py:         { label: "Python",     badge: "bg-green-600",   text: "text-white",       icon: "🐍", comment: "#"  },
  bash:       { label: "Bash",       badge: "bg-slate-600",   text: "text-white",       icon: "🖥️", comment: "#"  },
  shell:      { label: "Shell",      badge: "bg-slate-600",   text: "text-white",       icon: "🖥️", comment: "#"  },
  sh:         { label: "Shell",      badge: "bg-slate-600",   text: "text-white",       icon: "🖥️", comment: "#"  },
  json:       { label: "JSON",       badge: "bg-gray-500",    text: "text-white",       icon: "📦", comment: "//" },
  sql:        { label: "SQL",        badge: "bg-indigo-600",  text: "text-white",       icon: "🗄️", comment: "--" },
  docker:     { label: "Dockerfile", badge: "bg-blue-700",    text: "text-white",       icon: "🐳", comment: "#"  },
  dockerfile: { label: "Dockerfile", badge: "bg-blue-700",    text: "text-white",       icon: "🐳", comment: "#"  },
  yaml:       { label: "YAML",       badge: "bg-pink-600",    text: "text-white",       icon: "📄", comment: "#"  },
  yml:        { label: "YAML",       badge: "bg-pink-600",    text: "text-white",       icon: "📄", comment: "#"  },
  xml:        { label: "XML",        badge: "bg-orange-600",  text: "text-white",       icon: "📋", comment: "<!--" },
  php:        { label: "PHP",        badge: "bg-violet-600",  text: "text-white",       icon: "🐘", comment: "//" },
  go:         { label: "Go",         badge: "bg-cyan-600",    text: "text-white",       icon: "🔵", comment: "//" },
  rust:       { label: "Rust",       badge: "bg-orange-700",  text: "text-white",       icon: "🦀", comment: "//" },
  kotlin:     { label: "Kotlin",     badge: "bg-purple-600",  text: "text-white",       icon: "🟣", comment: "//" },
  swift:      { label: "Swift",      badge: "bg-orange-500",  text: "text-white",       icon: "🍎", comment: "//" },
  dart:       { label: "Dart",       badge: "bg-teal-500",    text: "text-white",       icon: "📱", comment: "//" },
  default:    { label: "Code",       badge: "bg-slate-500",   text: "text-white",       icon: "💻", comment: "//" },
};

function getLangMeta(lang?: string): LangMeta {
  if (!lang) return LANG_META.default;
  return LANG_META[lang.toLowerCase()] ?? LANG_META.default;
}

// ─── Minimal syntax tokeniser ─────────────────────────────────────────────────
// Applies colour classes without a full parser — good enough for learning content.

type Token = { type: "keyword" | "string" | "comment" | "number" | "fn" | "plain"; value: string };

const JS_KEYWORDS = new Set([
  "const","let","var","function","return","if","else","for","while","do",
  "switch","case","break","continue","import","export","default","from",
  "class","extends","new","this","super","typeof","instanceof","in","of",
  "async","await","try","catch","finally","throw","true","false","null",
  "undefined","void","delete","yield","static","get","set","type","interface",
  "enum","implements","abstract","public","private","protected","readonly",
]);

const JAVA_KEYWORDS = new Set([
  "public","private","protected","class","interface","extends","implements",
  "new","return","if","else","for","while","do","switch","case","break",
  "continue","import","package","static","final","void","int","long","double",
  "float","boolean","char","byte","short","String","null","true","false",
  "try","catch","finally","throw","throws","this","super","abstract","enum",
]);

const PYTHON_KEYWORDS = new Set([
  "def","class","return","if","elif","else","for","while","import","from",
  "as","pass","break","continue","with","try","except","finally","raise",
  "and","or","not","in","is","None","True","False","lambda","yield","async",
  "await","global","nonlocal","del","print","len","range","self",
]);

function getKeywords(lang: string): Set<string> {
  const l = lang.toLowerCase();
  if (["javascript","js","typescript","ts","jsx","tsx"].includes(l)) return JS_KEYWORDS;
  if (l === "java" || l === "kotlin") return JAVA_KEYWORDS;
  if (l === "python" || l === "py") return PYTHON_KEYWORDS;
  return JS_KEYWORDS; // sensible fallback
}

function tokeniseLine(line: string, lang: string, commentPrefix: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  // Single-line comment
  const commentIdx = remaining.indexOf(commentPrefix);
  let codePart = remaining;
  let commentPart: string | null = null;
  if (commentIdx !== -1) {
    // Ensure it's not inside a string (simplified check)
    const before = remaining.slice(0, commentIdx);
    const singleQuotes = (before.match(/'/g) || []).length;
    const doubleQuotes = (before.match(/"/g) || []).length;
    if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0) {
      codePart = remaining.slice(0, commentIdx);
      commentPart = remaining.slice(commentIdx);
    }
  }

  const keywords = getKeywords(lang);

  // Tokenise the code portion word-by-word
  const wordRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+\.?\d*\b|\b[a-zA-Z_$][\w$]*\b|[^\w\s"'`]|\s+)/g;
  let m: RegExpExecArray | null;
  while ((m = wordRegex.exec(codePart)) !== null) {
    const v = m[0];
    if (/^["'`]/.test(v)) {
      tokens.push({ type: "string", value: v });
    } else if (/^\d/.test(v)) {
      tokens.push({ type: "number", value: v });
    } else if (keywords.has(v)) {
      tokens.push({ type: "keyword", value: v });
    } else if (/^[a-zA-Z_$][\w$]*$/.test(v) && wordRegex.source && codePart[m.index + v.length] === "(") {
      tokens.push({ type: "fn", value: v });
    } else {
      tokens.push({ type: "plain", value: v });
    }
  }

  if (commentPart) {
    tokens.push({ type: "comment", value: commentPart });
  }

  return tokens;
}

const TOKEN_CLASS: Record<Token["type"], string> = {
  keyword: "text-violet-400 font-semibold",
  string:  "text-emerald-400",
  comment: "text-slate-500 italic",
  number:  "text-amber-400",
  fn:      "text-yellow-300",
  plain:   "text-slate-100",
};

function HighlightedLine({ line, lang, commentPrefix }: { line: string; lang: string; commentPrefix: string }) {
  if (!line.trim()) return <span>&nbsp;</span>;
  const tokens = tokeniseLine(line, lang, commentPrefix);
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} className={TOKEN_CLASS[t.type]}>
          {t.value}
        </span>
      ))}
    </>
  );
}

// ─── CodeBlock ────────────────────────────────────────────────────────────────

const COLLAPSE_THRESHOLD = 20; // lines before we offer collapse

export function CodeBlock({ snippet }: { snippet: CodeSnippetDto }) {
  const [copied, setCopied]       = useState(false);
  const [wrapped, setWrapped]     = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded]   = useState(false); // full-screen modal
  const codeRef = useRef<HTMLPreElement>(null);

  const lang     = (snippet.language || "").toLowerCase();
  const meta     = getLangMeta(lang);
  const lines    = (snippet.code || "").split("\n");
  const isTall   = lines.length > COLLAPSE_THRESHOLD;

  // How many lines to show when collapsed
  const PREVIEW_LINES = 12;
  const visibleLines  = collapsed ? lines.slice(0, PREVIEW_LINES) : lines;

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet.code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const codeBody = (
    <pre
      ref={codeRef}
      className={`text-[13px] leading-[1.65] font-mono overflow-x-auto p-0 m-0 ${wrapped ? "whitespace-pre-wrap break-all" : "whitespace-pre"}`}
    >
      {visibleLines.map((line, i) => (
        <div
          key={i}
          className="flex group/line hover:bg-white/5 rounded"
        >
          {/* Line number */}
          <span
            className="select-none shrink-0 w-10 pr-4 text-right text-slate-600 text-[11px] leading-[1.65] pt-px"
            aria-hidden
          >
            {i + 1}
          </span>
          {/* Code line */}
          <span className="flex-1 pr-4">
            <HighlightedLine
              line={line}
              lang={lang}
              commentPrefix={meta.comment}
            />
          </span>
        </div>
      ))}
    </pre>
  );

  return (
    <>
      {/* ── Full-screen modal ── */}
      {expanded && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setExpanded(false)}>
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
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2.5 text-slate-400 hover:text-white hover:bg-slate-700 gap-1.5 text-xs">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setExpanded(false)} className="h-8 px-2.5 text-slate-400 hover:text-white hover:bg-slate-700">
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="overflow-auto p-5 flex-1 bg-slate-900">
              <pre className="text-[13px] leading-[1.65] font-mono whitespace-pre text-slate-100">
                {lines.map((line, i) => (
                  <div key={i} className="flex hover:bg-white/5 rounded">
                    <span className="select-none shrink-0 w-10 pr-4 text-right text-slate-600 text-[11px] leading-[1.65] pt-px">{i + 1}</span>
                    <span className="flex-1 pr-4">
                      <HighlightedLine line={line} lang={lang} commentPrefix={meta.comment} />
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ── Main block ── */}
      <div className="group rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-lg shadow-black/20 my-6">

        {/* ── Title bar ── */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-800 border-b border-slate-700/80">
          {/* Left: traffic lights + lang badge + title */}
          <div className="flex items-center gap-3 min-w-0">
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

          {/* Right: action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              title="Word wrap"
              onClick={() => setWrapped((w) => !w)}
              className={`h-7 w-7 p-0 rounded hover:bg-slate-700 ${wrapped ? "text-violet-400" : "text-slate-500 hover:text-slate-200"}`}
            >
              <WrapText className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title="Expand"
              onClick={() => setExpanded(true)}
              className="h-7 w-7 p-0 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-700"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title={copied ? "Copied!" : "Copy code"}
              onClick={handleCopy}
              className={`h-7 px-2.5 rounded text-xs font-medium gap-1.5 transition-colors hover:bg-slate-700 ${
                copied ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {copied ? (
                <><Check className="h-3.5 w-3.5" /> Copied!</>
              ) : (
                <><Copy className="h-3.5 w-3.5" /> Copy</>
              )}
            </Button>
          </div>
        </div>

        {/* ── Line count badge ── */}
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

        {/* ── Code area ── */}
        <div className={`bg-slate-900 py-3 ${isTall && collapsed ? "max-h-[260px] overflow-hidden relative" : "overflow-x-auto"}`}>
          {codeBody}
          {/* Fade gradient when collapsed */}
          {isTall && collapsed && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
          )}
        </div>

        {/* ── Collapse / expand toggle ── */}
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

        {/* ── Explanation ── */}
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
      <div className="flex overflow-x-auto bg-slate-800 border-b border-slate-700/80 gap-0">
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
      {/* Active snippet (no outer wrapper — already has rounded from parent) */}
      <div className="[&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none [&>div]:my-0">
        <CodeBlock snippet={sorted[activeIdx]} />
      </div>
    </div>
  );
}