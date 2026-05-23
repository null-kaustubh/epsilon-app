"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DotmSquare5 } from "@/components/ui/dotm-square-5";
import { getBrowserApiBase } from "@/lib/api-base";

const MAX_ATTEMPTS = 20;
const RETRY_MS = 250;

async function sessionReady(): Promise<boolean> {
  const res = await fetch(`${getBrowserApiBase()}/auth/me`, {
    credentials: "include",
    cache: "no-store",
  });
  return res.ok;
}

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (cancelled) return;
        try {
          if (await sessionReady()) {
            router.replace("/home");
            return;
          }
        } catch {
          // retry
        }
        await new Promise((r) => setTimeout(r, RETRY_MS));
      }

      if (!cancelled) {
        setStatus("Could not verify your session. Redirecting to sign in…");
        router.replace("/signin?error=session");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full font-inter flex-col gap-2 text-lg">
      <DotmSquare5 />
      <span>{status}</span>
    </div>
  );
}
