export type CodeBlockPayload = {
  filename: string;
  code: string;
};

const EXT_TO_LANG: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  json: "json",
  css: "css",
  html: "html",
  xml: "xml",
  md: "markdown",
  sh: "bash",
  bash: "bash",
  py: "python",
  rs: "rust",
  go: "go",
  java: "java",
  cs: "csharp",
  cpp: "cpp",
  cc: "cpp",
  c: "c",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
};

export function langFromFilename(filename: string): string {
  const m = filename.trim().match(/\.([^.]+)$/);
  const ext = m?.[1]?.toLowerCase();
  return (ext && EXT_TO_LANG[ext]) ?? "plaintext";
}

export function defaultCodeBlockPayload(): CodeBlockPayload {
  return { filename: "snippet.ts", code: "" };
}

export function parseCodeBlockContent(raw: string): CodeBlockPayload {
  if (!raw.trim()) return defaultCodeBlockPayload();
  try {
    const p = JSON.parse(raw) as Partial<CodeBlockPayload>;
    if (typeof p.filename === "string" && typeof p.code === "string") {
      return {
        filename: p.filename,
        code: p.code,
      };
    }
  } catch {
    /* ignore */
  }
  return defaultCodeBlockPayload();
}

export function extFromFilename(filename: string): string {
  const m = filename.trim().match(/\.([^.]+)$/);
  return m?.[1]?.toLowerCase() ?? "plaintext";
}
