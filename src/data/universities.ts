export type Institution = { id?: string; name: string; countryCode: string; city?: string; county?: string; type: string };
import { universities as kenya } from "./institutions/kenya";
import { ghanaInstitutions } from "./institutions/ghana";
import { nigeriaInstitutions } from "./institutions/nigeria";
import { ugandaInstitutions } from "./institutions/uganda";
import { rwandaInstitutions } from "./institutions/rwanda";
import { tanzaniaInstitutions } from "./institutions/tanzania";
export const universities: Institution[] = [...kenya, ...ghanaInstitutions, ...nigeriaInstitutions, ...ugandaInstitutions, ...rwandaInstitutions, ...tanzaniaInstitutions];
export function getInstitutions(countryCode: string) { return universities.filter((i) => i.countryCode === countryCode); }

export function getUniversitiesByCountry(countryCode: string) {
  const institutions = getInstitutions(countryCode);

  if (institutions.length > 0) {
    return institutions;
  }

  return [
    {
      id: `${countryCode}-other`,
      name: "Other university / college",
      countryCode,
      type: "University / College",
    },
  ];
}
