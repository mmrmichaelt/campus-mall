import { NextResponse } from "next/server";
import { countries } from "@/data/countries";
import { getInstitutionSuggestions } from "@/lib/institution-directory";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = (params.get("country") || "").toUpperCase();
  const name = (params.get("name") || "").trim();

  if (!countries.some((item) => item.code === code)) {
    return NextResponse.json({ institutions: [] });
  }

  const institutions = await getInstitutionSuggestions(code, name);
  return NextResponse.json({ institutions });
}
