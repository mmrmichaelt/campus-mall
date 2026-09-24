import { NextResponse } from "next/server";
import { getInstitutions, universities } from "@/data/universities";
import { countries } from "@/data/countries";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = (params.get("country") || "").toUpperCase();
  const name = params.get("name")?.trim().toLowerCase() || "";
  const country = countries.find((c) => c.code === code);
  if (!country && !code) {
    const all = universities.filter((x) => !name || x.name.toLowerCase().includes(name));
    return NextResponse.json({ institutions: all.slice(0, 500) });
  }
  if (!country) return NextResponse.json({ institutions: [] });
  const local = getInstitutions(code);
  if (local.length) return NextResponse.json({ institutions: local.filter((x) => !name || x.name.toLowerCase().includes(name)).slice(0,500) });
  try {
    const upstream = new URL("https://universities.hipolabs.com/search");
    upstream.searchParams.set("country", country.name);
    if (name) upstream.searchParams.set("name", name);
    const r = await fetch(upstream, { next: { revalidate: 86400 } });
    const data = r.ok ? await r.json() : [];
    return NextResponse.json({ institutions: Array.isArray(data) ? data.map((x:any)=>({name:x.name,countryCode:x.alpha_two_code||code,city:x["state-province"]||"",type:"Institution",website:x.web_pages?.[0]||""})) : [] });
  } catch { return NextResponse.json({ institutions: [] }); }
}
