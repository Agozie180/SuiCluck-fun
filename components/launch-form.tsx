"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Coins, Copy, Egg, ExternalLink, Gauge, Lock, Rocket, ShieldCheck } from "lucide-react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { AIMemeGenerator, type GeneratedMeme } from "@/components/ai-meme-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  buildDemoLaunchAnchorTx,
  explorerTxUrl,
  mistFromSui,
  platformObjectId,
  suicluckPackageId,
} from "@/lib/sui";
import { saveLaunch } from "@/lib/launch-store";

const DEFAULT_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <rect width="1200" height="675" fill="#0f172a"/>
    <circle cx="870" cy="170" r="210" fill="#4da3ff" opacity=".35"/>
    <text x="70" y="120" font-size="40" fill="#ffb020" font-family="Arial" font-weight="900">SuiCluck.fun</text>
    <text x="70" y="580" font-size="72" fill="#fff" font-family="Arial" font-weight="900">Rocket Rooster</text>
    <text x="460" y="360" font-size="160">🐔</text>
  </svg>
`)}`;

export function LaunchForm() {
  const [meme, setMeme] = useState<GeneratedMeme>({
    name: "Rocket Rooster",
    ticker: "COCK",
    imageUrl: DEFAULT_IMAGE,
    prompt: "a heroic rooster with Sui laser eyes",
    palette: ["#4da3ff", "#ffb020", "#ff5a36", "#101828"],
    description: "A fearless Sui meme.",
    style: "classic scene, none accessory, alpha expression",
  });
  const [threshold, setThreshold] = useState(5000);
  const [creatorFee, setCreatorFee] = useState(1);
  const [lock, setLock] = useState(10);
  const manualNameRef = useRef(false);
  const manualTickerRef = useRef(false);
  const [launchResult, setLaunchResult] = useState<{ digest: string; url: string } | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const account = useCurrentAccount();
  const signAndExecute = useSignAndExecuteTransaction();
  const address = account?.address;

  const estimate = useMemo(
    () => Math.min(99, Math.round((threshold / 1000) * 5 + lock / 2 + creatorFee * 3)),
    [threshold, lock, creatorFee]
  );

  function handleGenerated(generated: GeneratedMeme) {
    setMeme((current) => ({
      ...generated,
      name: manualNameRef.current && current.name.trim() ? current.name : generated.name,
      ticker: manualTickerRef.current && current.ticker.trim() ? current.ticker : generated.ticker,
    }));
  }

  async function launch() {
    setLaunchError(null);
    setLaunchResult(null);

    if (!address) {
      setLaunchError("Connect Google zkLogin or a Sui Wallet before launching.");
      return;
    }

    try {
      const transaction = buildDemoLaunchAnchorTx(address);
      const result = await signAndExecute.mutateAsync({
        transaction,
        chain: "sui:testnet",
      });
      const digest = "digest" in result ? result.digest : undefined;

      if (!digest) {
        throw new Error("Wallet executed the transaction but did not return a digest.");
      }

      const url = explorerTxUrl(digest);
      saveLaunch({
        id: digest,
        owner: address,
        name: meme.name,
        ticker: meme.ticker,
        description: meme.description,
        imageUrl: meme.imageUrl,
        digest,
        explorerUrl: url,
        packageId: suicluckPackageId,
        platformObjectId,
        thresholdMist: mistFromSui(threshold).toString(),
        creatorFeeBps: creatorFee * 100,
        lockBps: lock * 100,
        status: "Launched",
        createdAt: new Date().toISOString(),
      });
      setLaunchResult({ digest, url });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Launch transaction failed.";
      setLaunchError(
        /rejected|denied|cancel/i.test(message)
          ? "Transaction was rejected in the wallet. No launch was recorded."
          : message
      );
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Egg className="text-secondary" /> Coin details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Name"
              value={meme.name}
              onChange={(value) => {
                manualNameRef.current = true;
                setMeme({ ...meme, name: value });
              }}
            />
            <Field
              label="Ticker"
              value={meme.ticker}
              onChange={(value) => {
                manualTickerRef.current = true;
                setMeme({ ...meme, ticker: value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) });
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="text-primary" /> Curve settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Range label="Graduation threshold" icon={<Rocket />} value={threshold} min={5000} max={10000} suffix=" SUI" onChange={setThreshold} />
            <Range label="Creator fee" icon={<Coins />} value={creatorFee} min={0} max={10} suffix="%" onChange={setCreatorFee} />
            <Range label="Creator lock" icon={<Lock />} value={lock} min={0} max={50} suffix="%" onChange={setLock} />
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>Estimated launch strength</span>
                <span className="font-semibold">{estimate}%</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all" style={{ width: `${estimate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-300" /> Launch transaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
              {address ? (
                <span className="flex flex-wrap items-center gap-2">
                  Ready with <span className="font-mono text-white">{address.slice(0, 8)}...{address.slice(-6)}</span> on Sui testnet.
                  <CopyValue value={address} label="Copy wallet address" />
                </span>
              ) : (
                "Connect Google zkLogin or a Sui Wallet above before launching."
              )}
            </div>
            <div className="rounded-lg border border-secondary/20 bg-secondary/10 p-4 text-xs text-secondary">
              Demo mode executes a real testnet PTB and stores the launch locally. Full bonding-curve creation is available once a published coin witness/treasury cap is supplied.
            </div>
            {launchError && <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{launchError}</div>}
            {launchResult && (
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="font-bold">Launch confirmed on testnet.</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 break-all font-mono text-xs">
                  {launchResult.digest}
                  <CopyValue value={launchResult.digest} label="Copy digest" />
                </p>
                <a className="mt-3 inline-flex items-center gap-2 font-bold text-emerald-200 underline" href={launchResult.url} target="_blank" rel="noreferrer">
                  View on Sui Explorer <ExternalLink size={14} />
                </a>
              </div>
            )}
            <Button size="lg" variant="secondary" className="w-full text-lg" onClick={launch} disabled={signAndExecute.status === "pending" || !address}>
              <Rocket size={20} />
              {signAndExecute.status === "pending" ? "Confirm in wallet..." : "Launch on testnet"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        <AIMemeGenerator onGenerated={handleGenerated} />
        <Card>
          <CardHeader>
            <CardTitle>Launch preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <img src={meme.imageUrl} alt={`${meme.name} preview`} className="aspect-video w-full object-cover" />
              <div className="p-4">
                <p className="text-sm text-muted-foreground">Token</p>
                <p className="mt-2 text-2xl font-black">{meme.name}</p>
                <p className="text-sm font-semibold text-secondary">${meme.ticker}</p>
                <p className="mt-3 text-sm text-muted-foreground">{meme.description}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-muted-foreground">Launch details</p>
              <dl className="mt-3 grid gap-2 text-sm">
                <Row label="Package" value={`${suicluckPackageId.slice(0, 8)}...${suicluckPackageId.slice(-6)}`} copyValue={suicluckPackageId} />
                <Row label="Platform" value={`${platformObjectId.slice(0, 8)}...${platformObjectId.slice(-6)}`} copyValue={platformObjectId} />
                <Row label="Threshold" value={`${threshold} SUI`} />
                <Row label="Creator fee" value={`${creatorFee}%`} />
                <Row label="Creator lock" value={`${lock}%`} />
              </dl>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-sm font-bold text-muted-foreground">
      {label}
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Range({ label, icon, value, min, max, suffix, onChange }: { label: string; icon: React.ReactNode; value: number; min: number; max: number; suffix: string; onChange: (value: number) => void }) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
        <span className="flex items-center gap-2">{icon}{label}</span>
        <span>{value}{suffix}</span>
      </div>
      <input className="w-full accent-orange-400" type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Row({ label, value, copyValue }: { label: string; value: string; copyValue?: string }) {
  return (
    <div className="flex justify-between gap-4 text-white/80">
      <span>{label}</span>
      <span className="flex items-center justify-end gap-2 text-right font-mono text-xs">
        {value}
        {copyValue && <CopyValue value={copyValue} label={`Copy ${label.toLowerCase()}`} />}
      </span>
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
