import type { Institution } from "./universities";

const cueUniversities = [
  "University of Nairobi","Moi University","Kenyatta University","Egerton University",
  "Jomo Kenyatta University of Agriculture and Technology","Maseno University",
  "Masinde Muliro University of Science and Technology","Dedan Kimathi University of Technology",
  "Chuka University","Technical University of Kenya","Technical University of Mombasa",
  "Pwani University","Kisii University","University of Eldoret","Maasai Mara University",
  "Jaramogi Oginga Odinga University of Science and Technology","Laikipia University",
  "South Eastern Kenya University","Meru University of Science and Technology",
  "Multimedia University of Kenya","University of Kabianga","Karatina University",
  "Kibabii University","Rongo University","The Co-operative University of Kenya",
  "Taita Taveta University","Murang'a University of Technology","University of Embu",
  "Machakos University","Kirinyaga University","Garissa University","Alupe University",
  "Kaimosi Friends University","Tom Mboya University","Tharaka University","Bomet University",
  "University of Eastern Africa, Baraton","Catholic University of Eastern Africa (CUEA)",
  "Daystar University","Scott Christian University","United States International University",
  "Africa Nazarene University","Kenya Methodist University","St. Paul's University",
  "Pan Africa Christian University","Strathmore University","Kabarak University",
  "Mount Kenya University","Africa International University","Kenya Highlands Evangelical University",
  "Great Lakes University of Kisumu","KCA University","Adventist University of Africa",
  "KAG EAST University","Umma University","Presbyterian University of East Africa",
  "Aga Khan University","Kiriri Women's University of Science and Technology",
  "The East African University","Zetech University","Lukenya University",
  "Management University of Africa","Tangaza University","Islamic University of Kenya",
  "Riara University","Uzima University","Gretsa University","Amref International University",
  "National Defence University-Kenya","Open University of Kenya",
  "National Intelligence Research University","Kenya Advanced Institute of Science and Technology",
  "Kenya Medical Research Institute","Turkana University College","Koitaleel Samoei University College",
  "Mama Ngina University College","Nyandarua University College","Kabarnet University College",
  "Makueni University College","Hekima University College","Marist International University College",
  "Pioneer International University","International Leadership University",
  "Consolata International University","Outspan Global University","The African Talent University",
  "East Kenya Integrated University"
];

const nationalPolytechnics = [
  "The Eldoret National Polytechnic","Kabete National Polytechnic","The Kenya Coast National Polytechnic",
  "Kisii National Polytechnic","The Kisumu National Polytechnic","Kitale National Polytechnic",
  "Baringo National Polytechnic","Mawego National Polytechnic","Nyamira National Polytechnic",
  "Kericho National Polytechnic","The Shamberere National Polytechnic","Bungoma National Polytechnic",
  "Jeremiah Nyagah National Polytechnic","Kaiboi National Polytechnic","Tseikuru National Polytechnic",
  "Michuki National Polytechnic","Mitunguu National Polytechnic","The Ol'Lessos National Polytechnic",
  "The Nairobi National Polytechnic","Kaimosi Friends National Polytechnic","Kisiwa National Polytechnic",
  "Siaya National Polytechnic","Bumbe National Polytechnic","Kipsoen National Polytechnic",
  "The Taita Taveta National Polytechnic","North Eastern National Polytechnic","The Nyeri National Polytechnic",
  "The Kiambu National Polytechnic"
];

const knownTvetInstitutions = [
  "Kenya Institute of Special Education","Kenya Institute of Mass Communication","Kenya Forestry College",
  "Kenya School of Revenue Administration - Nairobi","Kenya School of Revenue Administration - Mombasa",
  "Bandari Maritime Academy","Bukura Agricultural College","Wildlife Research and Training Institute",
  "Railway Training Institute - Nairobi","Kenya Institute of Highways and Building Technology",
  "Kenya Water Institute","Central Bank of Kenya Institute of Monetary Studies",
  "Kenya School of TVET","Rift Valley Technical Training Institute","Thika Technical Training Institute",
  "Keroka Technical Training Institute","Bondo Technical Training Institute","Wote Technical Training Institute",
  "Katine Technical Training Institute","Ugenya Technical and Vocational College",
  "Tindiret Technical and Vocational College","Total Technical and Vocational College",
  "Kirinyaga Central Technical and Vocational College","Runyenjes Technical and Vocational College",
  "Mvita Technical and Vocational College","Garbatulla Technical and Vocational College",
  "Igembe South Technical and Vocational College","Lamu West Technical and Vocational College",
  "Weru Technical and Vocational College","Chevaywa Technical Training Institute",
  "Chuka University TVET Igembe Campus","Jomo Kenyatta University of Agriculture and Technology TVET Directorate",
  "Meru University of Science and Technology TVET Directorate","Pwani University- Directorate of TVET",
  "Kibabii University Directorate of TVET","Laikipia University TVET Institute",
  "Kabarak University TVET Institute","Machakos University TVET Institute",
  "Taita Taveta University Institute of TVET","Tharaka University TVET Directorate",
  "Nairobi National Polytechnic","Muranga Technical Training Institute","Mathenge Technical Training Institute",
  "Mathioya Technical and Vocational College","Kiharu Technical and Vocational College",
  "Mwea Technical and Vocational College","Naivasha Technical and Vocational College",
  "Kapcherop Technical and Vocational College","Sabat ia Technical and Vocational College",
  "Kajiado East Technical and Vocational College","Narok South Technical and Vocational College",
  "Kiini Technical and Vocational College","Got Ramogi Technical and Vocational College",
  "Bunyala Technical and Vocational College","Kinangop Technical and Vocational College",
  "Tarbaj Technical and Vocational College","Emsos Technical and Vocational College",
  "Luanda Technical and Vocational College","Sot Technical Training Institute","Laisamis Technical Training Institute",
  "Butere Technical and Vocational College","Mumias West Technical Training Institute",
  "Ndia Technical and Vocational College","Riamo Technical & Vocational College",
  "P. C. Kinyanjui Technical Training Institute","NYS Technical Training Institute",
  "Rural Craft Training Centre - NYS Turbo","Mwala Technical and Vocational College",
  "Kaimosi Friends University TVET Directorate","The CUK Nairobi CBD Training Institute",
  "Ramogi Institute of Advanced Technology","Governance and Ethics Academy",
  "Regional Centre for Mapping of Resources for Development","Kenya Ethics and Anti-Corruption Academy",
  "St Paul's University TVET Institute - Nairobi Campus","John Charles Medical Training College",
  "Steps Healthcare Training Institute","Nairobi Institute of Technology","Bartmore Technical College",
  "Shang Tao Media College","Uwezo College","Kenya Institute of Development Studies - Nairobi",
  "Institute of Human Resource Advancement Training College","ELOW College of Professional Studies",
  "Gates Africa Training Centre","Pokot Technical and Vocational College","Memon College",
  "Life Shape Technical Institute","Rahma Luminous College","Baraka Technical College",
  "Fanisi Technical Training College","Marengoni Community Technical College"
];

const names = [...cueUniversities, ...nationalPolytechnics, ...knownTvetInstitutions]
  .filter((name, index, list) => list.findIndex((item) => item.toLowerCase() === name.toLowerCase()) === index);

export const kenyaInstitutions: Institution[] = names.map((name, index) => ({
  id: "ke-" + (index + 1),
  name,
  countryCode: "KE",
  type: cueUniversities.includes(name) ? "University" : name.toLowerCase().includes("polytechnic") ? "National Polytechnic" : "TVET/College",
}));

export const kenyaInstitutionNames = new Set(
  kenyaInstitutions.map((institution) => institution.name.toLowerCase())
);

export const universities = kenyaInstitutions;

export function getUniversitiesByCountry(countryCode: string): Institution[] {
  return countryCode.toUpperCase() === "KE" ? kenyaInstitutions : [];
}
