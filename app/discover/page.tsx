"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck, Flame, Search, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type MarketToken = {
  name: string;
  ticker: string;
  icon: string;
  creator: string;
  raised: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  progress: number;
  change24h: number;
  status: "Live" | "Hot" | "Graduating" | "Migrated";
  curve: "Constant Product" | "Linear";
  description: string;
};

const TOKENS: MarketToken[] = [
  {
    name: "Sui Moon Beak",
    ticker: "MOONB",
    icon: "🌕",
    creator: "0x8f2a...91c4",
    raised: 8420,
    marketCap: 184000,
    volume24h: 48200,
    holders: 1284,
    progress: 84,
    change24h: 36.8,
    status: "Graduating",
    curve: "Constant Product",
    description: "Lunar chicken meme with strong community buys and locked creator allocation.",
  },
  {
    name: "Neon Rooster",
    ticker: "NEON",
    icon: "⚡",
    creator: "0x42d9...a77e",
    raised: 6910,
    marketCap: 129500,
    volume24h: 36700,
    holders: 943,
    progress: 69,
    change24h: 22.4,
    status: "Hot",
    curve: "Constant Product",
    description: "Cyber rooster meta with AI-generated campaign art and rising 24h volume.",
  },
  {
    name: "Golden Yolk",
    ticker: "YOLK",
    icon: "👑",
    creator: "0x71ba...e203",
    raised: 5120,
    marketCap: 88300,
    volume24h: 21900,
    holders: 612,
    progress: 51,
    change24h: 14.9,
    status: "Live",
    curve: "Linear",
    description: "Royal egg cult coin with transparent treasury lock and steady holder growth.",
  },
  {
    name: "Rocket Comb",
    ticker: "COMB",
    icon: "🚀",
    creator: "0x099c...6b51",
    raised: 9730,
    marketCap: 231800,
    volume24h: 73400,
    holders: 2011,
    progress: 97,
    change24h: 41.2,
    status: "Migrated",
    curve: "Constant Product",
    description: "Near-complete curve with migration liquidity queued for post-launch trading.",
  },
  {
    name: "Ninja Cluck",
    ticker: "NINJ",
    icon: "🥷",
    creator: "0x634e...19af",
    raised: 2840,
    marketCap: 46600,
    volume24h: 9400,
    holders: 318,
    progress: 28,
    change24h: 8.6,
    status: "Live",
    curve: "Linear",
    description: "Early stealth launch with low float, meme raids, and no unlocked treasury.",
  },
  {
    name: "Wave Hen",
    ticker: "WAVE",
    icon: "🌊",
    creator: "0xb90d...f331",
    raised: 4380,
    marketCap: 70200,
    volume24h: 18100,
    holders: 487,
    progress: 44,
    change24h: -3.2,
    status: "Live",
    curve: "Constant Product",
    description: "Sui water-themed launch with active market makers and healthy curve depth.",
  },
];

const filters = ["All", "Hot", "Graduating", "Migrated"] as const;

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const tokens = useMemo(() => {
    const search = query.trim().toLowerCase();
    return TOKENS.filter((token) => {
      const matchesFilter = filter === "All" || token.status === filter;
      const matchesSearch =
        !search ||
        token.name.toLowerCase().includes(search) ||
        token.ticker.toLowerCase().includes(search) ||
        token.description.toLowerCase().includes(search);
      return matchesFilter && matchesSearch;
    }).sort((a, b) => b.volume24h - a.volume24h);
  }, [filter, query]);

  const totals = useMemo(() => {
    return TOKENS.reduce(
      (acc, token) => ({
        volume: acc.volume + token.volume24h,
        raised: acc.raised + token.raised,
        holders: acc.holders + token.holders,
      }),
      { volume: 0, raised: 0, holders: 0 }
    );
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-secondary">Live SuiCluck market</p>
          <h1 className="mt-2 font-display text-4xl font-black">Discover launches</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Track real trading signals: graduation progress, 24h volume, holder growth, and curve health.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 lg:min-w-[460px]">
          <Metric label="24h volume" value={`${formatSui(totals.volume)} SUI`} />
          <Metric label="Raised" value={`${formatSui(totals.raised)} SUI`} />
          <Metric label="Holders" value={formatInt(totals.holders)} />
        </div>
      </div>

      <Card className="mb-5">
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-3 size-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-10"
              placeholder="Search ticker, name, or market narrative"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-md border px-4 py-2 text-sm font-black transition ${
                  filter === item
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {tokens.map((token) => (
          <MarketCard key={token.ticker} token={token} />
        ))}
      </div>

      {tokens.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No launches match that search yet.
          </CardContent>
        </Card>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-black">{value}</p>
    </div>
  );
}

function MarketCard({ token }: { token: MarketToken }) {
  const positive = token.change24h >= 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid size-14 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/10 text-3xl">
              {token.icon}
            </div>
            <div className="min-w-0">
              <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
                {token.name}
                <BadgeCheck className="text-primary" size={17} />
              </CardTitle>
              <p className="mt-1 text-sm font-black text-secondary">${token.ticker}</p>
            </div>
          </div>
          <StatusBadge status={token.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{token.description}</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DataPoint icon={<TrendingUp size={15} />} label="MCap" value={`$${formatUsd(token.marketCap)}`} />
          <DataPoint icon={<Flame size={15} />} label="24h Vol" value={`${formatSui(token.volume24h)} SUI`} />
          <DataPoint icon={<Users size={15} />} label="Holders" value={formatInt(token.holders)} />
          <DataPoint icon={<ShieldCheck size={15} />} label="Curve" value={token.curve} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Graduation progress</span>
            <span className="font-black">{token.progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
              style={{ width: `${token.progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
          <div className="text-sm">
            <p className="text-muted-foreground">Creator</p>
            <p className="font-mono text-white/80">{token.creator}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-md px-3 py-2 text-sm font-black ${positive ? "bg-emerald-400/10 text-emerald-200" : "bg-red-400/10 text-red-200"}`}>
              {positive ? "+" : ""}{token.change24h.toFixed(1)}%
            </span>
            <Button variant="outline" size="sm">
              Trade <ArrowUpRight size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: MarketToken["status"] }) {
  const tone =
    status === "Hot"
      ? "bg-accent/15 text-accent"
      : status === "Graduating"
        ? "bg-secondary/15 text-secondary"
        : status === "Migrated"
          ? "bg-primary/15 text-primary"
          : "bg-white/10 text-white/75";

  return <span className={`rounded-md px-3 py-1 text-xs font-black ${tone}`}>{status}</span>;
}

function DataPoint({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{label}</p>
      <p className="mt-1 truncate text-sm font-black">{value}</p>
    </div>
  );
}

function formatSui(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 1 : 2)}K` : String(value);
}

function formatUsd(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}K` : String(value);
}

function formatInt(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
