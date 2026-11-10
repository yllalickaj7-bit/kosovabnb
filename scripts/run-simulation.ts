// Përdorimi: npx tsx scripts/run-simulation.ts [numri i seed-eve] [skedari JSON i daljes]
import { writeFileSync } from "node:fs";
import { DEFAULT_CONFIG } from "../src/lib/simulation/engine";
import { monteCarlo } from "../src/lib/simulation/montecarlo";

const n = Number(process.argv[2] ?? 30);
const out = process.argv[3];
const seeds = Array.from({ length: n }, (_, i) => i + 1);
const t0 = Date.now();
const res = monteCarlo(DEFAULT_CONFIG, seeds);
const eur = (x: number) => `€${Math.round(x).toLocaleString("en-US")}`;
console.log(`${n} seed-e × 3 strategji, ${DEFAULT_CONFIG.rooms} dhoma, ${DEFAULT_CONFIG.days} ditë (${Date.now() - t0} ms)\n`);
for (const s of ["static", "rules", "ai"] as const) {
  const x = res.summary[s];
  console.log(
    `${s.padEnd(6)} të ardhura ${eur(x.revenue.mean)} ±${Math.round(x.revenue.ci)} | zënia ${(x.occupancy.mean * 100).toFixed(1)}% | ADR €${x.adr.mean.toFixed(1)} | RevPAR €${x.revpar.mean.toFixed(1)} | humbje çmimi ${x.lostPrice.toFixed(0)}, plot ${x.lostFull.toFixed(0)}`,
  );
}
console.log();
for (const c of res.comparisons)
  console.log(`${c.strategy} vs ${c.baseline}: ${c.pctMean >= 0 ? "+" : ""}${c.pctMean.toFixed(2)}% (${eur(c.diffMean)} ±${Math.round(c.diffCi)}), fiton në ${c.wins}/${n} seed-e, ${c.significant ? "domethënëse" : "JO domethënëse"}`);
// Ndjeshmëria ndaj nivelit të kërkesës (sa i varur është përfitimi nga ngarkesa e hotelit)
const sweep = [6, 8, 10, 12, 14, 18, 24].map((d) => {
  const r = monteCarlo({ ...DEFAULT_CONFIG, demandPerDay: d }, seeds);
  return {
    demandPerDay: d,
    occupancyStatic: r.summary.static.occupancy.mean,
    occupancyAi: r.summary.ai.occupancy.mean,
    rulesVsStaticPct: r.comparisons[0].pctMean,
    aiVsStaticPct: r.comparisons[1].pctMean,
    aiVsRulesPct: r.comparisons[2].pctMean,
    aiVsRulesSignificant: r.comparisons[2].significant,
  };
});
console.log("\nNdjeshmëria ndaj kërkesës:");
for (const x of sweep)
  console.log(`λ=${String(x.demandPerDay).padStart(2)} zënia static ${(x.occupancyStatic * 100).toFixed(0)}% | rules vs static ${x.rulesVsStaticPct.toFixed(1)}% | ai vs static ${x.aiVsStaticPct.toFixed(1)}% | ai vs rules ${x.aiVsRulesPct.toFixed(1)}%${x.aiVsRulesSignificant ? "" : " (jo domethënëse)"}`);
if (out) {
  const slim = { config: res.config, seedCount: res.seeds.length, summary: res.summary, comparisons: res.comparisons, sensitivity: sweep };
  writeFileSync(out, JSON.stringify(slim, null, 2));
  console.log(`\nU ruajt: ${out}`);
}
