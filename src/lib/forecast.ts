// Parashikimi i zënies dhe i të ardhurave për Revenue Manager.
//
// Modeli "pickup" (i zakonshëm në hoteleri): për një natë që është L ditë larg, një pjesë w(L) e rezervimeve përfundimtare
// supozohet se është bërë tashmë. Me kohë mesatare rezervimi τ (eksponenciale), w(L) = exp(-(L+1)/τ).
//   parashikimi = zënia e rezervuar tani (OTB) + (1 - w) × zënia e pritur a-priori
// Pra: afër datës mbështetet te rezervimet reale; larg datës mbështetet te vlera a-priori (sezoni, fundjava).
// Intervali bazohet në variancën binomiale të pjesës së mbetur.
import { addDays, diffDays } from "./dates";
import { PricingRule, RoomPricing, clampPrice, nightlyPrice, ruleMultiplier } from "./pricing";

export interface BookingLite {
  checkIn: string;
  checkOut: string;
}

export interface ForecastOptions {
  rooms: number;
  today: string;
  days?: number;
  /** koha mesatare e rezervimit në ditë (τ) */
  meanLeadDays?: number;
  rules: PricingRule[];
  room: RoomPricing;
  /** zënia a-priori; nëse mungon përdoret priorOccupancy() */
  prior?: (date: string) => number;
}

export interface ForecastDay {
  date: string;
  leadDays: number;
  otb: number;
  otbOcc: number;
  priorOcc: number;
  forecastOcc: number;
  low: number;
  high: number;
  price: number;
  expectedRevenue: number;
}

export type AlertKind = "underbooked_peak" | "sellout_raise" | "low_demand";

export interface RevenueAlert {
  kind: AlertKind;
  date: string;
  forecastOcc: number;
  message: string;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Zënia a-priori kur nuk ka histori: 50% në ditë normale, e shumëzuar me kërkesën e njohur sezonale (e zbutur). */
export const priorOccupancy = (rules: PricingRule[], date: string, base = 0.5): number =>
  clamp(base * Math.pow(ruleMultiplier(rules, date, 99), 0.8), 0.05, 0.95);

// Koha e rezervimit matet në ditë të plota: në fillim të ditës L, rezervimet me kohë ≥ L+1 ditë janë bërë (jo ato të po asaj dite).
export const pickupShare = (leadDays: number, meanLead = 25): number => Math.exp(-(Math.max(0, leadDays) + 1) / meanLead);

/** Dhoma të rezervuara për çdo datë (rezervimet e anuluara duhet të jenë filtruar jashtë). */
export const onTheBooks = (bookings: BookingLite[], from: string, days: number): number[] => {
  const out = new Array<number>(days).fill(0);
  for (const b of bookings) {
    const start = Math.max(0, diffDays(from, b.checkIn));
    const end = Math.min(days, diffDays(from, b.checkOut));
    for (let i = start; i < end; i++) out[i]++;
  }
  return out;
};

export const forecastOccupancy = (otbOcc: number, priorOcc: number, leadDays: number, rooms: number, meanLead = 25) => {
  const w = pickupShare(leadDays, meanLead);
  const remaining = (1 - w) * priorOcc;
  const mean = clamp(otbOcc + remaining, otbOcc, 1);
  const p = clamp(remaining, 0, 1);
  const sigma = Math.sqrt((p * (1 - p)) / Math.max(1, rooms));
  return { mean, low: clamp(mean - 1.64 * sigma, otbOcc, 1), high: clamp(mean + 1.64 * sigma, otbOcc, 1) };
};

export const forecast = (bookings: BookingLite[], opts: ForecastOptions): ForecastDay[] => {
  const days = opts.days ?? 90;
  const tau = opts.meanLeadDays ?? 25;
  const otb = onTheBooks(bookings, opts.today, days);
  const out: ForecastDay[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(opts.today, i);
    const prior = (opts.prior ?? ((d) => priorOccupancy(opts.rules, d)))(date);
    const otbOcc = clamp(otb[i] / opts.rooms, 0, 1);
    const f = forecastOccupancy(otbOcc, prior, i, opts.rooms, tau);
    const price = nightlyPrice(opts.room, opts.rules, date, i);
    out.push({
      date,
      leadDays: i,
      otb: otb[i],
      otbOcc,
      priorOcc: prior,
      forecastOcc: f.mean,
      low: f.low,
      high: f.high,
      price,
      expectedRevenue: f.mean * opts.rooms * price,
    });
  }
  return out;
};

export interface WhatIf {
  changePct: number;
  price: number;
  occupancy: number;
  revenue: number;
}

/** Scenari "po sikur": çmimi ndryshon me changePct; kërkesa reagon me elasticitet (default -1.3, i supozuar, i rregullueshëm). */
export const whatIf = (d: ForecastDay, rooms: number, room: RoomPricing, changePct: number, elasticity = -1.3): WhatIf => {
  const price = clampPrice(d.price * (1 + changePct / 100), room);
  const ratio = price / d.price;
  // vetëm pjesa që ende nuk është rezervuar reagon ndaj çmimit të ri
  const remaining = Math.max(0, d.forecastOcc - d.otbOcc);
  const occupancy = clamp(d.otbOcc + remaining * Math.pow(ratio, elasticity), 0, 1);
  return { changePct: (ratio - 1) * 100, price, occupancy, revenue: occupancy * rooms * price };
};

/** Ndryshimi i çmimit (-30%…+30%) që maksimizon të ardhurat e pritura për një datë. */
export const bestPriceChange = (d: ForecastDay, rooms: number, room: RoomPricing, elasticity = -1.3): WhatIf => {
  let best = whatIf(d, rooms, room, 0, elasticity);
  for (let pct = -30; pct <= 30; pct++) {
    const w = whatIf(d, rooms, room, pct, elasticity);
    if (w.revenue > best.revenue + 1e-9) best = w;
  }
  return best;
};

export const alerts = (days: ForecastDay[], rules: PricingRule[]): RevenueAlert[] => {
  const out: RevenueAlert[] = [];
  for (const d of days) {
    const seasonal = ruleMultiplier(rules, d.date, 99);
    if (seasonal >= 1.15 && d.leadDays <= 45 && d.forecastOcc < 0.4)
      out.push({ kind: "underbooked_peak", date: d.date, forecastOcc: d.forecastOcc, message: "Datë në sezon të lartë me zënie të parashikuar nën 40%: konsidero promocion ose kanale shtesë." });
    else if (d.forecastOcc >= 0.9 && d.leadDays >= 7)
      out.push({ kind: "sellout_raise", date: d.date, forecastOcc: d.forecastOcc, message: "Pritet të mbushet: mundësi për të rritur çmimin." });
    else if (d.leadDays <= 14 && d.forecastOcc < 0.25)
      out.push({ kind: "low_demand", date: d.date, forecastOcc: d.forecastOcc, message: "Kërkesë shumë e ulët në 14 ditët e ardhshme: çmim last-minute ose ofertë." });
  }
  return out;
};

export const summarize = (days: ForecastDay[]) => ({
  expectedRevenue: days.reduce((a, d) => a + d.expectedRevenue, 0),
  avgOccupancy: days.reduce((a, d) => a + d.forecastOcc, 0) / Math.max(1, days.length),
  avgOtbOccupancy: days.reduce((a, d) => a + d.otbOcc, 0) / Math.max(1, days.length),
});
