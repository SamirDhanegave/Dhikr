import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const b = "https://thequranstudy.vercel.app";

  return [
    "",
    "/learn",
    "/sources",
    ...Array.from({ length: 114 }, (_, i) => `/surah/${i + 1}`),
  ].map((p) => ({
    url: b + p,
  }));
}
