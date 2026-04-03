import { createHighlighter } from "shiki";

export const highlighterPromise = createHighlighter({
  themes: ["one-dark-pro", "one-light"],
  langs: [
    "javascript",
    "typescript",
    "tsx",
    "jsx",
    "json",
    "css",
    "html",
    "xml",
    "markdown",
    "bash",
    "shell",
    "python",
    "rust",
    "go",
    "java",
    "csharp",
    "c",
    "cpp",
    "sql",
    "yaml",
    "plaintext",
  ],
});
