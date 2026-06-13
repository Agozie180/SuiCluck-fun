"use client";

export type StoredLaunch = {
  id: string;
  owner: string;
  name: string;
  ticker: string;
  description: string;
  imageUrl: string;
  digest: string;
  explorerUrl: string;
  packageId: string;
  platformObjectId: string;
  thresholdMist: string;
  creatorFeeBps: number;
  lockBps: number;
  status: "Launched" | "Pending" | "Failed";
  createdAt: string;
};

const STORAGE_KEY = "suicluck.launches.v1";

function readAll(): StoredLaunch[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(launches: StoredLaunch[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(launches));
  window.dispatchEvent(new CustomEvent("suicluck:launches-updated"));
}

export function saveLaunch(launch: StoredLaunch) {
  const launches = readAll();
  writeAll([launch, ...launches.filter((item) => item.id !== launch.id)]);
}

export function getLaunches(owner?: string | null) {
  const launches = readAll();
  if (!owner) return launches;
  return launches.filter((launch) => launch.owner.toLowerCase() === owner.toLowerCase());
}

export function subscribeToLaunches(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("suicluck:launches-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("suicluck:launches-updated", callback);
  };
}
