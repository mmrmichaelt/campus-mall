import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  const now = new Date();

  return [
    {
      url: normalizedBaseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${normalizedBaseUrl}/listings`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${normalizedBaseUrl}/account`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
