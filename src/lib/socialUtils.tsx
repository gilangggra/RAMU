import React from "react";

export interface ParsedSocialLinks {
  instagram: {
    handle: string;
    url: string;
  } | null;
  website: {
    label: string;
    url: string;
  } | null;
}

export function parseSocialLinks(websiteUrl?: string | null): ParsedSocialLinks {
  if (!websiteUrl || !websiteUrl.trim()) {
    return { instagram: null, website: null };
  }

  const raw = websiteUrl.trim();

  if (raw.startsWith("{") && raw.endsWith("}")) {
    try {
      const parsed = JSON.parse(raw);
      const ig = parsed.instagram ? formatInstagram(parsed.instagram) : null;
      const web = parsed.website ? formatWebsite(parsed.website) : null;
      return { instagram: ig, website: web };
    } catch {

    }
  }

  const tokens = raw.split(/[\s,|]+/).filter(Boolean);
  let instagram: { handle: string; url: string } | null = null;
  let website: { label: string; url: string } | null = null;

  for (const token of tokens) {
    if (isInstagramToken(token)) {
      if (!instagram) instagram = formatInstagram(token);
    } else {
      if (!website) website = formatWebsite(token);
    }
  }

  return { instagram, website };
}

function isInstagramToken(val: string): boolean {
  const lower = val.toLowerCase();
  return lower.includes("instagram.com") || val.startsWith("@") || lower.startsWith("ig:");
}

function formatInstagram(val: string): { handle: string; url: string } {
  let clean = val.trim();
  clean = clean.replace(/^ig:\s*/i, "");

  if (clean.toLowerCase().includes("instagram.com")) {
    const match = clean.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
    clean = match && match[1] ? match[1] : clean.replace(/.*instagram\.com\/?/i, "").replace(/\/.*$/, "");
  }

  clean = clean.replace(/^@/, "").replace(/\/$/, "");
  return {
    handle: `@${clean}`,
    url: `https://instagram.com/${clean}`,
  };
}

function formatWebsite(val: string): { label: string; url: string } {
  let url = val.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  const label = url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
  return {
    url,
    label: label.length > 24 ? `${label.slice(0, 22)}...` : label,
  };
}

export function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
