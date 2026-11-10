// Simulator i hotelit me agjentë (mysafirë sintetikë). Krahason tri strategji çmimi mbi PRECIZISHT të njëjtën kërkesë:
//   static = një çmim fiks gjithë vitin
//   rules  = çmimi bazë × rregullat (sezoni, fundjava, festat, last-minute)
//   ai     = rules × faktori i kërkesës nga zënia aktuale (po ajo logjikë si generate_price_recommendations)
//
// PRESUPOZIME (të dokumentuara qëllimisht; rezultatet vlejnë vetëm brenda tyre, nuk janë provë për tregun real):
//  - Kërkesa është sintetike: sezonaliteti i tregut NUK është identik me rregullat e hotelit, dhe ka "ngjarje" të rastësishme
//    (koncert, festival) që rregullat nuk i dinë; vetëm zënia aktuale i zbulon.
//  - Çdo mysafir ka një gatishmëri pagese (WTP) rreth çmimit të tregut për ato data; rezervon vetëm nëse çmimi mesatar ≤ WTP.
//  - Dhomat janë identike dhe hoteli mund t'i rirenditë mysafirët, pra kufizimi është numri i dhomave për natë.
import { addDays, isoDow, round2 } from "../dates";
import { DEFAULT_RULES, PricingRule, RoomPricing, nightlyPrice, recommendPrice } from "../pricing";
import { Rng } from "./rng";

export type Strategy = "static" | "rules" | "ai";

export interface SimConfig {
  startDate: string;
  days: number;
  rooms: number;
  /** çmimi fiks (static) dhe çmimi bazë i dhomës (rules/ai) */
  basePrice: number;
  minFactor: number;
  maxFactor: number;
  /** çmimi i referencës së tregut në ditë normale të javës jashtë sezonit */
  marketRef: number;
  /** numri mesatar i kërkesave të reja për ditë para "thinning" sipas sezonit */
  demandPerDay: number;
  /** shpërndarja e gatishmërisë për pagesë (lognormal sigma) */
  wtpSigma: number;
  /** koha mesatare nga rezervimi deri te qëndrimi (ditë) */
  meanLeadDays: number;
  /** probabiliteti që një ditë të ketë ngjarje e papritur */
  eventRate: number;
  rules: PricingRule[];
}

export const DEFAULT_CONFIG: SimConfig = {
  startDate: "2027-01-01",
  days: 365,
  rooms: 10,
  basePrice: 80,
  minFactor: 0.7,
  maxFactor: 1.8,
  marketRef: 90,
  demandPerDay: 10, // kalibruar që çmimi fiks të japë ~65% zënie vjetore (hotel tipik), para se të shihen rezultatet e AI
  wtpSigma: 0.25,
  meanLeadDays: 25,
  eventRate: 0.06,
  rules: DEFAULT_RULES,
};

export interface SimBooking {
  bookDay: number;
  stayStart: number;
  nights: number;
  total: number;
}

export interface RunResult {
  strategy: Strategy;
  seed: number;
  revenue: number;
  soldNights: number;
  occupancy: number;
  adr: number;
  revpar: number;
  bookings: number;
  lostPrice: number;
  lostFull: number;
  /** zënia (0–1) për çdo ditë */
  dailyOccupancy: number[];
  /** të ardhurat për çdo muaj kalendarik të vitit simulues (12 vlera nëse days=365) */
  monthlyRevenue: number[];
  bookingList: SimBooking[];
}

interface Request {
  bookDay: number;
  stayStart: number;
  nights: number;
  wtpFactor: number;
}

// --- kërkesa e tregut (e fshehur nga rregullat e hotelit) ---
const inRange = (d: string, a: string, b: string) => d >= a && d <= b;
const yearOf = (d: string) => d.slice(0, 4);

const marketSeason = (d: string): number => {
  const y = yearOf(d);
  let f = 1;
  if (inRange(d, `${y}-06-15`, `${y}-08-31`)) f *= 1.3;
  if (inRange(d, `${y}-12-15`, `${y}-12-31`) || inRange(d, `${y}-01-01`, `${y}-02-28`)) f *= 1.22;
  if (inRange(d, `${y}-02-15`, `${y}-02-18`)) f *= 1.15;
  return f;
};
const marketWeekend = (d: string) => (isoDow(d) === 5 || isoDow(d) === 6 ? 1.12 : 1);

const EVENT_VOLUME = 1.6;
const EVENT_PRICE = 1.15;
// probabiliteti i mbajtjes (thinning): intensiteti / intensiteti maksimal
const MAX_DEMAND = 1.3 * 1.22 * 1.15 * 1.25 * EVENT_VOLUME; // sipër i sigurt
const demandIndex = (d: string, event: boolean) =>
  marketSeason(d) * (isoDow(d) === 5 || isoDow(d) === 6 ? 1.25 : 1) * (event ? EVENT_VOLUME : 1);
const marketPrice = (cfg: SimConfig, d: string, event: boolean) =>
  cfg.marketRef * marketSeason(d) * marketWeekend(d) * (event ? EVENT_PRICE : 1);

const STAY_LENGTHS = [1, 2, 3, 4, 5, 7] as const;
const STAY_WEIGHTS = [0.25, 0.3, 0.2, 0.12, 0.08, 0.05] as const;
const BOOKING_HORIZON = 120; // rezervime që fillojnë para ditës 0 (për qëndrimet e fillimit të vitit)

export interface Scenario {
  dates: string[];
  events: boolean[];
  requests: Request[];
}

/** Kërkesa e një seed-i është e pavarur nga strategjia: kështu krahasimi është i drejtë (common random numbers). */
export const generateScenario = (cfg: SimConfig, seed: number): Scenario => {
  const rng = new Rng(seed * 7919 + 17);
  const dates: string[] = [];
  const events: boolean[] = [];
  for (let i = 0; i < cfg.days; i++) {
    dates.push(addDays(cfg.startDate, i));
    events.push(rng.next() < cfg.eventRate);
  }
  const requests: Request[] = [];
  for (let b = -BOOKING_HORIZON; b < cfg.days; b++) {
    const n = rng.poisson(cfg.demandPerDay);
    for (let i = 0; i < n; i++) {
      const lead = Math.min(Math.floor(rng.exponential(cfg.meanLeadDays)), 150);
      const stayStart = b + lead;
      const keep = rng.next();
      const wtpFactor = rng.lognormal(cfg.wtpSigma);
      const nights = rng.pick(STAY_LENGTHS, STAY_WEIGHTS);
      if (stayStart < 0 || stayStart >= cfg.days) continue;
      if (keep > demandIndex(dates[stayStart], events[stayStart]) / MAX_DEMAND) continue;
      requests.push({ bookDay: b, stayStart, nights: Math.min(nights, cfg.days - stayStart), wtpFactor });
    }
  }
  return { dates, events, requests };
};

const monthIndex = (ymd: string) => Number(ymd.slice(5, 7)) - 1;

export const simulate = (cfg: SimConfig, strategy: Strategy, seed: number, scenario?: Scenario): RunResult => {
  const sc = scenario ?? generateScenario(cfg, seed);
  const room: RoomPricing = { basePrice: cfg.basePrice, minPrice: cfg.basePrice * cfg.minFactor, maxPrice: cfg.basePrice * cfg.maxFactor };
  const booked = new Int32Array(cfg.days);
  const monthly = new Array(12).fill(0);
  const list: SimBooking[] = [];
  let revenue = 0;
  let sold = 0;
  let lostPrice = 0;
  let lostFull = 0;

  const windowOcc = (night: number): number => {
    let sum = 0;
    for (let k = night - 7; k < night + 7; k++) if (k >= 0 && k < cfg.days) sum += booked[k];
    return sum / (cfg.rooms * 14);
  };

  const priceFor = (night: number, bookDay: number): number => {
    const lead = Math.max(0, night - bookDay);
    if (strategy === "static") return cfg.basePrice;
    if (strategy === "rules") return nightlyPrice(room, cfg.rules, sc.dates[night], lead);
    return recommendPrice(room, cfg.rules, sc.dates[night], lead, windowOcc(night));
  };

  for (const r of sc.requests) {
    let full = false;
    for (let k = r.stayStart; k < r.stayStart + r.nights; k++) if (booked[k] >= cfg.rooms) full = true;
    if (full) {
      lostFull++;
      continue;
    }
    const prices: number[] = [];
    let marketSum = 0;
    for (let k = r.stayStart; k < r.stayStart + r.nights; k++) {
      prices.push(priceFor(k, r.bookDay));
      marketSum += marketPrice(cfg, sc.dates[k], sc.events[k]);
    }
    const total = prices.reduce((a, b) => a + b, 0);
    const wtp = (marketSum / r.nights) * r.wtpFactor;
    if (total / r.nights > wtp) {
      lostPrice++;
      continue;
    }
    for (let k = r.stayStart; k < r.stayStart + r.nights; k++) {
      booked[k]++;
      monthly[monthIndex(sc.dates[k])] += prices[k - r.stayStart];
    }
    revenue += total;
    sold += r.nights;
    list.push({ bookDay: r.bookDay, stayStart: r.stayStart, nights: r.nights, total: round2(total) });
  }

  const available = cfg.rooms * cfg.days;
  return {
    strategy,
    seed,
    revenue: round2(revenue),
    soldNights: sold,
    occupancy: sold / available,
    adr: sold ? revenue / sold : 0,
    revpar: revenue / available,
    bookings: list.length,
    lostPrice,
    lostFull,
    dailyOccupancy: Array.from(booked, (v) => v / cfg.rooms),
    monthlyRevenue: monthly.map(round2),
    bookingList: list,
  };
};
