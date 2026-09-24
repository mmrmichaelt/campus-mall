import { NextResponse } from "next/server";
import { countries } from "@/data/countries";

type UpstreamInstitution = {
  name?: string;
  alpha_two_code?: string;
  country?: string;
  "state-province"?: string | null;
  web_pages?: string[];
};

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = (params.get("country") || "").toUpperCase();
  const name = (params.get("name") || "").trim();

  const country = countries.find((item) => item.code === code);
  if (!country) {
    return NextResponse.json({ institutions: [] });
  }

  try {
    const upstream = new URL("https://universities.hipolabs.com/search");
    upstream.searchParams.set("country", country.name);
    if (name) upstream.searchParams.set("name", name);

    const response = await fetch(upstream, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { institutions: [], error: "The cloud institution directory is temporarily unavailable." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const institutions = Array.isArray(data)
      ? (data as UpstreamInstitution[])
          .filter((item) => typeof item.name === "string" && item.name.trim())
          .map((item) => ({
            name: item.name!.trim(),
            countryCode: item.alpha_two_code || code,
            city: item["state-province"] || "",
            website: item.web_pages?.[0] || "",
          }))
          .filter((item, index, list) => list.findIndex((other) => other.name.toLowerCase() === item.name.toLowerCase()) === index)
          .slice(0, 50)
      : [];

    return NextResponse.json({ institutions });
  } catch {
    return NextResponse.json(
      { institutions: [], error: "Unable to reach the cloud institution directory." },
      { status: 502 }
    );
  }
}
