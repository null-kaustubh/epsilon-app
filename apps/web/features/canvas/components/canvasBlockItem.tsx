"use client";

import React, { useMemo, useRef } from "react";
import { Block, BlockStyle } from "../lib/createBlockHelper";
import {
  BaseEditorProps,
  BaseViewProps,
  editorRegistry,
  viewRegistry,
} from "../lib/blockRegistry";
import BlockEditToolbar from "./blockEditToolbar";
import type { MarkdownEditorHandle } from "./blockEditToolbar";
import MarkdownBlockEditor from "../editors/markdownBlockEditor";

type CanvasBlockItemProps = {
  block: Block;
  isEditing: boolean;
  isDeleteMode: boolean;
  onDeleteBlock: (id: string) => void;
  onStartEditingAction: (id: string) => void;
  onStopEditingAction: () => void;
  onChangeContentAction: (id: string, next: string) => void;
  onChangeBlockStyleAction: (id: string, style: BlockStyle) => void;
  onGrowAction: (id: string, contentHeightPx: number) => void;
};

function CanvasBlockItem({
  block,
  isEditing,
  isDeleteMode,
  onDeleteBlock,
  onStartEditingAction,
  onStopEditingAction,
  onChangeContentAction,
  onChangeBlockStyleAction,
  onGrowAction,
}: CanvasBlockItemProps) {
  const editorRef = useRef<MarkdownEditorHandle | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const Editor = editorRegistry[block.type] ?? editorRegistry["note"];
  const View = viewRegistry[block.type] ?? viewRegistry["note"];

  const editorProps: BaseEditorProps = useMemo(
    () => ({
      value: block.content,
      blockStyle: block.style,
      onChangeAction: (next) => onChangeContentAction(block.id, next),
      onGrowAction: (px) => onGrowAction(block.id, px),
      onRequestCloseAction: onStopEditingAction,
    }),
    [
      block.content,
      block.style,
      block.id,
      onChangeContentAction,
      onGrowAction,
      onStopEditingAction,
    ],
  );

  const viewProps: BaseViewProps = useMemo(
    () => ({
      blockId: block.id,
      content: block.content,
      blockStyle: block.style,
      onGrowAction,
      onRequestEditAction: () => onStartEditingAction(block.id),
      onChangeContentAction: (next) => onChangeContentAction(block.id, next),
    }),
    [
      block.content,
      block.style,
      block.id,
      onChangeContentAction,
      onGrowAction,
      onStartEditingAction,
    ],
  );

  const showToolbar =
    isEditing && block.type !== "image" && block.type !== "code";

  const handleStyleChange = useMemo(
    () => (style: BlockStyle) => onChangeBlockStyleAction(block.id, style),
    [block.id, onChangeBlockStyleAction],
  );

  return (
    <div
      ref={anchorRef}
      className="relative w-full h-full rounded-sm bg-secondary"
      style={{ overflow: "visible" }}
      onClick={(e) => {
        if (!isDeleteMode) return;
        e.preventDefault();
        e.stopPropagation();
        onDeleteBlock(block.id);
      }}
      onDoubleClick={(e) => {
        if (isDeleteMode) return;
        e.preventDefault();
        e.stopPropagation();
        onStartEditingAction(block.id);
      }}
    >
      <div className="w-full h-full overflow-hidden rounded-sm">
        {isEditing ? (
          block.type === "markdown" ? (
            <MarkdownBlockEditor {...editorProps} ref={editorRef} />
          ) : (
            <Editor {...editorProps} />
          )
        ) : (
          <View {...viewProps} />
        )}
      </div>

      {showToolbar && (
        <BlockEditToolbar
          blockType={block.type}
          blockStyle={block.style}
          onChangeStyle={handleStyleChange}
          editorRef={block.type === "markdown" ? editorRef : undefined}
          anchorRef={anchorRef}
        />
      )}
    </div>
  );
}

export default React.memo(
  CanvasBlockItem,
  (prev, next) =>
    prev.isEditing === next.isEditing &&
    prev.isDeleteMode === next.isDeleteMode &&
    prev.block.id === next.block.id &&
    prev.block.type === next.block.type &&
    prev.block.content === next.block.content &&
    prev.block.style === next.block.style &&
    prev.onStartEditingAction === next.onStartEditingAction &&
    prev.onChangeBlockStyleAction === next.onChangeBlockStyleAction &&
    prev.onStopEditingAction === next.onStopEditingAction &&
    prev.onChangeContentAction === next.onChangeContentAction &&
    prev.onGrowAction === next.onGrowAction &&
    prev.onDeleteBlock === next.onDeleteBlock,
);
