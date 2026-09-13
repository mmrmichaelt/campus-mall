export type University = {
  name: string;
  countryCode: string;
};

export const universities: University[] = [
  // Kenya
  { name: "University of Nairobi", countryCode: "KE" },
  { name: "Kenyatta University", countryCode: "KE" },
  { name: "Jomo Kenyatta University of Agriculture and Technology", countryCode: "KE" },
  { name: "Moi University", countryCode: "KE" },
  { name: "Egerton University", countryCode: "KE" },
  { name: "Maseno University", countryCode: "KE" },
  { name: "Technical University of Kenya", countryCode: "KE" },
  { name: "Technical University of Mombasa", countryCode: "KE" },
  { name: "Kisii University", countryCode: "KE" },
  { name: "Mount Kenya University", countryCode: "KE" },
  { name: "Daystar University", countryCode: "KE" },
  { name: "Strathmore University", countryCode: "KE" },
  { name: "United States International University-Africa", countryCode: "KE" },

  // Uganda
  { name: "Makerere University", countryCode: "UG" },
  { name: "Kyambogo University", countryCode: "UG" },
  { name: "Mbarara University of Science and Technology", countryCode: "UG" },
  { name: "Uganda Christian University", countryCode: "UG" },

  // Tanzania
  { name: "University of Dar es Salaam", countryCode: "TZ" },
  { name: "Sokoine University of Agriculture", countryCode: "TZ" },
  { name: "Ardhi University", countryCode: "TZ" },
  { name: "University of Dodoma", countryCode: "TZ" },

  // Rwanda
  { name: "University of Rwanda", countryCode: "RW" },
  { name: "Kigali Independent University", countryCode: "RW" },
  { name: "African Leadership University", countryCode: "RW" },

  // Ethiopia
  { name: "Addis Ababa University", countryCode: "ET" },
  { name: "Bahir Dar University", countryCode: "ET" },
  { name: "Hawassa University", countryCode: "ET" },
  { name: "Jimma University", countryCode: "ET" },

  // Nigeria
  { name: "University of Lagos", countryCode: "NG" },
  { name: "University of Ibadan", countryCode: "NG" },
  { name: "University of Nigeria, Nsukka", countryCode: "NG" },
  { name: "Ahmadu Bello University", countryCode: "NG" },
  { name: "Obafemi Awolowo University", countryCode: "NG" },
  { name: "University of Benin", countryCode: "NG" },

  // Ghana
  { name: "University of Ghana", countryCode: "GH" },
  { name: "Kwame Nkrumah University of Science and Technology", countryCode: "GH" },
  { name: "University of Cape Coast", countryCode: "GH" },
  { name: "University for Development Studies", countryCode: "GH" },

  // South Africa
  { name: "University of Cape Town", countryCode: "ZA" },
  { name: "University of Johannesburg", countryCode: "ZA" },
  { name: "University of Pretoria", countryCode: "ZA" },
  { name: "University of the Witwatersrand", countryCode: "ZA" },
  { name: "Stellenbosch University", countryCode: "ZA" },
  { name: "University of South Africa", countryCode: "ZA" },

  // Egypt
  { name: "Cairo University", countryCode: "EG" },
  { name: "Ain Shams University", countryCode: "EG" },
  { name: "Alexandria University", countryCode: "EG" },
  { name: "The American University in Cairo", countryCode: "EG" },

  // Morocco
  { name: "Mohammed V University", countryCode: "MA" },
  { name: "Hassan II University of Casablanca", countryCode: "MA" },
  { name: "Cadi Ayyad University", countryCode: "MA" },

  // India
  { name: "University of Delhi", countryCode: "IN" },
  { name: "University of Mumbai", countryCode: "IN" },
  { name: "Indian Institute of Technology Bombay", countryCode: "IN" },
  { name: "Indian Institute of Technology Delhi", countryCode: "IN" },
  { name: "Indian Institute of Science", countryCode: "IN" },
  { name: "Jawaharlal Nehru University", countryCode: "IN" },

  // China
  { name: "Peking University", countryCode: "CN" },
  { name: "Tsinghua University", countryCode: "CN" },
  { name: "Fudan University", countryCode: "CN" },
  { name: "Shanghai Jiao Tong University", countryCode: "CN" },
  { name: "Zhejiang University", countryCode: "CN" },

  // Japan
  { name: "University of Tokyo", countryCode: "JP" },
  { name: "Kyoto University", countryCode: "JP" },
  { name: "Osaka University", countryCode: "JP" },
  { name: "Tohoku University", countryCode: "JP" },

  // South Korea
  { name: "Seoul National University", countryCode: "KR" },
  { name: "Korea University", countryCode: "KR" },
  { name: "Yonsei University", countryCode: "KR" },
  { name: "KAIST", countryCode: "KR" },

  // Australia
  { name: "University of Melbourne", countryCode: "AU" },
  { name: "University of Sydney", countryCode: "AU" },
  { name: "Australian National University", countryCode: "AU" },
  { name: "University of Queensland", countryCode: "AU" },
  { name: "Monash University", countryCode: "AU" },

  // New Zealand
  { name: "University of Auckland", countryCode: "NZ" },
  { name: "University of Otago", countryCode: "NZ" },
  { name: "Victoria University of Wellington", countryCode: "NZ" },

  // United Kingdom
  { name: "University of Oxford", countryCode: "GB" },
  { name: "University of Cambridge", countryCode: "GB" },
  { name: "Imperial College London", countryCode: "GB" },
  { name: "University College London", countryCode: "GB" },
  { name: "University of Edinburgh", countryCode: "GB" },
  { name: "University of Manchester", countryCode: "GB" },

  // United States
  { name: "Harvard University", countryCode: "US" },
  { name: "Stanford University", countryCode: "US" },
  { name: "Massachusetts Institute of Technology", countryCode: "US" },
  { name: "University of California, Berkeley", countryCode: "US" },
  { name: "University of California, Los Angeles", countryCode: "US" },
  { name: "Princeton University", countryCode: "US" },
  { name: "Yale University", countryCode: "US" },
  { name: "Columbia University", countryCode: "US" },
  { name: "New York University", countryCode: "US" },

  // Canada
  { name: "University of Toronto", countryCode: "CA" },
  { name: "McGill University", countryCode: "CA" },
  { name: "University of British Columbia", countryCode: "CA" },
  { name: "University of Alberta", countryCode: "CA" },

  // France
  { name: "Sorbonne University", countryCode: "FR" },
  { name: "Université Paris-Saclay", countryCode: "FR" },
  { name: "École Polytechnique", countryCode: "FR" },

  // Germany
  { name: "Technical University of Munich", countryCode: "DE" },
  { name: "Ludwig Maximilian University of Munich", countryCode: "DE" },
  { name: "Heidelberg University", countryCode: "DE" },
  { name: "Humboldt University of Berlin", countryCode: "DE" },

  // Italy
  { name: "University of Bologna", countryCode: "IT" },
  { name: "Sapienza University of Rome", countryCode: "IT" },
  { name: "University of Milan", countryCode: "IT" },

  // Spain
  { name: "University of Barcelona", countryCode: "ES" },
  { name: "Autonomous University of Madrid", countryCode: "ES" },
  { name: "Complutense University of Madrid", countryCode: "ES" },

  // Netherlands
  { name: "University of Amsterdam", countryCode: "NL" },
  { name: "Delft University of Technology", countryCode: "NL" },
  { name: "Leiden University", countryCode: "NL" },

  // Switzerland
  { name: "ETH Zurich", countryCode: "CH" },
  { name: "University of Zurich", countryCode: "CH" },
  { name: "University of Geneva", countryCode: "CH" },

  // Sweden
  { name: "Lund University", countryCode: "SE" },
  { name: "Uppsala University", countryCode: "SE" },
  { name: "KTH Royal Institute of Technology", countryCode: "SE" },

  // Norway
  { name: "University of Oslo", countryCode: "NO" },
  { name: "University of Bergen", countryCode: "NO" },
  { name: "Norwegian University of Science and Technology", countryCode: "NO" },

  // Denmark
  { name: "University of Copenhagen", countryCode: "DK" },
  { name: "Aarhus University", countryCode: "DK" },
  { name: "Technical University of Denmark", countryCode: "DK" },

  // Finland
  { name: "University of Helsinki", countryCode: "FI" },
  { name: "Aalto University", countryCode: "FI" },
  { name: "University of Turku", countryCode: "FI" },

  // Ireland
  { name: "Trinity College Dublin", countryCode: "IE" },
  { name: "University College Dublin", countryCode: "IE" },
  { name: "University College Cork", countryCode: "IE" },

  // Brazil
  { name: "University of São Paulo", countryCode: "BR" },
  { name: "Federal University of Rio de Janeiro", countryCode: "BR" },
  { name: "University of Brasília", countryCode: "BR" },

  // Mexico
  { name: "National Autonomous University of Mexico", countryCode: "MX" },
  { name: "Monterrey Institute of Technology and Higher Education", countryCode: "MX" },

  // Argentina
  { name: "University of Buenos Aires", countryCode: "AR" },
  { name: "National University of La Plata", countryCode: "AR" },

  // Colombia
  { name: "National University of Colombia", countryCode: "CO" },
  { name: "University of the Andes", countryCode: "CO" },

  // Chile
  { name: "University of Chile", countryCode: "CL" },
  { name: "Pontifical Catholic University of Chile", countryCode: "CL" },

  // Pakistan
  { name: "University of the Punjab", countryCode: "PK" },
  { name: "Quaid-i-Azam University", countryCode: "PK" },
  { name: "University of Karachi", countryCode: "PK" },
  { name: "Lahore University of Management Sciences", countryCode: "PK" },

  // Bangladesh
  { name: "University of Dhaka", countryCode: "BD" },
  { name: "Bangladesh University of Engineering and Technology", countryCode: "BD" },
  { name: "University of Chittagong", countryCode: "BD" },

  // Nepal
  { name: "Tribhuvan University", countryCode: "NP" },
  { name: "Kathmandu University", countryCode: "NP" },

  // Sri Lanka
  { name: "University of Colombo", countryCode: "LK" },
  { name: "University of Peradeniya", countryCode: "LK" },
  { name: "University of Moratuwa", countryCode: "LK" },

  // Indonesia
  { name: "University of Indonesia", countryCode: "ID" },
  { name: "Bandung Institute of Technology", countryCode: "ID" },
  { name: "Gadjah Mada University", countryCode: "ID" },

  // Malaysia
  { name: "University of Malaya", countryCode: "MY" },
  { name: "Universiti Putra Malaysia", countryCode: "MY" },
  { name: "Universiti Kebangsaan Malaysia", countryCode: "MY" },

  // Singapore
  { name: "National University of Singapore", countryCode: "SG" },
  { name: "Nanyang Technological University", countryCode: "SG" },
  { name: "Singapore Management University", countryCode: "SG" },

  // Philippines
  { name: "University of the Philippines", countryCode: "PH" },
  { name: "Ateneo de Manila University", countryCode: "PH" },
  { name: "De La Salle University", countryCode: "PH" },

  // Saudi Arabia
  { name: "King Saud University", countryCode: "SA" },
  { name: "King Abdulaziz University", countryCode: "SA" },
  { name: "King Fahd University of Petroleum and Minerals", countryCode: "SA" },

  // United Arab Emirates
  { name: "United Arab Emirates University", countryCode: "AE" },
  { name: "Khalifa University", countryCode: "AE" },
  { name: "American University of Sharjah", countryCode: "AE" },

  // Qatar
  { name: "Qatar University", countryCode: "QA" },
  { name: "Hamad Bin Khalifa University", countryCode: "QA" },

  // Israel
  { name: "Hebrew University of Jerusalem", countryCode: "IL" },
  { name: "Tel Aviv University", countryCode: "IL" },
  { name: "Technion – Israel Institute of Technology", countryCode: "IL" },

  // Turkey
  { name: "Middle East Technical University", countryCode: "TR" },
  { name: "Istanbul University", countryCode: "TR" },
  { name: "Boğaziçi University", countryCode: "TR" },

  // Russia
  { name: "Lomonosov Moscow State University", countryCode: "RU" },
  { name: "Saint Petersburg State University", countryCode: "RU" },
  { name: "National Research University Higher School of Economics", countryCode: "RU" },

  // Ukraine
  { name: "Taras Shevchenko National University of Kyiv", countryCode: "UA" },
  { name: "National Technical University of Ukraine", countryCode: "UA" },

  // Ghana / West Africa
  { name: "University of Professional Studies, Accra", countryCode: "GH" },

  // Zambia
  { name: "University of Zambia", countryCode: "ZM" },
  { name: "Copperbelt University", countryCode: "ZM" },

  // Zimbabwe
  { name: "University of Zimbabwe", countryCode: "ZW" },
  { name: "National University of Science and Technology", countryCode: "ZW" },

  // Malawi
  { name: "University of Malawi", countryCode: "MW" },
  { name: "Mzuzu University", countryCode: "MW" },

  // Mozambique
  { name: "Eduardo Mondlane University", countryCode: "MZ" },

  // Botswana
  { name: "University of Botswana", countryCode: "BW" },

  // Namibia
  { name: "University of Namibia", countryCode: "NA" },
  { name: "Namibia University of Science and Technology", countryCode: "NA" },

  // Mauritius
  { name: "University of Mauritius", countryCode: "MU" },

  // Sierra Leone
  { name: "University of Sierra Leone", countryCode: "SL" },

  // Liberia
  { name: "University of Liberia", countryCode: "LR" },

  // Senegal
  { name: "Cheikh Anta Diop University", countryCode: "SN" },

  // Côte d'Ivoire
  { name: "Université Félix Houphouët-Boigny", countryCode: "CI" },

  // Cameroon
  { name: "University of Yaoundé I", countryCode: "CM" },
  { name: "University of Buea", countryCode: "CM" },

  // Democratic Republic of the Congo
  { name: "University of Kinshasa", countryCode: "CD" },

  // Republic of the Congo
  { name: "Marien Ngouabi University", countryCode: "CG" },

  // Angola
  { name: "Agostinho Neto University", countryCode: "AO" },

  // Algeria
  { name: "University of Algiers", countryCode: "DZ" },
  { name: "University of Oran", countryCode: "DZ" },

  // Tunisia
  { name: "University of Tunis", countryCode: "TN" },
  { name: "University of Carthage", countryCode: "TN" },

  // Sudan
  { name: "University of Khartoum", countryCode: "SD" },

  // Somalia
  { name: "Somali National University", countryCode: "SO" },

  // South Sudan
  { name: "University of Juba", countryCode: "SS" },

  // Rwanda
  { name: "University of Kigali", countryCode: "RW" },

  // Burundi
  { name: "University of Burundi", countryCode: "BI" },

  // Madagascar
  { name: "University of Antananarivo", countryCode: "MG" },

  // Mauritius
  { name: "Middlesex University Mauritius", countryCode: "MU" },

  // Portugal
  { name: "University of Lisbon", countryCode: "PT" },
  { name: "University of Porto", countryCode: "PT" },
  { name: "University of Coimbra", countryCode: "PT" },

  // Poland
  { name: "University of Warsaw", countryCode: "PL" },
  { name: "Jagiellonian University", countryCode: "PL" },

  // Czechia
  { name: "Charles University", countryCode: "CZ" },
  { name: "Czech Technical University in Prague", countryCode: "CZ" },

  // Austria
  { name: "University of Vienna", countryCode: "AT" },
  { name: "Vienna University of Technology", countryCode: "AT" },

  // Belgium
  { name: "KU Leuven", countryCode: "BE" },
  { name: "Ghent University", countryCode: "BE" },
  { name: "University of Brussels", countryCode: "BE" },

  // Greece
  { name: "National and Kapodistrian University of Athens", countryCode: "GR" },
  { name: "Aristotle University of Thessaloniki", countryCode: "GR" },

  // Romania
  { name: "University of Bucharest", countryCode: "RO" },
  { name: "Babeș-Bolyai University", countryCode: "RO" },

  // Hungary
  { name: "Eötvös Loránd University", countryCode: "HU" },
  { name: "University of Szeged", countryCode: "HU" },

  // Croatia
  { name: "University of Zagreb", countryCode: "HR" },

  // Serbia
  { name: "University of Belgrade", countryCode: "RS" },

  // Bulgaria
  { name: "Sofia University", countryCode: "BG" },

  // Iceland
  { name: "University of Iceland", countryCode: "IS" },

  // Estonia
  { name: "University of Tartu", countryCode: "EE" },

  // Latvia
  { name: "University of Latvia", countryCode: "LV" },

  // Lithuania
  { name: "Vilnius University", countryCode: "LT" },

  // Slovenia
  { name: "University of Ljubljana", countryCode: "SI" },

  // Slovakia
  { name: "Comenius University Bratislava", countryCode: "SK" },

  // Bosnia and Herzegovina
  { name: "University of Sarajevo", countryCode: "BA" },

  // Albania
  { name: "University of Tirana", countryCode: "AL" },

  // North Macedonia
  { name: "Ss. Cyril and Methodius University in Skopje", countryCode: "MK" },

  // Montenegro
  { name: "University of Montenegro", countryCode: "ME" },

  // Moldova
  { name: "Moldova State University", countryCode: "MD" },

  // Georgia
  { name: "Ivane Javakhishvili Tbilisi State University", countryCode: "GE" },

  // Armenia
  { name: "Yerevan State University", countryCode: "AM" },

  // Azerbaijan
  { name: "Baku State University", countryCode: "AZ" },

  // Kazakhstan
  { name: "Al-Farabi Kazakh National University", countryCode: "KZ" },

  // Uzbekistan
  { name: "National University of Uzbekistan", countryCode: "UZ" },

  // Kyrgyzstan
  { name: "Kyrgyz National University", countryCode: "KG" },

  // Tajikistan
  { name: "Tajik National University", countryCode: "TJ" },

  // Turkmenistan
  { name: "Magtymguly Pyrgy Turkmen State University", countryCode: "TM" },

  // Mongolia
  { name: "National University of Mongolia", countryCode: "MN" },

  // Fiji
  { name: "University of the South Pacific", countryCode: "FJ" },

  // Papua New Guinea
  { name: "University of Papua New Guinea", countryCode: "PG" },

  // Samoa
  { name: "National University of Samoa", countryCode: "WS" },

  // Tonga
  { name: "Tonga National University", countryCode: "TO" },

  // Solomon Islands
  { name: "Solomon Islands National University", countryCode: "SB" },

  // Vanuatu
  { name: "University of the South Pacific - Vanuatu", countryCode: "VU" },

  // United States territories / other commonly used entries
  { name: "Other university / college", countryCode: "US" }
];

const universityMap = new Map<string, University[]>();

for (const university of universities) {
  const existing = universityMap.get(university.countryCode) ?? [];
  existing.push(university);
  universityMap.set(university.countryCode, existing);
}

export function getUniversitiesByCountry(
  countryCode: string
): University[] {
  const options = universityMap.get(countryCode) ?? [];

  return [
    ...options,
    {
      name: "Other university / college",
      countryCode
    }
  ];
}

export function searchUniversities(
  countryCode: string,
  searchTerm: string
): University[] {
  const term = searchTerm.trim().toLowerCase();

  const options = getUniversitiesByCountry(countryCode);

  if (!term) {
    return options;
  }

  return options.filter((university) =>
    university.name.toLowerCase().includes(term)
  );
  }
