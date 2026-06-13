"use client";

import { useMemo, useState } from "react";
import { useConnectWallet, useCurrentAccount, useDisconnectWallet, useWallets } from "@mysten/dapp-kit";
import { Check, CheckCircle2, Copy, Loader2, LogOut, Mail, Send, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/WalletConnectButton";

const enokiApiKey = process.env.NEXT_PUBLIC_ENOKI_API_KEY ?? "";
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const emailClientId = process.env.NEXT_PUBLIC_ENOKI_EMAIL_CLIENT_ID ?? "";

function mask(value: string) {
  if (!value) return "missing";
  return `${value.slice(0, 6)}...(${value.length} chars)`;
}

function getFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/403|forbidden/i.test(message)) {
    return "Enoki rejected the request with 403. Check that NEXT_PUBLIC_ENOKI_API_KEY is correct, localhost:3000 is allowed in Enoki, Google provider is enabled, and the Google client ID matches the Enoki app.";
  }
  if (/failed to fetch|network|cors/i.test(message)) {
    return "Unable to reach Enoki. Check internet/CORS, ad blockers, localhost origin allowlist, and restart the dev server after changing .env.local.";
  }
  if (/popup|closed/i.test(message)) {
    return "The login popup was blocked or closed. Allow popups for this site and try again.";
  }
  return message;
}

type AuthProvider = "google" | "email" | "twitter";

export function ZkLoginButton() {
  const wallets = useWallets();
  const connectWallet = useConnectWallet();
  const disconnectWallet = useDisconnectWallet();
  const account = useCurrentAccount();
  const [error, setError] = useState<string | null>(null);
  const [busyProvider, setBusyProvider] = useState<AuthProvider | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  const providerWallets = useMemo(() => {
    const byName = (words: string[]) =>
      wallets.find((wallet) => {
        const name = wallet.name.toLowerCase();
        return words.some((word) => name.includes(word)) || (name.includes("enoki") && words.some((word) => name.includes(word)));
      });
    return {
      google: byName(["google"]),
      email: byName(["email", "mail"]),
    };
  }, [wallets]);

  async function connectProvider(provider: Exclude<AuthProvider, "twitter">) {
    setBusyProvider(provider);
    setError(null);
    setShowFallback(false);

    console.info("[SuiCluck zkLogin] login requested", {
      provider,
      network: "testnet",
      enokiApiKeyLoaded: Boolean(enokiApiKey),
      enokiApiKeyMasked: mask(enokiApiKey),
      googleClientIdLoaded: Boolean(googleClientId),
      googleClientIdMasked: mask(googleClientId),
      emailClientIdLoaded: Boolean(emailClientId),
      emailClientIdMasked: mask(emailClientId),
      registeredWallets: wallets.map((wallet) => wallet.name),
    });

    try {
      if (!enokiApiKey) throw new Error("NEXT_PUBLIC_ENOKI_API_KEY is missing. Add it to .env.local and restart npm run dev.");
      if (provider === "google" && !googleClientId) throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing. Add the OAuth web client ID to .env.local and restart npm run dev.");
      if (provider === "email" && !emailClientId) throw new Error("NEXT_PUBLIC_ENOKI_EMAIL_CLIENT_ID is missing. Add the Enoki email provider client ID when your Enoki project has email enabled.");

      const wallet = providerWallets[provider];
      if (!wallet) throw new Error(`Enoki ${provider} wallet is not registered yet. Check Enoki provider setup, refresh, or use wallet fallback for the demo.`);

      await connectWallet.mutateAsync({ wallet });
      console.info("[SuiCluck zkLogin] zkLogin connected", { provider });
    } catch (err) {
      const friendly = getFriendlyError(err);
      console.error("[SuiCluck zkLogin] login failed", { provider, err });
      setError(friendly);
      setShowFallback(true);
    } finally {
      setBusyProvider(null);
    }
  }

  function connectTwitter() {
    setBusyProvider("twitter");
    const msg = "X is shown for the final flow, but this Enoki SDK build does not expose a native X wallet. Use Google, Email if enabled in Enoki, or the Sui Wallet fallback for the live demo.";
    console.warn("[SuiCluck zkLogin] Twitter requested but unsupported by installed Enoki SDK", {
      provider: "twitter",
      supportedNativeProviders: ["google", "facebook", "twitch", "onefc", "playtron"],
    });
    setError(msg);
    setShowFallback(true);
    window.setTimeout(() => setBusyProvider(null), 250);
  }

  if (account) {
    return (
      <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-300">
              <CheckCircle2 size={16} /> Connected on Sui testnet
            </p>
            <p className="mt-1 flex items-center gap-2 font-mono text-xs text-muted-foreground">
              {account.address.slice(0, 8)}...{account.address.slice(-6)}
              <CopyValue value={account.address} label="Copy wallet address" />
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => disconnectWallet.mutate()}>
            <LogOut size={14} /> Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <AuthButton label="Continue with Google" busy={busyProvider === "google"} disabled={Boolean(busyProvider)} onClick={() => connectProvider("google")} />
        <AuthButton icon={<Mail size={18} />} label="Continue with Email" busy={busyProvider === "email"} disabled={Boolean(busyProvider)} onClick={() => connectProvider("email")} />
        <AuthButton icon={<Send size={18} />} label="Continue with X" busy={busyProvider === "twitter"} disabled={Boolean(busyProvider)} onClick={connectTwitter} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100">
          <p className="flex items-start gap-2 font-black text-red-200"><TriangleAlert size={16} /> zkLogin needs attention</p>
          <p className="mt-2 leading-relaxed text-red-100/90">{error}</p>
        </div>
      )}

      <WalletConnectButton reason={showFallback ? "zkLogin could not complete. You can still launch with a regular Sui wallet for the demo." : "Wallet fallback for judges, popup blockers, or provider configuration issues."} />

      <p className="text-xs text-muted-foreground">
        Debug logs include provider, network, key-loaded status, and registered wallet names.
      </p>
    </div>
  );
}

function AuthButton({ icon, label, busy, disabled, onClick }: { icon?: React.ReactNode; label: string; busy: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={label.includes("Google") ? "default" : "outline"}
      className={`h-[52px] rounded-lg px-5 text-base font-black transition hover:-translate-y-0.5 ${label.includes("Google") ? "bg-white text-black shadow-lg shadow-white/10 hover:bg-gray-100" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}`}
    >
      {busy ? <Loader2 className="animate-spin" size={18} /> : icon}
      {label}
    </Button>
  );
}

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={label}
      className="inline-flex size-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}
