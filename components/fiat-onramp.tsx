"use client";

import { useMemo, useState } from "react";
import { Banknote, CheckCircle2, CreditCard, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";
const redotPayCheckoutUrl = process.env.NEXT_PUBLIC_REDOTPAY_CHECKOUT_URL ?? "";

export function FiatOnramp({ walletAddress }: { walletAddress?: string | null }) {
  const [selected, setSelected] = useState<"stripe" | "redotpay">("stripe");
  const [opening, setOpening] = useState(false);
  const checkoutUrl = selected === "stripe" ? stripePaymentLink : redotPayCheckoutUrl;
  const providerName = selected === "stripe" ? "Stripe test checkout" : "RedotPay checkout";

  const destination = useMemo(() => {
    if (!walletAddress) return "Connect a wallet first";
    return `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`;
  }, [walletAddress]);

  function openCheckout() {
    setOpening(true);
    window.setTimeout(() => setOpening(false), 700);

    if (checkoutUrl) {
      const separator = checkoutUrl.includes("?") ? "&" : "?";
      const url = walletAddress
        ? `${checkoutUrl}${separator}client_reference_id=${encodeURIComponent(walletAddress)}`
        : checkoutUrl;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="text-secondary" /> Buy SUI with Card
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
          <ProviderTab active={selected === "stripe"} label="Stripe" onClick={() => setSelected("stripe")} />
          <ProviderTab active={selected === "redotpay"} label="RedotPay" onClick={() => setSelected("redotpay")} />
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">Card to SUI/USDC demo</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Destination: <span className="font-mono text-white/80">{destination}</span>
              </p>
            </div>
            <Banknote className="text-secondary" />
          </div>
          <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
            <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-300" /> Test-mode checkout for hackathon demo.</p>
            <p className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-300" /> Launch remains on-chain only after wallet confirmation.</p>
          </div>
        </div>

        {!checkoutUrl && (
          <div className="rounded-lg border border-amber-400/25 bg-amber-400/10 p-3 text-xs text-amber-100">
            Add {selected === "stripe" ? "NEXT_PUBLIC_STRIPE_PAYMENT_LINK" : "NEXT_PUBLIC_REDOTPAY_CHECKOUT_URL"} in Vercel to open a live test checkout. The demo flow is visible now.
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-lg font-black"
          disabled={!walletAddress || opening}
          onClick={openCheckout}
        >
          {opening ? <Loader2 className="animate-spin" size={17} /> : <ExternalLink size={17} />}
          {checkoutUrl ? `Open ${providerName}` : "Configure checkout link"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ProviderTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-md text-sm font-black transition ${active ? "bg-secondary text-black" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
    >
      {label}
    </button>
  );
}
