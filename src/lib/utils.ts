import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);

  if (seconds < 60) {
    return `${seconds} secs ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

// Helper function for consistent number formatting
export function formatNumber(num: number): string {
  // Split the number into whole and decimal parts
  const [whole, decimal] = num.toString().split(".");

  // Add commas only to the whole number part
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // If there's a decimal part, add it back
  return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
}

export const shortenAddress = (
  address: string,
  from: number = 15,
  to: number = 7
) => {
  if (!address) return "";
  return `${address.slice(0, from)}...${address.slice(-to)}`;
};

export const shortenHash = (hash: string, to: number = 12) => {
  return `${hash.slice(0, to)}...`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 1000000000) {
    return (value / 1000000000).toFixed(1) + " B";
  }

  if (absValue >= 1000000) {
    return (value / 1000000).toFixed(1) + " M";
  }

  if (absValue >= 1000) {
    return (value / 1000).toFixed(1) + " K";
  }

  return value.toString();
}
