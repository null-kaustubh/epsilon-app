"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DotmSquare5 } from "@/components/ui/dotm-square-5";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.replace("/home");
    }, 3000);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full font-inter flex-col gap-2 text-lg">
      <DotmSquare5 />
      <span>setting things up for you....</span>
    </div>
  );
}
