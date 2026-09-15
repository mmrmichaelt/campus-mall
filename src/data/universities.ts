export type Institution = {
  name: string;
  countryCode: string;
  county: string;
  type:
    | "University"
    | "University College"
    | "National Polytechnic"
    | "Technical College"
    | "TVET"
    | "College"
    | "Training Institute";
};

export const universities: Institution[] = [
  // ============================================================
  // BARINGO COUNTY
  // ============================================================
  {
    name: "Kabarnet Technical and Vocational College",
    countryCode: "KE",
    county: "Baringo",
    type: "Technical College",
  },
  {
    name: "Emining Technical and Vocational College",
    countryCode: "KE",
    county: "Baringo",
    type: "Technical College",
  },
  {
    name: "Baringo Technical College",
    countryCode: "KE",
    county: "Baringo",
    type: "Technical College",
  },
  {
    name: "Koibatek Technical and Vocational College",
    countryCode: "KE",
    county: "Baringo",
    type: "Technical College",
  },
  {
    name: "Baringo National Polytechnic",
    countryCode: "KE",
    county: "Baringo",
    type: "National Polytechnic",
  },

  // ============================================================
  // BOMET COUNTY
  // ============================================================
  {
    name: "Bomet University",
    countryCode: "KE",
    county: "Bomet",
    type: "University",
  },
  {
    name: "Bomet Technical and Vocational College",
    countryCode: "KE",
    county: "Bomet",
    type: "Technical College",
  },
  {
    name: "Sotik Technical and Vocational College",
    countryCode: "KE",
    county: "Bomet",
    type: "Technical College",
  },
  {
    name: "Longisa Technical and Vocational College",
    countryCode: "KE",
    county: "Bomet",
    type: "Technical College",
  },

  // ============================================================
  // BUNGOMA COUNTY
  // ============================================================
  {
    name: "Kibabii University",
    countryCode: "KE",
    county: "Bungoma",
    type: "University",
  },
  {
    name: "Sang'alo Institute of Science and Technology",
    countryCode: "KE",
    county: "Bungoma",
    type: "Technical College",
  },
  {
    name: "Bungoma North Technical and Vocational College",
    countryCode: "KE",
    county: "Bungoma",
    type: "Technical College",
  },
  {
    name: "Kimilili Technical and Vocational College",
    countryCode: "KE",
    county: "Bungoma",
    type: "Technical College",
  },
  {
    name: "Nzoia Sugar Company Training Institute",
    countryCode: "KE",
    county: "Bungoma",
    type: "Training Institute",
  },

  // ============================================================
  // BUSIA COUNTY
  // ============================================================
  {
    name: "Alupe University",
    countryCode: "KE",
    county: "Busia",
    type: "University",
  },
  {
    name: "Busia Technical and Vocational College",
    countryCode: "KE",
    county: "Busia",
    type: "Technical College",
  },
  {
    name: "Butula Technical and Vocational College",
    countryCode: "KE",
    county: "Busia",
    type: "Technical College",
  },
  {
    name: "Nambale Technical and Vocational College",
    countryCode: "KE",
    county: "Busia",
    type: "Technical College",
  },

  // ============================================================
  // ELGEYO-MARAKWET COUNTY
  // ============================================================
  {
    name: "Rift Valley Technical Training Institute",
    countryCode: "KE",
    county: "Elgeyo-Marakwet",
    type: "Technical College",
  },
  {
    name: "Keiyo Technical and Vocational College",
    countryCode: "KE",
    county: "Elgeyo-Marakwet",
    type: "Technical College",
  },
  {
    name: "Kapsowar Technical and Vocational College",
    countryCode: "KE",
    county: "Elgeyo-Marakwet",
    type: "Technical College",
  },
  {
    name: "Iten Technical and Vocational College",
    countryCode: "KE",
    county: "Elgeyo-Marakwet",
    type: "Technical College",
  },

  // ============================================================
  // EMBU COUNTY
  // ============================================================
  {
    name: "University of Embu",
    countryCode: "KE",
    county: "Embu",
    type: "University",
  },
  {
    name: "Embu College",
    countryCode: "KE",
    county: "Embu",
    type: "College",
  },
  {
    name: "Runyenjes Technical and Vocational College",
    countryCode: "KE",
    county: "Embu",
    type: "Technical College",
  },
  {
    name: "Embu Technical and Vocational College",
    countryCode: "KE",
    county: "Embu",
    type: "Technical College",
  },
  {
    name: "Kenya Medical Training College - Embu",
    countryCode: "KE",
    county: "Embu",
    type: "College",
  },

  // ============================================================
  // GARISSA COUNTY
  // ============================================================
  {
    name: "Garissa University",
    countryCode: "KE",
    county: "Garissa",
    type: "University",
  },
  {
    name: "Garissa Technical and Vocational College",
    countryCode: "KE",
    county: "Garissa",
    type: "Technical College",
  },
  {
    name: "Dadaab Technical and Vocational College",
    countryCode: "KE",
    county: "Garissa",
    type: "Technical College",
  },
  {
    name: "Masalani Technical and Vocational College",
    countryCode: "KE",
    county: "Garissa",
    type: "Technical College",
  },

  // ============================================================
  // HOMA BAY COUNTY
  // ============================================================
  {
    name: "Tom Mboya University",
    countryCode: "KE",
    county: "Homa Bay",
    type: "University",
  },
  {
    name: "Mawego Technical Training Institute",
    countryCode: "KE",
    county: "Homa Bay",
    type: "Technical College",
  },
  {
    name: "Homa Bay Technical and Vocational College",
    countryCode: "KE",
    county: "Homa Bay",
    type: "Technical College",
  },
  {
    name: "Rachuonyo Technical and Vocational College",
    countryCode: "KE",
    county: "Homa Bay",
    type: "Technical College",
  },

  // ============================================================
  // ISIOLO COUNTY
  // ============================================================
  {
    name: "North Eastern National Polytechnic - Isiolo Campus",
    countryCode: "KE",
    county: "Isiolo",
    type: "College",
  },
  {
    name: "Isiolo Technical and Vocational College",
    countryCode: "KE",
    county: "Isiolo",
    type: "Technical College",
  },
  {
    name: "Merti Technical and Vocational College",
    countryCode: "KE",
    county: "Isiolo",
    type: "Technical College",
  },

  // ============================================================
  // KAJIADO COUNTY
  // ============================================================
  {
    name: "Kajiado Technical and Vocational College",
    countryCode: "KE",
    county: "Kajiado",
    type: "Technical College",
  },
  {
    name: "Loitokitok Technical and Vocational College",
    countryCode: "KE",
    county: "Kajiado",
    type: "Technical College",
  },
  {
    name: "Ngong Technical and Vocational College",
    countryCode: "KE",
    county: "Kajiado",
    type: "Technical College",
  },
  {
    name: "Marengoni Community Technical College",
    countryCode: "KE",
    county: "Kajiado",
    type: "TVET",
  },

  // ============================================================
  // KAKAMEGA COUNTY
  // ============================================================
  {
    name: "Masinde Muliro University of Science and Technology",
    countryCode: "KE",
    county: "Kakamega",
    type: "University",
  },
  {
    name: "Kakamega National Polytechnic",
    countryCode: "KE",
    county: "Kakamega",
    type: "National Polytechnic",
  },
  {
    name: "Bukura Agricultural College",
    countryCode: "KE",
    county: "Kakamega",
    type: "College",
  },
  {
    name: "Butere Technical and Vocational College",
    countryCode: "KE",
    county: "Kakamega",
    type: "Technical College",
  },
  {
    name: "Mumias Technical and Vocational College",
    countryCode: "KE",
    county: "Kakamega",
    type: "Technical College",
  },
  {
    name: "Shamberere Technical Training Institute",
    countryCode: "KE",
    county: "Kakamega",
    type: "Technical College",
  },

  // ============================================================
  // KERICHO COUNTY
  // ============================================================
  {
    name: "University of Kabianga",
    countryCode: "KE",
    county: "Kericho",
    type: "University",
  },
  {
    name: "Kenya Forestry College",
    countryCode: "KE",
    county: "Kericho",
    type: "College",
  },
  {
    name: "Kericho Technical and Vocational College",
    countryCode: "KE",
    county: "Kericho",
    type: "Technical College",
  },
  {
    name: "Kimasian Technical and Vocational College",
    countryCode: "KE",
    county: "Kericho",
    type: "Technical College",
  },

  // ============================================================
  // KIAMBU COUNTY
  // ============================================================
  {
    name: "Jomo Kenyatta University of Agriculture and Technology",
    countryCode: "KE",
    county: "Kiambu",
    type: "University",
  },
  {
    name: "Mount Kenya University",
    countryCode: "KE",
    county: "Kiambu",
    type: "University",
  },
  {
    name: "Kenyatta University - Ruiru Campus",
    countryCode: "KE",
    county: "Kiambu",
    type: "University",
  },
  {
    name: "Limuru Technical and Vocational College",
    countryCode: "KE",
    county: "Kiambu",
    type: "Technical College",
  },
  {
    name: "Thika Technical Training Institute",
    countryCode: "KE",
    county: "Kiambu",
    type: "Technical College",
  },
  {
    name: "Kiambu Institute of Science and Technology",
    countryCode: "KE",
    county: "Kiambu",
    type: "Technical College",
  },
  {
    name: "Kiambu Technical and Vocational College",
    countryCode: "KE",
    county: "Kiambu",
    type: "Technical College",
  },
  {
    name: "Kabete National Polytechnic",
    countryCode: "KE",
    county: "Kiambu",
    type: "National Polytechnic",
  },

  // ============================================================
  // KILIFI COUNTY
  // ============================================================
  {
    name: "Pwani University",
    countryCode: "KE",
    county: "Kilifi",
    type: "University",
  },
  {
    name: "Kenya Utalii College - Coast Campus",
    countryCode: "KE",
    county: "Kilifi",
    type: "College",
  },
  {
    name: "Kilifi Institute of Agriculture",
    countryCode: "KE",
    county: "Kilifi",
    type: "College",
  },
  {
    name: "Godoma Technical and Vocational College",
    countryCode: "KE",
    county: "Kilifi",
    type: "Technical College",
  },
  {
    name: "Watulizeni Technical Training Institute",
    countryCode: "KE",
    county: "Kilifi",
    type: "Technical College",
  },
  {
    name: "Tewa Training Centre",
    countryCode: "KE",
    county: "Kilifi",
    type: "Training Institute",
  },

  // ============================================================
  // KIRINYAGA COUNTY
  // ============================================================
  {
    name: "Kirinyaga University",
    countryCode: "KE",
    county: "Kirinyaga",
    type: "University",
  },
  {
    name: "Kirinyaga Central Technical and Vocational College",
    countryCode: "KE",
    county: "Kirinyaga",
    type: "Technical College",
  },
  {
    name: "Mwea Technical and Vocational College",
    countryCode: "KE",
    county: "Kirinyaga",
    type: "Technical College",
  },

  // ============================================================
  // KISII COUNTY
  // ============================================================
  {
    name: "Kisii University",
    countryCode: "KE",
    county: "Kisii",
    type: "University",
  },
  {
    name: "Riragia Technical and Vocational College",
    countryCode: "KE",
    county: "Kisii",
    type: "Technical College",
  },
  {
    name: "Kisii National Polytechnic",
    countryCode: "KE",
    county: "Kisii",
    type: "National Polytechnic",
  },
  {
    name: "Nyamache Technical and Vocational College",
    countryCode: "KE",
    county: "Kisii",
    type: "Technical College",
  },
  {
    name: "Gusii Institute of Technology",
    countryCode: "KE",
    county: "Kisii",
    type: "Technical College",
  },
  {
    name: "Kenya Medical Training College - Kisii",
    countryCode: "KE",
    county: "Kisii",
    type: "College",
  },

  // ============================================================
  // KISUMU COUNTY
  // ============================================================
  {
    name: "Maseno University",
    countryCode: "KE",
    county: "Kisumu",
    type: "University",
  },
  {
    name: "Great Lakes University of Kisumu",
    countryCode: "KE",
    county: "Kisumu",
    type: "University",
  },
  {
    name: "Kisumu National Polytechnic",
    countryCode: "KE",
    county: "Kisumu",
    type: "National Polytechnic",
  },
  {
    name: "Kisumu Technical and Vocational College",
    countryCode: "KE",
    county: "Kisumu",
    type: "Technical College",
  },
  {
    name: "Kenya Medical Training College - Kisumu",
    countryCode: "KE",
    county: "Kisumu",
    type: "College",
  },

  // ============================================================
  // KITUI COUNTY
  // ============================================================
  {
    name: "South Eastern Kenya University",
    countryCode: "KE",
    county: "Kitui",
    type: "University",
  },
  {
    name: "Kitui National Polytechnic",
    countryCode: "KE",
    county: "Kitui",
    type: "National Polytechnic",
  },
  {
    name: "Mwingi Technical and Vocational College",
    countryCode: "KE",
    county: "Kitui",
    type: "Technical College",
  },
  {
    name: "Mutomo Technical and Vocational College",
    countryCode: "KE",
    county: "Kitui",
    type: "Technical College",
  },
  {
    name: "Mercy Commercial Vocational Training Centre",
    countryCode: "KE",
    county: "Kitui",
    type: "TVET",
  },

  // ============================================================
  // KWALE COUNTY
  // ============================================================
  {
    name: "Taita Taveta University - Kwale Campus",
    countryCode: "KE",
    county: "Kwale",
    type: "University",
  },
  {
    name: "Kwale Technical and Vocational College",
    countryCode: "KE",
    county: "Kwale",
    type: "Technical College",
  },
  {
    name: "Kinango Technical and Vocational College",
    countryCode: "KE",
    county: "Kwale",
    type: "Technical College",
  },
  {
    name: "Msambweni Technical and Vocational College",
    countryCode: "KE",
    county: "Kwale",
    type: "Technical College",
  },

  // ============================================================
  // LAIKIPIA COUNTY
  // ============================================================
  {
    name: "Laikipia University",
    countryCode: "KE",
    county: "Laikipia",
    type: "University",
  },
  {
    name: "Nanyuki Technical and Vocational College",
    countryCode: "KE",
    county: "Laikipia",
    type: "Technical College",
  },
  {
    name: "Nyahururu Technical and Vocational College",
    countryCode: "KE",
    county: "Laikipia",
    type: "Technical College",
  },

  // ============================================================
  // LAMU COUNTY
  // ============================================================
  {
    name: "Lamu Technical and Vocational College",
    countryCode: "KE",
    county: "Lamu",
    type: "Technical College",
  },
  {
    name: "Lamu Polytechnic",
    countryCode: "KE",
    county: "Lamu",
    type: "Technical College",
  },

  // ============================================================
  // MACHAKOS COUNTY
  // ============================================================
  {
    name: "Machakos University",
    countryCode: "KE",
    county: "Machakos",
    type: "University",
  },
  {
    name: "Scott Theological College",
    countryCode: "KE",
    county: "Machakos",
    type: "College",
  },
  {
    name: "Machakos Technical Institute for the Deaf",
    countryCode: "KE",
    county: "Machakos",
    type: "Technical College",
  },
  {
    name: "Machakos Technical and Vocational College",
    countryCode: "KE",
    county: "Machakos",
    type: "Technical College",
  },
  {
    name: "Mwala Technical and Vocational College",
    countryCode: "KE",
    county: "Machakos",
    type: "Technical College",
  },

  // ============================================================
  // MAKUENI COUNTY
  // ============================================================
  {
    name: "Wote Technical Training Institute",
    countryCode: "KE",
    county: "Makueni",
    type: "Technical College",
  },
  {
    name: "Makueni Technical and Vocational College",
    countryCode: "KE",
    county: "Makueni",
    type: "Technical College",
  },
  {
    name: "Kibwezi Technical and Vocational College",
    countryCode: "KE",
    county: "Makueni",
    type: "Technical College",
  },
  {
    name: "Kaiti Technical and Vocational College",
    countryCode: "KE",
    county: "Makueni",
    type: "Technical College",
  },

  // ============================================================
  // MANDERA COUNTY
  // ============================================================
  {
    name: "Mandera Technical and Vocational College",
    countryCode: "KE",
    county: "Mandera",
    type: "Technical College",
  },
  {
    name: "Elwak Technical and Vocational College",
    countryCode: "KE",
    county: "Mandera",
    type: "Technical College",
  },
  {
    name: "Rhamu Technical and Vocational College",
    countryCode: "KE",
    county: "Mandera",
    type: "Technical College",
  },

  // ============================================================
  // MARSABIT COUNTY
  // ============================================================
  {
    name: "Marsabit Technical and Vocational College",
    countryCode: "KE",
    county: "Marsabit",
    type: "Technical College",
  },
  {
    name: "Moyale Technical and Vocational College",
    countryCode: "KE",
    county: "Marsabit",
    type: "Technical College",
  },

  // ============================================================
  // MERU COUNTY
  // ============================================================
  {
    name: "Meru University of Science and Technology",
    countryCode: "KE",
    county: "Meru",
    type: "University",
  },
  {
    name: "Kenya Methodist University",
    countryCode: "KE",
    county: "Meru",
    type: "University",
  },
  {
    name: "Meru National Polytechnic",
    countryCode: "KE",
    county: "Meru",
    type: "National Polytechnic",
  },
  {
    name: "Nkabune Technical Training Institute",
    countryCode: "KE",
    county: "Meru",
    type: "Technical College",
  },
  {
    name: "Meru Technical and Vocational College",
    countryCode: "KE",
    county: "Meru",
    type: "Technical College",
  },
  {
    name: "Igembe Technical and Vocational College",
    countryCode: "KE",
    county: "Meru",
    type: "Technical College",
  },

  // ============================================================
  // MIGORI COUNTY
  // ============================================================
  {
    name: "Rongo University",
    countryCode: "KE",
    county: "Migori",
    type: "University",
  },
  {
    name: "Migori Technical and Vocational College",
    countryCode: "KE",
    county: "Migori",
    type: "Technical College",
  },
  {
    name: "Kuria West Technical and Vocational College",
    countryCode: "KE",
    county: "Migori",
    type: "Technical College",
  },
  {
    name: "Nyatike Technical and Vocational College",
    countryCode: "KE",
    county: "Migori",
    type: "Technical College"  },

  // ============================================================
  // MOMBASA COUNTY
  // ============================================================
  {
    name: "Technical University of Mombasa",
    countryCode: "KE",
    county: "Mombasa",
    type: "University",
  },
  {
    name: "Bandari Maritime Academy",
    countryCode: "KE",
    county: "Mombasa",
    type: "College",
  },
  {
    name: "Mombasa Technical and Vocational College",
    countryCode: "KE",
    county: "Mombasa",
    type: "Technical College",
  },
  {
    name: "Kenya Coast National Polytechnic",
    countryCode: "KE",
    county: "Mombasa",
    type: "National Polytechnic",
  },
  {
    name: "Kenya School of Government - Mombasa",
    countryCode: "KE",
    county: "Mombasa",
    type: "Training Institute",
  },

  // ============================================================
  // MURANG'A COUNTY
  // ============================================================
  {
    name: "Murang'a University of Technology",
    countryCode: "KE",
    county: "Murang'a",
    type: "University",
  },
  {
    name: "Murang'a National Polytechnic",
    countryCode: "KE",
    county: "Murang'a",
    type: "National Polytechnic",
  },
  {
    name: "Gatanga Technical and Vocational College",
    countryCode: "KE",
    county: "Murang'a",
    type: "Technical College",
  },

  // ============================================================
  // NAIROBI COUNTY
  // ============================================================
  {
    name: "University of Nairobi",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "Kenyatta University",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "Technical University of Kenya",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "Multimedia University of Kenya",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "Co-operative University of Kenya",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "Strathmore University",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "United States International University - Africa",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "Africa International University",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "Catholic University of Eastern Africa",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "Daystar University",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "Amref International University",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "KCA University",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "Zetech University",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "Mount Kenya University - Nairobi Campus",
    countryCode: "KE",
    county: "Nairobi",
    type: "University",
  },
  {
    name: "Nairobi National Polytechnic",
    countryCode: "KE",
    county: "Nairobi",
    type: "National Polytechnic",
  },
  {
    name: "Nairobi Technical Training Institute",
    countryCode: "KE",
    county: "Nairobi",
    type: "Technical College",
  },
  {
    name: "Kenya Medical Training College - Nairobi",
    countryCode: "KE",
    county: "Nairobi",
    type: "College",
  },
  {
    name: "Kenya Institute of Mass Communication",
    countryCode: "KE",
    county: "Nairobi",
    type: "Training Institute",
  },
  {
    name: "Kenya Institute of Management",
    countryCode: "KE",
    county: "Nairobi",
    type: "Training Institute",
  },
  {
    name: "Kenya School of Revenue Administration",
    countryCode: "KE",
    county: "Nairobi",
    type: "Training Institute",
  },
  {
    name: "Institute of Energy Studies and Research",
    countryCode: "KE",
    county: "Nairobi",
    type: "Training Institute",
  },

  // ============================================================
  // NAKURU COUNTY
  // ============================================================
  {
    name: "Egerton University",
    countryCode: "KE",
    county: "Nakuru",
    type: "University",
  },
  {
    name: "Kabarak University",
    countryCode: "KE",
    county: "Nakuru",
    type: "University",
  },
  {
    name: "Nakuru National Polytechnic",
    countryCode: "KE",
    county: "Nakuru",
    type: "National Polytechnic",
  },
  {
    name: "Nakuru Technical and Vocational College",
    countryCode: "KE",
    county: "Nakuru",
    type: "Technical College",
  },
  {
    name: "Kenya Wildlife Service Training Institute",
    countryCode: "KE",
    county: "Nakuru",
    type: "Training Institute",
  },
  {
    name: "Kenya Industrial Training Institute",
    countryCode: "KE",
    county: "Nakuru",
    type: "Training Institute",
  },

  // ============================================================
  // NANDI COUNTY
  // ============================================================
  {
    name: "University of Eastern Africa, Baraton",
    countryCode: "KE",
    county: "Nandi",
    type: "University",
  },
  {
    name: "Kapsabet Technical and Vocational College",
    countryCode: "KE",
    county: "Nandi",
    type: "Technical College",
  },
  {
    name: "Nandi Hills Technical and Vocational College",
    countryCode: "KE",
    county: "Nandi",
    type: "Technical College",
  },

  // ============================================================
  // NAROK COUNTY
  // ============================================================
  {
    name: "Maasai Mara University",
    countryCode: "KE",
    county: "Narok",
    type: "University",
  },
  {
    name: "Narok Technical and Vocational College",
    countryCode: "KE",
    county: "Narok",
    type: "Technical College",
  },
  {
    name: "Transmara Technical and Vocational College",
    countryCode: "KE",
    county: "Narok",
    type: "Technical College",
  },

  // ============================================================
  // NYAMIRA COUNTY
  // ============================================================
  {
    name: "Nyamira Technical and Vocational College",
    countryCode: "KE",
    county: "Nyamira",
    type: "Technical College",
  },
  {
    name: "Sironga Technical and Vocational College",
    countryCode: "KE",
    county: "Nyamira",
    type: "Technical College",
  },

  // ============================================================
  // NYANDARUA COUNTY
  // ============================================================
  {
    name: "Nyandarua Technical and Vocational College",
    countryCode: "KE",
    county: "Nyandarua",
    type: "Technical College",
  },
  {
    name: "Kinangop Technical and Vocational College",
    countryCode: "KE",
    county: "Nyandarua",
    type: "Technical College",
  },

  // ============================================================
  // NYERI COUNTY
  // ============================================================
  {
    name: "Dedan Kimathi University of Technology",
    countryCode: "KE",
    county: "Nyeri",
    type: "University",
  },
  {
    name: "Karatina University",
    countryCode: "KE",
    county: "Nyeri",
    type: "University",
  },
  {
    name: "Nyeri National Polytechnic",
    countryCode: "KE",
    county: "Nyeri",
    type: "National Polytechnic",
  },
  {
    name: "Mathira Technical and Vocational College",
    countryCode: "KE",
    county: "Nyeri",
    type: "Technical College",
  },
  {
    name: "Kieni Technical and Vocational College",
    countryCode: "KE",
    county: "Nyeri",
    type: "Technical College",
  },

  // ============================================================
  // SAMBURU COUNTY
  // ============================================================
  {
    name: "Samburu Technical and Vocational College",
    countryCode: "KE",
    county: "Samburu",
    type: "Technical College",
  },
  {
    name: "Maralal Technical and Vocational College",
    countryCode: "KE",
    county: "Samburu",
    type: "Technical College",
  },

  // ============================================================
  // SIAYA COUNTY
  // ============================================================
  {
    name: "Jaramogi Oginga Odinga University of Science and Technology",
    countryCode: "KE",
    county: "Siaya",
    type: "University",
  },
  {
    name: "Siaya Institute of Technology",
    countryCode: "KE",
    county: "Siaya",
    type: "Technical College",
  },
  {
    name: "Bondo Technical and Vocational College",
    countryCode: "KE",
    county: "Siaya",
    type: "Technical College",
  },
  {
    name: "Ugenya Technical and Vocational College",
    countryCode: "KE",
    county: "Siaya",
    type: "Technical College",
  },

  // ============================================================
  // TAITA-TAVETA COUNTY
  // ============================================================
  {
    name: "Taita Taveta University",
    countryCode: "KE",
    county: "Taita-Taveta",
    type: "University",
  },
  {
    name: "Taita Taveta National Polytechnic",
    countryCode: "KE",
    county: "Taita-Taveta",
    type: "National Polytechnic",
  },
  {
    name: "Voi Technical and Vocational College",
    countryCode: "KE",
    county: "Taita-Taveta",
    type: "Technical College",
  },

  // ============================================================
  // TANA RIVER COUNTY
  // ============================================================
  {
    name: "Tana River Technical and Vocational College",
    countryCode: "KE",
    county: "Tana River",
    type: "Technical College",
  },
  {
    name: "Hola Technical and Vocational College",
    countryCode: "KE",
    county: "Tana River",
    type: "Technical College",
  },

  // ============================================================
  // THARAKA-NITHI COUNTY
  // ============================================================
  {
    name: "Chuka University",
    countryCode: "KE",
    county: "Tharaka-Nithi",
    type: "University",
  },
  {
    name: "Tharaka University",
    countryCode: "KE",
    county: "Tharaka-Nithi",
    type: "University",
  },
  {
    name: "Chuka Technical and Vocational College",
    countryCode: "KE",
    county: "Tharaka-Nithi",
    type: "Technical College",
  },
  {
    name: "Maara Technical and Vocational College",
    countryCode: "KE",
    county: "Tharaka-Nithi",
    type: "Technical College",
  },

  // ============================================================
  // TRANS NZOIA COUNTY
  // ============================================================
  {
    name: "Kitale National Polytechnic",
    countryCode: "KE",
    county: "Trans Nzoia",
    type: "National Polytechnic",
  },
  {
    name: "Kiminini Technical and Vocational College",
    countryCode: "KE",
    county: "Trans Nzoia",
    type: "Technical College",
  },
  {
    name: "Endebess Technical and Vocational College",
    countryCode: "KE",
    county: "Trans Nzoia",
    type: "Technical College",
  },

  // ============================================================
  // TURKANA COUNTY
  // ============================================================
  {
    name: "Turkana University College",
    countryCode: "KE",
    county: "Turkana",
    type: "University College",
  },
  {
    name: "Lodwar Technical and Vocational College",
    countryCode: "KE",
    county: "Turkana",
    type: "Technical College",
  },
  {
    name: "Turkana West Technical and Vocational College",
    countryCode: "KE",
    county: "Turkana",
    type: "Technical College",
  },

  // ============================================================
  // UASIN GISHU COUNTY
  // ============================================================
  {
    name: "Moi University",
    countryCode: "KE",
    county: "Uasin Gishu",
    type: "University",
  },
  {
    name: "University of Eldoret",
    countryCode: "KE",
    county: "Uasin Gishu",
    type: "University",
  },
  {
    name: "Eldoret National Polytechnic",
    countryCode: "KE",
    county: "Uasin Gishu",
    type: "National Polytechnic",
  },
  {
    name: "Eldoret Technical and Vocational College",
    countryCode: "KE",
    county: "Uasin Gishu",
    type: "Technical College",
  },
  {
    name: "Rift Valley Technical Training Institute",
    countryCode: "KE",
    county: "Uasin Gishu",
    type: "Technical College",
  },

  // ============================================================
  // VIHIGA COUNTY
  // ============================================================
  {
    name: "Kaimosi Friends University",
    countryCode: "KE",
    county: "Vihiga",
    type: "University",
  },
  {
    name: "Kaimosi Friends National Polytechnic",
    countryCode: "KE",
    county: "Vihiga",
    type: "National Polytechnic",
  },
  {
    name: "Vihiga Technical and Vocational College",
    countryCode: "KE",
    county: "Vihiga",
    type: "Technical College",
  },
  {
    name: "Emuhaya Technical and Vocational College",
    countryCode: "KE",
    county: "Vihiga",
    type: "Technical College",
  },

  // ============================================================
  // WAJIR COUNTY
  // ============================================================
  {
    name: "Wajir Technical and Vocational College",
    countryCode: "KE",
    county: "Wajir",
    type: "Technical College",
  },
  {
    name: "Bute Technical and Vocational College",
    countryCode: "KE",
    county: "Wajir",
    type: "Technical College",
  },
  {
    name: "Griftu Technical and Vocational College",
    countryCode: "KE",
    county: "Wajir",
    type: "Technical College",
  },

  // ============================================================
  // WEST POKOT COUNTY
  // ============================================================
  {
    name: "Kapenguria Technical and Vocational College",
    countryCode: "KE",
    county: "West Pokot",
    type: "Technical College",
  },
  {
    name: "Sigor Technical and Vocational College",
    countryCode: "KE",
    county: "West Pokot",
    type: "Technical College",
  },
  {
    name: "West Pokot Technical and Vocational College",
    countryCode: "KE",
    county: "West Pokot",
    type: "Technical College",
  },
];

export function getUniversitiesByCountry(
  countryCode: string
): Institution[] {
  return universities.filter(
    (institution) =>
      institution.countryCode === countryCode
  );
}

export function getInstitutionsByCounty(
  county: string
): Institution[] {
  return universities.filter(
    (institution) =>
      institution.countryCode === "KE" &&
      institution.county === county
  );
}

export function getKenyanInstitutions(): Institution[] {
  return universities.filter(
    (institution) =>
      institution.countryCode === "KE"
  );
}

export const kenyaCounties = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
] as const;
