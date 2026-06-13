"use client";

import { useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { registerEnokiWallets } from "@mysten/enoki";
import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { suiClient } from "@/lib/sui";

const enokiApiKey = process.env.NEXT_PUBLIC_ENOKI_API_KEY ?? "";
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const appNetwork = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet") as "mainnet" | "testnet" | "devnet" | "localnet";
const rpcUrl = process.env.NEXT_PUBLIC_SUI_RPC_URL || getJsonRpcFullnodeUrl("testnet");

const { networkConfig } = createNetworkConfig({
  testnet: { network: "testnet", url: rpcUrl },
});

function mask(value: string) {
  if (!value) return "missing";
  return `${value.slice(0, 6)}...(${value.length} chars)`;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const providerReady = useMemo(() => Boolean(enokiApiKey && googleClientId), []);

  useEffect(() => {
    console.info("[SuiCluck zkLogin] boot", {
      network: appNetwork,
      rpcUrl,
      enokiApiKeyLoaded: Boolean(enokiApiKey),
      enokiApiKeyMasked: mask(enokiApiKey),
      googleClientIdLoaded: Boolean(googleClientId),
      googleClientIdMasked: mask(googleClientId),
      twitterNativeSupport: false,
    });

    if (!providerReady) {
      console.warn("[SuiCluck zkLogin] Missing NEXT_PUBLIC_ENOKI_API_KEY or NEXT_PUBLIC_GOOGLE_CLIENT_ID. Google zkLogin will fail until .env.local is fixed and the dev server is restarted.");
      return;
    }

    const { unregister } = registerEnokiWallets({
      apiKey: enokiApiKey,
      client: suiClient as any,
      network: "testnet",
      providers: {
        google: {
          clientId: googleClientId,
          redirectUrl: process.env.NEXT_PUBLIC_ZKLOGIN_REDIRECT_URI || `${window.location.origin}/auth/callback`,
          extraParams: { scope: "openid email profile" },
        },
      },
      windowFeatures: "popup,width=480,height=720,left=100,top=100",
    });

    console.info("[SuiCluck zkLogin] Enoki Google wallet registered for testnet");
    return () => unregister();
  }, [providerReady]);

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect preferredWallets={["Google", "Sui Wallet", "Slush"]}>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
