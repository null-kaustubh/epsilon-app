"use client";

import Image from "next/image";
import Link from "next/link";
import { SOURCE_CODE_GITHUB_URL } from "../../config/site";

const GITHUB_URL = SOURCE_CODE_GITHUB_URL.replace(/\.git$/, "");

export default function PausedPage() {
  return (
    <div
      data-color-theme="light"
      className="h-dvh min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y bg-landing-background text-landing-foreground"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <header className="px-6 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <Link
            href="/"
            className="flex cursor-pointer items-center font-bodoni text-2xl font-bold text-landing-foreground select-none hover:opacity-80"
          >
            <Image
              src="/epsilon_logo.svg"
              alt=""
              width={24}
              height={24}
              className="-mt-0.5"
            />
            PSILON
          </Link>
          <Link
            href="/"
            className="font-inter text-sm text-landing-foreground-soft hover:underline"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-16 font-inter">
        <p className="text-sm tracking-wide text-landing-foreground-soft/70 uppercase">
          A short note
        </p>
        <h1 className="mt-3 font-bodoni text-4xl font-semibold tracking-tight sm:text-5xl">
          Hosted Epsilon is wrapping up
        </h1>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-landing-foreground-soft">
          <p>
            Running the public app around the clock got expensive, and the AWS
            credits keeping it alive are about to run out. Rather than let the
            servers vanish overnight, I&apos;m shutting the hosted version down
            on purpose.
          </p>
          <p>
            Sign in and sign up are closed. Anything that lived on
            epsilonapp.site won&apos;t stay online.
          </p>
          <p>
            The whole project is open source, and the GitHub docs are written so
            you can get Epsilon running on your own machine without a treasure
            hunt. Clone it, follow the README, and you&apos;re in.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-landing-foreground-soft px-5 py-3 font-medium text-sm text-landing-background transition-opacity hover:opacity-80"
          >
            Set it up locally on GitHub
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 10L10 2M10 2H4M10 2V8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </main>
    </div>
  );
}
