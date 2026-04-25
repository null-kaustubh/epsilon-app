"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 sm:right-2 z-50 flex justify-center px-4 py-3 pointer-events-none">
      <div className="relative w-full max-w-280 pointer-events-auto">
        <nav
          className="flex items-center justify-between gap-8 rounded-xl border border-[#1e1e1e] bg-linear-to-b from-[#1e1e1e] to-[#151515]
          pl-5 pr-3 h-16 shadow-[
            inset_0_1px_0_rgba(255,255,255,0.07),
            inset_0_-1px_0_rgba(0,0,0,0.8),
            0_0_0_1px_rgba(255,255,255,0.03),
            0_4px_6px_rgba(0,0,0,0.6),
            0_12px_24px_rgba(0,0,0,0.5),
            0_24px_48px_rgba(0,0,0,0.3)
          ]
          w-full"
        >
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl tracking-tight text-white/80 hover:text-white transition-colors duration-200"
          >
            epsilon
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center">
            <a
              href="#features"
              className="rounded-md text-sm tracking-wide lowercase text-white/40 px-3 py-2
              transition-all duration-200 hover:text-white/80
              hover:bg-white/4
              hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.3)]"
            >
              Features
            </a>
            <a
              href="#why"
              className="rounded-md text-sm tracking-wide lowercase text-white/40 px-3 py-2
              transition-all duration-200 hover:text-white/80
              hover:bg-white/4
              hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.3)]"
            >
              Why epsilon
            </a>
            <div className="w-px h-4 bg-white/10 mx-4" />
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="text-sm tracking-wide lowercase text-white/40 px-3 py-2 rounded-md cursor-pointer
                transition-all duration-200 hover:text-white/80
                hover:bg-white/4
                hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.3)]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-linear-to-b from-[#202020] to-[#141414] tracking-wide lowercase px-3.5 py-2 text-sm text-white/80
                border border-[#0a0a0a] cursor-pointer
                shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_6px_rgba(0,0,0,0.5)]
                hover:from-[#252525] hover:to-[#181818] hover:text-white
                transition-all duration-200"
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* Mobile Right */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/signin"
              className="text-sm tracking-wide lowercase text-white/40 px-3 py-2 rounded-md cursor-pointer
              transition-all duration-200 hover:text-white/80"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-linear-to-b from-[#202020] to-[#141414] px-3.5 py-2 text-sm tracking-wide lowercase text-white/80
              border border-[#0a0a0a] cursor-pointer
              shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_6px_rgba(0,0,0,0.5)]
              hover:from-[#252525] hover:to-[#181818] hover:text-white
              transition-all duration-200"
            >
              Sign up
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-md text-white/40 hover:text-white/80 hover:bg-white/4 transition-all duration-200 cursor-pointer"
              aria-label="Toggle menu"
            >
              {open ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <line
                    x1="2"
                    y1="2"
                    x2="16"
                    y2="16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="16"
                    y1="2"
                    x2="2"
                    y2="16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <line
                    x1="2"
                    y1="5"
                    x2="16"
                    y2="5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="2"
                    y1="9"
                    x2="16"
                    y2="9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="2"
                    y1="13"
                    x2="16"
                    y2="13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        {open && (
          <div
            className="md:hidden mt-1 rounded-xl border border-[#1e1e1e] bg-linear-to-b from-[#1e1e1e] to-[#151515]
            shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_8px_24px_rgba(0,0,0,0.5)]
            overflow-hidden"
          >
            <a
              href="#features"
              onClick={() => setOpen(false)}
              className="block px-5 py-3.5 text-sm font-medium tracking-wide lowercase text-white/40 hover:text-white/80 hover:bg-white/4 transition-all duration-200 border-b border-white/4"
            >
              Features
            </a>
            <a
              href="#why"
              onClick={() => setOpen(false)}
              className="block px-5 py-3.5 text-sm font-medium tracking-wide lowercase text-white/40 hover:text-white/80 hover:bg-white/4 transition-all duration-200"
            >
              Why epsilon
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
