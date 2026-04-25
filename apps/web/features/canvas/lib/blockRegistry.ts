import React from "react";
import { BlockStyle } from "./createBlockHelper";

// --- shared contracts ---
export interface BaseEditorProps {
  value: string;
  blockStyle?: BlockStyle;
  onChangeAction: (next: string) => void;
  onGrowAction: (contentHeightPx: number) => void;
  onRequestCloseAction: () => void;
}

export interface BaseViewProps {
  blockId: string;
  content: string;
  blockStyle?: BlockStyle;
  onGrowAction: (id: string, contentHeightPx: number) => void;
  onRequestEditAction?: () => void;
  /** Optional: update block content from view mode (e.g. todo checkboxes). */
  onChangeContentAction?: (next: string) => void;
}

// --- imports ---
import TextBlockEditor from "../editors/textBlockEditor";
import MarkdownBlockEditor from "../editors/markdownBlockEditor";
import ImageBlockEditor from "../editors/imageBlockEditor";
import TextBlockView from "../views/textBlockView";
import MarkdownBlockView from "../views/markdownBlockView";
import ImageBlockView from "../views/imageBlockView";
import CodeBlockEditor from "../editors/codeBlockEditor";
import TodoBlockEditor from "../editors/todoBlockEditor";
import CodeBlockView from "../views/codeBlockView";
import TodoBlockView from "../views/todoBlockView";
import { Block } from "./createBlockHelper";

// --- registries ---
export const editorRegistry: Record<
  Block["type"],
  React.ComponentType<BaseEditorProps>
> = {
  note: TextBlockEditor,
  markdown: MarkdownBlockEditor,
  image: ImageBlockEditor,
  code: CodeBlockEditor,
  todo: TodoBlockEditor,
};

export const viewRegistry: Record<
  Block["type"],
  React.ComponentType<BaseViewProps>
> = {
  note: TextBlockView,
  markdown: MarkdownBlockView,
  image: ImageBlockView,
  code: CodeBlockView,
  todo: TodoBlockView,
};
