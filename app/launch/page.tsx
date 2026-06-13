import { ShieldCheck } from "lucide-react";
import { LaunchForm } from "@/components/launch-form";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { ZkLoginButton } from "@/components/zklogin-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LaunchPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24">
      <div className="mb-6">
        <p className="text-sm font-bold text-secondary">One-click gasless launch</p>
        <h1 className="font-display text-4xl font-black md:text-5xl">Hatch a meme coin 🐣</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Generate your art, tune the curve, sign with Google zkLogin, and let the sponsor handle gas on Sui testnet.
        </p>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="text-secondary" /> zkLogin</CardTitle>
          </CardHeader>
          <CardContent>
            <ZkLoginButton />
          </CardContent>
        </Card>
        <WalletConnectButton reason="Fallback if Enoki rejects the request, Google popup is blocked, or X/Twitter is unavailable." />
      </div>

      <LaunchForm />
    </main>
  );
}
