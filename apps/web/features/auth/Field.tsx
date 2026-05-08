export default function Field({
  label,
  hint,
  right,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  right?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label
          htmlFor={htmlFor}
          className="text-[10.5px] font-inter font-semibold tracking-widest uppercase"
          style={{ color: "var(--muted-foreground)" }}
        >
          {label}
        </label>

        {right && (
          <div className="flex items-center lowercase tracking-normal">
            {right}
          </div>
        )}
      </div>
      {children}
      {hint && (
        <p
          className="text-[12px] pl-0.5 font-inter"
          style={{ color: "var(--muted-foreground)" }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
