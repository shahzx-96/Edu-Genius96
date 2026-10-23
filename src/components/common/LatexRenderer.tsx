import React, { useMemo, useState } from 'react';
import katex from 'katex';
import { Check, Copy } from 'lucide-react';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parsedElements = useMemo(() => {
    if (!content) return [];

    // First, extract code blocks ```...``` to avoid LaTeX collisions
    const codeBlockRegex = /```([a-zA-Z0-9]*)\n?([\s\S]*?)```/g;
    const parts: { type: 'code' | 'text'; code?: string; lang?: string; text?: string }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', lang: match[1] || 'text', code: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', text: content.slice(lastIndex) });
    }

    return parts;
  }, [content]);

  // Helper to render KaTeX safely
  const renderMathSafely = (tex: string, displayMode: boolean): string => {
    try {
      return katex.renderToString(tex, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch (e) {
      return `<span class="text-rose-500 font-mono text-xs">${tex}</span>`;
    }
  };

  // Helper to parse text segment containing LaTeX and simple markdown
  const renderTextSegment = (text: string, segmentIdx: number) => {
    // Replace block math $$...$$
    let formatted = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      const rendered = renderMathSafely(math.trim(), true);
      return `<div class="my-2 py-1 overflow-x-auto text-center">${rendered}</div>`;
    });

    // Replace inline math $...$ (avoiding currency $10)
    formatted = formatted.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (_, prefix, math) => {
      const rendered = renderMathSafely(math.trim(), false);
      return `${prefix}${rendered}`;
    });

    // Headings
    formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-5 mb-3 pb-1.5 border-b border-slate-200 dark:border-slate-800">$1</h1>');

    // Bold & italic
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700 dark:text-slate-300">$1</em>');

    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-mono text-xs">$1</code>');

    // Line breaks & paragraphs
    formatted = formatted.replace(/\n\n/g, '<div class="h-2.5"></div>');
    formatted = formatted.replace(/\n/g, '<br />');

    return (
      <div
        key={`segment-${segmentIdx}`}
        className="leading-relaxed text-sm md:text-base text-slate-800 dark:text-slate-200"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  };

  return (
    <div className={`space-y-3 font-sans ${className}`}>
      {parsedElements.map((part, index) => {
        if (part.type === 'code' && part.code) {
          return (
            <div key={`code-${index}`} className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-xs">
                <span className="font-mono text-slate-400 font-medium lowercase">{part.lang || 'code'}</span>
                <button
                  onClick={() => copyToClipboard(part.code || '', index)}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors py-1 px-2 rounded hover:bg-slate-800/80 active:scale-95"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-emerald-300">
                <code>{part.code}</code>
              </pre>
            </div>
          );
        }

        return renderTextSegment(part.text || '', index);
      })}
    </div>
  );
};
