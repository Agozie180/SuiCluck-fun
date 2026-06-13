"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareOnX({ name, ticker, explorerUrl }: { name: string; ticker: string; explorerUrl: string }) {
  const text = `I just hatched ${name} ($${ticker}) on SuiCluck.fun. Fresh meme coin, real testnet launch, chicken energy. ${explorerUrl}`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <Button asChild variant="secondary" className="h-11 rounded-lg font-black">
      <a href={shareUrl} target="_blank" rel="noreferrer">
        <Send size={17} />
        Share on X
      </a>
    </Button>
  );
}
