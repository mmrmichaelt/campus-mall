export type Institution = {
  id: string;
  name: string;
  countryCode: string;
  city?: string;
  type?: string;
  website?: string;
};

export const universities: Institution[] = [];

export function getUniversitiesByCountry(countryCode: string): Institution[] {
  return universities.filter(
    (institution) => institution.countryCode.toUpperCase() === countryCode.toUpperCase()
  );
}
