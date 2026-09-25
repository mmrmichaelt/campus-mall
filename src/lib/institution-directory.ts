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

export const EAST_AFRICA_COUNTRY_CODES = [
  "BI", "CD", "KM", "DJ", "ER", "ET", "KE", "MG",
  "MU", "RW", "SC", "SO", "SS", "SD", "TZ", "UG",
] as const;

const OFFICIAL_SEED_INSTITUTIONS: Record<string, string[]> = {
  BI: [
    "Université du Burundi",
    "École Normale Supérieure",
    "Institut Supérieur de Gestion des Entreprises",
    "Institut Supérieur de Police",
    "Institut Supérieur des Cadres Militaires",
    "Institut National de Santé Publique",
    "École Normale d'Administration",
  ],
  RW: [
    "University of Rwanda",
    "Institute of Legal Practice and Development",
    "Rwanda Polytechnic",
    "African Biomanufacturing Institute",
  ],
  SD: [
    "University of Khartoum",
    "Omdurman Islamic University",
    "Sudan University of Science and Technology",
    "University of Gezira",
    "University of Albutana",
    "International University of Africa",
    "University of the Holy Quran and Islamic Sciences",
    "Al-Neelain University",
    "Al-Zaiem Al-Azhari University",
    "University of Bahri",
    "Shendi University",
    "Nile Valley University",
    "University of Dongola",
    "Red Sea University",
    "Kassala University",
    "University of Gedaref",
    "Sinnar University",
    "Blue Nile University",
    "Imam Al-Mahdi University",
    "Bakht Alruda University",
    "University of Kordofan",
    "Dalanj University",
    "West Kordofan University",
    "University of Salam",
    "University of El Fasher",
    "University of Nyala",
    "University of Zalingei",
    "University of Geneina",
    "Abdel Latif Hamad Technological University",
    "University of Daein",
    "Sudan Technological University",
    "University of Mannaqil for Science and Technology",
    "East Kordofan University",
    "University of Health Sciences - Khartoum",
    "Sudan Open University",
    "National Ribat University",
    "Ahfad University for Women",
    "University of Science and Technology - Omdurman",
    "University of Medical Sciences and Technology",
    "Future University",
    "Mashreq University",
    "Elrazi University",
    "National University - Khartoum",
    "Arab Open University - Sudan",
    "Garden City University",
    "Ibn Sina University",
    "Sheikh Abdullah El-Badri University",
    "White Nile University",
    "Al Bayan University",
    "Al Nasr University",
    "East Nile College",
    "Sudan International University",
    "University of Africa for Humanitarian Studies",
  ],
};

function seedInstitutions(countryCode: string): Institution[] {
  return (OFFICIAL_SEED_INSTITUTIONS[countryCode] || []).map((name, index) => ({
    id: countryCode.toLowerCase() + "-seed-" + (index + 1),
    name,
    countryCode,
    type: "Official higher-learning institution",
  }));
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
    const rowRegex = /<tr[^>]*>([\\s\\S]*?)<\/tr>/gi;
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;

    for (const row of html.matchAll(rowRegex)) {
      const cells = [...row[1].matchAll(cellRegex)].map((match) =>
        match[1].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#039;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
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

    const upstreamInstitutions: Institution[] = Array.isArray(data)
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
      : [];

    return unique([...seedInstitutions(code), ...upstreamInstitutions])
      .filter((item) => !term || item.name.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 100);
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
