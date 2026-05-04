import type { ReactNode } from "react";

export function renderInlineMarkdown(text: string): ReactNode {
  // Token order: code (`...`), bold (**...**), italic (*...*).
  const tokenRegex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  const nodes: ReactNode[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    const start = match.index;
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));

    const token = match[0];
    if (token.startsWith("`")) {
      nodes.push(
        <code key={`code-${start}`} className="px-1 rounded bg-muted">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={`bold-${start}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={`italic-${start}`}>{token.slice(1, -1)}</em>);
    }

    lastIndex = start + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function parseMarkdownBlocks(content: string): ReactNode[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  // Heading size + weight per level
  const headingStyles: Record<
    number,
    { fontSize: number; letterSpacing?: string }
  > = {
    1: { fontSize: 28, letterSpacing: "-0.02em" },
    2: { fontSize: 22 },
    3: { fontSize: 18 },
    4: { fontSize: 16 },
    5: { fontSize: 14 },
    6: { fontSize: 13 },
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.trim().length === 0) {
      blocks.push(
        <div
          key={`empty-${i}`}
          style={{
            height: "1em",
          }}
        />,
      );
      i += 1;
      continue;
    }

    // Headings
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      const level = Math.min(6, headingMatch[1]?.length ?? 1);
      const text = headingMatch[2] ?? "";
      const style = headingStyles[level] ?? { fontSize: 14 };
      blocks.push(
        <div
          key={`h-${i}`}
          style={{
            margin: "0 0 2px 0",
            fontWeight: 700,
            fontSize: style.fontSize,
            lineHeight: 1.25,
            letterSpacing: style.letterSpacing,
          }}
        >
          {renderInlineMarkdown(text)}
        </div>,
      );
      i += 1;
      continue;
    }

    // Unordered list
    const ulMatch = /^[-*]\s+(.*)$/.exec(line);
    if (ulMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = /^[-*]\s+(.*)$/.exec(lines[i] ?? "");
        if (!m) break;
        items.push(m[1] ?? "");
        i += 1;
      }
      blocks.push(
        <ul
          key={`ul-${i}`}
          style={{
            margin: "0 0 4px 0",
            paddingLeft: "1.25rem",
            listStyleType: "disc",
          }}
        >
          {items.map((item, idx) => (
            <li
              key={`li-${i}-${idx}`}
              style={{ margin: "1px 0", lineHeight: 1.5 }}
            >
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Paragraph
    const paragraphLines: string[] = [];
    while (i < lines.length && (lines[i]?.trim().length ?? 0) > 0) {
      paragraphLines.push(lines[i] ?? "");
      i += 1;
    }
    blocks.push(
      <p
        key={`p-${i}`}
        style={{ margin: "0 0 4px 0", whiteSpace: "pre-wrap", lineHeight: 1.5 }}
      >
        {renderInlineMarkdown(paragraphLines.join("\n"))}
      </p>,
    );
  }

  return blocks;
}
