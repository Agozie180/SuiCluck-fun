import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { txBytes, signature } = await req.json().catch(() => ({ txBytes: "", signature: "" }));

  if (!txBytes || !signature) {
    return NextResponse.json({ error: "Missing txBytes or user signature." }, { status: 400 });
  }

  if (!process.env.SPONSOR_PRIVATE_KEY || process.env.SPONSOR_PRIVATE_KEY === "placeholder-never-expose-client-side") {
    return NextResponse.json(
      {
        error:
          "Sponsor is not configured. For this demo, use the wallet execution fallback; it will still create a real testnet digest.",
      },
      { status: 501 }
    );
  }

  return NextResponse.json(
    {
      error:
        "Sponsored execution requires server-side gas-object selection and sponsor signing. Configure this endpoint before enabling gasless production launches.",
    },
    { status: 501 }
  );
}
