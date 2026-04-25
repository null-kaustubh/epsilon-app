"use client";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-landing-background px-6 pt-20 lg:px-10">
      <div className="relative mx-auto max-w-7xl">
        {/* TOP CONTENT */}
        <div className="relative pt-14">
          <h1 className="max-w-5xl text-6xl font-semibold leading-[0.98] tracking-[-0.05em] text-landing-foreground sm:text-7xl lg:text-[88px]">
            The workspace
            <br />
            that keeps
            <br />
            ideas structured.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-landing-text-secondary">
            Purpose-built for planning, building, and shipping ideas. Designed
            for the modern creator.
          </p>

          {/* Right chip */}
          <div className="mt-10 lg:absolute lg:right-0 lg:top-24">
            <div className="inline-flex items-center gap-3 rounded-full border border-landing-white-8 bg-landing-white-5 px-5 py-3 text-sm text-landing-text-secondary">
              <span className="h-2 w-2 rounded-full bg-landing-primary" />
              Build faster with epsilon →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
