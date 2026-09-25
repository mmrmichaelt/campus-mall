import { countries } from "@/data/countries";
import { kenyaInstitutions, type Institution } from "@/data/universities";

type UpstreamInstitution = {
  name?: string;
  alpha_two_code?: string;
  country?: string;
  "state-province"?: string | null;
  web_pages?: string[];
};

function unique(items: Institution[]) {
  return items.filter((item, index, list) =>
    list.findIndex((other) => other.name.toLowerCase() === item.name.toLowerCase()) === index
  );
}

async function getKenyaTvetaInstitutions(): Promise<Institution[]> {
  try {
    const response = await fetch("https://www.tveta.go.ke/accredited-tvet-institutions/", {
      headers: { Accept: "text/html" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];

    const html = await response.text();
    const institutions: Institution[] = [];
    const rowRegex = /<tr[^>]*>([\s\\S]*?)<\\/tr>/gi;
    const cellRegex = /<td[^>]*>([\\s\\S]*?)<\\/td>/gi;

    for (const row of html.matchAll(rowRegex)) {
      const cells = [...row[1].matchAll(cellRegex)].map((match) =>
        match[1].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#039;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/\\s+/g, " ").trim()
      );
      if (cells.length < 7) continue;
      const name = cells[1];
      const regNo = cells[2];
      const type = cells[3];
      const kind = cells[4];
      const county = cells[5];
      if (!name || !regNo?.startsWith("TVETA/")) continue;
      institutions.push({
        id: "tveta-" + regNo.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name,
        countryCode: "KE",
        city: county,
        type: type ? kind + " " + type : "TVET",
      });
    }

    return unique(institutions);
  } catch {
    return [];
  }
}

async function getKenyaInstitutions() {
  const liveTveta = await getKenyaTvetaInstitutions();
  return unique([...kenyaInstitutions, ...liveTveta]);
}

export async function getInstitutionSuggestions(countryCode: string, query = ""): Promise<Institution[]> {
  const code = countryCode.toUpperCase();
  const term = query.trim().toLowerCase();

  if (code === "KE") {
    const all = await getKenyaInstitutions();
    return all
      .filter((item) => !term || item.name.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 100);
  }

  const country = countries.find((item) => item.code === code);
  if (!country) return [];

  try {
    const upstream = new URL("https://universities.hipolabs.com/search");
    upstream.searchParams.set("country", country.name);
    if (query.trim()) upstream.searchParams.set("name", query.trim());
    const response = await fetch(upstream, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const data = await response.json();

    return unique(
      Array.isArray(data)
        ? (data as UpstreamInstitution[])
            .filter((item) => typeof item.name === "string" && item.name.trim())
            .map((item) => ({
              id: code.toLowerCase() + "-" + item.name!.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              name: item.name!.trim(),
              countryCode: item.alpha_two_code || code,
              city: item["state-province"] || "",
              website: item.web_pages?.[0] || "",
              type: "University/College",
            }))
        : []
    ).filter((item) => !term || item.name.toLowerCase().includes(term)).slice(0, 100);
  } catch {
    return [];
  }
}

export async function isValidInstitution(countryCode: string, institutionName: string): Promise<boolean> {
  const name = institutionName.trim();
  if (!name) return false;

  const suggestions = await getInstitutionSuggestions(countryCode, name);
  return suggestions.some((item) => item.name.trim().toLowerCase() === name.toLowerCase());
}
