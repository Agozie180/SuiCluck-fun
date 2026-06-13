"use client";

import { ConnectButton, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { Check, Copy, Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function WalletConnectButton({ reason }: { reason?: string }) {
  const account = useCurrentAccount();
  const disconnect = useDisconnectWallet();

  if (account) {
    return (
      <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4">
        <p className="text-sm font-bold text-emerald-300">Fallback Sui Wallet connected</p>
        <p className="mt-1 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          {account.address.slice(0, 8)}...{account.address.slice(-6)}
          <CopyValue value={account.address} label="Copy wallet address" />
        </p>
        <Button className="mt-3" size="sm" variant="outline" onClick={() => disconnect.mutate()}>
          <LogOut size={14} /> Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-secondary/25 bg-secondary/10 p-4 shadow-lg shadow-secondary/5">
      <div className="mb-3 flex items-start gap-3">
        <Wallet className="mt-0.5 text-secondary" size={20} />
        <div>
          <p className="font-bold text-secondary">Wallet fallback</p>
          <p className="text-sm text-muted-foreground">
            {reason || "Use this if zkLogin is blocked by API key, origin, popup, or provider configuration."}
          </p>
        </div>
      </div>
      <ConnectButton
        connectText="Connect Sui Wallet"
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-secondary px-5 text-sm font-bold text-secondary-foreground transition hover:-translate-y-0.5 hover:bg-secondary/90"
      />
    </div>
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
