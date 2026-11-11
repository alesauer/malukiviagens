import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div className={cn("markdown-content text-foreground leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-4 mb-3 pb-2 text-lg sm:text-2xl font-display font-bold text-foreground border-b border-border/60 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-4 mb-2 text-base sm:text-xl font-display font-semibold text-foreground first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-3 mb-1.5 text-sm sm:text-base font-semibold text-foreground">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-2.5 mb-1 text-xs sm:text-sm font-semibold text-foreground">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-xs sm:text-sm leading-relaxed text-foreground/90 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-2.5 ml-4 list-disc space-y-1 text-xs sm:text-sm text-foreground/90 marker:text-primary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 ml-4 list-decimal space-y-1 text-xs sm:text-sm text-foreground/90 marker:text-primary font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-primary/60 bg-primary/5 py-2 px-3.5 rounded-r-xl text-xs sm:text-sm italic text-foreground/80">
              {children}
            </blockquote>
          ),
          code: ({ children, className: codeClass }) => {
            const isBlock = Boolean(codeClass);
            if (isBlock) {
              return (
                <code className={cn("block font-mono text-xs text-slate-100", codeClass)}>
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded-md bg-secondary/80 px-1.5 py-0.5 font-mono text-[11px] sm:text-xs font-semibold text-primary">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-100 font-mono shadow-xs">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-border/70 shadow-xs">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-secondary/70 border-b border-border/70 text-foreground font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border/50">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-muted/40">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="p-2.5 font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-2.5 text-foreground/90">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-4 border-t border-border/70" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline hover:text-primary/80 font-medium"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Componente envolucro da mensagem do Assistente no chat
 */
export function AssistantMessageCard({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Resposta copiada para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative w-full rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-soft transition-all hover:border-primary/30">
      {/* Cabeçalho do Card da Resposta */}
      <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent shadow-xs">
            <Sparkles className="size-4" />
          </div>
          <div>
            <span className="font-semibold text-xs sm:text-sm text-foreground">
              Assistente de Viagens
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 rounded-lg px-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
          title="Copiar texto da resposta"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span className="text-[11px] hidden sm:inline">Copiar</span>
            </>
          )}
        </Button>
      </div>

      {/* Conteúdo Markdown Formatado */}
      <MarkdownContent content={content} />
    </div>
  );
}
