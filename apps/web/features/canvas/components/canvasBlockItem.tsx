"use client";

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
  onStartEditingAction: (id: string) => void;
  onStopEditingAction: () => void;
  onChangeContentAction: (id: string, next: string) => void;
  onGrowAction: (id: string, contentHeightPx: number) => void;
};

export default function CanvasBlockItem({
  block,
  isEditing,
  onStartEditingAction,
  onStopEditingAction,
  onChangeContentAction,
  onGrowAction,
}: CanvasBlockItemProps) {
  const Editor = editorRegistry[block.type] ?? editorRegistry["note"];
  const View = viewRegistry[block.type] ?? viewRegistry["note"];

  const editorProps: BaseEditorProps = {
    value: block.content,
    onChangeAction: (next) => onChangeContentAction(block.id, next),
    onGrowAction: (px) => onGrowAction(block.id, px),
    onRequestCloseAction: onStopEditingAction,
  };

  const viewProps: BaseViewProps = {
    blockId: block.id,
    content: block.content,
    onGrowAction,
    onRequestEditAction: () => onStartEditingAction(block.id),
  };

  return (
    <div
      className="w-full h-full rounded-sm bg-secondary"
      style={{ overflow: "hidden" }}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onStartEditingAction(block.id);
      }}
    >
      {isEditing ? <Editor {...editorProps} /> : <View {...viewProps} />}
    </div>
  );
}
