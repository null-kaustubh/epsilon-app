export default function OAuthButton({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
}) {
  const baseStyles = {
    background: "var(--secondary)",
    color: "var(--secondary-foreground)",
    border: "1px solid var(--border)",
  };

  const hoverEnter = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor =
      "color-mix(in srgb, var(--muted-foreground) 40%, transparent)";
    (e.currentTarget as HTMLElement).style.background = "var(--muted)";
  };

  const hoverLeave = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
    (e.currentTarget as HTMLElement).style.background = "var(--secondary)";
  };

  const className =
    "w-full flex items-center justify-center gap-2.5 text-sm font-inter font-medium rounded-lg py-2 px-4 transition-all duration-150 cursor-pointer";

  if (href) {
    return (
      <a
        href={href}
        className={className}
        style={baseStyles}
        onMouseEnter={hoverEnter}
        onMouseLeave={hoverLeave}
      >
        {icon}
        {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={baseStyles}
      onMouseEnter={hoverEnter}
      onMouseLeave={hoverLeave}
    >
      {icon}
      {label}
    </button>
  );
}
