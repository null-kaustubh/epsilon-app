"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "phosphor-react";
import { ApiError, register } from "../../lib/api";

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordMeta = checks.map((c) => ({ ...c, passed: c.test(password) }));
  const allPassed = passwordMeta.every((c) => c.passed);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const [username, setUsername] = useState("");
  const isUsernameValid = /^[a-zA-Z0-9_]{3,30}$/.test(username);

  const canSubmit = isEmailValid && allPassed && isUsernameValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await register(email, password, username);

      // backend sets the session cookie via Set-Cookie header — nothing to do manually
      router.push("/home");
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div
        className="w-full max-w-105 bg-white dark:bg-secondary
                   rounded-md border border-border p-10
                   shadow-popover"
        style={{ animation: "cardIn 0.4s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {/* Header */}
        <header className="mb-8">
          <span className="block text-accent text-2xl mb-4">Ɛ</span>
          <h1 className="text-foreground text-[26px] font-semibold tracking-tight leading-snug mb-1">
            Create your account
          </h1>
          <p className="text-muted-foreground text-sm font-light">
            Simple, fast, no noise.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          noValidate
        >
          {/* ── Email ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground text-[13px] font-medium tracking-wide">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted text-foreground
                           placeholder:text-muted-foreground/50
                           border border-border rounded-md
                           px-3.5 py-2.75 pr-9 text-sm
                           outline-none caret-accent
                           transition-all duration-200
                           focus:bg-background
                           focus:border-accent
                           focus:ring-2 focus:ring-accent/20"
              />
              {isEmailValid ? (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-success text-[11px] font-bold"
                  style={{
                    animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
                  }}
                >
                  ✓
                </span>
              ) : (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive text-[11px] font-bold"
                  style={{
                    animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
                  }}
                >
                  !
                </span>
              )}
            </div>
          </div>

          {/* ── Username ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground text-[13px] font-medium tracking-wide">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="username"
                placeholder="yourname"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                className="w-full bg-muted text-foreground
                 placeholder:text-muted-foreground/50
                 border border-border rounded-md
                 px-3.5 py-2.75 pr-9 text-sm
                 outline-none caret-accent
                 transition-all duration-200
                 focus:bg-background
                 focus:border-accent
                 focus:ring-2 focus:ring-accent/20"
              />
              {username.length > 0 && (
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold
                    ${isUsernameValid ? "text-success" : "text-destructive"}`}
                  style={{
                    animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
                  }}
                >
                  {isUsernameValid ? "✓" : "!"}
                </span>
              )}
            </div>
            {username.length > 0 && !isUsernameValid && (
              <p className="text-[11px] text-muted-foreground">
                3–30 chars, letters, numbers, underscore only
              </p>
            )}
          </div>

          {/* ── Password ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-foreground text-[13px] font-medium tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted text-foreground
                           placeholder:text-muted-foreground/50
                           border border-border rounded-md
                           px-3.5 py-2.75 pr-9 text-sm
                           outline-none caret-accent
                           transition-all duration-200
                           focus:bg-background
                           focus:border-accent
                           focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-muted-foreground hover:text-foreground
                           transition-colors text-xs leading-none p-0.5 cursor-pointer"
              >
                {showPassword ? <EyeClosed size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Live validation checks */}
            <div
              className={`flex flex-col gap-1.5 overflow-hidden transition-all duration-300
                          ${password.length > 0 ? "max-h-44 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
            >
              {passwordMeta.map((c) => (
                <div
                  key={c.key}
                  className={`flex items-center gap-2 text-[12.5px] transition-colors duration-200
                              ${c.passed ? "text-success" : "text-muted-foreground"}`}
                >
                  <span
                    className={`text-[11px] font-bold w-3.5 shrink-0
                                    transition-transform duration-150
                                    ${c.passed ? "scale-100" : "scale-90 opacity-60"}`}
                  >
                    {c.passed ? "✓" : "●"}
                  </span>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <p className="text-sm text-destructive rounded-lg">{error}</p>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={`w-full rounded-md py-3 px-5
                        text-sm font-medium tracking-wide
                        flex items-center justify-center min-h-11.5
                        transition-all duration-200
                        ${
                          canSubmit && !loading
                            ? `bg-accent text-accent-foreground cursor-pointer
                             shadow-[0_4px_16px_rgba(253,145,62,0.32)]
                             hover:-translate-y-px
                             hover:shadow-[0_6px_20px_rgba(253,145,62,0.42)]
                             active:translate-y-0`
                            : "bg-primary/80 dark:bg-primary text-primary-foreground/30 cursor-not-allowed"
                        }
                        ${loading ? "opacity-75 cursor-wait" : ""}`}
          >
            {loading ? (
              <span className="w-4.5 h-4.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          Already have an account?{" "}
          <a href="/signin" className="text-link font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
