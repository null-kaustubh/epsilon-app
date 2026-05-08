"use client";

import { useState } from "react";
import { api, ApiError } from "../../lib/api";
import Link from "next/link";
import { toast } from "sonner";
import Field from "../../features/auth/Field";
import InputWrap from "../../features/auth/InputWrap";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
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
        {!sent && (
          <>
            <h1 className="text-3xl font-inter font-semibold tracking-tight mb-2 text-center text-foreground">
              Forgot password?
            </h1>

            <p className="text-sm font-inter mb-6 text-center max-w-xs text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </>
        )}

        {/* Card */}
        {!sent ? (
          <div className="w-full max-w-sm rounded-xl p-6 bg-secondary/40 border border-border">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              <Field label="Email" htmlFor="email">
                <InputWrap
                  indicator={
                    email.length > 0
                      ? isEmailValid
                        ? "valid"
                        : "invalid"
                      : null
                  }
                >
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="ep-input"
                  />
                </InputWrap>
              </Field>

              <button
                type="submit"
                disabled={!isEmailValid || loading}
                className={`w-full rounded-lg py-2.5 px-5 mt-1
                text-sm font-semibold font-inter flex items-center justify-center
                transition-all duration-200
                ${
                  isEmailValid && !loading
                    ? "cursor-pointer bg-background text-foreground border border-border"
                    : "cursor-not-allowed bg-secondary/60 text-muted-foreground/60 border border-border"
                }`}
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  "Send reset email"
                )}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="text-3xl font-inter font-semibold tracking-tight mb-2 text-center text-foreground">
              Reset link sent
            </div>
            <div className="w-full max-w-md rounded-xl p-8 text-center bg-secondary/40 border border-border">
              <p className="text-left text-sm font-inter mb-4">
                An email is on it&apos;s way to {email} with instructions to
                reset your password.
              </p>
              <p className="text-left text-sm font-inter">
                If you don&apos;t receive an email soon, check that the email
                address you entered is correct or check your spam folder.
              </p>
            </div>
          </>
        )}

        {/* Back link */}
        <p className="mt-6 text-[13px] text-muted-foreground">
          <Link href="/signin" className="hover:underline text-accent">
            ← Back to sign in
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
        }`}</style>
    </div>
  );
}
