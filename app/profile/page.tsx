"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Coins, Copy, ExternalLink, Rocket, Trophy, Wallet } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ShareOnX } from "@/components/share-on-x";
import { ZkLoginButton } from "@/components/zklogin-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLaunches, subscribeToLaunches, type StoredLaunch } from "@/lib/launch-store";
import { explorerAddressUrl } from "@/lib/sui";

export default function ProfilePage() {
  const account = useCurrentAccount();
  const [launches, setLaunches] = useState<StoredLaunch[]>([]);

  useEffect(() => {
    const refresh = () => setLaunches(getLaunches(account?.address));
    refresh();
    return subscribeToLaunches(refresh);
  }, [account?.address]);

  const stats = useMemo(() => {
    const created = launches.length;
    const graduated = launches.filter((launch) => launch.status === "Launched").length;
    const feeBps = launches.reduce((sum, launch) => sum + launch.creatorFeeBps, 0);
    return { created, graduated, avgFee: created ? `${(feeBps / created / 100).toFixed(1)}%` : "0%" };
  }, [launches]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-4xl font-black">My coop</h1>
          <p className="text-muted-foreground">Track confirmed launches, transaction digests, locks, fees, and share links.</p>
        </div>
        <div className="md:min-w-[360px]">
          <ZkLoginButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={<Rocket />} label="Created" value={String(stats.created)} />
        <Metric icon={<Coins />} label="Avg creator fee" value={stats.avgFee} />
        <Metric icon={<Trophy />} label="Confirmed" value={String(stats.graduated)} />
      </div>

      {account && (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
          <p className="flex flex-wrap items-center gap-2">
            <Wallet size={16} className="text-secondary" />
            Showing launches for <span className="font-mono text-white">{account.address.slice(0, 8)}...{account.address.slice(-6)}</span>
            <CopyValue value={account.address} label="Copy wallet address" />
            <a className="inline-flex items-center gap-1 font-bold text-secondary hover:underline" href={explorerAddressUrl(account.address)} target="_blank" rel="noreferrer">
              Explorer <ExternalLink size={13} />
            </a>
          </p>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My launches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!account && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
              Connect Google zkLogin or a Sui Wallet to see launches created from this browser.
            </div>
          )}

          {account && launches.length === 0 && (
            <div className="rounded-3xl border border-secondary/20 bg-secondary/10 p-6">
              <p className="font-bold text-secondary">No launches yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate a meme on the launch page, confirm the testnet transaction, and it will appear here.
              </p>
            </div>
          )}

          {launches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-5">
        <div className="text-secondary">{icon}</div>
        <div>
          <p className="font-display text-2xl font-black">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LaunchCard({ launch }: { launch: StoredLaunch }) {
  return (
    <div className="grid gap-4 rounded-lg border border-white/10 bg-white/5 p-3 transition hover:border-secondary/30 hover:bg-white/[.07] sm:grid-cols-[128px_1fr] lg:grid-cols-[128px_1fr_auto] lg:items-center">
      <img src={launch.imageUrl} alt={`${launch.name} art`} className="aspect-video w-full rounded-md object-cover sm:w-[128px]" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold">{launch.name}</p>
          <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">${launch.ticker}</span>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200" title="This launch was saved only after Sui transaction confirmation">{launch.status}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{launch.description}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {new Date(launch.createdAt).toLocaleDateString()}</span>
          <span>{Number(BigInt(launch.thresholdMist) / 1_000_000_000n).toLocaleString()} SUI threshold</span>
          <span>{(launch.creatorFeeBps / 100).toFixed(1)}% fee</span>
          <span>{(launch.lockBps / 100).toFixed(1)}% lock</span>
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-2 break-all font-mono text-xs text-white/45">
          {launch.digest}
          <CopyValue value={launch.digest} label="Copy transaction digest" />
        </p>
      </div>
      <div className="flex flex-wrap gap-2 lg:flex-col">
        <a
          href={launch.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
          title="Open this transaction in Sui Explorer"
        >
          Explorer <ExternalLink size={14} />
        </a>
        <ShareOnX name={launch.name} ticker={launch.ticker} explorerUrl={launch.explorerUrl} />
      </div>
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
