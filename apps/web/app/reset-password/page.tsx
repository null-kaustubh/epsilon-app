"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeClosed } from "phosphor-react";
import { api, ApiError } from "../../lib/api";
import Link from "next/link";
import { toast } from "sonner";
import Field from "../../features/auth/Field";
import InputWrap from "../../features/auth/InputWrap";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // redirect if no token
  useEffect(() => {
    if (!token) router.replace("/forgot-password");
  }, [token, router]);

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpec = /[^A-Za-z0-9]/.test(password);
  const hasLength = password.length >= 8;
  const passwordValid = hasUpper && hasLower && hasNum && hasSpec && hasLength;
  const confirmValid = confirm.length > 0 && confirm === password;
  const canSubmit = passwordValid && confirmValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: password,
      });

      toast.success("Password updated", {
        style: {
          background:
            "color-mix(in srgb, var(--success) 12%, var(--secondary))",
          border:
            "1px solid color-mix(in srgb, var(--success) 35%, transparent)",
        },
      });

      setTimeout(() => router.push("/signin"), 1000);
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

  const requirements = [
    { label: "8+ characters", met: hasLength },
    { label: "Uppercase", met: hasUpper },
    { label: "Lowercase", met: hasLower },
    { label: "Number", met: hasNum },
    { label: "Special character", met: hasSpec },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 py-10 bg-background"
      data-color-theme="dark"
    >
      <div className="absolute top-6">
        <span className="text-2xl font-medium tracking-tight text-foreground">
          epsilon
        </span>
      </div>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center w-full flex-1">
        <>
          <h1 className="text-3xl font-inter font-semibold tracking-tight mb-6 text-center text-foreground">
            Reset your password
          </h1>
        </>

        {/* Card */}
        <div className="w-full max-w-sm rounded-xl p-6 bg-secondary/40 border border-border">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            {/* New password */}
            <Field label="New password" htmlFor="password">
              <InputWrap>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="New password"
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

            {/* Password requirements */}
            {password.length > 0 && (
              <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 -mt-1 font-inter">
                {requirements.map((r) => (
                  <span
                    key={r.label}
                    className="text-[11px] flex items-center gap-1 transition-colors duration-200"
                    style={{
                      color: r.met
                        ? "var(--success)"
                        : "var(--muted-foreground)",
                    }}
                  >
                    <span>{r.met ? "✓" : "·"}</span>
                    {r.label}
                  </span>
                ))}
              </div>
            )}

            {/* Confirm password */}
            <Field label="Confirm password" htmlFor="confirm">
              <InputWrap>
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="ep-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label="Toggle confirm visibility"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-150"
                  style={{ color: "var(--muted-foreground)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--foreground)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--muted-foreground)")
                  }
                >
                  {showConfirm ? <EyeClosed size={14} /> : <Eye size={14} />}
                </button>
              </InputWrap>
            </Field>

            {/* Mismatch hint */}
            {confirm.length > 0 && !confirmValid && (
              <p
                className="text-[12px] -mt-1"
                style={{ color: "var(--destructive)" }}
              >
                Passwords don&apos;t match
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`w-full rounded-lg py-2.5 px-5 mt-1
                text-sm font-semibold font-inter flex items-center justify-center
                transition-all duration-200
              ${
                canSubmit && !loading
                  ? "cursor-pointer bg-background text-foreground border border-border"
                  : "cursor-not-allowed bg-secondary/60 text-muted-foreground/60 border border-border"
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                "Update password"
              )}
            </button>
          </form>
        </div>
      </div>

      <p
        className="mt-6 text-[13px]"
        style={{ color: "var(--muted-foreground)" }}
      >
        <Link
          href="/signin"
          className="hover:underline"
          style={{ color: "var(--accent)" }}
        >
          ← Back to sign in
        </Link>
      </p>

      <style>{`
        .ep-input {
          width: 100%;
          background: var(--muted);
          color: var(--foreground);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 0.5rem 2.25rem 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          caret-color: var(--accent);
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
        }
        .ep-input::placeholder { color: color-mix(in srgb, var(--muted-foreground) 45%, transparent); }
        .ep-input:hover { border-color: color-mix(in srgb, var(--muted-foreground) 35%, transparent); }
        .ep-input:focus {
          background: var(--background);
          border-color: color-mix(in srgb, var(--ring) 55%, transparent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 14%, transparent);
        }
      `}</style>
    </div>
  );
}

// useSearchParams needs Suspense boundary in Next.js app router
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
