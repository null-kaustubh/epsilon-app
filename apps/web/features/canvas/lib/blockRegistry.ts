import React from "react";

// --- shared contracts ---
export interface BaseEditorProps {
  value: string;
  onChangeAction: (next: string) => void;
  onGrowAction: (contentHeightPx: number) => void;
  onRequestCloseAction: () => void;
}

export interface BaseViewProps {
  blockId: string;
  content: string;
  onGrowAction: (id: string, contentHeightPx: number) => void;
  onRequestEditAction?: () => void;
}

// --- imports ---
import TextBlockEditor from "../editors/textBlockEditor";
import MarkdownBlockEditor from "../editors/markdownBlockEditor";
import ImageBlockEditor from "../editors/imageBlockEditor";
import TextBlockView from "../views/textBlockView";
import MarkdownBlockView from "../views/markdownBlockView";
import ImageBlockView from "../views/imageBlockView";
import { Block } from "./createBlockHelper";

// --- registries ---
export const editorRegistry: Record<
  Block["type"],
  React.ComponentType<BaseEditorProps>
> = {
  note: TextBlockEditor,
  markdown: MarkdownBlockEditor,
  image: ImageBlockEditor,
  code: TextBlockEditor, // fallback until CodeBlockEditor exists
  todo: TextBlockEditor, // fallback until TodoBlockEditor exists
};

export const viewRegistry: Record<
  Block["type"],
  React.ComponentType<BaseViewProps>
> = {
  note: TextBlockView,
  markdown: MarkdownBlockView,
  image: ImageBlockView,
  code: TextBlockView, // fallback
  todo: TextBlockView, // fallback
};
