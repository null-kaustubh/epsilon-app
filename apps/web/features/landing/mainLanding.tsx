"use client";

import { useMemo } from "react";
import Hero from "./hero";
import SectionDivider from "./sectionDivider";

export default function Landing() {
  const stats = useMemo(
    () => [
      "Block-first editor",
      "Spatial canvas",
      "Realtime collaboration",
      "Markdown export",
    ],
    [],
  );
  return (
    <main className="h-dvh overflow-y-auto bg-landing-background">
      {/* HERO */}
      <SectionDivider bottom>
        <Hero />
      </SectionDivider>

      {/* TRUST BAR */}
      <SectionDivider bottom>
        <section className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid gap-4 rounded-3xl border border-black/5 bg-white p-6 md:grid-cols-4">
            {stats.map((item) => (
              <div key={item} className="text-sm font-medium text-black/65">
                {item}
              </div>
            ))}
          </div>
        </section>
      </SectionDivider>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-28 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
            Features
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Built for modern thinking.
          </h2>

          <p className="mt-5 text-lg leading-8 text-black/60">
            Not another docs clone. A workspace where writing, planning,
            sketching, and organizing happen together.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[
            "Drag blocks anywhere",
            "Nested content structure",
            "Keyboard-first workflow",
            "Realtime multiplayer",
            "Export to Markdown / HTML",
            "Fast canvas interactions",
          ].map((item, i) => (
            <div
              key={item}
              className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm"
            >
              <p className="text-sm font-semibold text-orange-500">0{i + 1}</p>
              <h3 className="mt-3 text-xl font-semibold">{item}</h3>
              <p className="mt-3 text-sm leading-7 text-black/55">
                Thoughtfully designed to feel instant, clean, and powerful.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section id="why" className="mx-auto max-w-6xl px-6 pb-28 lg:px-10">
        <div className="grid gap-10 rounded-4xl border border-black/5 bg-white p-8 md:grid-cols-[1fr_1.1fr] md:items-start md:gap-14 md:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
              Why epsilon
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              The structure you want, without the rigidity.
            </h2>
            <p className="mt-5 text-lg leading-8 text-black/60">
              Most tools force you into a single shape: a page, a list, a board.
              epsilon stays flexible, but still keeps your work legible.
            </p>
          </div>

          <div className="grid gap-5">
            {[
              {
                title: "Designed for momentum",
                body: "Fast interactions, clear hierarchy, minimal UI. You stay in flow.",
              },
              {
                title: "Visual, but not messy",
                body: "Blocks are movable and structured—so your canvas stays readable.",
              },
              {
                title: "A workspace, not a document",
                body: "Notes, tasks, and snippets live together with context that sticks.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-black/5 bg-[#fcfbf8] p-6"
              >
                <p className="text-base font-semibold tracking-tight text-black">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-black/60">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-28 lg:px-10">
        <div className="mx-auto max-w-6xl rounded-4xl bg-black px-8 py-16 text-center text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">
            Ready
          </p>

          <h3 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Start building documents that think like you do.
          </h3>

          <p className="mx-auto mt-5 max-w-2xl text-white/60">
            Free to start. No credit card. No clutter.
          </p>

          <button className="mt-10 rounded-2xl bg-orange-500 px-7 py-4 text-sm font-semibold text-white hover:opacity-95">
            Create workspace
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/5 px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-2xl font-head">epsilon</p>
          <p className="text-sm text-black/50">
            © 2026 epsilon. Designed for builders.
          </p>
        </div>
      </footer>
    </main>
  );
}
