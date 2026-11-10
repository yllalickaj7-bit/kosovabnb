// Logjika e çmimit: pasqyrë 1:1 e funksioneve SQL `nightly_price` dhe `generate_price_recommendations`
// (supabase/migrations/20261110000000_* dhe 20261110010000_*). Përdoret nga simulatori, parashikimi dhe testet.
// Nëse ndryshon njëra anë, ndrysho edhe tjetrën: src/lib/__tests__/pricing.test.ts kontrollon vlerat e njëjta me testet SQL.
import { isoDow, round2 } from "./dates";

export type RuleKind = "season" | "holiday" | "weekend" | "last_minute";

export interface PricingRule {
  kind: RuleKind;
  /** YYYY-MM-DD, për season/holiday */
  start?: string;
  end?: string;
  multiplier: number;
}

export interface RoomPricing {
  basePrice: number;
  minPrice?: number | null;
  maxPrice?: number | null;
}

/** Të njëjtat rregulla globale që futen në migrim (seed). */
export const DEFAULT_RULES: PricingRule[] = [
  { kind: "season", start: "2027-06-15", end: "2027-08-31", multiplier: 1.25 },
  { kind: "season", start: "2026-12-15", end: "2027-02-28", multiplier: 1.2 },
  { kind: "holiday", start: "2027-02-15", end: "2027-02-18", multiplier: 1.3 },
  { kind: "weekend", multiplier: 1.1 },
  { kind: "last_minute", multiplier: 0.9 },
];

/** Shumëzuesi i kombinuar (prodhim) për një natë; leadDays = net - sot. Si në SQL: exp(sum(ln(m))). */
export const ruleMultiplier = (rules: PricingRule[], night: string, leadDays: number): number => {
  let m = 1;
  for (const r of rules) {
    if ((r.kind === "season" || r.kind === "holiday") && r.start && r.end && night >= r.start && night <= r.end) m *= r.multiplier;
    else if (r.kind === "weekend" && (isoDow(night) === 5 || isoDow(night) === 6)) m *= r.multiplier;
    else if (r.kind === "last_minute" && leadDays >= 0 && leadDays <= 3) m *= r.multiplier;
  }
  return m;
};

export const clampPrice = (price: number, room: RoomPricing): number => {
  let p = price;
  if (room.minPrice != null) p = Math.max(p, room.minPrice);
  if (room.maxPrice != null) p = Math.min(p, room.maxPrice);
  return p;
};

/** Çmimi i natës nga rregullat (pa çmim të miratuar manualisht). */
export const nightlyPrice = (room: RoomPricing, rules: PricingRule[], night: string, leadDays: number): number =>
  clampPrice(round2(room.basePrice * ruleMultiplier(rules, night, leadDays)), room);

/**
 * Faktori i kërkesës i rekomandimit (si në generate_price_recommendations):
 * occupancy = net të zëna në dritaren ±7 ditë / (dhoma × 14).
 */
export const demandAdjustment = (occupancy: number, leadDays: number): number => {
  if (occupancy >= 0.8) return 1.15;
  if (occupancy >= 0.6) return 1.08;
  if (occupancy < 0.25 && leadDays <= 14) return 0.9;
  if (occupancy < 0.4 && leadDays <= 30) return 0.95;
  return 1;
};

/** Çmimi i rekomanduar = çmimi nga rregullat × faktori i kërkesës, i kufizuar në [min, max]. */
export const recommendPrice = (
  room: RoomPricing,
  rules: PricingRule[],
  night: string,
  leadDays: number,
  occupancy: number,
): number => {
  const current = nightlyPrice(room, rules, night, leadDays);
  return clampPrice(round2(current * demandAdjustment(occupancy, leadDays)), room);
};
