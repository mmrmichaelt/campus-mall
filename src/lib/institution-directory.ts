import { countries } from "@/data/countries";
import { kenyaInstitutions, type Institution } from "@/data/universities";

type UpstreamInstitution = {
  name?: string;
  alpha_two_code?: string;
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
  BI: ["Université du Burundi", "École Normale Supérieure", "Institut National de Santé Publique"],
  CD: ["University of Kinshasa", "University of Lubumbashi", "University of Kisangani", "Catholic University of Congo", "Kongo University"],
  KM: ["University of Comoros", "National School of Administration", "National School of Health"],
  DJ: ["University of Djibouti", "Djibouti Free Zone University", "Institute of Diplomatic Studies"],
  ER: ["University of Asmara", "Eritrea Institute of Technology", "College of Business and Economics", "Orotta School of Medicine and Dentistry"],
  ET: ["Addis Ababa University", "Bahir Dar University", "University of Gondar", "Hawassa University", "Mekelle University", "Jimma University", "Adama Science and Technology University", "Arba Minch University", "Haramaya University", "Debre Berhan University", "Debre Markos University", "Dire Dawa University", "Wolaita Sodo University", "Wolkite University", "Ambo University", "Dilla University", "Jigjiga University"],
  KE: [],
  MG: ["University of Antananarivo", "University of Toamasina", "University of Fianarantsoa", "University of Mahajanga", "University of Toliara", "University of Antsiranana"],
  MU: ["University of Mauritius", "University of Technology Mauritius", "Mahatma Gandhi Institute", "Open University of Mauritius", "Mauritius Institute of Education"],
  RW: ["University of Rwanda", "Institute of Legal Practice and Development", "Rwanda Polytechnic", "African Biomanufacturing Institute"],
  SC: ["University of Seychelles", "Seychelles Tourism Academy", "Seychelles Maritime Academy"],
  SO: ["Somali National University", "Amoud University", "University of Hargeisa", "SIMAD University", "Mogadishu University", "Puntland State University", "Jamhuriya University of Science and Technology", "East Africa University"],
  SS: ["University of Juba", "Upper Nile University", "Rumbek University of Science and Technology", "Dr. John Garang Memorial University of Science and Technology", "University of Bahr El Ghazal"],
  SD: ["University of Khartoum", "Omdurman Islamic University", "Sudan University of Science and Technology", "University of Gezira", "Al-Neelain University", "University of Bahri", "Shendi University", "Nile Valley University", "Red Sea University", "Kassala University", "University of Gedaref", "Sinnar University", "Blue Nile University", "University of Kordofan", "University of Nyala", "University of Zalingei", "Ahfad University for Women", "University of Medical Sciences and Technology"],
  TZ: ["University of Dar es Salaam", "Sokoine University of Agriculture", "Ardhi University", "Muhimbili University of Health and Allied Sciences", "Open University of Tanzania", "Mzumbe University", "University of Dodoma", "Nelson Mandela African Institution of Science and Technology", "State University of Zanzibar", "Mbeya University of Science and Technology", "Moshi Co-operative University", "Zanzibar University"],
  UG: ["Makerere University", "Kyambogo University", "Mbarara University of Science and Technology", "Gulu University", "Busitema University", "Kabale University", "Muni University", "Lira University", "Mountains of the Moon University", "Uganda Christian University", "Uganda Martyrs University", "Islamic University in Uganda", "Kampala International University"],
};

const COUNTRY_SOURCE_NAMES: Record<string, string[]> = {
  CD: ["Democratic Republic of the Congo", "DR Congo", "Congo, The Democratic Republic of the"],
  TZ: ["Tanzania", "United Republic of Tanzania"],
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
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    for (const row of html.matchAll(rowRegex)) {
      const cells = [...row[1].matchAll(cellRegex)].map((match) =>
        match[1].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#039;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
      );
      if (cells.length < 7) continue;
      const name = cells[1];
      const regNo = cells[2];
      if (!name || !regNo?.startsWith("TVETA/")) continue;
      institutions.push({
        id: "tveta-" + regNo.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name,
        countryCode: "KE",
        city: cells[5],
        type: cells[3] ? cells[4] + " " + cells[3] : "TVET",
      });
    }
    return unique(institutions);
  } catch {
    return [];
  }
}

async function getKenyaInstitutions() {
  return unique([...kenyaInstitutions, ...(await getKenyaTvetaInstitutions())]);
}

export async function getInstitutionSuggestions(countryCode: string, query = ""): Promise<Institution[]> {
  const code = countryCode.toUpperCase();
  const term = query.trim().toLowerCase();

  if (code === "KE") {
    const all = await getKenyaInstitutions();
    return all.filter((item) => !term || item.name.toLowerCase().includes(term)).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 250);
  }

  const country = countries.find((item) => item.code === code);
  if (!country) return [];

  try {
    const sourceNames = COUNTRY_SOURCE_NAMES[code] || [country.name];
    const responses = await Promise.all(sourceNames.map(async (sourceName) => {
      const upstream = new URL("https://universities.hipolabs.com/search");
      upstream.searchParams.set("country", sourceName);
      if (query.trim()) upstream.searchParams.set("name", query.trim());
      try {
        const response = await fetch(upstream, { headers: { Accept: "application/json" }, next: { revalidate: 3600 } });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data as UpstreamInstitution[] : [];
      } catch {
        return [];
      }
    }));

    const upstreamInstitutions: Institution[] = responses.flat()
      .filter((item) => typeof item.name === "string" && item.name.trim())
      .map((item, index) => ({
        id: code.toLowerCase() + "-upstream-" + index + "-" + item.name!.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: item.name!.trim(),
        countryCode: item.alpha_two_code || code,
        city: item["state-province"] || "",
        website: item.web_pages?.[0] || "",
        type: "University/College",
      }));

    return unique([...seedInstitutions(code), ...upstreamInstitutions])
      .filter((item) => !term || item.name.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 250);
  } catch {
    return seedInstitutions(code).filter((item) => !term || item.name.toLowerCase().includes(term)).slice(0, 250);
  }
}

export async function isValidInstitution(countryCode: string, institutionName: string): Promise<boolean> {
  const name = institutionName.trim();
  if (!name) return false;
  const suggestions = await getInstitutionSuggestions(countryCode, name);
  return suggestions.some((item) => item.name.trim().toLowerCase() === name.toLowerCase());
}
