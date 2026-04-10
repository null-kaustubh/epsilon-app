"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "phosphor-react";

type SpaceNameModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialName?: string;
  title: string;
  submitLabel: string;
  loading?: boolean;
};

export default function SpaceNameModal({
  open,
  onClose,
  onSubmit,
  initialName = "",
  title,
  submitLabel,
  loading = false,
}: SpaceNameModalProps) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, initialName]);

  if (!open) return null;

  const canSubmit = name.trim().length > 0 && !loading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSubmit) onSubmit(name.trim());
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm bg-secondary border border-border
                    rounded-xl p-6 shadow-popover"
        style={{
          animation: "modalIn 0.2s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="text-foreground text-[13px] font-medium tracking-wide mb-1.5 block">
            Name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My awesome space"
            className="w-full bg-muted text-foreground
                       placeholder:text-muted-foreground/50
                       border border-border rounded-md
                       px-3.5 py-2.5 text-sm
                       outline-none caret-accent
                       transition-all duration-200
                       focus:bg-background
                       focus:border-accent
                       focus:ring-2 focus:ring-accent/20"
          />

          <div className="flex items-center justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-md text-sm text-muted-foreground
                         hover:text-foreground hover:bg-muted
                         transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                          ${
                            canSubmit
                              ? "bg-accent text-accent-foreground cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(253,145,62,0.32)]"
                              : "bg-primary/80 text-primary-foreground/30 cursor-not-allowed"
                          }
                          ${loading ? "opacity-75 cursor-wait" : ""}`}
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
