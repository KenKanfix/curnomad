import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

const IS_NATIVE = Capacitor.isNativePlatform();

const API_BASE = "https://open.er-api.com/v6/latest/";
const GEO_API = "https://api.bigdatacloud.net/data/reverse-geocode-client";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const WEATHER_CACHE_KEY = "roam.weather.v1";
const STORAGE_KEY = "roam.state.v1";
const CACHE_KEY = "roam.rates.v1";
const HOME_OVERRIDE_KEY = "roam.home.v1";
const REFRESH_INTERVAL = 6 * 60 * 60 * 1000;

const COUNTRY_TO_CURRENCY = {
  AD: "EUR", AE: "AED", AF: "AFN", AG: "XCD", AI: "XCD", AL: "ALL", AM: "AMD",
  AN: "ANG", AO: "AOA", AQ: "USD", AR: "ARS", AS: "USD", AT: "EUR", AU: "AUD",
  AW: "AWG", AX: "EUR", AZ: "AZN", BA: "BAM", BB: "BBD", BD: "BDT", BE: "EUR",
  BF: "XOF", BG: "EUR", BH: "BHD", BI: "BIF", BJ: "XOF", BL: "EUR", BM: "BMD",
  BN: "BND", BO: "BOB", BQ: "USD", BR: "BRL", BS: "BSD", BT: "BTN", BV: "NOK",
  BW: "BWP", BY: "BYN", BZ: "BZD", CA: "CAD", CC: "AUD", CD: "CDF", CF: "XAF",
  CG: "XAF", CH: "CHF", CI: "XOF", CK: "NZD", CL: "CLP", CM: "XAF", CN: "CNY",
  CO: "COP", CR: "CRC", CU: "CUP", CV: "CVE", CW: "XCG", CX: "AUD", CY: "EUR",
  CZ: "CZK", DE: "EUR", DJ: "DJF", DK: "DKK", DM: "XCD", DO: "DOP", DZ: "DZD",
  EC: "USD", EE: "EUR", EG: "EGP", EH: "MAD", ER: "ERN", ES: "EUR", ET: "ETB",
  FI: "EUR", FJ: "FJD", FK: "FKP", FM: "USD", FO: "DKK", FR: "EUR", GA: "XAF",
  GB: "GBP", GD: "XCD", GE: "GEL", GF: "EUR", GG: "GBP", GH: "GHS", GI: "GIP",
  GL: "DKK", GM: "GMD", GN: "GNF", GP: "EUR", GQ: "XAF", GR: "EUR", GS: "FKP",
  GT: "GTQ", GU: "USD", GW: "XOF", GY: "GYD", HK: "HKD", HM: "AUD", HN: "HNL",
  HR: "EUR", HT: "HTG", HU: "HUF", ID: "IDR", IE: "EUR", IL: "ILS", IM: "GBP",
  IN: "INR", IO: "USD", IQ: "IQD", IR: "IRR", IS: "ISK", IT: "EUR", JE: "GBP",
  JM: "JMD", JO: "JOD", JP: "JPY", KE: "KES", KG: "KGS", KH: "KHR", KI: "AUD",
  KM: "KMF", KN: "XCD", KP: "KPW", KR: "KRW", KW: "KWD", KY: "KYD", KZ: "KZT",
  LA: "LAK", LB: "LBP", LC: "XCD", LI: "CHF", LK: "LKR", LR: "LRD", LS: "LSL",
  LT: "EUR", LU: "EUR", LV: "EUR", LY: "LYD", MA: "MAD", MC: "EUR", MD: "MDL",
  ME: "EUR", MF: "EUR", MG: "MGA", MH: "USD", MK: "MKD", ML: "XOF", MM: "MMK",
  MN: "MNT", MO: "MOP", MP: "USD", MQ: "EUR", MR: "MRU", MS: "XCD", MT: "EUR",
  MU: "MUR", MV: "MVR", MW: "MWK", MX: "MXN", MY: "MYR", MZ: "MZN", NA: "NAD",
  NC: "XPF", NE: "XOF", NF: "AUD", NG: "NGN", NI: "NIO", NL: "EUR", NO: "NOK",
  NP: "NPR", NR: "AUD", NU: "NZD", NZ: "NZD", OM: "OMR", PA: "PAB", PE: "PEN",
  PF: "XPF", PG: "PGK", PH: "PHP", PK: "PKR", PL: "PLN", PM: "EUR", PN: "NZD",
  PR: "USD", PS: "ILS", PT: "EUR", PW: "USD", PY: "PYG", QA: "QAR", RE: "EUR",
  RO: "RON", RS: "RSD", RU: "RUB", RW: "RWF", SA: "SAR", SB: "SBD", SC: "SCR",
  SD: "SDG", SE: "SEK", SG: "SGD", SH: "SHP", SI: "EUR", SJ: "NOK", SK: "EUR",
  SL: "SLE", SM: "EUR", SN: "XOF", SO: "SOS", SR: "SRD", SS: "SSP", ST: "STN",
  SV: "USD", SX: "XCG", SY: "SYP", SZ: "SZL", TC: "USD", TD: "XAF", TF: "EUR",
  TG: "XOF", TH: "THB", TJ: "TJS", TK: "NZD", TL: "USD", TM: "TMT", TN: "TND",
  TO: "TOP", TR: "TRY", TT: "TTD", TV: "AUD", TW: "TWD", TZ: "TZS", UA: "UAH",
  UG: "UGX", UM: "USD", US: "USD", UY: "UYU", UZ: "UZS", VA: "EUR", VC: "XCD",
  VE: "VES", VG: "USD", VI: "USD", VN: "VND", VU: "VUV", WF: "XPF", WS: "WST",
  XK: "EUR", YE: "YER", YT: "EUR", ZA: "ZAR", ZM: "ZMW", ZW: "ZWG",
};

const POPULAR = [
  "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "SGD",
  "HKD", "NZD", "THB", "AED", "ZAR", "BRL", "MXN", "KRW", "SEK", "NOK",
  "DKK", "PLN", "TRY", "IDR", "MYR", "PHP", "VND",
];

const CURRENCY_COUNTRY_CODES = {};
for (const [countryCode, currencyCode] of Object.entries(COUNTRY_TO_CURRENCY)) {
  if (!CURRENCY_COUNTRY_CODES[currencyCode]) {
    CURRENCY_COUNTRY_CODES[currencyCode] = countryCode;
  }
}

const CURRENCY_COUNTRY_OVERRIDES = {
  ANG: "CW",
  EUR: "EU",
  MAD: "MA",
  NOK: "NO",
  NZD: "NZ",
  USD: "US",
  XAF: "CM",
  XCD: "AG",
  XOF: "SN",
  XPF: "PF",
};

const CURRENCY_COUNTRY_LABELS = {
  EUR: "Euro area",
  XAF: "Central Africa",
  XCD: "East Caribbean",
  XOF: "West Africa",
  XPF: "French Pacific",
};

const COUNTRY_POWER = {
  AD: { v: "230", hz: "50", p: ["C", "F"] },
  AE: { v: "220", hz: "50", p: ["C", "D", "G"] },
  AF: { v: "220", hz: "50", p: ["C", "F"] },
  AG: { v: "230", hz: "60", p: ["A", "B"] },
  AI: { v: "110", hz: "60", p: ["A"] },
  AL: { v: "230", hz: "50", p: ["C", "F"] },
  AM: { v: "230", hz: "50", p: ["C", "F"] },
  AO: { v: "220", hz: "50", p: ["C"] },
  AR: { v: "220", hz: "50", p: ["C", "I"] },
  AS: { v: "120", hz: "60", p: ["A", "B", "F", "I"] },
  AT: { v: "230", hz: "50", p: ["C", "F"] },
  AU: { v: "230", hz: "50", p: ["I"] },
  AW: { v: "127", hz: "60", p: ["A", "B", "F"] },
  AX: { v: "230", hz: "50", p: ["C", "F"] },
  AZ: { v: "220", hz: "50", p: ["C", "F"] },
  BA: { v: "230", hz: "50", p: ["C", "F"] },
  BB: { v: "115", hz: "50", p: ["A", "B"] },
  BD: { v: "220", hz: "50", p: ["C", "D", "G", "K"] },
  BE: { v: "230", hz: "50", p: ["C", "E"] },
  BF: { v: "220", hz: "50", p: ["C", "E"] },
  BG: { v: "230", hz: "50", p: ["C", "F"] },
  BH: { v: "230", hz: "50", p: ["G"] },
  BI: { v: "220", hz: "50", p: ["C", "E"] },
  BJ: { v: "220", hz: "50", p: ["C", "E"] },
  BL: { v: "230", hz: "60", p: ["C", "E"] },
  BM: { v: "120", hz: "60", p: ["A", "B"] },
  BN: { v: "240", hz: "50", p: ["G"] },
  BO: { v: "115/230", hz: "50", p: ["A", "C"] },
  BQ: { v: "110/127", hz: "50/60", p: ["A", "B", "C", "F"] },
  BR: { v: "127/220", hz: "60", p: ["C", "N"] },
  BS: { v: "120", hz: "60", p: ["A", "B"] },
  BT: { v: "230", hz: "50", p: ["C", "D", "F", "G", "M"] },
  BW: { v: "230", hz: "50", p: ["D", "G", "M"] },
  BY: { v: "220", hz: "50", p: ["C", "F"] },
  BZ: { v: "110/220", hz: "60", p: ["A", "B", "G"] },
  CA: { v: "120", hz: "60", p: ["A", "B"] },
  CC: { v: "230", hz: "50", p: ["I"] },
  CD: { v: "220", hz: "50", p: ["C", "D", "E"] },
  CF: { v: "220", hz: "50", p: ["C", "E"] },
  CG: { v: "230", hz: "50", p: ["C", "E"] },
  CH: { v: "230", hz: "50", p: ["C", "J"] },
  CI: { v: "230", hz: "50", p: ["C", "E"] },
  CK: { v: "240", hz: "50", p: ["I"] },
  CL: { v: "220", hz: "50", p: ["C", "L"] },
  CM: { v: "220", hz: "50", p: ["C", "E"] },
  CN: { v: "220", hz: "50", p: ["A", "C", "I"] },
  CO: { v: "110", hz: "60", p: ["A", "B"] },
  CR: { v: "120", hz: "60", p: ["A", "B"] },
  CU: { v: "110", hz: "60", p: ["A", "B"] },
  CV: { v: "220", hz: "50", p: ["C", "F"] },
  CW: { v: "127/220", hz: "50", p: ["A", "B", "C", "F"] },
  CX: { v: "230", hz: "50", p: ["I"] },
  CY: { v: "240", hz: "50", p: ["G"] },
  CZ: { v: "230", hz: "50", p: ["C", "E"] },
  DE: { v: "230", hz: "50", p: ["C", "F"] },
  DJ: { v: "220", hz: "50", p: ["C", "E"] },
  DK: { v: "230", hz: "50", p: ["C", "E", "F", "K"] },
  DM: { v: "230", hz: "50", p: ["D", "G"] },
  DO: { v: "110", hz: "60", p: ["A", "B"] },
  DZ: { v: "230", hz: "50", p: ["C", "F"] },
  EC: { v: "120", hz: "60", p: ["A", "B"] },
  EE: { v: "230", hz: "50", p: ["C", "F"] },
  EG: { v: "220", hz: "50", p: ["C", "F"] },
  EH: { v: "230", hz: "50", p: ["C", "E"] },
  ER: { v: "230", hz: "50", p: ["C", "L"] },
  ES: { v: "230", hz: "50", p: ["C", "F"] },
  ET: { v: "220", hz: "50", p: ["C", "E", "F", "L"] },
  EU: { v: "230", hz: "50", p: ["C", "E", "F"] },
  FI: { v: "230", hz: "50", p: ["C", "F"] },
  FJ: { v: "240", hz: "50", p: ["I"] },
  FK: { v: "240", hz: "50", p: ["G"] },
  FM: { v: "120", hz: "60", p: ["A", "B"] },
  FO: { v: "230", hz: "50", p: ["C", "E", "F", "K"] },
  FR: { v: "230", hz: "50", p: ["C", "E"] },
  GA: { v: "220", hz: "50", p: ["C"] },
  GB: { v: "230", hz: "50", p: ["G"] },
  GD: { v: "230", hz: "50", p: ["G"] },
  GE: { v: "220", hz: "50", p: ["C", "F"] },
  GF: { v: "220", hz: "50", p: ["C", "D", "E"] },
  GG: { v: "230", hz: "50", p: ["G"] },
  GH: { v: "230", hz: "50", p: ["D", "G"] },
  GI: { v: "240", hz: "50", p: ["C", "G"] },
  GL: { v: "230", hz: "50", p: ["C", "E", "F", "K"] },
  GM: { v: "230", hz: "50", p: ["G"] },
  GN: { v: "220", hz: "50", p: ["C", "F", "K"] },
  GP: { v: "230", hz: "50", p: ["C", "D", "E"] },
  GQ: { v: "220", hz: "50", p: ["C", "E"] },
  GR: { v: "230", hz: "50", p: ["C", "F"] },
  GS: { v: "230", hz: "50", p: ["G"] },
  GT: { v: "120", hz: "60", p: ["A", "B"] },
  GU: { v: "110", hz: "60", p: ["A", "B"] },
  GW: { v: "220", hz: "50", p: ["C"] },
  GY: { v: "240", hz: "60", p: ["A", "B", "D", "G"] },
  HK: { v: "220", hz: "50", p: ["D", "G"] },
  HN: { v: "110", hz: "60", p: ["A", "B"] },
  HR: { v: "230", hz: "50", p: ["C", "F"] },
  HT: { v: "110", hz: "60", p: ["A", "B"] },
  HU: { v: "230", hz: "50", p: ["C", "F"] },
  ID: { v: "110/220", hz: "50", p: ["C", "F"] },
  IE: { v: "230", hz: "50", p: ["G"] },
  IL: { v: "230", hz: "50", p: ["C", "H", "M"] },
  IM: { v: "240", hz: "50", p: ["C", "G"] },
  IN: { v: "230", hz: "50", p: ["C", "D", "M"] },
  IO: { v: "230", hz: "50", p: ["G"] },
  IQ: { v: "230", hz: "50", p: ["C", "D", "G"] },
  IR: { v: "220", hz: "50", p: ["C", "F"] },
  IS: { v: "230", hz: "50", p: ["C", "F"] },
  IT: { v: "230", hz: "50", p: ["C", "F", "L"] },
  JE: { v: "230", hz: "50", p: ["G"] },
  JM: { v: "110", hz: "50", p: ["A", "B"] },
  JO: { v: "230", hz: "50", p: ["B", "C", "D", "F", "G", "J"] },
  JP: { v: "100", hz: "50/60", p: ["A", "B"] },
  KE: { v: "240", hz: "50", p: ["G"] },
  KG: { v: "220", hz: "50", p: ["C", "F"] },
  KH: { v: "230", hz: "50", p: ["A", "C", "G"] },
  KI: { v: "240", hz: "50", p: ["I"] },
  KM: { v: "220", hz: "50", p: ["C", "E"] },
  KN: { v: "230", hz: "60", p: ["A", "B", "D", "G"] },
  KP: { v: "110/220", hz: "50/60", p: ["A", "C", "F"] },
  KR: { v: "220", hz: "60", p: ["C", "F"] },
  KW: { v: "240", hz: "50", p: ["C", "G"] },
  KY: { v: "120", hz: "60", p: ["A", "B"] },
  KZ: { v: "220", hz: "50", p: ["C", "F"] },
  LA: { v: "230", hz: "50", p: ["A", "B", "C", "E", "F"] },
  LB: { v: "220", hz: "50", p: ["A", "B", "C", "D", "G"] },
  LC: { v: "240", hz: "50", p: ["G"] },
  LI: { v: "230", hz: "50", p: ["C", "J"] },
  LK: { v: "230", hz: "50", p: ["D", "G", "M"] },
  LR: { v: "120/220", hz: "50/60", p: ["A", "B", "C", "E", "F"] },
  LS: { v: "220", hz: "50", p: ["M"] },
  LT: { v: "220", hz: "50", p: ["C", "F"] },
  LU: { v: "230", hz: "50", p: ["C", "F"] },
  LV: { v: "230", hz: "50", p: ["C", "F"] },
  LY: { v: "127/230", hz: "50", p: ["C", "D", "F", "L"] },
  MA: { v: "127/220", hz: "50", p: ["C", "E"] },
  MC: { v: "230", hz: "50", p: ["C", "D", "E", "F"] },
  MD: { v: "220", hz: "50", p: ["C", "F"] },
  ME: { v: "230", hz: "50", p: ["C", "F"] },
  MF: { v: "120/220", hz: "60", p: ["C", "F"] },
  MG: { v: "127/220", hz: "50", p: ["C", "D", "E", "J", "K"] },
  MH: { v: "120", hz: "60", p: ["A", "B"] },
  MK: { v: "230", hz: "50", p: ["C", "F"] },
  ML: { v: "220", hz: "50", p: ["C", "E"] },
  MM: { v: "230", hz: "50", p: ["C", "D", "F", "G"] },
  MN: { v: "220", hz: "50", p: ["C", "E"] },
  MO: { v: "220", hz: "50", p: ["D", "F", "G", "M"] },
  MP: { v: "120", hz: "60", p: ["A", "B"] },
  MQ: { v: "220", hz: "50", p: ["C", "D", "E"] },
  MR: { v: "220", hz: "50", p: ["C"] },
  MS: { v: "230", hz: "60", p: ["A", "B"] },
  MT: { v: "230", hz: "50", p: ["G"] },
  MU: { v: "230", hz: "50", p: ["C", "G"] },
  MV: { v: "230", hz: "50", p: ["A", "C", "D", "G", "J", "K", "L"] },
  MW: { v: "230", hz: "50", p: ["G"] },
  MX: { v: "127", hz: "60", p: ["A", "B"] },
  MY: { v: "240", hz: "50", p: ["A", "C", "G", "M"] },
  MZ: { v: "220", hz: "50", p: ["C", "F", "M"] },
  NA: { v: "220", hz: "50", p: ["D", "M"] },
  NC: { v: "220", hz: "50", p: ["C", "F"] },
  NE: { v: "220", hz: "50", p: ["A", "B", "C", "D", "E", "F"] },
  NF: { v: "230", hz: "50", p: ["I"] },
  NG: { v: "230", hz: "50", p: ["D", "G"] },
  NI: { v: "120", hz: "60", p: ["A", "B"] },
  NL: { v: "230", hz: "50", p: ["C", "F"] },
  NO: { v: "230", hz: "50", p: ["C", "F"] },
  NP: { v: "230", hz: "50", p: ["C", "D", "M"] },
  NR: { v: "240", hz: "50", p: ["I"] },
  NU: { v: "230", hz: "50", p: ["I"] },
  NZ: { v: "230", hz: "50", p: ["I"] },
  OM: { v: "240", hz: "50", p: ["C", "G"] },
  PA: { v: "110", hz: "60", p: ["A", "B"] },
  PE: { v: "220", hz: "60", p: ["A", "B", "C"] },
  PF: { v: "230", hz: "60", p: ["C", "E"] },
  PG: { v: "240", hz: "50", p: ["I"] },
  PH: { v: "220", hz: "60", p: ["A", "B", "C"] },
  PK: { v: "230", hz: "50", p: ["C", "D", "G", "M"] },
  PL: { v: "230", hz: "50", p: ["C", "E"] },
  PM: { v: "230", hz: "50", p: ["C", "E"] },
  PN: { v: "230", hz: "50", p: ["I"] },
  PR: { v: "120", hz: "60", p: ["A", "B"] },
  PS: { v: "230", hz: "50", p: ["C", "H"] },
  PT: { v: "230", hz: "50", p: ["C", "F"] },
  PW: { v: "120", hz: "60", p: ["A", "B"] },
  PY: { v: "220", hz: "50", p: ["C"] },
  QA: { v: "240", hz: "50", p: ["D", "G"] },
  RE: { v: "220", hz: "50", p: ["E"] },
  RO: { v: "230", hz: "50", p: ["C", "F"] },
  RS: { v: "230", hz: "50", p: ["C", "F"] },
  RU: { v: "220", hz: "50", p: ["C", "F"] },
  RW: { v: "230", hz: "50", p: ["C", "J"] },
  SA: { v: "220/230", hz: "60", p: ["G"] },
  SB: { v: "220", hz: "50", p: ["G", "I"] },
  SC: { v: "240", hz: "50", p: ["G"] },
  SD: { v: "230", hz: "50", p: ["C", "D"] },
  SE: { v: "230", hz: "50", p: ["C", "F"] },
  SG: { v: "230", hz: "50", p: ["C", "G", "M"] },
  SH: { v: "230", hz: "50", p: ["G"] },
  SI: { v: "230", hz: "50", p: ["C", "F"] },
  SJ: { v: "230", hz: "50", p: ["C", "F"] },
  SK: { v: "230", hz: "50", p: ["C", "E"] },
  SL: { v: "230", hz: "50", p: ["D", "G"] },
  SM: { v: "230", hz: "50", p: ["C", "F", "L"] },
  SN: { v: "230", hz: "50", p: ["C", "D", "E", "K"] },
  SO: { v: "220", hz: "50", p: ["C"] },
  SR: { v: "127", hz: "60", p: ["C", "F"] },
  SS: { v: "230", hz: "50", p: ["C", "D", "G"] },
  ST: { v: "220", hz: "50", p: ["C", "F"] },
  SV: { v: "115", hz: "60", p: ["A", "B"] },
  SY: { v: "220", hz: "50", p: ["C", "E", "L"] },
  SZ: { v: "230", hz: "50", p: ["M"] },
  TC: { v: "120", hz: "60", p: ["A", "B"] },
  TD: { v: "220", hz: "50", p: ["C", "D", "E", "F"] },
  TG: { v: "220", hz: "50", p: ["C"] },
  TH: { v: "220", hz: "50", p: ["A", "B", "C", "F"] },
  TJ: { v: "220", hz: "50", p: ["C", "F", "I"] },
  TK: { v: "230", hz: "50", p: ["I"] },
  TL: { v: "220", hz: "50", p: ["C", "E", "F", "I"] },
  TM: { v: "220", hz: "50", p: ["B", "C", "F"] },
  TN: { v: "230", hz: "50", p: ["C", "E"] },
  TO: { v: "240", hz: "50", p: ["I"] },
  TR: { v: "220", hz: "50", p: ["C", "F"] },
  TT: { v: "115", hz: "60", p: ["A", "B"] },
  TV: { v: "220", hz: "50", p: ["I"] },
  TW: { v: "110", hz: "60", p: ["A", "B"] },
  TZ: { v: "230", hz: "50", p: ["D", "G"] },
  UA: { v: "220", hz: "50", p: ["C", "F"] },
  UG: { v: "240", hz: "50", p: ["G"] },
  UM: { v: "120", hz: "60", p: ["A", "B"] },
  US: { v: "120", hz: "60", p: ["A", "B"] },
  UY: { v: "230", hz: "50", p: ["C", "F", "I", "L"] },
  UZ: { v: "220", hz: "50", p: ["C", "I"] },
  VA: { v: "230", hz: "50", p: ["C", "F", "L"] },
  VC: { v: "230", hz: "50", p: ["A", "C", "E", "G", "I", "K"] },
  VE: { v: "120", hz: "60", p: ["A", "B"] },
  VG: { v: "110", hz: "60", p: ["A", "B"] },
  VI: { v: "110", hz: "60", p: ["A", "B"] },
  VN: { v: "220", hz: "50", p: ["A", "C", "F"] },
  VU: { v: "220", hz: "50", p: ["C", "G", "I"] },
  WF: { v: "230", hz: "50", p: ["C", "E"] },
  WS: { v: "230", hz: "50", p: ["I"] },
  XK: { v: "230", hz: "50", p: ["C", "F"] },
  YE: { v: "230", hz: "50", p: ["A", "D", "G"] },
  YT: { v: "230", hz: "50", p: ["C", "E"] },
  ZA: { v: "230", hz: "50", p: ["C", "D", "M", "N"] },
  ZM: { v: "230", hz: "50", p: ["C", "D", "G"] },
  ZW: { v: "220", hz: "50", p: ["D", "G"] },
};

const SOCKET_SHAPES = {
  A: '<rect x="15" y="16" width="4" height="15" rx="2"/><rect x="29" y="16" width="4" height="15" rx="2"/>',
  B: '<rect x="15" y="13" width="4" height="15" rx="2"/><rect x="29" y="13" width="4" height="15" rx="2"/><circle cx="24" cy="34" r="2.6"/>',
  C: '<circle cx="16" cy="24" r="3.4"/><circle cx="32" cy="24" r="3.4"/>',
  D: '<circle cx="24" cy="15" r="3"/><circle cx="14" cy="30" r="3"/><circle cx="34" cy="30" r="3"/>',
  E: '<circle cx="16" cy="26" r="3.2"/><circle cx="32" cy="26" r="3.2"/><rect x="22.5" y="8" width="3" height="7" rx="1.5"/>',
  F: '<circle cx="16" cy="24" r="3.2"/><circle cx="32" cy="24" r="3.2"/><rect x="5" y="20" width="3" height="8" rx="1.5"/><rect x="40" y="20" width="3" height="8" rx="1.5"/>',
  G: '<rect x="22.5" y="11" width="3" height="10" rx="1"/><rect x="13.5" y="29" width="3" height="10" rx="1"/><rect x="31.5" y="29" width="3" height="10" rx="1"/>',
  H: '<circle cx="24" cy="14" r="2.7"/><circle cx="16" cy="29" r="2.7"/><circle cx="32" cy="29" r="2.7"/>',
  I: '<rect x="12" y="15" width="3.5" height="12" rx="1.5" transform="rotate(-18 13.75 21)"/><rect x="32.5" y="15" width="3.5" height="12" rx="1.5" transform="rotate(18 34.25 21)"/><rect x="22.25" y="32" width="3.5" height="9" rx="1.5"/>',
  J: '<circle cx="26" cy="13" r="2.7"/><circle cx="15" cy="28" r="2.7"/><circle cx="33" cy="28" r="2.7"/>',
  K: '<circle cx="16" cy="21" r="3.2"/><circle cx="32" cy="21" r="3.2"/><rect x="22.5" y="31" width="3" height="7" rx="1.5"/>',
  L: '<circle cx="14" cy="24" r="2.9"/><circle cx="24" cy="24" r="2.9"/><circle cx="34" cy="24" r="2.9"/>',
  M: '<circle cx="24" cy="13" r="3.6"/><circle cx="13" cy="30" r="3.6"/><circle cx="35" cy="30" r="3.6"/>',
  N: '<circle cx="24" cy="15" r="2.6"/><circle cx="16.5" cy="29" r="2.6"/><circle cx="31.5" cy="29" r="2.6"/>',
};

const DEFAULT_TARGETS = ["EUR", "GBP", "JPY"];

const state = {
  home: "USD",
  amountRaw: "100",
  targets: [{ currency: "EUR" }, { currency: "GBP" }, { currency: "JPY" }],
  location: null,
  homeOverride: null,
  rates: null,
  ratesBase: null,
  updatedAt: null,
  fetchedAt: null,
  cached: false,
  loading: false,
  locating: false,
  error: null,
  picker: null,
  installPrompt: null,
  fetchController: null,
  weather: {
    current: null,
    home: null,
  },
};

const els = {};
const nameCache = new Map();
const symbolCache = new Map();
const digitsCache = new Map();
const countryNameCache = new Map();
let displayNames = null;
let regionDisplayNames = null;
let homeSettingsDraft = null;
let homeCitySearchResults = [];
let homeCitySearchController = null;

const CURRENCY_TIMEZONES = {
  AED: "Asia/Dubai", AFN: "Asia/Kabul", ALL: "Europe/Tirane", AMD: "Asia/Yerevan", ANG: "America/Curacao",
  AOA: "Africa/Luanda", ARS: "America/Argentina/Buenos_Aires", AUD: "Australia/Sydney", AWG: "America/Aruba",
  AZN: "Asia/Baku", BAM: "Europe/Belgrade", BBD: "America/Barbados", BDT: "Asia/Dhaka", BHD: "Asia/Qatar",
  BIF: "Africa/Bujumbura", BMD: "Atlantic/Bermuda", BND: "Asia/Brunei", BOB: "America/La_Paz",
  BRL: "America/Sao_Paulo", BSD: "America/Nassau", BTN: "Asia/Thimphu", BWP: "Africa/Gaborone",
  BYN: "Europe/Minsk", BZD: "America/Belize", CAD: "America/Toronto", CDF: "Africa/Kinshasa",
  CHF: "Europe/Zurich", CLP: "America/Santiago", CNY: "Asia/Shanghai", COP: "America/Bogota",
  CRC: "America/Costa_Rica", CUP: "America/Havana", CVE: "Atlantic/Cape_Verde", CZK: "Europe/Prague",
  DJF: "Africa/Djibouti", DKK: "Europe/Copenhagen", DOP: "America/Santo_Domingo", DZD: "Africa/Algiers",
  EGP: "Africa/Cairo", ERN: "Africa/Asmara", ETB: "Africa/Addis_Ababa", EUR: "Europe/Berlin",
  FJD: "Pacific/Fiji", FKP: "Atlantic/Stanley", GBP: "Europe/London", GEL: "Asia/Tbilisi",
  GHS: "Africa/Accra", GIP: "Europe/Gibraltar", GMD: "Africa/Banjul", GNF: "Africa/Conakry",
  GTQ: "America/Guatemala", GYD: "America/Guyana", HKD: "Asia/Hong_Kong", HNL: "America/Tegucigalpa",
  HTG: "America/Port-au-Prince", HUF: "Europe/Budapest", IDR: "Asia/Jakarta", ILS: "Asia/Jerusalem",
  INR: "Asia/Kolkata", IQD: "Asia/Baghdad", IRR: "Asia/Tehran", ISK: "Atlantic/Reykjavik",
  JMD: "America/Jamaica", JOD: "Asia/Amman", JPY: "Asia/Tokyo", KES: "Africa/Nairobi",
  KGS: "Asia/Bishkek", KHR: "Asia/Phnom_Penh", KMF: "Indian/Comoro", KPW: "Asia/Pyongyang",
  KRW: "Asia/Seoul", KWD: "Asia/Riyadh", KYD: "America/Panama", KZT: "Asia/Almaty",
  LAK: "Asia/Vientiane", LBP: "Asia/Beirut", LKR: "Asia/Colombo", LRD: "Africa/Monrovia",
  LSL: "Africa/Maseru", LYD: "Africa/Tripoli", MAD: "Africa/Casablanca", MDL: "Europe/Chisinau",
  MGA: "Indian/Antananarivo", MKD: "Europe/Skopje", MMK: "Asia/Yangon", MNT: "Asia/Ulaanbaatar",
  MOP: "Asia/Macau", MRU: "Africa/Nouakchott", MUR: "Indian/Mauritius", MVR: "Indian/Maldives",
  MWK: "Africa/Blantyre", MXN: "America/Mexico_City", MYR: "Asia/Kuala_Lumpur", MZN: "Africa/Maputo",
  NAD: "Africa/Windhoek", NGN: "Africa/Lagos", NIO: "America/Managua", NOK: "Europe/Oslo",
  NPR: "Asia/Kathmandu", NZD: "Pacific/Auckland", OMR: "Asia/Dubai", PAB: "America/Panama",
  PEN: "America/Lima", PGK: "Pacific/Port_Moresby", PHP: "Asia/Manila", PKR: "Asia/Karachi",
  PLN: "Europe/Warsaw", PYG: "America/Asuncion", QAR: "Asia/Qatar", RON: "Europe/Bucharest",
  RSD: "Europe/Belgrade", RUB: "Europe/Moscow", RWF: "Africa/Kigali", SAR: "Asia/Riyadh",
  SBD: "Pacific/Guadalcanal", SCR: "Indian/Mahe", SDG: "Africa/Khartoum", SEK: "Europe/Stockholm",
  SGD: "Asia/Singapore", SHP: "Africa/Abidjan", SLE: "Africa/Freetown", SOS: "Africa/Mogadishu",
  SRD: "America/Paramaribo", SSP: "Africa/Juba", STN: "Africa/Sao_Tome", SYP: "Asia/Damascus",
  SZL: "Africa/Mbabane", THB: "Asia/Bangkok", TJS: "Asia/Dushanbe", TMT: "Asia/Ashgabat",
  TND: "Africa/Tunis", TOP: "Pacific/Tongatapu", TRY: "Europe/Istanbul", TTD: "America/Port_of_Spain",
  TWD: "Asia/Taipei", TZS: "Africa/Dar_es_Salaam", UAH: "Europe/Kyiv", UGX: "Africa/Kampala",
  USD: "America/New_York", UYU: "America/Montevideo", UZS: "Asia/Tashkent", VES: "America/Caracas",
  VND: "Asia/Ho_Chi_Minh", VUV: "Pacific/Efate", WST: "Pacific/Apia", XAF: "Africa/Lagos",
  XCD: "America/Puerto_Rico", XCG: "America/Curacao", XOF: "Africa/Abidjan", XPF: "Pacific/Tahiti",
  YER: "Asia/Riyadh", ZAR: "Africa/Johannesburg", ZMW: "Africa/Lusaka", ZWG: "Africa/Harare",
};

const COUNTRY_TO_TZ = {
  US: "America/New_York",
  CA: "America/Toronto",
  GB: "Europe/London",
  IE: "Europe/Dublin",
  FR: "Europe/Paris",
  DE: "Europe/Berlin",
  NL: "Europe/Amsterdam",
  BE: "Europe/Brussels",
  CH: "Europe/Zurich",
  AT: "Europe/Vienna",
  ES: "Europe/Madrid",
  IT: "Europe/Rome",
  PT: "Europe/Lisbon",
  SE: "Europe/Stockholm",
  NO: "Europe/Oslo",
  DK: "Europe/Copenhagen",
  FI: "Europe/Helsinki",
  PL: "Europe/Warsaw",
  CZ: "Europe/Prague",
  HU: "Europe/Budapest",
  GR: "Europe/Athens",
  TR: "Europe/Istanbul",
  UA: "Europe/Kyiv",
  RU: "Europe/Moscow",
  AU: "Australia/Sydney",
  NZ: "Pacific/Auckland",
  JP: "Asia/Tokyo",
  KR: "Asia/Seoul",
  CN: "Asia/Shanghai",
  HK: "Asia/Hong_Kong",
  TW: "Asia/Taipei",
  SG: "Asia/Singapore",
  MY: "Asia/Kuala_Lumpur",
  TH: "Asia/Bangkok",
  VN: "Asia/Ho_Chi_Minh",
  ID: "Asia/Jakarta",
  PH: "Asia/Manila",
  IN: "Asia/Kolkata",
  PK: "Asia/Karachi",
  BD: "Asia/Dhaka",
  AE: "Asia/Dubai",
  SA: "Asia/Riyadh",
  QA: "Asia/Qatar",
  IL: "Asia/Jerusalem",
  ZA: "Africa/Johannesburg",
  EG: "Africa/Cairo",
  NG: "Africa/Lagos",
  KE: "Africa/Nairobi",
  MA: "Africa/Casablanca",
  BR: "America/Sao_Paulo",
  AR: "America/Argentina/Buenos_Aires",
  MX: "America/Mexico_City",
  CL: "America/Santiago",
  CO: "America/Bogota",
  PE: "America/Lima",
};

try {
  displayNames = new Intl.DisplayNames(undefined, { type: "currency" });
} catch {
  displayNames = null;
}

try {
  regionDisplayNames = new Intl.DisplayNames(undefined, { type: "region" });
} catch {
  regionDisplayNames = null;
}

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  hydrateState();
  loadCachedRates();
  loadCachedWeather();
  normalizeSelections();
  // if (syncNearbyWithLocation()) persistState();
  bindEvents();
  renderAll();
  updateNetworkUI();
  setupNativeShell();
  registerServiceWorker();
  installPromptSetup();

  fetchRates({ initial: true }).then(() => {
    if (navigator.onLine) {
      detectLocation({ precise: false, silent: true });
    }
  });

  window.setInterval(handleTicker, 60 * 1000);
  scheduleClockTick();
  fetchWeatherForLocations();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      handleTicker(true);
      renderClocks();
      fetchWeatherForLocations();
    }
  });
}

function scheduleClockTick() {
  window.setTimeout(() => {
    renderClocks();
    scheduleClockTick();
  }, 60000 - (Date.now() % 60000));
}

function cacheElements() {
  const ids = [
    "connectionPill", "connectionText", "installButton", "rateMeta",
    "rateMetaValue", "refreshButton", "locateButton", "locateButtonText",
    "baseLabel", "currencyGrid", "currencyDialog", "dialogEyebrow",
    "dialogTitle", "closeDialog", "currencySearch", "searchClear",
    "currencyList", "toastRegion", "offlineBanner", "homeClockSub",
    "homeClockTime", "homeClockDate", "currentClockSub", "currentClockTime",
    "currentClockDate",
  ];

  ids.forEach((id) => {
    els[id] = document.getElementById(id);
  });
  els.menuButton = document.getElementById("menuButton");
  els.menuDropdown = document.getElementById("menuDropdown");
  els.menuAbout = document.getElementById("menuAbout");
  els.menuHomeSettings = document.getElementById("menuHomeSettings");
  els.homeClockCard = document.getElementById("homeClockCard");
  els.aboutDialog = document.getElementById("aboutDialog");
  els.closeAboutDialog = document.getElementById("closeAboutDialog");
  els.homeSettingsDialog = document.getElementById("homeSettingsDialog");
  els.closeHomeSettingsDialog = document.getElementById("closeHomeSettingsDialog");
  els.powerDialog = document.getElementById("powerDialog");
  els.closePowerDialog = document.getElementById("closePowerDialog");
  els.powerDialogTitle = document.getElementById("powerDialogTitle");
  els.powerDialogLocation = document.getElementById("powerDialogLocation");
  els.powerDialogPlugs = document.getElementById("powerDialogPlugs");
  els.powerDialogSpecs = document.getElementById("powerDialogSpecs");
  els.homeTimezoneSelect = document.getElementById("homeTimezoneSelect");
  els.useCurrentLocationAsHome = document.getElementById("useCurrentLocationAsHome");
  els.clearHomeOverride = document.getElementById("clearHomeOverride");
  els.homeCitySearch = document.getElementById("homeCitySearch");
  els.homeCityResults = document.getElementById("homeCityResults");
  els.homeLocationSummary = document.getElementById("homeLocationSummary");
  els.homeCurrencyOption = document.getElementById("homeCurrencyOption");
  els.setHomeCurrencyFromCity = document.getElementById("setHomeCurrencyFromCity");
  els.setHomeCurrencyLabel = document.getElementById("setHomeCurrencyLabel");
  els.saveHomeSettings = document.getElementById("saveHomeSettings");
  els.cancelHomeSettings = document.getElementById("cancelHomeSettings");
}

function hydrateState() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    saved = null;
  }

  let homeOverride = null;
  try {
    homeOverride = JSON.parse(localStorage.getItem(HOME_OVERRIDE_KEY) || "null");
  } catch {
    homeOverride = null;
  }

  const home = normalizeCode(saved?.home);
  const guessedHome = guessHomeCurrency();
  state.home = home || guessedHome;

  if (homeOverride && typeof homeOverride === "object") {
    const tz = sanitizeTimezone(homeOverride.timezone);
    if (tz) {
      const lat = typeof homeOverride.lat === "number" && Number.isFinite(homeOverride.lat) ? homeOverride.lat
        : (typeof homeOverride.latitude === "number" && Number.isFinite(homeOverride.latitude) ? homeOverride.latitude : null);
      const lon = typeof homeOverride.lon === "number" && Number.isFinite(homeOverride.lon) ? homeOverride.lon
        : (typeof homeOverride.longitude === "number" && Number.isFinite(homeOverride.longitude) ? homeOverride.longitude : null);
      state.homeOverride = {
        timezone: tz,
        city: typeof homeOverride.city === "string" ? homeOverride.city.slice(0, 80) : null,
        countryCode: typeof homeOverride.countryCode === "string" ? homeOverride.countryCode.toUpperCase() : null,
        source: homeOverride.source === "location" ? "location" : "manual",
        lat,
        lon,
      };
    }
  }

  if (typeof saved?.amountRaw === "string" && saved.amountRaw.trim() !== "") {
    state.amountRaw = sanitizeAmount(saved.amountRaw);
  }

  const savedTargets = Array.isArray(saved?.targets) ? saved.targets : [];
  state.targets = [0, 1, 2].map((index) => ({
    currency: normalizeCode(savedTargets[index]?.currency),
  }));

  state.location = sanitizeLocation(saved?.location);
  fillMissingTargets();
}

function loadCachedRates() {
  let cache = null;
  try {
    cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
  } catch {
    cache = null;
  }

  if (!cache || cache.base !== state.home || !isRatesObject(cache.rates)) {
    return;
  }

  state.rates = cache.rates;
  state.ratesBase = cache.base;
  state.updatedAt = parseDate(cache.updatedAt);
  state.fetchedAt = parseDate(cache.fetchedAt);
  state.cached = true;
}

function sanitizeLocation(location) {
  if (!location || typeof location !== "object") return null;
  const countryCode = String(location.countryCode || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(countryCode)) return null;
  const localCurrency = normalizeCode(location.localCurrency);
  const timezone = sanitizeTimezone(location.timezone)
    || COUNTRY_TO_TZ[countryCode]
    || CURRENCY_TIMEZONES[localCurrency]
    || null;
  const lat = typeof location.lat === "number" && Number.isFinite(location.lat) ? location.lat
    : (typeof location.latitude === "number" && Number.isFinite(location.latitude) ? location.latitude : null);
  const lon = typeof location.lon === "number" && Number.isFinite(location.lon) ? location.lon
    : (typeof location.longitude === "number" && Number.isFinite(location.longitude) ? location.longitude : null);
  return {
    countryCode,
    countryName: String(location.countryName || countryCode).slice(0, 80),
    city: String(location.city || "").slice(0, 80),
    localCurrency,
    timezone,
    source: location.source === "gps" ? "gps" : "network",
    detectedAt: parseDate(location.detectedAt)?.toISOString() || new Date().toISOString(),
    lat,
    lon,
  };
}

function guessHomeCurrency() {
  try {
    const locale = new Intl.Locale(navigator.language || "en-US");
    const region = locale.region || locale.maximize().region;
    if (region && COUNTRY_TO_CURRENCY[region.toUpperCase()]) {
      return COUNTRY_TO_CURRENCY[region.toUpperCase()];
    }
  } catch {
    const region = (navigator.language || "").split("-")[1];
    if (region && COUNTRY_TO_CURRENCY[region.toUpperCase()]) {
      return COUNTRY_TO_CURRENCY[region.toUpperCase()];
    }
  }
  return "USD";
}

function fillMissingTargets() {
  const used = new Set([state.home]);
  state.targets.forEach((target, index) => {
    if (target.currency && target.currency !== state.home && !used.has(target.currency)) {
      used.add(target.currency);
    } else {
      target.currency = null;
    }
  });

  state.targets.forEach((target, index) => {
    if (target.currency) return;
    if (index === 0 && state.location?.localCurrency) {
      let lc = normalizeCode(state.location.localCurrency);
      if (lc && lc === state.home) {
        const fallback = pickCurrencyFallback();
        if (fallback) lc = fallback;
      }
      if (lc && (!state.rates || state.rates[lc])) {
        if (used.has(lc)) {
          const other = state.targets.find((t, i) => i !== 0 && t.currency === lc);
          if (other) other.currency = null;
        }
        target.currency = lc;
        used.add(lc);
        return;
      }
    }
    const pool = availableCodePool();
    const next = [...DEFAULT_TARGETS, ...POPULAR, ...pool].find(
      (code) => code && !used.has(code) && (state.rates ? Boolean(state.rates[code]) : true),
    );
    target.currency = next || "USD";
    used.add(target.currency);
  });
}

function syncNearbyWithLocation() {
  const localCurrency = normalizeCode(state.location?.localCurrency);
  if (!localCurrency) return false;

  const desired = localCurrency;
  if (!desired) return false;
  if (state.rates && !state.rates[desired]) return false;

  const nearby = state.targets[0];
  if (!nearby || nearby.currency === desired) return false;

  const other = state.targets.find((target, index) => index !== 0 && target.currency === desired);
  if (other) other.currency = nearby.currency;
  nearby.currency = desired;
  fillMissingTargets();
  return true;
}

function availableCodePool() {
  if (state.rates) {
    return Object.keys(state.rates).sort();
  }
  return [...new Set(Object.values(COUNTRY_TO_CURRENCY))].sort();
}

function normalizeSelections() {
  if (!state.rates) return;
  if (!state.rates[state.home]) {
    state.home = state.rates.USD ? "USD" : Object.keys(state.rates)[0];
  }
  fillMissingTargets();
}

function bindEvents() {
  els.locateButton.addEventListener("click", () => {
    detectLocation({ precise: true, silent: false });
  });
  els.refreshButton.addEventListener("click", () => {
    fetchRates({ force: true, notify: true });
  });

  if (els.menuButton) {
    els.menuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = !els.menuDropdown.hidden;
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (els.menuAbout) {
    els.menuAbout.addEventListener("click", () => {
      closeMenu();
      openAboutDialog();
    });
  }

  if (els.menuHomeSettings) {
    els.menuHomeSettings.addEventListener("click", () => {
      closeMenu();
      openHomeSettingsDialog();
    });
  }

  document.addEventListener("click", (event) => {
    if (!els.menuDropdown || els.menuDropdown.hidden) return;
    if (event.target.closest(".menu-wrapper")) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  if (els.homeClockCard) {
    els.homeClockCard.addEventListener("click", () => {
      openHomeSettingsDialog();
    });
    els.homeClockCard.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openHomeSettingsDialog();
      }
    });
  }

  if (els.closeAboutDialog && els.aboutDialog) {
    els.closeAboutDialog.addEventListener("click", () => closeAboutDialog());
    els.aboutDialog.addEventListener("click", (event) => {
      if (event.target === els.aboutDialog) closeAboutDialog();
    });
  }

  if (els.closeHomeSettingsDialog && els.homeSettingsDialog) {
    els.closeHomeSettingsDialog.addEventListener("click", () => closeHomeSettingsDialog());
    els.homeSettingsDialog.addEventListener("click", (event) => {
      if (event.target === els.homeSettingsDialog) closeHomeSettingsDialog();
    });
  }

  if (els.closePowerDialog && els.powerDialog) {
    els.closePowerDialog.addEventListener("click", () => closePowerDialog());
    els.powerDialog.addEventListener("click", (event) => {
      if (event.target === els.powerDialog) closePowerDialog();
    });
  }

  if (els.useCurrentLocationAsHome) {
    els.useCurrentLocationAsHome.addEventListener("click", () => {
      useCurrentLocationAsHome();
    });
  }

  if (els.clearHomeOverride) {
    els.clearHomeOverride.addEventListener("click", () => {
      clearHomeOverride();
    });
  }

  if (els.homeTimezoneSelect) {
    els.homeTimezoneSelect.addEventListener("change", () => {
      const tz = sanitizeTimezone(els.homeTimezoneSelect.value);
      if (!tz || !homeSettingsDraft) return;
      homeSettingsDraft.timezone = tz;
      updateHomeSettingsUI();
    });
  }

  if (els.homeCitySearch) {
    els.homeCitySearch.addEventListener("input", () => {
      searchHomeCity(els.homeCitySearch.value);
    });
    els.homeCitySearch.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const first = els.homeCityResults?.querySelector("[data-city-index]");
        if (first) first.click();
      }
    });
  }

  if (els.homeCityResults) {
    els.homeCityResults.addEventListener("click", (event) => {
      const button = event.target.closest("[data-city-index]");
      if (!button) return;
      const index = Number(button.dataset.cityIndex);
      const result = homeCitySearchResults[index];
      if (result) selectHomeCity(result);
    });
  }

  if (els.setHomeCurrencyFromCity) {
    els.setHomeCurrencyFromCity.addEventListener("change", () => {
      if (homeSettingsDraft) {
        homeSettingsDraft.setCurrency = els.setHomeCurrencyFromCity.checked;
      }
    });
  }

  if (els.saveHomeSettings) {
    els.saveHomeSettings.addEventListener("click", () => {
      commitHomeSettings();
    });
  }

  if (els.cancelHomeSettings) {
    els.cancelHomeSettings.addEventListener("click", () => {
      closeHomeSettingsDialog();
    });
  }

  els.currencyGrid.addEventListener("input", handleCardInput);

  els.currencyGrid.addEventListener("click", (event) => {
    const powerButton = event.target.closest("[data-power-slot]");
    if (powerButton) {
      openPowerDialog(powerButton);
      return;
    }
    const button = event.target.closest("[data-pick-slot]");
    if (!button) return;
    const slot = Number(button.dataset.pickSlot);
    if (!Number.isInteger(slot)) return;
    if (slot === 0) {
      openPicker({ type: "home" });
    } else {
      openPicker({ type: "target", index: slot - 1 });
    }
  });

  els.closeDialog.addEventListener("click", closeDialog);
  els.currencyDialog.addEventListener("click", (event) => {
    if (event.target === els.currencyDialog) closeDialog();
  });
  els.currencyDialog.addEventListener("close", () => {
    state.picker = null;
  });
  els.currencyDialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (els.currencySearch.value) {
      event.preventDefault();
      els.currencySearch.value = "";
      els.searchClear.hidden = true;
      renderCurrencyList();
      return;
    }
    closeDialog();
  });

  els.currencySearch.addEventListener("input", () => {
    els.searchClear.hidden = !els.currencySearch.value;
    renderCurrencyList();
  });
  els.searchClear.addEventListener("click", () => {
    els.currencySearch.value = "";
    els.searchClear.hidden = true;
    renderCurrencyList();
    els.currencySearch.focus();
  });

  els.currencyList.addEventListener("click", (event) => {
    const option = event.target.closest("[data-currency]");
    if (!option) return;
    applyCurrency(option.dataset.currency);
  });

  window.addEventListener("online", () => {
    updateNetworkUI();
    showToast("You're back online. Refreshing rates.", "info");
    fetchRates({ force: true });
  });

  window.addEventListener("offline", () => {
    updateNetworkUI();
    showToast("You're offline. Saved rates are still available.", "info");
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      updateNetworkUI();
    });
  }
}

function handleCardInput(event) {
  const input = event.target.closest("[data-amount-input]");
  if (!input || input.disabled) return;

  const slot = Number(input.dataset.amountInput);
  const caret = input.selectionStart ?? input.value.length;
  const cleaned = String(input.value).replace(/,/g, "").replace(/[^\d.]/g, "");
  let significant = countSignificant(input.value, caret);
  const sanitized = sanitizeAmount(input.value);
  if (sanitized === `0${cleaned}` && cleaned.startsWith(".")) {
    significant += 1;
  }

  if (slot === 0) {
    state.amountRaw = sanitized;
  } else {
    const target = state.targets[slot - 1];
    const rate = state.rates?.[target?.currency];
    if (!target || !rate || !isRateReady()) return;

    const parsed = sanitized.trim() === "" ? null : Number.parseFloat(sanitized);
    state.amountRaw = parsed === null || !Number.isFinite(parsed)
      ? ""
      : formatInputAmount(parsed / rate, state.home);
  }

  const display = formatGroupedAmount(sanitized);
  if (input.value !== display) {
    input.value = display;
    const position = positionForSignificant(display, significant);
    input.setSelectionRange(position, position);
  }

  updateCardAmounts(slot);
  persistState();
}

function sanitizeAmount(raw) {
  let next = String(raw).replace(/,/g, "").replace(/[^\d.]/g, "");
  const parts = next.split(".");
  if (parts.length > 2) {
    next = `${parts.shift()}.${parts.join("")}`;
  }
  if (next.startsWith(".")) {
    next = `0${next}`;
  }
  return next;
}

async function fetchRates({ force = false, initial = false, notify = false } = {}) {
  if (!navigator.onLine && state.ratesBase !== state.home) {
    state.error = new Error("offline");
    state.loading = false;
    renderAll();
    if (notify) showToast("No connection and no saved rates for this currency.", "error");
    return;
  }

  const base = state.home;

  if (state.fetchController) {
    state.fetchController.abort();
  }

  const controller = new AbortController();
  state.fetchController = controller;
  state.loading = true;
  state.error = null;
  renderStatus();

  try {
    const response = await fetch(`${API_BASE}${encodeURIComponent(base)}`, {
      signal: controller.signal,
      cache: force ? "no-store" : "default",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Rate request failed (${response.status})`);
    }

    const data = await response.json();
    if (data.result !== "success" || !isRatesObject(data.rates)) {
      throw new Error(data["error-type"] || "Rates unavailable");
    }

    if (state.home !== base) return;

    state.rates = data.rates;
    state.ratesBase = base;
    state.updatedAt = data.time_last_update_unix
      ? new Date(data.time_last_update_unix * 1000)
      : new Date();
    state.fetchedAt = new Date();
    state.cached = false;
    state.error = null;
    normalizeSelections();
    persistState();
    saveCachedRates();
    renderAll();

    if (notify) {
      showToast("Exchange rates refreshed.", "success");
    }
  } catch (error) {
    if (error.name === "AbortError" || state.home !== base) return;

    state.error = error;
    if (state.ratesBase === base && state.rates) {
      state.cached = true;
      if (notify) {
        showToast("Couldn't refresh. Showing your saved rates.", "error");
      }
    } else if (notify) {
      showToast("Rates are unavailable right now. Check your connection.", "error");
    }
  } finally {
    if (state.fetchController === controller) {
      state.fetchController = null;
      state.loading = false;
      renderAll();
    }
  }
}

function saveCachedRates() {
  if (!state.rates || !state.ratesBase) return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        base: state.ratesBase,
        rates: state.rates,
        updatedAt: state.updatedAt?.toISOString() || null,
        fetchedAt: state.fetchedAt?.toISOString() || null,
      }),
    );
  } catch {
    showToast("Your browser couldn't save the latest rates.", "error");
  }
}

function saveHomeOverride() {
  try {
    if (!state.homeOverride?.timezone) {
      localStorage.removeItem(HOME_OVERRIDE_KEY);
      return;
    }
    localStorage.setItem(HOME_OVERRIDE_KEY, JSON.stringify(state.homeOverride));
  } catch {
    showToast("Your browser couldn't save home settings.", "error");
  }
}

function openMenu() {
  if (!els.menuDropdown) return;
  els.menuDropdown.hidden = false;
  if (els.menuButton) {
    els.menuButton.setAttribute("aria-expanded", "true");
  }
}

function closeMenu() {
  if (!els.menuDropdown) return;
  els.menuDropdown.hidden = true;
  if (els.menuButton) {
    els.menuButton.setAttribute("aria-expanded", "false");
  }
}

function openAboutDialog() {
  if (!els.aboutDialog) return;
  if (typeof els.aboutDialog.showModal === "function") {
    els.aboutDialog.showModal();
  } else {
    els.aboutDialog.setAttribute("open", "");
  }
}

function closeAboutDialog() {
  if (!els.aboutDialog) return;
  if (els.aboutDialog.open && typeof els.aboutDialog.close === "function") {
    els.aboutDialog.close();
  } else {
    els.aboutDialog.removeAttribute("open");
  }
}

function openHomeSettingsDialog() {
  if (!els.homeSettingsDialog) return;
  resetHomeSettingsDraft();
  if (typeof els.homeSettingsDialog.showModal === "function") {
    els.homeSettingsDialog.showModal();
  } else {
    els.homeSettingsDialog.setAttribute("open", "");
  }
}

function closeHomeSettingsDialog() {
  homeSettingsDraft = null;
  homeCitySearchResults = [];
  if (els.homeCityResults) {
    els.homeCityResults.hidden = true;
    els.homeCityResults.innerHTML = "";
  }
  if (els.homeCitySearch) els.homeCitySearch.value = "";
  if (!els.homeSettingsDialog) return;
  if (els.homeSettingsDialog.open && typeof els.homeSettingsDialog.close === "function") {
    els.homeSettingsDialog.close();
  } else {
    els.homeSettingsDialog.removeAttribute("open");
  }
}

function resetHomeSettingsDraft() {
  const tz = getHomeTimezone();
  homeSettingsDraft = {
    timezone: tz,
    city: state.homeOverride?.city || null,
    countryCode: state.homeOverride?.countryCode || null,
    countryName: null,
    lat: state.homeOverride?.lat ?? null,
    lon: state.homeOverride?.lon ?? null,
    setCurrency: true,
  };
  if (homeSettingsDraft.countryCode) {
    try {
      homeSettingsDraft.countryName = regionDisplayNames?.of(homeSettingsDraft.countryCode) || homeSettingsDraft.countryCode;
    } catch {
      homeSettingsDraft.countryName = homeSettingsDraft.countryCode;
    }
  }
  if (els.homeCitySearch) els.homeCitySearch.value = homeSettingsDraft.city || "";
  if (els.homeCityResults) {
    els.homeCityResults.hidden = true;
    els.homeCityResults.innerHTML = "";
  }
  populateHomeTimezoneSelect();
  updateHomeSettingsUI();
}

function populateHomeTimezoneSelect() {
  if (!els.homeTimezoneSelect) return;
  const timezones = typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : ["UTC", "America/New_York", "Europe/London", "Europe/Berlin", "Asia/Tokyo", "Asia/Kolkata", "Australia/Sydney"];
  const current = homeSettingsDraft?.timezone || getHomeTimezone();
  els.homeTimezoneSelect.innerHTML = "";
  for (const tz of timezones) {
    const option = document.createElement("option");
    option.value = tz;
    option.textContent = tz.replace(/_/g, " ");
    if (tz === current) option.selected = true;
    els.homeTimezoneSelect.appendChild(option);
  }
}

function updateHomeSettingsUI() {
  if (!homeSettingsDraft) return;

  if (els.homeTimezoneSelect) {
    els.homeTimezoneSelect.value = homeSettingsDraft.timezone;
  }

  if (els.homeLocationSummary) {
    if (homeSettingsDraft.city) {
      const country = homeSettingsDraft.countryName || homeSettingsDraft.countryCode || "";
      els.homeLocationSummary.textContent = country
        ? `${homeSettingsDraft.city}, ${country} · ${homeSettingsDraft.timezone}`
        : `${homeSettingsDraft.city} · ${homeSettingsDraft.timezone}`;
    } else {
      els.homeLocationSummary.textContent = `${homeSettingsDraft.timezone} · no city selected`;
    }
  }

  const currency = homeSettingsDraft.countryCode
    ? COUNTRY_TO_CURRENCY[homeSettingsDraft.countryCode]
    : null;
  const canSetCurrency = Boolean(currency && currency !== state.home && (!state.rates || state.rates[currency]));

  if (els.homeCurrencyOption) {
    els.homeCurrencyOption.hidden = !canSetCurrency;
  }
  if (canSetCurrency && els.setHomeCurrencyLabel) {
    els.setHomeCurrencyLabel.textContent = `Also set home currency to ${currency} (${getCurrencyName(currency)})`;
  }
  if (els.setHomeCurrencyFromCity) {
    els.setHomeCurrencyFromCity.checked = canSetCurrency ? Boolean(homeSettingsDraft.setCurrency) : false;
  }
}

async function searchHomeCity(rawQuery) {
  const query = String(rawQuery || "").trim();
  if (!els.homeCityResults) return;

  if (homeCitySearchController) {
    homeCitySearchController.abort();
    homeCitySearchController = null;
  }

  if (query.length < 2) {
    homeCitySearchResults = [];
    els.homeCityResults.hidden = true;
    els.homeCityResults.innerHTML = "";
    return;
  }

  if (!navigator.onLine) {
    els.homeCityResults.hidden = false;
    els.homeCityResults.innerHTML = `<p class="home-city-empty">Connect to the internet to search cities.</p>`;
    return;
  }

  const controller = new AbortController();
  homeCitySearchController = controller;

  els.homeCityResults.hidden = false;
  els.homeCityResults.innerHTML = `<p class="home-city-empty">Searching…</p>`;

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`,
      { signal: controller.signal, headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error("geocode failed");
    const data = await res.json();
    if (homeCitySearchController !== controller) return;
    homeCitySearchResults = Array.isArray(data?.results) ? data.results : [];
    renderHomeCityResults();
  } catch (error) {
    if (error.name === "AbortError") return;
    homeCitySearchResults = [];
    if (els.homeCityResults) {
      els.homeCityResults.innerHTML = `<p class="home-city-empty">Couldn't search cities. Try again.</p>`;
    }
  } finally {
    if (homeCitySearchController === controller) {
      homeCitySearchController = null;
    }
  }
}

function renderHomeCityResults() {
  if (!els.homeCityResults) return;
  if (!homeCitySearchResults.length) {
    els.homeCityResults.hidden = false;
    els.homeCityResults.innerHTML = `<p class="home-city-empty">No matching cities.</p>`;
    return;
  }

  els.homeCityResults.hidden = false;
  els.homeCityResults.innerHTML = homeCitySearchResults.map((result, index) => {
    const region = [result.admin1, result.country].filter(Boolean).join(", ");
    return `
      <button class="home-city-option" type="button" role="option" data-city-index="${index}">
        <span class="home-city-name">${escapeHTML(result.name || "Unknown")}</span>
        <span class="home-city-region">${escapeHTML(region)}</span>
      </button>
    `;
  }).join("");
}

function selectHomeCity(result) {
  if (!homeSettingsDraft || !result) return;
  homeSettingsDraft.city = String(result.name || "").slice(0, 80) || null;
  homeSettingsDraft.countryCode = typeof result.country_code === "string" ? result.country_code.toUpperCase() : null;
  homeSettingsDraft.countryName = result.country || null;
  homeSettingsDraft.lat = typeof result.latitude === "number" ? result.latitude : null;
  homeSettingsDraft.lon = typeof result.longitude === "number" ? result.longitude : null;
  const tz = sanitizeTimezone(result.timezone);
  if (tz) homeSettingsDraft.timezone = tz;
  if (els.homeCitySearch) els.homeCitySearch.value = homeSettingsDraft.city || "";
  if (els.homeCityResults) {
    els.homeCityResults.hidden = true;
    els.homeCityResults.innerHTML = "";
  }
  homeCitySearchResults = [];
  updateHomeSettingsUI();
}

function useCurrentLocationAsHome() {
  if (state.location?.timezone) {
    const tz = sanitizeTimezone(state.location.timezone);
    if (tz) {
      if (!homeSettingsDraft) resetHomeSettingsDraft();
      homeSettingsDraft.timezone = tz;
      homeSettingsDraft.city = state.location.city || timezoneCity(tz);
      homeSettingsDraft.countryCode = state.location.countryCode || null;
      homeSettingsDraft.countryName = state.location.countryName || null;
      homeSettingsDraft.lat = state.location.lat ?? null;
      homeSettingsDraft.lon = state.location.lon ?? null;
      if (els.homeCitySearch) els.homeCitySearch.value = homeSettingsDraft.city;
      updateHomeSettingsUI();
      showToast("Current location loaded. Press OK to save.", "info");
      return;
    }
  }
  showToast("Detect your current location first to use it as home.", "info");
}

function commitHomeSettings() {
  if (!homeSettingsDraft) {
    closeHomeSettingsDialog();
    return;
  }

  const tz = sanitizeTimezone(homeSettingsDraft.timezone);
  if (!tz) {
    showToast("Choose a valid timezone.", "error");
    return;
  }

  const currency = homeSettingsDraft.setCurrency && homeSettingsDraft.countryCode
    ? COUNTRY_TO_CURRENCY[homeSettingsDraft.countryCode]
    : null;

  state.homeOverride = {
    timezone: tz,
    city: homeSettingsDraft.city || null,
    countryCode: homeSettingsDraft.countryCode || null,
    source: homeSettingsDraft.lat != null && homeSettingsDraft.lon != null ? "location" : "manual",
    lat: homeSettingsDraft.lat ?? null,
    lon: homeSettingsDraft.lon ?? null,
  };
  saveHomeOverride();

  closeHomeSettingsDialog();
  renderAll();

  if (currency && currency !== state.home && (!state.rates || state.rates[currency])) {
    setHomeCurrency(currency);
  }

  showToast("Home location saved.", "success");
  fetchWeatherForLocations();
}

function setHomeCurrency(code) {
  if (!code || code === state.home || !state.rates?.[code]) return;
  const oldHome = state.home;
  const matchingTarget = state.targets.find((target) => target.currency === code);
  if (matchingTarget) {
    matchingTarget.currency = oldHome;
  }
  state.home = code;
    deriveRatesForBase(code);
    // syncNearbyWithLocation();
    fillMissingTargets();
  persistState();
  renderAll();
  fetchRates({ force: true });
}

function clearHomeOverride() {
  state.homeOverride = null;
  saveHomeOverride();
  closeHomeSettingsDialog();
  renderAll();
  showToast("Home timezone reverted to currency-based.", "success");
}

function persistState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        home: state.home,
        amountRaw: state.amountRaw,
        targets: state.targets.map((target) => ({ currency: target.currency })),
        location: state.location,
      }),
    );
  } catch {
    showToast("Your browser couldn't save your preferences.", "error");
  }
}

function renderAll() {
  renderCards();
  renderClocks();
  renderStatus();
  renderRateMeta();
  renderLocation();
  populateHomeTimezoneSelect();
}

function renderCards() {
  const ratesReady = isRateReady();
  const amount = parseAmount();
  els.baseLabel.textContent = state.home;

  const slots = [
    { index: 0, code: state.home, isHome: true, isNearby: false },
    ...state.targets.map((target, index) => ({
      index: index + 1,
      code: target.currency,
      isHome: false,
      isNearby: index === 0,
    })),
  ];

  els.currencyGrid.innerHTML = slots.map((slot) => {
    const code = slot.code;
    const name = getCurrencyName(code);
    const symbol = getCurrencySymbol(code);
    const rate = slot.isHome ? 1 : ratesReady ? state.rates[code] : null;
    const pending = !ratesReady && state.loading;
    const canEdit = slot.isHome || Boolean(rate);
    const value = slot.isHome
      ? formatGroupedAmount(state.amountRaw)
      : rate && amount !== null
        ? formatGroupedAmount(formatInputAmount(amount * rate, code))
        : "";
    const tag = slotTagMarkup(slot);
    const tagTitle = ` title="${escapeHTML(slotTitle(slot))}"`;
    const triggerDark = slot.isHome ? " currency-trigger--dark" : "";

    return `
      <article class="currency-card${slot.isHome ? " currency-card--home" : ""}${slot.isNearby ? " currency-card--nearby" : ""}" data-slot="${slot.index}">
        <div class="currency-card-head">
          <span class="card-tag"${tagTitle}>${tag}</span>
          <button
            class="currency-trigger currency-trigger--small${triggerDark}"
            type="button"
            data-pick-slot="${slot.index}"
            aria-haspopup="dialog"
            aria-label="Change currency for ${escapeHTML(getCurrencyCountry(slot.code))}, currently ${escapeHTML(code)} — ${escapeHTML(name)}"
          >
            <span class="currency-symbol" aria-hidden="true">${escapeHTML(symbol)}</span>
            <span>${escapeHTML(code)}</span>
            <svg class="chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="currency-main">
          <div class="currency-amount">
            <span class="currency-amount-symbol" aria-hidden="true">${escapeHTML(symbol)}</span>
            <label class="sr-only" for="amountSlot${slot.index}">Amount in ${escapeHTML(name)}</label>
            <input
              class="currency-amount-input"
              id="amountSlot${slot.index}"
              data-amount-input="${slot.index}"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              spellcheck="false"
              value="${escapeHTML(value)}"
              placeholder="${canEdit ? "0" : "—"}"
              aria-label="Amount in ${escapeHTML(name)}"
              ${canEdit ? "" : "disabled"}
            >
          </div>
          <p class="currency-card-name">${escapeHTML(name)}</p>
        </div>
        <div class="currency-card-foot">
          ${cardFootMarkup(slot, rate, pending)}
          ${powerMarkup(slot)}
        </div>
      </article>
    `;
  }).join("");
}

function tagLabel(slot) {
  if (slot.isHome) return "Home";
  return getCurrencyCountry(slot.code);
}

function slotTitle(slot) {
  const country = getCurrencyCountry(slot.code);
  const currency = getCurrencyName(slot.code);
  if (slot.isHome) return `${country} · ${currency} · home currency`;
  if (slot.isNearby) {
    const place = state.location ? ` Detected near ${locationShort()}.` : "";
    return `${country} · ${currency} · nearby currency.${place}`;
  }
  return `${country} · ${currency}`;
}

function slotTagMarkup(slot) {
  let icon = "";
  if (slot.isHome) {
    icon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 10.5 12 4l7.5 6.5V20h-5v-5.5h-5V20h-5v-9.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`;
  } else if (slot.isNearby) {
    icon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s6.5-5.7 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.3 12 21 12 21Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.1" stroke="currentColor" stroke-width="1.8"/></svg>`;
  } else {
    icon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 12h17M12 3.5c2.4 2.5 3.6 5.3 3.6 8.5s-1.2 6-3.6 8.5M12 3.5C9.6 6 8.4 8.8 8.4 12s1.2 6 3.6 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  }
  const locationMarkup = slot.isNearby ? ` ${nearbyLocationMarkup()}` : "";
  return `${icon}<span>${escapeHTML(tagLabel(slot))}</span>${locationMarkup}`;
}

function cardFootMarkup(slot, rate, pending) {
  if (slot.isHome) {
    return `<p class="rate-line">Base currency · <strong>${escapeHTML(state.home)}</strong></p>
      <p class="inverse-rate">Edits sync all cards</p>`;
  }
  if (!rate) {
    return `<p class="rate-line"><span class="rate-pending">${pending ? "Fetching rate…" : "Rate unavailable"}</span></p>`;
  }
  return `<p class="rate-line">1 ${escapeHTML(state.home)} = <strong>${formatRate(rate)}</strong> ${escapeHTML(slot.code)}</p>
    <p class="inverse-rate">1 ${escapeHTML(slot.code)} = ${formatRate(1 / rate)} ${escapeHTML(state.home)}</p>`;
}

function updateCardAmounts(activeSlot) {
  const ratesReady = isRateReady();
  const amount = parseAmount();

  els.currencyGrid.querySelectorAll("[data-amount-input]").forEach((input) => {
    const slot = Number(input.dataset.amountInput);
    if (slot === activeSlot) return;

    if (slot === 0) {
      input.value = formatGroupedAmount(state.amountRaw);
      return;
    }

    const code = state.targets[slot - 1]?.currency;
    const rate = ratesReady ? state.rates[code] : null;
    input.value = rate && amount !== null
      ? formatGroupedAmount(formatInputAmount(amount * rate, code))
      : "";
  });
}

function nearbyLocationMarkup() {
  if (!state.location) {
    return `<span class="target-location sr-only">Use location to detect the local currency.</span>`;
  }
  const place = locationShort();
  return `<span class="target-location sr-only">Local location: ${escapeHTML(place)}</span>`;
}

function renderLocation() {
  els.locateButton.disabled = state.locating;
  els.locateButton.classList.toggle("is-locating", state.locating);
  els.locateButtonText.textContent = state.locating
    ? "Locating…"
    : state.location
      ? "Update location"
      : "Use my location";
}

function renderStatus() {
  const offline = !navigator.onLine;
  let text = "Live rates";
  let mode = "ready";

  if (offline && !navigator.onLine) {
    text = "Offline";
    mode = "offline";
  } else if (state.loading) {
    text = state.rates ? "Updating" : "Connecting";
    mode = "loading";
  } else if (state.error && !state.rates) {
    text = "Unavailable";
    mode = "error";
  } else if (state.cached) {
    text = "Saved rates";
    mode = "cached";
  } else if (!state.rates) {
    text = "Connecting";
    mode = "loading";
  }

  els.connectionText.textContent = text;
  els.connectionPill.classList.toggle("is-loading", mode === "loading");
  els.connectionPill.classList.toggle("is-cached", mode === "cached");
  els.connectionPill.classList.toggle("is-offline", mode === "offline");
  els.connectionPill.classList.toggle("is-error", mode === "error");
  els.refreshButton.classList.toggle("is-spinning", state.loading);
  els.refreshButton.setAttribute("aria-busy", String(state.loading));
}

function renderClocks() {
  const now = new Date();
  const homeTimezone = getHomeTimezone();

  const homeLabel = state.homeOverride?.city || timezoneCity(homeTimezone);
  els.homeClockSub.textContent = homeTimezone
    ? `${state.home} · ${homeLabel || ""}`.replace(/ · $/, "")
    : state.home;
  renderClock(now, homeTimezone, "home");
  els.homeClockTime.title = homeTimezone || "Home time unavailable";
  applyClockWeather("home");

  const currentTimezone = sanitizeTimezone(state.location?.timezone);
  els.currentClockSub.textContent = state.location
    ? locationShort()
    : "Not detected";
  renderClock(now, currentTimezone, "current");
  els.currentClockTime.title = currentTimezone || "Detect your location to see local time";
  applyClockWeather("current");
}

function renderClock(now, timezone, prefix) {
  const timeElement = els[`${prefix}ClockTime`];
  const dateElement = els[`${prefix}ClockDate`];

  if (!timezone) {
    timeElement.textContent = "--:--";
    dateElement.textContent = prefix === "current" ? "Use my location" : "Time unavailable";
    return;
  }

  try {
    timeElement.textContent = new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);
    dateElement.textContent = new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(now);
  } catch {
    timeElement.textContent = "--:--";
    dateElement.textContent = "Time unavailable";
  }
}

function getHomeTimezone() {
  if (state.homeOverride?.timezone) {
    const tz = sanitizeTimezone(state.homeOverride.timezone);
    if (tz) return tz;
  }
  return sanitizeTimezone(CURRENCY_TIMEZONES[state.home])
    || sanitizeTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    || "UTC";
}

function timezoneCity(timezone) {
  if (!timezone) return "";
  const city = timezone.split("/").pop().replaceAll("_", " ");
  return city === "UTC" ? "UTC" : city;
}

function sanitizeTimezone(value) {
  if (typeof value !== "string") return null;
  const timezone = value.trim();
  if (!timezone || timezone.length > 64) return null;
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: timezone }).format();
    return timezone;
  } catch {
    return null;
  }
}

function timezoneFromGeo(data) {
  const informative = data?.localityInfo?.informative;
  if (!Array.isArray(informative)) return null;
  for (const item of informative) {
    if (String(item?.description || "").toLowerCase() !== "time zone") continue;
    const timezone = sanitizeTimezone(item?.name);
    if (timezone) return timezone;
  }
  return null;
}

function renderRateMeta() {
  let message = "Connecting to exchange rates…";
  let title = "Fetching the latest available exchange rates";

  if (state.loading) {
    message = state.rates ? "Refreshing live rates…" : "Connecting to exchange rates…";
  } else if (state.rates && state.updatedAt) {
    const stamp = formatUpdateStamp(state.updatedAt);
    if (!navigator.onLine) {
      message = `Offline snapshot · updated ${stamp}`;
    } else if (state.cached || state.error) {
      message = `Saved rates · updated ${stamp}`;
    } else {
      message = `Updated ${stamp} · mid-market`;
    }
    title = `Rates last updated ${formatFullDate(state.updatedAt)}`;
  } else if (state.error) {
    message = "Rates unavailable — check your connection";
    title = "We couldn't load exchange rates";
  }

  if (els.rateMeta) els.rateMeta.style.display = "none";
  if (els.rateMetaValue) els.rateMetaValue.textContent = message;
  if (els.rateMeta) els.rateMeta.title = title;
}

function updateNetworkUI() {
  const offline = !navigator.onLine;
  document.body.classList.toggle("is-offline", offline);
  els.offlineBanner.hidden = !offline;
  renderStatus();
  renderRateMeta();
}

function isRateReady() {
  return Boolean(state.rates && state.ratesBase === state.home);
}

function parseAmount() {
  if (!state.amountRaw.trim()) return null;
  const amount = Number.parseFloat(state.amountRaw);
  return Number.isFinite(amount) ? amount : null;
}

function getCurrencyName(code) {
  if (!code) return "Unknown currency";
  if (nameCache.has(code)) return nameCache.get(code);
  let name = code;
  try {
    name = displayNames?.of(code) || code;
  } catch {
    name = code;
  }
  nameCache.set(code, name);
  return name;
}

function getCurrencyCountry(code) {
  if (!code) return "Unknown";
  if (countryNameCache.has(code)) return countryNameCache.get(code);

  let country = CURRENCY_COUNTRY_LABELS[code];
  if (!country) {
    const countryCode = CURRENCY_COUNTRY_OVERRIDES[code] || CURRENCY_COUNTRY_CODES[code];
    if (countryCode) {
      try {
        country = regionDisplayNames?.of(countryCode) || countryCode;
      } catch {
        country = countryCode;
      }
    }
  }

  if (!country) {
    country = getCurrencyName(code);
  }

  countryNameCache.set(code, country);
  return country;
}

function normalizeCountryCode(value) {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

function currencyCountryCode(code) {
  return normalizeCountryCode(CURRENCY_COUNTRY_OVERRIDES[code] || CURRENCY_COUNTRY_CODES[code]);
}

function powerCountryForSlot(slot) {
  if (slot.isNearby) {
    return normalizeCountryCode(state.location?.countryCode) || currencyCountryCode(slot.code);
  }
  if (slot.isHome) {
    return normalizeCountryCode(state.homeOverride?.countryCode) || currencyCountryCode(slot.code);
  }
  return currencyCountryCode(slot.code);
}

function countryNameForCode(code) {
  try {
    return regionDisplayNames?.of(code) || code;
  } catch {
    return code;
  }
}

function powerLocationLabel(slot, countryCode) {
  if (slot.isNearby) return countryNameForCode(countryCode);
  if (slot.isHome) {
    return state.homeOverride?.countryCode
      ? countryNameForCode(countryCode)
      : getCurrencyCountry(slot.code);
  }
  return getCurrencyCountry(slot.code);
}

function socketIconMarkup(type) {
  const shape = SOCKET_SHAPES[type];
  if (!shape) return "";
  return `<svg class="socket-icon" viewBox="0 0 48 48" aria-hidden="true"><rect class="socket-plate" x="3" y="3" width="42" height="42" rx="10"/><g class="socket-holes">${shape}</g></svg>`;
}

function powerMarkup(slot) {
  const countryCode = powerCountryForSlot(slot);
  const info = countryCode ? COUNTRY_POWER[countryCode] : null;
  if (!info) return "";

  const visibleTypes = info.p.length <= 3 ? info.p : info.p.slice(0, 3);
  const hiddenCount = info.p.length - visibleTypes.length;
  const icons = visibleTypes.map(socketIconMarkup).join("");
  const typeText = info.p.length === 1 ? `type ${info.p[0]} socket` : `type ${info.p.join(", ")} sockets`;
  const label = `Typical mains power in ${powerLocationLabel(slot, countryCode)}: ${typeText} · ${info.v} V · ${info.hz} Hz`;
  const more = hiddenCount ? `<span class="currency-power-more">+${hiddenCount}</span>` : "";
  const allTypes = info.p.join(",");

  return `
    <button class="currency-power" type="button" data-power-slot="${slot.index}" data-power-country="${escapeHTML(countryCode || "")}" data-power-types="${escapeHTML(allTypes)}" data-power-voltage="${escapeHTML(info.v)}" data-power-hz="${escapeHTML(info.hz)}" title="${escapeHTML(label)}" aria-label="Show power outlet details for ${escapeHTML(powerLocationLabel(slot, countryCode))}">
      <span class="currency-power-sockets" aria-hidden="true">${icons}${more}</span>
      <span class="currency-power-spec" aria-hidden="true">${escapeHTML(info.p.join("/"))} · ${escapeHTML(info.v)} V · ${escapeHTML(info.hz)} Hz</span>
      <span class="sr-only">${escapeHTML(label)}</span>
    </button>`;
}

function getCurrencySymbol(code) {
  if (!code) return "•";
  if (symbolCache.has(code)) return symbolCache.get(code);
  let symbol = code;
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    symbol = parts.find((part) => part.type === "currency")?.value || code;
  } catch {
    symbol = code;
  }
  const result = symbol.length > 4 ? code : symbol;
  symbolCache.set(code, result);
  return result;
}

function getCurrencyDigits(code) {
  if (digitsCache.has(code)) return digitsCache.get(code);
  let digits = 2;
  try {
    digits = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).resolvedOptions().maximumFractionDigits;
  } catch {
    digits = 2;
  }
  digitsCache.set(code, digits);
  return digits;
}

function formatCurrencyAmount(value, code) {
  if (!Number.isFinite(value)) return "—";
  let maximumFractionDigits = getCurrencyDigits(code);
  if (value !== 0 && Math.abs(value) < 1) {
    maximumFractionDigits = Math.max(maximumFractionDigits, 2);
  }
  if (value !== 0 && Math.abs(value) < 0.01) {
    maximumFractionDigits = Math.min(8, Math.max(maximumFractionDigits, 6));
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits,
    }).format(value);
  } catch {
    return `${code} ${value.toFixed(maximumFractionDigits)}`;
  }
}

function formatInputAmount(value, code) {
  if (!Number.isFinite(value)) return "";
  let digits = getCurrencyDigits(code);
  if (value !== 0 && Math.abs(value) < 1) {
    digits = Math.max(digits, 2);
  }
  if (value !== 0 && Math.abs(value) < 0.01) {
    digits = Math.min(8, Math.max(digits, 6));
  }
  const fixed = value.toFixed(digits);
  if (!fixed.includes(".")) return fixed;
  return fixed.replace(/0+$/, "").replace(/\.$/, "");
}

function formatGroupedAmount(raw) {
  if (!raw) return "";
  const [integerPart, fractionPart] = String(raw).split(".");
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fractionPart === undefined ? grouped : `${grouped}.${fractionPart}`;
}

function countSignificant(value, position) {
  return value.slice(0, position).replace(/[^\d.]/g, "").length;
}

function positionForSignificant(value, count) {
  if (count <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (/[\d.]/.test(value[index])) {
      seen += 1;
      if (seen === count) return index + 1;
    }
  }
  return value.length;
}

function formatRate(value) {
  if (!Number.isFinite(value)) return "—";
  const absolute = Math.abs(value);
  let maximumFractionDigits = 4;
  if (absolute >= 1000) maximumFractionDigits = 2;
  else if (absolute >= 1) maximumFractionDigits = 4;
  else if (absolute >= 0.01) maximumFractionDigits = 5;
  else maximumFractionDigits = 7;

  try {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits,
      minimumFractionDigits: 0,
    }).format(value);
  } catch {
    return String(value);
  }
}

function formatUpdateStamp(date) {
  const diff = Date.now() - date.getTime();
  if (diff < 0) return "just now";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

function formatFullDate(date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function locationShort() {
  if (!state.location) return "";
  const { city, countryName, countryCode } = state.location;
  if (city) return `${city}, ${countryCode}`;
  return countryName || countryCode;
}

function openPicker(context) {
  if (!isRateReady()) {
    showToast("Rates are still loading. Try again in a moment.", "info");
    if (!state.loading) fetchRates();
    return;
  }

  state.picker = context;
  els.currencySearch.value = "";
  els.searchClear.hidden = true;

  if (context.type === "home") {
    els.dialogEyebrow.textContent = "Base currency";
    els.dialogTitle.textContent = "Choose home currency";
  } else {
    const code = state.targets[context.index]?.currency || state.home;
    els.dialogEyebrow.textContent = context.index === 0
      ? `Nearby: ${getCurrencyCountry(code)}`
      : getCurrencyCountry(code);
    els.dialogTitle.textContent = "Choose a currency";
  }

  renderCurrencyList();
  if (typeof els.currencyDialog.showModal === "function") {
    els.currencyDialog.showModal();
  } else {
    els.currencyDialog.setAttribute("open", "");
  }

  window.requestAnimationFrame(() => {
    els.currencySearch.focus();
    els.currencyList.scrollTop = 0;
  });
}

function applyClockWeather(prefix) {
  const cards = document.querySelectorAll(".clock-card");
  const card = prefix === "home" ? els.homeClockCard : cards[1];
  if (!card) return;
  const weather = prefix === "home" ? state.weather.home : state.weather.current;
  const visual = card.querySelector(".clock-weather-visual");
  if (!weather) {
    card.classList.remove("clock-card--weather");
    card.removeAttribute("data-weather");
    delete card.dataset.weatherCondition;
    if (visual) {
      visual.classList.remove("clock-weather-visual--show");
      visual.setAttribute("data-condition", "");
    }
    return;
  }
  card.classList.add("clock-card--weather");
  const condition = weather.condition || "Cloudy";
  const conditionKey = mapWeatherCondition(condition);
  card.setAttribute("data-weather", `${Math.round(weather.temperature)}°${weather.unit} · ${condition}`);
  card.dataset.weatherCondition = condition;
  if (visual) {
    visual.setAttribute("data-condition", conditionKey);
    visual.classList.add("clock-weather-visual--show");
  }
}

function mapWeatherCondition(condition) {
  const c = String(condition).toLowerCase();
  if (c === "sunny") return "sun";
  if (c === "cloudy") return "cloudy";
  if (c === "fog") return "fog";
  if (c === "drizzle") return "drizzle";
  if (c === "rain") return "rain";
  if (c === "snow") return "snow";
  if (c === "storm") return "storm";
  return "cloudy";
}

function getWeatherCondition(code) {
  if (code === 0) return "Sunny";
  if (code >= 1 && code <= 3) return "Cloudy";
  if (code >= 45 && code <= 48) return "Fog";
  if ((code >= 51 && code <= 57)) return "Drizzle";
  if ((code >= 61 && code <= 67)) return "Rain";
  if ((code >= 71 && code <= 77)) return "Snow";
  if ((code >= 80 && code <= 82)) return "Rain";
  if ((code >= 85 && code <= 86)) return "Snow";
  if (code >= 95 && code <= 99) return "Storm";
  return "Cloudy";
}

function loadCachedWeather() {
  try {
    const cached = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || "null");
    if (!cached || typeof cached !== "object") return;
    const now = Date.now();
    if (cached.current && cached.current.fetchedAt && now - cached.current.fetchedAt < 30 * 60 * 1000) {
      state.weather.current = cached.current;
    }
    if (cached.home && cached.home.fetchedAt && now - cached.home.fetchedAt < 30 * 60 * 1000) {
      state.weather.home = cached.home;
    }
  } catch {
    // ignore
  }
}

function saveCachedWeather() {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
      current: state.weather.current ? { ...state.weather.current, fetchedAt: state.weather.current.fetchedAt || Date.now() } : null,
      home: state.weather.home ? { ...state.weather.home, fetchedAt: state.weather.home.fetchedAt || Date.now() } : null,
    }));
  } catch {
    // ignore
  }
}

async function fetchWeatherForLocations() {
  if (!navigator.onLine) return;
  const tasks = [];
  if (state.location?.lat != null && state.location?.lon != null) {
    tasks.push(fetchWeatherForCoords(state.location.lat, state.location.lon, "current"));
  }
  if (state.homeOverride?.lat != null && state.homeOverride?.lon != null) {
    tasks.push(fetchWeatherForCoords(state.homeOverride.lat, state.homeOverride.lon, "home"));
  }
  if (tasks.length) {
    Promise.allSettled(tasks).then(() => {
      renderClocks();
    });
  } else {
    renderClocks();
  }
}

async function fetchWeatherForCoords(lat, lon, key) {
  try {
    const url = `${WEATHER_API}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!res.ok) throw new Error("weather failed");
    const data = await res.json();
    const temp = data?.current?.temperature_2m;
    const code = data?.current?.weather_code;
    if (typeof temp !== "number") return;
    state.weather[key] = {
      temperature: temp,
      unit: "C",
      condition: getWeatherCondition(code),
      fetchedAt: Date.now(),
    };
    saveCachedWeather();
    renderClocks();
  } catch {
    // ignore
  }
}

function closeDialog() {
  if (els.currencyDialog.open && typeof els.currencyDialog.close === "function") {
    els.currencyDialog.close();
  } else {
    els.currencyDialog.removeAttribute("open");
    state.picker = null;
  }
}

function openPowerDialog(button) {
  if (!els.powerDialog || !button) return;
  const countryCode = button.dataset.powerCountry || "";
  const typesStr = button.dataset.powerTypes || "";
  const voltage = button.dataset.powerVoltage || "";
  const hz = button.dataset.powerHz || "";
  const types = typesStr.split(",").filter(Boolean);

  if (els.powerDialogTitle) {
    els.powerDialogTitle.textContent = countryCode ? `${countryNameForCode(countryCode)}` : "Outlets";
  }
  if (els.powerDialogLocation) {
    els.powerDialogLocation.textContent = countryCode ? `Typical mains power in ${countryNameForCode(countryCode)}` : "Typical mains power";
  }
  if (els.powerDialogSpecs) {
    els.powerDialogSpecs.textContent = voltage && hz ? `Voltage: ${voltage} V · Frequency: ${hz} Hz` : "";
  }

  if (els.powerDialogPlugs) {
    if (!types.length) {
      els.powerDialogPlugs.innerHTML = "";
    } else {
      els.powerDialogPlugs.innerHTML = types
        .map((type) => {
          const shape = SOCKET_SHAPES[type];
          if (!shape) return "";
          return `<div class="power-dialog-plug"><svg class="power-dialog-plug-svg" viewBox="0 0 48 48" aria-hidden="true"><rect class="socket-plate" x="3" y="3" width="42" height="42" rx="10"/><g class="socket-holes">${shape}</g></svg><div class="power-dialog-plug-label">Type ${type}</div></div>`;
        })
        .join("");
    }
  }

  if (typeof els.powerDialog.showModal === "function") {
    els.powerDialog.showModal();
  } else {
    els.powerDialog.setAttribute("open", "");
  }
}

function closePowerDialog() {
  if (!els.powerDialog) return;
  if (els.powerDialog.open && typeof els.powerDialog.close === "function") {
    els.powerDialog.close();
  } else {
    els.powerDialog.removeAttribute("open");
  }
}

function renderCurrencyList() {
  if (!state.picker || !state.rates) return;

  const query = els.currencySearch.value.trim().toLowerCase();
  const codes = Object.keys(state.rates).sort((a, b) => {
    return getCurrencyName(a).localeCompare(getCurrencyName(b));
  });
  const currentCode = state.picker.type === "home"
    ? state.home
    : state.targets[state.picker.index]?.currency;
  const excluded = state.picker.type === "target"
    ? new Set([state.home])
    : new Set();

  const filtered = codes.filter((code) => {
    if (excluded.has(code)) return false;
    if (!query) return true;
    return (
      code.toLowerCase().includes(query) ||
      getCurrencyName(code).toLowerCase().includes(query) ||
      getCurrencySymbol(code).toLowerCase().includes(query)
    );
  });

  const selectedCode = currentCode;
  const popularCodes = query
    ? []
    : POPULAR.filter((code) => filtered.includes(code) && code !== selectedCode);
  const remaining = query
    ? filtered
    : filtered.filter((code) => !POPULAR.includes(code) && code !== selectedCode);

  let html = "";

  if (selectedCode && filtered.includes(selectedCode)) {
    html += `<div class="currency-group-title">Current</div>`;
    html += currencyOptionMarkup(selectedCode, true);
  }

  if (popularCodes.length) {
    html += `<div class="currency-group-title">Popular</div>`;
    html += popularCodes.map((code) => currencyOptionMarkup(code, false)).join("");
  }

  if (remaining.length) {
    html += `<div class="currency-group-title">${query ? `${filtered.length} result${filtered.length === 1 ? "" : "s"}` : "All currencies"}</div>`;
    html += remaining.map((code) => currencyOptionMarkup(code, false)).join("");
  }

  if (!filtered.length) {
    html = `
      <div class="currency-empty">
        <strong>No match for “${escapeHTML(els.currencySearch.value.trim())}”</strong>
        Try a currency name or three-letter code.
      </div>
    `;
  }

  els.currencyList.innerHTML = html;
}

function currencyOptionMarkup(code, selected) {
  const name = getCurrencyName(code);
  const rate = state.rates[code];
  const homeRate = state.rates[state.home] || 1;
  const relativeRate = rate && homeRate ? rate / homeRate : null;
  const context = state.picker?.type === "target" ? `1 ${state.home} = ${formatRate(relativeRate)} ${code}` : name;
  const check = selected
    ? `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.3 4.3L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    : "";

  return `
    <button
      class="currency-option"
      type="button"
      role="option"
      aria-selected="${selected ? "true" : "false"}"
      data-currency="${escapeHTML(code)}"
    >
      <span class="currency-symbol" aria-hidden="true">${escapeHTML(getCurrencySymbol(code))}</span>
      <span class="currency-option-copy">
        <span class="currency-option-code">${escapeHTML(code)}</span>
        <span class="currency-option-name">${escapeHTML(context)}</span>
      </span>
      <span class="currency-option-meta">${selected ? "Selected" : ""}${check}</span>
    </button>
  `;
}

function applyCurrency(code) {
  if (!state.picker || !code || !state.rates?.[code]) return;

  if (state.picker.type === "home") {
    if (code === state.home) {
      closeDialog();
      return;
    }

    const oldHome = state.home;
    const matchingTarget = state.targets.find((target) => target.currency === code);
    if (matchingTarget) {
      matchingTarget.currency = oldHome;
    }

    state.home = code;
    deriveRatesForBase(code);
  // syncNearbyWithLocation();
    fillMissingTargets();
    persistState();
    closeDialog();
    renderAll();
    fetchRates({ force: true });
    showToast(`${getCurrencyName(code)} is now your home currency.`, "success");
  } else {
    const target = state.targets[state.picker.index];
    if (!target || code === state.home) {
      closeDialog();
      return;
    }
    if (code === target.currency) {
      closeDialog();
      return;
    }

    const other = state.targets.find((item, index) => {
      return index !== state.picker.index && item.currency === code;
    });

    if (other) {
      other.currency = target.currency;
    }
    target.currency = code;
    persistState();
    closeDialog();
    renderAll();
    showToast(`${getCurrencyName(code)} added to your currencies.`, "success");
  }

  if (navigator.vibrate) navigator.vibrate(8);
}

function deriveRatesForBase(newBase) {
  if (!state.rates || !state.rates[newBase]) return;
  const factor = state.rates[newBase];
  if (!Number.isFinite(factor) || factor === 0) return;

  const nextRates = {};
  Object.keys(state.rates).forEach((code) => {
    const rate = state.rates[code] / factor;
    if (Number.isFinite(rate)) nextRates[code] = rate;
  });
  nextRates[newBase] = 1;
  state.rates = nextRates;
  state.ratesBase = newBase;
  state.cached = true;
}

async function detectLocation({ precise = false, silent = false } = {}) {
  if (state.locating) return;
  state.locating = true;
  renderLocation();

  let data = null;
  let source = precise ? "gps" : "network";
  let preciseError = null;

  try {
    if (precise) {
      try {
        if (!IS_NATIVE && !("geolocation" in navigator)) {
          throw new Error("Geolocation is not supported");
        }
        if (!IS_NATIVE && !window.isSecureContext) {
          throw new Error("Geolocation needs a secure connection");
        }
        const position = await getCurrentPosition();
        data = await fetchJson(
          `${GEO_API}?latitude=${encodeURIComponent(position.coords.latitude)}&longitude=${encodeURIComponent(position.coords.longitude)}&localityLanguage=en`,
        );
        data = { ...data, _pos: position };
        source = "gps";
      } catch (error) {
        preciseError = error;
      }
    }

    if (!data) {
      data = await fetchJson(`${GEO_API}?localityLanguage=en`);
      source = "network";
    }

    const countryCode = String(data.countryCode || "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      throw new Error("Could not determine your country");
    }

    let currency = COUNTRY_TO_CURRENCY[countryCode] || null;
    const ratesAvailable = state.rates && isRateReady();

    if (ratesAvailable && (!currency || !state.rates[currency])) {
      currency = null;
    }

    if (!currency) {
      throw new Error("No supported currency found for this location");
    }

    const localCurrency = currency;
    let usedFallback = false;
    let nearbyCurrency = currency;
    if (nearbyCurrency === state.home) {
      const fallback = pickCurrencyFallback();
      if (fallback) {
        nearbyCurrency = fallback;
        usedFallback = true;
      }
    }

    if (!Array.isArray(state.targets)) state.targets = [];
    while (state.targets.length < 3) state.targets.push({ currency: null });
    state.targets[0] = { currency: nearbyCurrency };

    state.location = {
      countryCode,
      countryName: String(data.countryName || countryCode),
      city: String(data.city || data.locality || data.principalSubdivision || ""),
      localCurrency: nearbyCurrency,
      timezone: timezoneFromGeo(data)
        || COUNTRY_TO_TZ[countryCode]
        || CURRENCY_TIMEZONES[nearbyCurrency]
        || null,
      source,
      detectedAt: new Date().toISOString(),
      lat: typeof data._pos?.coords?.latitude === "number"
        ? data._pos.coords.latitude
        : (typeof data.latitude === "number" ? data.latitude : null),
      lon: typeof data._pos?.coords?.longitude === "number"
        ? data._pos.coords.longitude
        : (typeof data.longitude === "number" ? data.longitude : null),
    };

    fillMissingTargets();
    if (state.targets[0]) {
      state.targets[0].currency = nearbyCurrency;
    }

    persistState();
    renderAll();
    fetchWeatherForLocations();

    if (!silent) {
      if (preciseError) {
        showToast("Precise location unavailable — using an approximate location.", "info");
      }
      if (usedFallback) {
        showToast(
          `${state.location.countryName} uses your home currency. Nearby set to ${currency}.`,
          "info",
        );
      } else {
        const place = locationShort();
        showToast(`Local currency set to ${currency}${place ? ` · ${place}` : ""}.`, "success");
      }
    }
  } catch (error) {
    if (!silent) {
      const message = preciseError
        ? "We couldn't access your location or network location."
        : error?.message || "We couldn't detect your local currency.";
      showToast(message, "error");
    }
  } finally {
    state.locating = false;
    renderLocation();
  }
}

async function getCurrentPosition() {
  if (IS_NATIVE) {
    const permissions = await Geolocation.requestPermissions();
    if (permissions.location !== "granted" && permissions.coarseLocation !== "granted") {
      throw new Error("Location permission was denied");
    }
    return Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 5 * 60 * 1000,
    });
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Location request failed (${response.status})`);
    }
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

function pickCurrencyFallback() {
  const candidates = ["EUR", "GBP", "USD", "AUD", "CAD", "CHF", "JPY", "SGD", "CNY"];
  const pool = state.rates ? Object.keys(state.rates) : candidates;
  return candidates
    .concat(pool)
    .find((code) => code !== state.home && (!state.rates || state.rates[code]));
}

function showToast(message, type = "success") {
  if (!els.toastRegion) return;

  while (els.toastRegion.children.length >= 3) {
    els.toastRegion.firstElementChild.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = type === "error"
    ? `<svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
    : type === "info"
      ? `<svg viewBox="0 0 16 16" fill="none"><path d="M8 7v5m0-7.5v.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
      : `<svg viewBox="0 0 16 16" fill="none"><path d="m3.5 8.3 3 3 6-6.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const text = document.createElement("span");
  text.textContent = message;

  toast.append(icon, text);
  els.toastRegion.append(toast);

  window.setTimeout(() => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 250);
  }, 4200);
}

function handleTicker(force = false) {
  renderClocks();
  renderRateMeta();
  if (!navigator.onLine || state.loading) return;
  const age = state.fetchedAt ? Date.now() - state.fetchedAt.getTime() : Infinity;
  if (force && age > REFRESH_INTERVAL) {
    fetchRates();
  } else if (age > REFRESH_INTERVAL * 2) {
    fetchRates();
  }
}

function setupNativeShell() {
  if (!IS_NATIVE) return;

  if (Capacitor.getPlatform() === "android") {
    StatusBar.setBackgroundColor({ color: "#F2EFE7" }).catch(() => {});
    StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
  }
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

  window.setTimeout(() => {
    SplashScreen.hide().catch(() => {});
  }, 150);
}

function registerServiceWorker() {
  if (IS_NATIVE) return;
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

function installPromptSetup() {
  if (IS_NATIVE || window.matchMedia("(display-mode: standalone)").matches) {
    els.installButton.hidden = true;
  }
  if (IS_NATIVE) return;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.installPrompt = event;
    els.installButton.hidden = false;
  });

  els.installButton.addEventListener("click", async () => {
    if (!state.installPrompt) return;
    state.installPrompt.prompt();
    const choice = await state.installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      els.installButton.hidden = true;
      showToast("Curnomad was added to your device.", "success");
    }
    state.installPrompt = null;
  });

  window.addEventListener("appinstalled", () => {
    state.installPrompt = null;
    els.installButton.hidden = true;
    showToast("Curnomad installed. It now works offline.", "success");
  });
}

function normalizeCode(value) {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : null;
}

function isRatesObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length);
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
