import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, ExternalLink, AlertTriangle, Lightbulb, Info, CheckCircle2, Zap, ChevronRight } from "lucide-react";
import type { Components } from "react-markdown";
import type { ReactNode } from "react";

// ─── Syntax highlight theme tweaked for our design ───
const codeStyle = {
  ...oneDark,
  'code[class*="language-"]': { ...oneDark['code[class*="language-"]'], background: "transparent", fontSize: "0.875rem" },
  'pre[class*="language-"]': { ...oneDark['pre[class*="language-"]'], background: "transparent", fontSize: "0.875rem" },
};

// ─── Pre-process custom syntax ───
// We convert custom blocks to HTML so react-markdown can render them via custom components.

function preprocessMarkdown(md: string): string {
  let out = md;

  // Feature cards: :::feature Title\nContent\n:::
  out = out.replace(/^:::feature\s+(.+)\n([\s\S]*?)^:::/gm, (_: string, title: string, body: string) => {
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    return `<FeatureCard title="${escapeAttr(cleanTitle)}">\n${cleanBody}\n</FeatureCard>`;
  });

  // GitHub-style callouts: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT]
  // These are blockquotes where the first line is a callout marker
  const blockquoteCallout = /^(>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION|DANGER|INFO|SUCCESS|ERROR)\])([\s\S]*?)(?=\n\n|$(?![\s\S]))/gm;
  // Simpler approach: process line by line for blockquote callouts
  const lines = out.split("\n");
  const result: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION|DANGER|INFO|SUCCESS|ERROR)\]\s*(.*)/i);
    if (match) {
      const type = match[1].toLowerCase();
      const firstContent = match[2];
      const bodyLines: string[] = firstContent ? [firstContent] : [];
      i++;
      while (i < lines.length && lines[i].startsWith(">")) {
        const content = lines[i].replace(/^>\s?/, "");
        bodyLines.push(content);
        i++;
      }
      const body = bodyLines.join("\n").trim();
      result.push(`<Callout type="${type}">\n${body}\n</Callout>`);
      result.push("");
    } else {
      result.push(line);
      i++;
    }
  }
  out = result.join("\n");

  // YouTube embeds: bare YouTube URLs on their own line → embedded iframe
  out = out.replace(
    /^(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11}))$/gm,
    '<YouTubeEmbed url="$1" vid="$2" />'
  );

  return out;
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Sub-components ───

const Lightbox = ({ src, alt, onClose }: { src: string; alt?: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className="absolute top-4 right-4 p-2 bg-card border border-border rounded-full text-muted-foreground hover:text-foreground transition-colors"
    >
      <X className="w-5 h-5" />
    </button>
    <motion.img
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      src={src}
      alt={alt || ""}
      className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </motion.div>
);

const ZoomableImage = ({ src, alt }: { src?: string; alt?: string }) => {
  const [open, setOpen] = useState(false);
  if (!src) return null;

  return (
    <>
      <figure className="my-8 group relative">
        <div className="relative overflow-hidden rounded-xl border border-border shadow-sm">
          <img
            src={src}
            alt={alt || ""}
            className="w-full object-cover cursor-zoom-in"
            onClick={() => setOpen(true)}
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
          <button
            onClick={() => setOpen(true)}
            className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        {alt && (
          <figcaption className="mt-3 text-center text-sm text-muted-foreground font-body italic">
            {alt}
          </figcaption>
        )}
      </figure>
      <AnimatePresence>{open && <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
};

const calloutConfig: Record<string, { icon: ReactNode; bg: string; border: string; text: string; label: string }> = {
  note:         { icon: <Info className="w-5 h-5" />,            bg: "bg-blue-500/5",  border: "border-blue-500/20",  text: "text-blue-600 dark:text-blue-400",         label: "Note" },
  tip:          { icon: <Lightbulb className="w-5 h-5" />,      bg: "bg-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", label: "Tip" },
  warning:      { icon: <AlertTriangle className="w-5 h-5" />,  bg: "bg-amber-500/5",  border: "border-amber-500/20",  text: "text-amber-600 dark:text-amber-400",      label: "Warning" },
  important:    { icon: <AlertTriangle className="w-5 h-5" />,  bg: "bg-orange-500/5", border: "border-orange-500/20", text: "text-orange-600 dark:text-orange-400",    label: "Important" },
  caution:      { icon: <AlertTriangle className="w-5 h-5" />,  bg: "bg-red-500/5",    border: "border-red-500/20",    text: "text-red-600 dark:text-red-400",          label: "Caution" },
  danger:       { icon: <AlertTriangle className="w-5 h-5" />,  bg: "bg-red-500/10",   border: "border-red-500/30",   text: "text-red-600 dark:text-red-400",          label: "Danger" },
  info:         { icon: <Info className="w-5 h-5" />,           bg: "bg-sky-500/5",    border: "border-sky-500/20",    text: "text-sky-600 dark:text-sky-400",          label: "Info" },
  success:      { icon: <CheckCircle2 className="w-5 h-5" />,   bg: "bg-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", label: "Success" },
  error:        { icon: <X className="w-5 h-5" />,               bg: "bg-red-500/5",    border: "border-red-500/20",    text: "text-red-600 dark:text-red-400",          label: "Error" },
  info_default: { icon: <Info className="w-5 h-5" />,           bg: "bg-accent/50",     border: "border-border",        text: "text-foreground",                         label: "Note" },
};

const CalloutBlock = ({ type, children }: { type: string; children: ReactNode }) => {
  const config = calloutConfig[type] || calloutConfig.info_default;
  return (
    <div className={`my-6 rounded-xl border ${config.border} ${config.bg} p-5`}>
      <div className={`flex items-center gap-2 mb-2 ${config.text}`}>
        {config.icon}
        <span className="text-sm font-display font-semibold uppercase tracking-wide">{config.label}</span>
      </div>
      <div className="text-sm text-muted-foreground font-body leading-relaxed [&>p]:my-1">
        {children}
      </div>
    </div>
  );
};

const FeatureCardBlock = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="my-6 bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/10 transition-colors duration-300">
    <div className="flex items-center gap-2 px-5 py-4 bg-muted/30 border-b border-border">
      <Zap className="w-4 h-4 text-primary" />
      <h4 className="font-display font-semibold text-foreground text-sm">{title}</h4>
    </div>
    <div className="p-5 text-sm text-muted-foreground font-body leading-relaxed [&>p]:my-1 [&>ul]:my-2 [&>ul]:list-disc [&>ul]:pl-5">
      {children}
    </div>
  </div>
);

const YouTubeEmbed = ({ url, vid }: { url: string; vid: string }) => (
  <figure className="my-8">
    <div className="relative aspect-video rounded-xl overflow-hidden border border-border shadow-sm bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${vid}`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    </div>
    <figcaption className="mt-2 text-center text-xs text-muted-foreground font-body">
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
        <ExternalLink className="w-3 h-3" />
        Watch on YouTube
      </a>
    </figcaption>
  </figure>
);

// ─── Main component ───

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const processed = useMemo(() => preprocessMarkdown(content), [content]);

  const isPlainText = useMemo(() => {
    // If text has no markdown indicators, treat as plain text
    const hasMarkdown = /^#{1,6}\s|^\*\*|^\*[^*]|^-\s|^>\s|^```|^\[|!\[|`|~~|^\d+\.\s/.test(content);
    return !hasMarkdown && !content.includes("<Callout") && !content.includes("<FeatureCard") && !content.includes("<YouTubeEmbed");
  }, []); // Only computed once since content identity is handled by useMemo above

  if (!content?.trim()) return null;

  if (content && isPlainText && !processed.includes("<Callout") && !processed.includes("<FeatureCard") && !processed.includes("<YouTubeEmbed")) {
    // Rich plain-text: preserve paragraphs via double-newlines
    const paragraphs = content.split(/\n\n+/).filter(Boolean);
    return (
      <section className={`py-16 md:py-24 ${className}`}>
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <div className="space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-muted-foreground font-body leading-relaxed text-lg">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const components: Components = {
    // Code blocks with syntax highlighting
    code({ className: codeClass, children, node, ...props }) {
      const match = /language-(\w+)/.exec(codeClass || "");
      const isInline = !match && !(String(children).includes("\n"));

      if (!isInline && match) {
        return (
          <div className="my-6 rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
              <span className="text-xs font-body text-muted-foreground uppercase tracking-wide">{match[1]}</span>
              <button
                onClick={() => navigator.clipboard.writeText(String(children))}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
              >
                Copy
              </button>
            </div>
            <SyntaxHighlighter
              style={codeStyle}
              language={match[1]}
              PreTag="div"
              customStyle={{ margin: 0, borderRadius: 0, padding: "1.25rem 1.5rem", background: "hsl(var(--card))" }}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        );
      }

      // Inline code
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono text-primary border border-border" {...props}>
          {children}
        </code>
      );
    },

    // Tables
    table({ children }) {
      return (
        <div className="my-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">{children}</table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className="bg-muted/50 border-b border-border">{children}</thead>;
    },
    th({ children }) {
      return (
        <th className="px-4 py-3 text-left font-display font-semibold text-foreground text-xs uppercase tracking-wider">
          {children}
        </th>
      );
    },
    td({ children }) {
      return <td className="px-4 py-3 text-muted-foreground font-body border-t border-border/50">{children}</td>;
    },

    // Images with zoom
    img({ src, alt }) {
      return <ZoomableImage src={src} alt={alt} />;
    },

    // Links open in new tab
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 decoration-border hover:decoration-foreground transition-all font-medium"
        >
          {children}
        </a>
      );
    },

    // Blockquotes (default style when not a callout)
    blockquote({ children }) {
      return (
        <blockquote className="my-6 border-l-2 border-primary pl-5 italic text-muted-foreground font-body">
          {children}
        </blockquote>
      );
    },

    // Custom HTML elements injected by preprocessor
    Callout({ type, children }: { type?: string; children?: ReactNode } & Record<string, unknown>) {
      return <CalloutBlock type={type || "info_default"}>{children}</CalloutBlock>;
    },
    FeatureCard({ title, children }: { title?: string; children?: ReactNode } & Record<string, unknown>) {
      return <FeatureCardBlock title={title || ""}>{children}</FeatureCardBlock>;
    },
    YouTubeEmbed({ url, vid }: { url?: string; vid?: string }) {
      return <YouTubeEmbed url={url || ""} vid={vid || ""} />;
    },

    // Horizontal rule
    hr() {
      return <hr className="my-12 border-t border-border" />;
    },

    // Lists
    ul({ children }) {
      return <ul className="my-4 space-y-2 list-disc pl-5 text-muted-foreground font-body marker:text-primary">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="my-4 space-y-2 list-decimal pl-5 text-muted-foreground font-body marker:text-foreground marker:font-display marker:font-semibold">{children}</ol>;
    },
    li({ children }) {
      return <li className="pl-1 leading-relaxed">{children}</li>;
    },

    // Emphasis
    strong({ children }) {
      return <strong className="font-semibold text-foreground">{children}</strong>;
    },
    em({ children }) {
      return <em className="italic">{children}</em>;
    },
  };

  return (
    <section className={`py-16 md:py-24 ${className}`}>
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <div className="prose prose-lg dark:prose-invert max-w-none
          prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
          prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:mb-8 prose-h1:mt-0
          prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border
          prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
          prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3
          prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-5
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
          prose-li:text-muted-foreground prose-li:my-1
          prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono
          prose-code:before:content-none prose-code:after:content-none
          prose-img:rounded-xl prose-img:shadow-md
          prose-strong:text-foreground prose-strong:font-semibold
          prose-hr:border-border
        ">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["no-underline"] } }]]}
            components={components as Components}
          >
            {processed}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
