import { Plus } from "phosphor-react";
import type { Block } from "../lib/createBlockHelper";

type AddBlockButtonProps = {
  onAdd: (type: Block["type"]) => void;
};

export default function AddBlockButton({ onAdd }: AddBlockButtonProps) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => {
          console.log("addtext clicked");
          return onAdd("note");
        }}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/70 transition"
      >
        <Plus size={16} />
        <span>Add Text</span>
      </button>
      <button
        onClick={() => {
          console.log("addimage clicked");
          return onAdd("image");
        }}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/70 transition"
      >
        <Plus size={16} />
        <span>Add Image</span>
      </button>
      <button
        onClick={() => {
          console.log("addmd clicked");
          return onAdd("markdown");
        }}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/70 transition"
      >
        <Plus size={16} />
        <span>Add Markdown</span>
      </button>
    </div>
  );
}
