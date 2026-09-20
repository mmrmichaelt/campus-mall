export type Institution = { id?: string; name: string; countryCode: string; city?: string; county?: string; type: string };
import { universities as kenya } from "./institutions/kenya";
import { ghanaInstitutions } from "./institutions/ghana";
import { nigeriaInstitutions } from "./institutions/nigeria";
import { ugandaInstitutions } from "./institutions/uganda";
import { rwandaInstitutions } from "./institutions/rwanda";
import { tanzaniaInstitutions } from "./institutions/tanzania";
export const universities: Institution[] = [...kenya, ...ghanaInstitutions, ...nigeriaInstitutions, ...ugandaInstitutions, ...rwandaInstitutions, ...tanzaniaInstitutions];
export function getInstitutions(countryCode: string) { return universities.filter((i) => i.countryCode === countryCode); }
export function getUniversitiesByCountry(countryCode: string) { return getInstitutions(countryCode); }
