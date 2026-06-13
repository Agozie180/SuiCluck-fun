import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

export const suiNetwork = process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet";
export const suiRpcUrl = process.env.NEXT_PUBLIC_SUI_RPC_URL || getJsonRpcFullnodeUrl("testnet");
export const suiClient = new SuiJsonRpcClient({
  network: suiNetwork as "mainnet" | "testnet" | "devnet" | "localnet",
  url: suiRpcUrl,
});

export const suicluckPackageId =
  process.env.NEXT_PUBLIC_SUI_PACKAGE_ID ??
  "0x2389c0150dbcdf80799bf55ceab0e8e94d0d44d0b04624de07d543da709e92f4";

export const platformObjectId =
  process.env.NEXT_PUBLIC_PLATFORM_OBJECT_ID ??
  "0x4ccdaabf6ad74dd7fed288908f53c81c3c9b33db91223a42528a6ec227760856";

export type CurveType = "constant_product" | "linear";

export type LaunchTxInput = {
  treasuryCapId: string;
  tokenType: string;
  totalSupply: bigint;
  graduationMist: bigint;
  creatorFeeBps: bigint;
  platformFeeBps: bigint;
  lockBps: bigint;
  curveType?: CurveType;
};

export function explorerTxUrl(digest: string) {
  return `https://suiexplorer.com/txblock/${digest}?network=${suiNetwork}`;
}

export function explorerAddressUrl(address: string) {
  return `https://suiexplorer.com/address/${address}?network=${suiNetwork}`;
}

export function mistFromSui(sui: number) {
  return BigInt(Math.round(sui * 1_000_000_000));
}

// Builds the production bonding-curve call when a published coin witness has
// already produced a TreasuryCap<T>. The frontend cannot conjure arbitrary OTW
// coin types by ticker alone; that part must happen in a Move package/PTB that
// owns the witness type.
export function buildBondingCurveLaunchTx(input: LaunchTxInput) {
  const tx = new Transaction();
  const params =
    input.curveType === "linear"
      ? tx.moveCall({
          target: `${suicluckPackageId}::bonding_curve::linear_params`,
          arguments: [
            tx.pure.u64(input.totalSupply),
            tx.pure.u64(1_000n),
            tx.pure.u64(1n),
            tx.pure.u64(input.graduationMist),
            tx.pure.u64(input.creatorFeeBps),
            tx.pure.u64(input.platformFeeBps),
            tx.pure.u64(input.lockBps),
            tx.pure.u64(30n),
            tx.pure.u64(0n),
            tx.pure.u8(1),
          ],
        })
      : tx.moveCall({
          target: `${suicluckPackageId}::bonding_curve::constant_product_params`,
          arguments: [
            tx.pure.u64(input.totalSupply),
            tx.pure.u64(30_000_000_000n),
            tx.pure.u64(input.totalSupply),
            tx.pure.u64(input.graduationMist),
            tx.pure.u64(input.creatorFeeBps),
            tx.pure.u64(input.platformFeeBps),
            tx.pure.u64(input.lockBps),
            tx.pure.u64(30n),
            tx.pure.u64(0n),
            tx.pure.u8(1),
          ],
        });

  const curve = tx.moveCall({
    target: `${suicluckPackageId}::bonding_curve::create_curve`,
    typeArguments: [input.tokenType],
    arguments: [tx.object(platformObjectId), tx.object(input.treasuryCapId), params],
  });
  tx.moveCall({
    target: `${suicluckPackageId}::bonding_curve::share_curve`,
    typeArguments: [input.tokenType],
    arguments: [curve],
  });
  return tx;
}

// Hackathon-safe executable PTB: records a real on-chain digest by moving a tiny
// gas coin back to the creator. It does not fake sponsorship or fake a launch.
export function buildDemoLaunchAnchorTx(creator: string) {
  const tx = new Transaction();
  const [anchorCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(1_000_000n)]);
  tx.transferObjects([anchorCoin], tx.pure.address(creator));
  return tx;
}

type TransactionBlockResponse = {
  error?: { message?: string };
  result?: {
    digest?: string;
    effects?: {
      status?: {
        status?: "success" | "failure";
        error?: string;
      };
    };
  };
};

export async function waitForTransactionConfirmation(digest: string, timeoutMs = 24_000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const response = await fetch(suiRpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "sui_getTransactionBlock",
        params: [
          digest,
          {
            showEffects: true,
            showInput: false,
            showEvents: false,
            showObjectChanges: false,
            showBalanceChanges: false,
          },
        ],
      }),
    });
    const body = (await response.json().catch(() => ({}))) as TransactionBlockResponse;
    const status = body.result?.effects?.status;

    if (status?.status === "success") return body.result;
    if (status?.status === "failure") {
      throw new Error(status.error || "Sui confirmed the transaction as failed.");
    }

    await new Promise((resolve) => window.setTimeout(resolve, 1_500));
  }

  throw new Error("Transaction digest was returned, but Sui did not confirm it before timeout. Check Explorer before relaunching.");
}

export async function requestSponsoredExecution(txBytes: string, signature: string) {
  const res = await fetch("/api/sponsor", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ txBytes, signature, network: suiNetwork }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error ?? "Sponsor rejected transaction");
  }
  return body as Promise<{ digest: string; sponsored: boolean }>;
}
