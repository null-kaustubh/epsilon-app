"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "phosphor-react";
import { api, ApiError } from "../../lib/api";
import { GitHubIcon, GoogleIcon } from "../signup/page";
import Link from "next/link";
import { toast } from "sonner";
import OAuthButton from "../../features/auth/OAuthButton";
import Field from "../../features/auth/Field";
import InputWrap from "../../features/auth/InputWrap";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = isEmailValid && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await api.post("/auth/login", { email, password });

      toast.success("Welcome back", {
        style: {
          background:
            "color-mix(in srgb, var(--success) 12%, var(--secondary))",
          border:
            "1px solid color-mix(in srgb, var(--success) 35%, transparent)",
        },
      });

      setTimeout(() => {
        router.push("/home");
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong.";

      toast.error(message, {
        style: {
          background:
            "color-mix(in srgb, var(--destructive) 12%, var(--secondary))",
          border:
            "1px solid color-mix(in srgb, var(--destructive) 40%, transparent)",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{ background: "var(--background)" }}
    >
      <div
        className="w-full max-w-300 h-200 flex overflow-hidden"
        style={{
          background: "var(--background)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* ════════════════════════════════════════
          LEFT PANEL — floating card (add image inside)
      ════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-3">
          {/*
          ┌──────────────────────────────────────────────────────────────┐
          │  FLOATING IMAGE CARD                                          │
          │  To add your image, replace the inner placeholder div with:  │
          │                                                               │
          │    <Image                                                     │
          │      src="/your-image.png"                                    │
          │      alt="..."                                                │
          │      fill                                                     │
          │      className="object-cover"                                 │
          │    />                                                         │
          │                                                               │
          │  The card already handles rounded corners + overflow hidden.  │
          └──────────────────────────────────────────────────────────────┘
        */}
          <div
            className="relative w-full h-full max-h-[calc(100vh-3rem)] rounded-2xl overflow-hidden"
            style={{
              background: "var(--secondary)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-popover)",
              animation:
                "cardFloat 0.55s cubic-bezier(0.22,1,0.36,1) 0.08s both",
            }}
          >
            {/* Grid texture — remove when you add a real image */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                linear-gradient(color-mix(in srgb, var(--foreground) 4%, transparent) 1px, transparent 1px),
                linear-gradient(90deg, color-mix(in srgb, var(--foreground) 4%, transparent) 1px, transparent 1px)
              `,
                backgroundSize: "52px 52px",
              }}
            />

            {/* Accent glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 55% 45% at 55% 65%, color-mix(in srgb, var(--accent) 8%, transparent), transparent)",
              }}
            />

            {/* Image placeholder label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center select-none">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Your image goes here
                </p>
                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      "color-mix(in srgb, var(--muted-foreground) 45%, transparent)",
                  }}
                >
                  Replace this panel with your hero artwork
                </p>
              </div>
            </div>

            {/* Bottom text — keep or adapt */}
            <div className="absolute bottom-8 left-8 right-8 z-10 pointer-events-none">
              <p
                className="text-[22px] font-semibold leading-snug"
                style={{ color: "var(--foreground)" }}
              >
                Font management.
                <br />
                <span style={{ color: "var(--accent)" }}>Perfected.</span>
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
          RIGHT PANEL — form
      ════════════════════════════════════════ */}
        <div
          className="w-full lg:w-110 xl:w-120 shrink-0
                   flex flex-col justify-center px-10 xl:px-14 py-12 overflow-y-auto"
          style={{
            animation: "panelIn 0.45s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* Logo */}
          <div className="mb-8">
            <span
              className="text-3xl font-inter font-medium tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              <span style={{ color: "var(--accent)" }}>Ɛ</span> epsilon
            </span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1
              className="text-2xl font-inter font-semibold tracking-tight leading-tight mb-1.5"
              style={{ color: "var(--foreground)" }}
            >
              Welcome back
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Sign in to continue
            </p>
          </div>

          {/* OAuth */}
          <div className="flex flex-col gap-2.5 mb-5">
            <OAuthButton icon={<GoogleIcon />} label="Sign in with Google" />
            <OAuthButton icon={<GitHubIcon />} label="Sign in with GitHub" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border)" }}
            />
            <span
              className="text-[10px] tracking-widest uppercase font-inter"
              style={{ color: "var(--muted-foreground)" }}
            >
              or
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border)" }}
            />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            {/* Email */}
            <Field label="Email" htmlFor="email">
              <InputWrap
                indicator={
                  email.length > 0 ? (isEmailValid ? "valid" : "invalid") : null
                }
              >
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ep-input"
                />
              </InputWrap>
            </Field>

            {/* Password */}
            <Field
              label="Password"
              htmlFor="password"
              right={
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-inter hover:underline cursor-pointer"
                  style={{ color: "var(--accent)" }}
                >
                  Forgot password?
                </Link>
              }
            >
              <InputWrap>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ep-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-150"
                  style={{ color: "var(--muted-foreground)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--foreground)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--muted-foreground)")
                  }
                >
                  {showPassword ? <EyeClosed size={14} /> : <Eye size={14} />}
                </button>
              </InputWrap>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`w-full rounded-lg py-2.75 px-5 mt-1
                        text-sm font-inter font-semibold tracking-wide
                        flex items-center justify-center
                        transition-all duration-200
                        ${
                          canSubmit && !loading
                            ? "cursor-pointer hover:-translate-y-px active:translate-y-0 active:scale-[0.99]"
                            : "cursor-not-allowed"
                        }`}
              style={
                canSubmit && !loading
                  ? {
                      background: "var(--accent)",
                      color: "var(--accent-foreground)",
                      boxShadow:
                        "0 4px 22px color-mix(in srgb, var(--accent) 32%, transparent)",
                    }
                  : {
                      background: "var(--secondary)",
                      color: "var(--muted-foreground)",
                      border: "1px solid var(--border)",
                      opacity: 0.6,
                    }
              }
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p
            className="mt-6 text-center text-[13px] font-inter"
            style={{ color: "var(--muted-foreground)" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Sign up
            </Link>
          </p>
        </div>

        <style>{`
        .ep-input {
          width: 100%;
          background: var(--muted);
          color: var(--foreground);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 0.50rem 1rem;
          padding-right: 2.25rem;
          font-size: 0.875rem;
          line-height: 1.5;
          outline: none;
          caret-color: var(--accent);
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
        }
        .ep-input::placeholder {
          color: color-mix(in srgb, var(--muted-foreground) 45%, transparent);
        }
        .ep-input:hover {
          border-color: color-mix(in srgb, var(--muted-foreground) 35%, transparent);
        }
        .ep-input:focus {
          background: var(--background);
          border-color: color-mix(in srgb, var(--ring) 55%, transparent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 14%, transparent);
        }

        @keyframes panelIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes cardFloat {
          from { opacity: 0; transform: translateY(18px) scale(0.975); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popIn {
          from { transform: translateY(-50%) scale(0.3); opacity: 0; }
          to   { transform: translateY(-50%) scale(1);   opacity: 1; }
        }
      `}</style>
      </div>
    </div>
  );
}
