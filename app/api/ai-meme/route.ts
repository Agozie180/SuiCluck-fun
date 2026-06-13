import { NextResponse } from "next/server";
import { generateMemeVariant } from "@/lib/meme-generator";

export async function POST(req: Request) {
  const { prompt, variation } = await req.json().catch(() => ({ prompt: "", variation: Date.now() }));

  try {
    const seed = typeof variation === "number" ? variation : Date.now();
    return NextResponse.json(generateMemeVariant(String(prompt || ""), seed));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate meme.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
