export default function OAuthButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-2.5
                 text-sm font-inter font-medium rounded-lg py-2 px-4
                 transition-all duration-150 cursor-pointer"
      style={{
        background: "var(--secondary)",
        color: "var(--secondary-foreground)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "color-mix(in srgb, var(--muted-foreground) 40%, transparent)";
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--muted)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--border)";
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--secondary)";
      }}
    >
      {icon}
      {label}
    </button>
  );
}
