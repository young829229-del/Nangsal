export interface CityLocation {
  name: string;
  region: "Inside Valley" | "Outside Valley";
  charge: number; // 100, 150, or 200
  district: string;
}

export const NEPAL_CITIES: CityLocation[] = [
  // --- 1. KATHMANDU VALLEY DISTRICTS (Rs. 100) ---
  { name: "Kathmandu City", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "Thamel / Durbar Marg", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "New Baneshwor / Koteshwor", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "Boudha / Jorpati", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "Kalanki / Swayambhu", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "Maharajgunj / Chabahil", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "Kirtipur", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "Budhanilkantha", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "Tokha", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "Shankharapur (Sankhu)", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "Tarakeshwar", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "Gokarneshwar", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "Chandragiri", region: "Inside Valley", charge: 100, district: "Kathmandu" },
  { name: "Nagarjun", region: "Inside Valley", charge: 100, district: "Kathmandu" },

  { name: "Lalitpur (Patan)", region: "Inside Valley", charge: 100, district: "Lalitpur" },
  { name: "Jawalakhel / Jhamsikhel", region: "Inside Valley", charge: 100, district: "Lalitpur" },
  { name: "Satdobato / Kupondole", region: "Inside Valley", charge: 100, district: "Lalitpur" },
  { name: "Mahalaxmi (Imadol)", region: "Inside Valley", charge: 100, district: "Lalitpur" },
  { name: "Godawari", region: "Inside Valley", charge: 100, district: "Lalitpur" },

  { name: "Bhaktapur City", region: "Inside Valley", charge: 100, district: "Bhaktapur" },
  { name: "Thimi (Madhyapur)", region: "Inside Valley", charge: 100, district: "Bhaktapur" },
  { name: "Suryabinayak", region: "Inside Valley", charge: 100, district: "Bhaktapur" },
  { name: "Changunarayan", region: "Inside Valley", charge: 100, district: "Bhaktapur" },

  // --- 2. ALL OUTSIDE VALLEY DISTRICTS & CITIES (Rs. 150 - MAJOR CITIES & HIGHWAYS) ---
  { name: "Pokhara / Lekhnath", region: "Outside Valley", charge: 150, district: "Kaski" },
  { name: "Bharatpur", region: "Outside Valley", charge: 150, district: "Chitwan" },
  { name: "Narayangarh", region: "Outside Valley", charge: 150, district: "Chitwan" },
  { name: "Tandi / Ratnanagar", region: "Outside Valley", charge: 150, district: "Chitwan" },
  { name: "Biratnagar", region: "Outside Valley", charge: 150, district: "Morang" },
  { name: "Urlabari", region: "Outside Valley", charge: 150, district: "Morang" },
  { name: "Butwal", region: "Outside Valley", charge: 150, district: "Rupandehi" },
  { name: "Bhairahawa (Siddharthanagar)", region: "Outside Valley", charge: 150, district: "Rupandehi" },
  { name: "Lumbini", region: "Outside Valley", charge: 150, district: "Rupandehi" },
  { name: "Dharan", region: "Outside Valley", charge: 150, district: "Sunsari" },
  { name: "Itahari", region: "Outside Valley", charge: 150, district: "Sunsari" },
  { name: "Inaruwa", region: "Outside Valley", charge: 150, district: "Sunsari" },
  { name: "Birgunj", region: "Outside Valley", charge: 150, district: "Parsa" },
  { name: "Hetauda", region: "Outside Valley", charge: 150, district: "Makwanpur" },
  { name: "Nepalgunj", region: "Outside Valley", charge: 150, district: "Banke" },
  { name: "Kohalpur", region: "Outside Valley", charge: 150, district: "Banke" },
  { name: "Birtamode", region: "Outside Valley", charge: 150, district: "Jhapa" },
  { name: "Damak", region: "Outside Valley", charge: 150, district: "Jhapa" },
  { name: "Kakarvitta", region: "Outside Valley", charge: 150, district: "Jhapa" },
  { name: "Bhadrapur", region: "Outside Valley", charge: 150, district: "Jhapa" },
  { name: "Janakpur Sub-Metropolitan", region: "Outside Valley", charge: 150, district: "Dhanusha" },
  { name: "Dhalkebar", region: "Outside Valley", charge: 150, district: "Dhanusha" },
  { name: "Mahendranagar (Janakpur)", region: "Outside Valley", charge: 150, district: "Dhanusha" },
  { name: "Ghorahi", region: "Outside Valley", charge: 150, district: "Dang" },
  { name: "Tulsipur", region: "Outside Valley", charge: 150, district: "Dang" },
  { name: "Lamahi", region: "Outside Valley", charge: 150, district: "Dang" },
  { name: "Gaindakot", region: "Outside Valley", charge: 150, district: "Nawalpur" },
  { name: "Kawasoti", region: "Outside Valley", charge: 150, district: "Nawalpur" },
  { name: "Ramgram (Parasi)", region: "Outside Valley", charge: 150, district: "Parasi" },
  { name: "Sunwal", region: "Outside Valley", charge: 150, district: "Parasi" },
  { name: "Banepa", region: "Outside Valley", charge: 150, district: "Kavrepalanchok" },
  { name: "Dhulikhel", region: "Outside Valley", charge: 150, district: "Kavrepalanchok" },
  { name: "Panauti", region: "Outside Valley", charge: 150, district: "Kavrepalanchok" },
  { name: "Lahan", region: "Outside Valley", charge: 150, district: "Siraha" },
  { name: "Siraha Bazaar", region: "Outside Valley", charge: 150, district: "Siraha" },
  { name: "Rajbiraj", region: "Outside Valley", charge: 150, district: "Saptari" },
  { name: "Damauli (Vyas)", region: "Outside Valley", charge: 150, district: "Tanahun" },
  { name: "Abukhaireni", region: "Outside Valley", charge: 150, district: "Tanahun" },
  { name: "Gorkha Bazaar", region: "Outside Valley", charge: 150, district: "Gorkha" },
  { name: "Tansen", region: "Outside Valley", charge: 150, district: "Palpa" },
  { name: "Rampur", region: "Outside Valley", charge: 150, district: "Palpa" },
  { name: "Putalibazar (Syangja)", region: "Outside Valley", charge: 150, district: "Syangja" },
  { name: "Waling", region: "Outside Valley", charge: 150, district: "Syangja" },
  { name: "Bidur / Trishuli", region: "Outside Valley", charge: 150, district: "Nuwakot" },
  { name: "Dhading Besi", region: "Outside Valley", charge: 150, district: "Dhading" },
  { name: "Malekhu", region: "Outside Valley", charge: 150, district: "Dhading" },
  { name: "Bardibas", region: "Outside Valley", charge: 150, district: "Mahottari" },
  { name: "Jaleshwar", region: "Outside Valley", charge: 150, district: "Mahottari" },
  { name: "Lalbandi", region: "Outside Valley", charge: 150, district: "Sarlahi" },
  { name: "Malangwa", region: "Outside Valley", charge: 150, district: "Sarlahi" },
  { name: "Chandrapur", region: "Outside Valley", charge: 150, district: "Rautahat" },
  { name: "Gaur", region: "Outside Valley", charge: 150, district: "Rautahat" },
  { name: "Simara", region: "Outside Valley", charge: 150, district: "Bara" },
  { name: "Kalaiya", region: "Outside Valley", charge: 150, district: "Bara" },
  { name: "Taulihawa", region: "Outside Valley", charge: 150, district: "Kapilvastu" },
  { name: "Chandrauta", region: "Outside Valley", charge: 150, district: "Kapilvastu" },

  // --- 3. ALL OTHER 77 DISTRICT HEADQUARTERS & OUTER REGIONAL CITIES (Rs. 200) ---
  { name: "Dhangadhi", region: "Outside Valley", charge: 200, district: "Kailali" },
  { name: "Tikapur", region: "Outside Valley", charge: 200, district: "Kailali" },
  { name: "Attariya", region: "Outside Valley", charge: 200, district: "Kailali" },
  { name: "Mahendranagar (Bhimdatta)", region: "Outside Valley", charge: 200, district: "Kanchanpur" },
  { name: "Birendranagar (Surkhet)", region: "Outside Valley", charge: 200, district: "Surkhet" },
  { name: "Amargadhi (Dadeldhura)", region: "Outside Valley", charge: 200, district: "Dadeldhura" },
  { name: "Ilam Bazaar", region: "Outside Valley", charge: 200, district: "Ilam" },
  { name: "Gaighat (Triyuga)", region: "Outside Valley", charge: 200, district: "Udayapur" },
  { name: "Katari", region: "Outside Valley", charge: 200, district: "Udayapur" },
  { name: "Dhankuta Bazaar", region: "Outside Valley", charge: 200, district: "Dhankuta" },
  { name: "Baglung Bazaar", region: "Outside Valley", charge: 200, district: "Baglung" },
  { name: "Beni", region: "Outside Valley", charge: 200, district: "Myagdi" },
  { name: "Kusma", region: "Outside Valley", charge: 200, district: "Parbat" },
  { name: "Besisahar", region: "Outside Valley", charge: 200, district: "Lamjung" },
  { name: "Charikot", region: "Outside Valley", charge: 200, district: "Dolakha" },
  { name: "Chautara", region: "Outside Valley", charge: 200, district: "Sindhupalchok" },
  { name: "Manthali", region: "Outside Valley", charge: 200, district: "Ramechhap" },
  { name: "Kamalamai (Sindhulimadi)", region: "Outside Valley", charge: 200, district: "Sindhuli" },
  { name: "Phidim", region: "Outside Valley", charge: 200, district: "Panchthar" },
  { name: "Fungling", region: "Outside Valley", charge: 200, district: "Taplejung" },
  { name: "Khandbari", region: "Outside Valley", charge: 200, district: "Sankhuwasabha" },
  { name: "Salleri", region: "Outside Valley", charge: 200, district: "Solukhumbu" },
  { name: "Okhaldhunga Bazaar", region: "Outside Valley", charge: 200, district: "Okhaldhunga" },
  { name: "Diktel", region: "Outside Valley", charge: 200, district: "Khotang" },
  { name: "Bhojpur Bazaar", region: "Outside Valley", charge: 200, district: "Bhojpur" },
  { name: "Myanglung", region: "Outside Valley", charge: 200, district: "Terhathum" },
  { name: "Dhunche", region: "Outside Valley", charge: 200, district: "Rasuwa" },
  { name: "Chame", region: "Outside Valley", charge: 200, district: "Manang" },
  { name: "Jomsom", region: "Outside Valley", charge: 200, district: "Mustang" },
  { name: "Sandhikharka", region: "Outside Valley", charge: 200, district: "Arghakhanchi" },
  { name: "Tamghas", region: "Outside Valley", charge: 200, district: "Gulmi" },
  { name: "Liwang", region: "Outside Valley", charge: 200, district: "Rolpa" },
  { name: "Pyuthan Bazaar", region: "Outside Valley", charge: 200, district: "Pyuthan" },
  { name: "Rukumkot", region: "Outside Valley", charge: 200, district: "Rukum East" },
  { name: "Musikot", region: "Outside Valley", charge: 200, district: "Rukum West" },
  { name: "Gulariya", region: "Outside Valley", charge: 200, district: "Bardiya" },
  { name: "Dunai", region: "Outside Valley", charge: 200, district: "Dolpa" },
  { name: "Gamgadhi", region: "Outside Valley", charge: 200, district: "Mugu" },
  { name: "Simikot", region: "Outside Valley", charge: 200, district: "Humla" },
  { name: "Chandannath (Jumla)", region: "Outside Valley", charge: 200, district: "Jumla" },
  { name: "Manma", region: "Outside Valley", charge: 200, district: "Kalikot" },
  { name: "Khalanga (Jajarkot)", region: "Outside Valley", charge: 200, district: "Jajarkot" },
  { name: "Dailekh Bazaar", region: "Outside Valley", charge: 200, district: "Dailekh" },
  { name: "Salyan Bazaar", region: "Outside Valley", charge: 200, district: "Salyan" },
  { name: "Martadi", region: "Outside Valley", charge: 200, district: "Bajura" },
  { name: "Chainpur (Bajhang)", region: "Outside Valley", charge: 200, district: "Bajhang" },
  { name: "Darchula Bazaar", region: "Outside Valley", charge: 200, district: "Darchula" },
  { name: "Dasharathchand (Baitadi)", region: "Outside Valley", charge: 200, district: "Baitadi" },
  { name: "Dipayal Silgadhi", region: "Outside Valley", charge: 200, district: "Doti" },
  { name: "Mangalsen", region: "Outside Valley", charge: 200, district: "Achham" }
];

export const isInsideKathmanduValley = (cityName: string, addressName?: string): boolean => {
  const query = `${cityName} ${addressName || ""}`.toLowerCase();
  const valleyKeywords = ["kathmandu", "ktm", "lalitpur", "bhaktapur", "patan", "thimi", "kirtipur", "budhanilkantha", "tokha", "godawari", "chandragiri", "nagarjun", "mahalaxmi", "baneshwor", "thamel", "chabahil", "kalanki", "boudha", "imadol", "sanepa", "jawalakhel", "kupondole"];
  return valleyKeywords.some((kw) => query.includes(kw));
};

export const getCityDeliveryCharge = (cityName: string, addressName?: string, defaultInside = 100, defaultOutside = 150): number => {
  if (isInsideKathmanduValley(cityName, addressName)) {
    return defaultInside;
  }
  const cleanCity = cityName.trim().toLowerCase();
  const matched = NEPAL_CITIES.find(c => 
    c.name.toLowerCase().includes(cleanCity) || 
    cleanCity.includes(c.name.toLowerCase()) || 
    c.district.toLowerCase() === cleanCity
  );
  if (matched) {
    return matched.charge;
  }
  return defaultOutside;
};
