export default function InputWrap({
  indicator,
  children,
}: {
  indicator?: "valid" | "invalid" | null;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {indicator && (
        <span
          className="absolute right-3.5 top-1/2 text-[11px] font-bold pointer-events-none"
          style={{
            color:
              indicator === "valid" ? "var(--success)" : "var(--destructive)",
            animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
            transform: "translateY(-50%)",
          }}
        >
          {indicator === "valid" ? "✓" : "!"}
        </span>
      )}
    </div>
  );
}
