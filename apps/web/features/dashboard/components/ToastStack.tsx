"use client";

import UndoToast from "./UndoToast";
import { PendingDelete } from "../hooks/useSpaces";
import { Space } from "../../../lib/spaces";

type Props = {
  pendingDeletes: PendingDelete[];
  onUndo: (id: number) => void;
  onExpire: (id: number, space: Space) => void;
};

export function ToastStack({ pendingDeletes, onUndo, onExpire }: Props) {
  return (
    <div className="fixed bottom-20 left-0 right-0 z-9999 flex flex-col-reverse items-center gap-2 pointer-events-none">
      {pendingDeletes.map(({ space, id }) => (
        <div key={id} className="pointer-events-auto">
          <UndoToast
            spaceName={space.name}
            onUndo={() => onUndo(id)}
            onExpire={() => onExpire(id, space)}
          />
        </div>
      ))}
    </div>
  );
}
