"use client";

import React, { useMemo } from "react";
import { Block } from "../lib/createBlockHelper";
import {
  BaseEditorProps,
  BaseViewProps,
  editorRegistry,
  viewRegistry,
} from "../lib/blockRegistry";

type CanvasBlockItemProps = {
  block: Block;
  isEditing: boolean;
  isDeleteMode: boolean;
  onDeleteBlock: (id: string) => void;
  onStartEditingAction: (id: string) => void;
  onStopEditingAction: () => void;
  onChangeContentAction: (id: string, next: string) => void;
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
  onGrowAction,
}: CanvasBlockItemProps) {
  const Editor = editorRegistry[block.type] ?? editorRegistry["note"];
  const View = viewRegistry[block.type] ?? viewRegistry["note"];

  const editorProps: BaseEditorProps = useMemo(
    () => ({
      value: block.content,
      onChangeAction: (next) => onChangeContentAction(block.id, next),
      onGrowAction: (px) => onGrowAction(block.id, px),
      onRequestCloseAction: onStopEditingAction,
    }),
    [block.content, block.id, onChangeContentAction, onGrowAction, onStopEditingAction],
  );

  const viewProps: BaseViewProps = useMemo(
    () => ({
      blockId: block.id,
      content: block.content,
      onGrowAction,
      onRequestEditAction: () => onStartEditingAction(block.id),
      onChangeContentAction: (next) => onChangeContentAction(block.id, next),
    }),
    [block.content, block.id, onChangeContentAction, onGrowAction, onStartEditingAction],
  );

  return (
    <div
      className="w-full h-full rounded-sm bg-secondary"
      style={{ overflow: "hidden" }}
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
      {isEditing ? <Editor {...editorProps} /> : <View {...viewProps} />}
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
    prev.onStartEditingAction === next.onStartEditingAction &&
    prev.onStopEditingAction === next.onStopEditingAction &&
    prev.onChangeContentAction === next.onChangeContentAction &&
    prev.onGrowAction === next.onGrowAction &&
    prev.onDeleteBlock === next.onDeleteBlock,
);