export default function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-bodoni text-xl font-semibold text-landing-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-landing-foreground-soft">
        {children}
      </div>
    </section>
  );
}
