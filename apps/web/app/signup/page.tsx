"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "phosphor-react";
import { ApiError, register } from "../../lib/api";
import { toast } from "sonner";
import Link from "next/link";
import OAuthButton from "../../features/auth/OAuthButton";
import Field from "../../features/auth/Field";
import InputWrap from "../../features/auth/InputWrap";
import Image from "next/image";

const checks = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    key: "upper",
    label: "One uppercase letter",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    key: "lower",
    label: "One lowercase letter",
    test: (p: string) => /[a-z]/.test(p),
  },
  { key: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
  {
    key: "special",
    label: "One special character",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordMeta = checks.map((c) => ({ ...c, passed: c.test(password) }));
  const allPassed = passwordMeta.every((c) => c.passed);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isUsernameValid = /^[a-zA-Z0-9_]{3,30}$/.test(username);
  const canSubmit = isEmailValid && allPassed && isUsernameValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await register(email, password, username);

      toast.success("Account created", {
        style: {
          background:
            "color-mix(in srgb, var(--success) 12%, var(--secondary))",
          border:
            "1px solid color-mix(in srgb, var(--success) 35%, transparent)",
          color: "var(--foreground)",
        },
      });

      router.push("/auth/callback");
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong.";

      toast.error(message, {
        style: {
          background:
            "color-mix(in srgb, var(--destructive) 12%, var(--secondary))",
          border:
            "1px solid color-mix(in srgb, var(--destructive) 40%, transparent)",
          color: "var(--foreground)",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_WHITE_IMAGE!;

  return (
    <div
      className="flex flex-col items-center justify-start lg:justify-center px-2 min-h-0 h-dvh overflow-y-auto overscroll-y-contain touch-pan-y pt-[max(2rem,env(safe-area-inset-top,0px))] pb-[max(2rem,env(safe-area-inset-bottom,0px))] lg:px-6 lg:py-10"
      style={{
        background: "var(--background)",
        WebkitOverflowScrolling: "touch",
      }}
      data-color-theme="dark"
    >
      <div
        className="shrink-0 w-full max-w-300 flex overflow-visible lg:overflow-hidden lg:border lg:border-border lg:shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        style={{
          background: "var(--background)",
        }}
      >
        <div
          className="w-full lg:w-110 xl:w-120 shrink-0 flex flex-col justify-center px-6 lg:px-10 xl:px-14 py-10 lg:py-12"
          style={{
            animation: "panelIn 0.45s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          <div className="mb-8">
            <span
              className="text-3xl font-inter font-medium tracking-tight flex items-center"
              style={{ color: "var(--foreground)" }}
            >
              <Image
                src={LOGO_URL}
                alt="logo"
                width={40}
                height={40}
                className="pt-1.5"
                unoptimized
              />
              <p>epsilon</p>
            </span>
          </div>

          <div className="mb-7">
            <h1
              className="text-2xl font-inter font-semibold tracking-tight leading-tight mb-1.5"
              style={{ color: "var(--foreground)" }}
            >
              Create your account
            </h1>
          </div>

          <div className="flex flex-col gap-2.5 mb-5">
            <OAuthButton
              icon={<GoogleIcon />}
              label="Continue with Google"
              href={`${API_URL}/auth/oauth/google`}
            />
            <OAuthButton
              icon={<GitHubIcon />}
              label="Continue with GitHub"
              href={`${API_URL}/auth/oauth/github`}
            />
          </div>

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

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
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

            <Field
              label="Username"
              htmlFor="username"
              hint={
                username.length > 0 && !isUsernameValid
                  ? "3–30 chars · letters, numbers, underscore only"
                  : undefined
              }
            >
              <InputWrap
                indicator={
                  username.length > 0
                    ? isUsernameValid
                      ? "valid"
                      : "invalid"
                    : null
                }
              >
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  className="ep-input"
                />
              </InputWrap>
            </Field>

            <Field label="Password" htmlFor="password">
              <InputWrap>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
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

              <div
                className={`grid grid-cols-2 gap-x-4 gap-y-1.5 overflow-hidden
                          transition-all duration-300
                          ${password.length > 0 ? "max-h-28 opacity-100 mt-2" : "max-h-0 opacity-0"}`}
              >
                {passwordMeta.map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center gap-1.5 font-inter text-[12px] transition-colors duration-200"
                    style={{
                      color: c.passed
                        ? "var(--success)"
                        : "var(--muted-foreground)",
                    }}
                  >
                    <span
                      className={`text-[10px] font-bold shrink-0 transition-transform duration-150 ${c.passed ? "scale-100" : "scale-90"}`}
                    >
                      {c.passed ? "✓" : "●"}
                    </span>
                    {c.label}
                  </div>
                ))}
              </div>
            </Field>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`w-full rounded-lg py-2.75 px-5 mt-1
                        text-sm font-inter font-semibold tracking-wide
                        flex items-center justify-center
                        transition-all duration-200
                        ${
                          canSubmit && !loading
                            ? "cursor-pointer bg-secondary/60 hover:bg-background transition-[color] text-foreground border border-border"
                            : "cursor-not-allowed bg-secondary/60 text-muted-foreground/60 border border-border"
                        }`}
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p
            className="mt-6 text-center text-[13px] font-inter"
            style={{ color: "var(--muted-foreground)" }}
          >
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Sign in
            </Link>
          </p>
        </div>
        <div className="hidden lg:flex flex-1 items-center justify-center p-3">
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
            {/* Image placeholder label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Image
                src="https://assets.kaustubh.cloud/epsilon/signup_bg.png"
                alt="signupimage"
                fill
                priority
                quality={100}
                sizes="(max-width: 1024px) 0vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
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
      `}</style>
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────── */

export function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.148 17.64 11.84 17.64 9.2z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
