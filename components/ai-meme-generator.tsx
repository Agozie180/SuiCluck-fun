"use client";

import { useRef, useState } from "react";
import { Bot, Download, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateMemeVariant, type MemeGeneration } from "@/lib/meme-generator";

export type GeneratedMeme = MemeGeneration;

export function AIMemeGenerator({ onGenerated }: { onGenerated: (meme: GeneratedMeme) => void }) {
  const [prompt, setPrompt] = useState("");
  const [meme, setMeme] = useState<GeneratedMeme | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  async function generate() {
    const cleanPrompt = (promptRef.current?.value ?? prompt).trim();
    if (!cleanPrompt) return;

    setLoading(true);
    setError(null);
    setProgress(8);

    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(92, value + 7 + Math.floor(Math.random() * 9)));
    }, 140);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 760));
      const variation = window.crypto?.getRandomValues
        ? window.crypto.getRandomValues(new Uint32Array(1))[0]
        : Date.now() + Math.floor(Math.random() * 1_000_000);
      let result: GeneratedMeme;

      try {
        result = generateMemeVariant(cleanPrompt, variation);
      } catch {
        const response = await fetch("/api/ai-meme", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ prompt: cleanPrompt, variation }),
        });

        if (!response.ok) throw new Error("AI generation failed. Try again.");
        result = (await response.json()) as GeneratedMeme;
      }

      setProgress(100);
      setMeme(result);
      onGenerated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate meme image.");
    } finally {
      window.clearInterval(timer);
      window.setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 220);
    }
  }

  function downloadImage() {
    if (!meme) return;
    const link = document.createElement("a");
    link.href = meme.imageUrl;
    link.download = `${meme.ticker.toLowerCase()}-suicluck.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="text-secondary" /> AI Meme Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          ref={promptRef}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Try: moon chicken, cyber laser rooster, gold chicken surfer..."
          className="min-h-[140px] transition focus-visible:ring-secondary"
        />

        <Button
          onClick={generate}
          disabled={loading || !(promptRef.current?.value ?? prompt).trim()}
          variant="secondary"
          className="h-[52px] w-full rounded-lg text-base font-black shadow-lg shadow-secondary/10 transition hover:-translate-y-0.5"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {loading ? "Hatching your legendary meme... 🐔" : "Generate chicken alpha"}
        </Button>

        {loading && (
          <div className="overflow-hidden rounded-3xl border border-secondary/20 bg-white/5 shadow-2xl shadow-black/20">
            <div className="relative grid aspect-video place-items-center bg-[radial-gradient(circle_at_42%_28%,rgba(255,176,32,.35),transparent_29%),radial-gradient(circle_at_72%_72%,rgba(77,163,255,.28),transparent_30%),linear-gradient(135deg,rgba(17,24,39,.96),rgba(255,90,54,.20))]">
              <div className="absolute left-8 top-8 h-16 w-16 animate-pulse rounded-full bg-secondary/30 blur-2xl" />
              <div className="absolute bottom-10 right-10 h-24 w-24 animate-pulse rounded-full bg-primary/30 blur-2xl" />
              <div className="absolute left-1/2 top-8 -translate-x-1/2 animate-bounce text-5xl">🐔</div>
              <div className="relative w-[min(86%,440px)] rounded-3xl border border-white/10 bg-black/35 px-5 py-5 text-center backdrop-blur">
                <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-secondary/20 shadow-inner shadow-secondary/20">
                  <Wand2 className="animate-pulse text-secondary" size={28} />
                </div>
                <p className="text-sm font-black text-white">Hatching your legendary meme... 🐔</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choosing pose, drip, background chaos, and ticker magic.
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-bold text-secondary">{progress}% rendered</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {!loading && meme && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 transition duration-300 animate-in fade-in zoom-in-95">
            <img
              src={meme.imageUrl}
              alt={`${meme.name} generated meme art`}
              className="aspect-video w-full rounded-3xl border border-white/10 object-cover shadow-2xl shadow-black/20"
            />
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-black">{meme.name}</p>
                <p className="font-bold text-secondary">${meme.ticker}</p>
              </div>
              <Button size="sm" variant="outline" onClick={downloadImage}>
                <Download size={14} /> Download
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{meme.description}</p>
            <p className="mt-2 text-xs font-semibold text-white/45">{meme.style}</p>
            <p className="mt-1 text-xs text-secondary/80">Generate again for a fresh name, ticker, layout, and art direction.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
