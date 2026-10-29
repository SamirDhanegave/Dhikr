import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const b = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"; return ["", "/learn", "/sources", ...Array.from({ length: 114 }, (_, i) => `/surah/${i + 1}`)].map((p) => ({ url: b + p })); }
