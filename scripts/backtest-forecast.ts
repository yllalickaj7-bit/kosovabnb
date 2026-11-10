// Backtest i parashikuesit: në ditë të ndryshme të vitit simulues, parashiko zënien për 90 ditët e ardhshme me rezervimet
// e njohura deri atëherë dhe krahaso me zënien përfundimtare. Krahasohet me dy bazë të thjeshta.
// Përdorimi: npx tsx scripts/backtest-forecast.ts [skedari JSON]
import { writeFileSync } from "node:fs";
import { addDays, isoDow } from "../src/lib/dates";
import { forecast } from "../src/lib/forecast";
import { DEFAULT_RULES } from "../src/lib/pricing";
import { DEFAULT_CONFIG, generateScenario, simulate } from "../src/lib/simulation/engine";

const cfg = DEFAULT_CONFIG;
const trainSeeds = Array.from({ length: 20 }, (_, i) => 1000 + i);
const testSeeds = Array.from({ length: 20 }, (_, i) => 1 + i);

// a-priori e kalibruar nga viti i kaluar: zënia mesatare sipas (muaji, fundjavë) nga seed-e trajnimi të PAVARURA
const sums = new Map<string, { s: number; n: number }>();
for (const seed of trainSeeds) {
  const r = simulate(cfg, "static", seed, generateScenario(cfg, seed));
  r.dailyOccupancy.forEach((occ, i) => {
    const d = addDays(cfg.startDate, i);
    const key = `${d.slice(5, 7)}-${isoDow(d) >= 5 && isoDow(d) <= 6 ? "w" : "d"}`;
    const e = sums.get(key) ?? { s: 0, n: 0 };
    e.s += occ;
    e.n++;
    sums.set(key, e);
  });
}
const histPrior = (d: string) => {
  const e = sums.get(`${d.slice(5, 7)}-${isoDow(d) >= 5 && isoDow(d) <= 6 ? "w" : "d"}`)!;
  return e.s / e.n;
};

const buckets = [[0, 7], [8, 14], [15, 30], [31, 60], [61, 89]] as const;
type Acc = { pickup: number; otbOnly: number; priorOnly: number; n: number };
const acc: Acc[] = buckets.map(() => ({ pickup: 0, otbOnly: 0, priorOnly: 0, n: 0 }));
const room = { basePrice: cfg.basePrice };

for (const seed of testSeeds) {
  const r = simulate(cfg, "static", seed, generateScenario(cfg, seed));
  for (let day = 0; day <= cfg.days - 90; day += 15) {
    // pamja në fillim të ditës (bookDay < day), si në modelin pickup
    const known = r.bookingList.filter((b) => b.bookDay < day).map((b) => ({ checkIn: addDays(cfg.startDate, b.stayStart), checkOut: addDays(cfg.startDate, b.stayStart + b.nights) }));
    const f = forecast(known, { rooms: cfg.rooms, today: addDays(cfg.startDate, day), days: 90, rules: DEFAULT_RULES, room, prior: histPrior });
    f.forEach((d, lead) => {
      const actual = r.dailyOccupancy[day + lead];
      const bi = buckets.findIndex(([a, b]) => lead >= a && lead <= b);
      acc[bi].pickup += Math.abs(d.forecastOcc - actual);
      acc[bi].otbOnly += Math.abs(d.otbOcc - actual);
      acc[bi].priorOnly += Math.abs(d.priorOcc - actual);
      acc[bi].n++;
    });
  }
}
const rows = buckets.map(([a, b], i) => ({
  leadDays: `${a}-${b}`,
  samples: acc[i].n,
  maePickup: acc[i].pickup / acc[i].n,
  maeOtbOnly: acc[i].otbOnly / acc[i].n,
  maePriorOnly: acc[i].priorOnly / acc[i].n,
}));
console.log("Gabimi absolut mesatar (MAE) në pikë përqindjeje të zënies; sa më i vogël aq më mirë\n");
console.log("lead     | pickup | vetëm rezervimet | vetëm a-priori");
for (const r of rows) console.log(`${r.leadDays.padEnd(8)} | ${(r.maePickup * 100).toFixed(1).padStart(5)}  | ${(r.maeOtbOnly * 100).toFixed(1).padStart(15)}  | ${(r.maePriorOnly * 100).toFixed(1).padStart(13)}`);
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify({ trainSeeds: trainSeeds.length, testSeeds: testSeeds.length, rows }, null, 2));
