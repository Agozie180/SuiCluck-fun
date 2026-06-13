"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareOnX({ name, ticker, explorerUrl }: { name: string; ticker: string; explorerUrl: string }) {
  const text = `I just hatched ${name} ($${ticker}) on SuiCluck.fun. AI meme art, Sui testnet launch, explorer proof, and peak chicken energy. ${explorerUrl}`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <Button asChild variant="secondary" className="h-11 rounded-lg font-black shadow-lg shadow-secondary/10 transition hover:-translate-y-0.5">
      <a href={shareUrl} target="_blank" rel="noreferrer" title="Share this confirmed launch on X">
        <Send size={17} />
        Share on X
      </a>
    </Button>
  );
}
