import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatMist(mist: number) { return `${(mist / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })} SUI`; }
