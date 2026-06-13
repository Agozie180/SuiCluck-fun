"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => router.replace("/launch"), 900);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="grid min-h-[70vh] place-items-center px-4">
      <div className="max-w-md text-center rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/10">
        <div className="text-7xl">🐔</div>
        <h1 className="mt-4 font-display text-4xl font-black">zkLogin callback</h1>
        <p className="mt-3 text-muted-foreground">
          Returning to the launch page. The Enoki wallet popup completes the session through dApp Kit.
        </p>
        <Button
          className="mt-5"
          onClick={() => router.push("/launch")}
        >
          Back to launch
        </Button>
      </div>
    </main>
  );
}
