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

## shadcn/ui

This project includes shadcn-style local primitives. To add more official components:

```bash
npx shadcn@latest add dialog tabs badge slider
```

## Production Notes

- Replace `/api/ai-meme` with Grok/Flux generation and Walrus upload.
- Replace `/api/sponsor` with a backend gas station that verifies zkLogin proof, rate limits users, signs gas, and executes PTBs.
- `lib/zklogin.ts` starts OIDC flows for Google, X/Twitter via OIDC gateway, and email. Complete production zkLogin by generating ephemeral keys, max epoch, nonce, salt, zk proof, and Sui address derivation server/client flow.
- `lib/sui.ts` contains the Sui client and gasless launch transaction builder hooks.
