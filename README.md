# SuiCluck.fun Frontend

Mobile-first Next.js 15 App Router frontend for SuiCluck.fun.

## Folder Structure

```text
frontend/
  app/
    page.tsx
    launch/page.tsx
    discover/page.tsx
    profile/page.tsx
    api/ai-meme/route.ts
    api/sponsor/route.ts
    auth/callback/page.tsx
    globals.css
    layout.tsx
  components/
    ai-meme-generator.tsx
    curve-card.tsx
    launch-form.tsx
    zklogin-button.tsx
    ui/
  lib/
    sui.ts
    utils.ts
    zklogin.ts
```

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Required Environment

Use these exact real Sui IDs for the hackathon demo:

```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
NEXT_PUBLIC_SUI_PACKAGE_ID=0x2389c0150dbcdf80799bf55ceab0e8e94d0d44d0b04624de07d543da709e92f4
NEXT_PUBLIC_PLATFORM_OBJECT_ID=0x4ccdaabf6ad74dd7fed288908f53c81c3c9b33db91223a42528a6ec227760856
NEXT_PUBLIC_ENOKI_API_KEY=your_enoki_public_api_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_web_client_id.apps.googleusercontent.com
NEXT_PUBLIC_ENOKI_EMAIL_CLIENT_ID=your_enoki_email_client_id_if_enabled
NEXT_PUBLIC_ZKLOGIN_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/test_replace_with_payment_link
NEXT_PUBLIC_REDOTPAY_CHECKOUT_URL=https://checkout.redotpay.com/test_replace_with_checkout_url
AI_MEME_API_KEY=placeholder
SPONSOR_PRIVATE_KEY=placeholder-never-expose-client-side
```

For Vercel, change `NEXT_PUBLIC_ZKLOGIN_REDIRECT_URI` to:

```env
NEXT_PUBLIC_ZKLOGIN_REDIRECT_URI=https://YOUR_VERCEL_DOMAIN/auth/callback
```

Add both `http://localhost:3000` and `https://YOUR_VERCEL_DOMAIN` as allowed origins in Enoki.

## Final Testing

1. Install and build:

```bash
npm install
npm run build
npm run typecheck
```

2. Run locally:

```bash
npm run dev
```

3. Open `http://localhost:3000/launch`.
4. Connect with `Continue with Google`, `Continue with Email` if your Enoki project exposes email, or `Connect Sui Wallet`.
5. Click `Buy SUI with Card` and verify the Stripe or RedotPay test checkout opens when the URL env var is configured.
6. Generate three memes from the same prompt and confirm each image/name/ticker/layout changes.
7. Launch on Sui testnet. The app should show wallet signing, then Sui confirmation, then success only after the fullnode returns successful transaction effects.
8. Click `View on Sui Explorer`, then `Share on X`.
9. Open `/profile` and verify the confirmed launch appears with digest, launch details, Explorer, and Share on X.

## Vercel Deployment

1. Push the full repo to GitHub.
2. In Vercel, import `Agozie180/SuiCluck-fun`.
3. Set the project root directory to `frontend`.
4. Add every variable from `.env.example` in Vercel Project Settings → Environment Variables.
5. Set `NEXT_PUBLIC_ZKLOGIN_REDIRECT_URI` to `https://YOUR_VERCEL_DOMAIN/auth/callback`.
6. Add the Vercel domain to Enoki and Google OAuth allowed origins/redirects.
7. Deploy, then test `/launch`, `/auth/callback`, and `/profile`.

## shadcn/ui

This project includes shadcn-style local primitives. To add more official components:

```bash
npx shadcn@latest add dialog tabs badge slider
```

## Production Notes

- `/api/ai-meme` currently produces deterministic local SVG art with strong per-click variation for demo reliability. Swap in Grok/Flux and Walrus upload when API keys are ready.
- `/api/sponsor` is a placeholder for a backend gas station. The current launch path executes a real testnet PTB and only records success after Sui confirmation.
- X is used for sharing after launch. Native X zkLogin is not exposed in the installed Enoki SDK build, so the app presents X honestly and keeps wallet fallback available.
- Email login appears as an Enoki option when `NEXT_PUBLIC_ENOKI_EMAIL_CLIENT_ID` and an Email wallet provider are enabled in the Enoki project.
