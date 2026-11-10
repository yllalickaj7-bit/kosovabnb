import { DEFAULT_CONFIG, RunResult, SimConfig, Strategy, generateScenario, simulate } from "./engine";

export const STRATEGIES: Strategy[] = ["static", "rules", "ai"];

// vlera kritike t (dy anë, 95%) për df = 1..30; për df > 30 përafrohet me 1.96
const T95 = [12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08, 2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042];
export const tCritical = (df: number): number => (df < 1 ? NaN : df <= 30 ? T95[df - 1] : 1.96);

export const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length;
export const sd = (xs: number[]): number => {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
};
export const ci95 = (xs: number[]): number => (xs.length < 2 ? 0 : (tCritical(xs.length - 1) * sd(xs)) / Math.sqrt(xs.length));

export interface Summary {
  strategy: Strategy;
  n: number;
  revenue: { mean: number; ci: number };
  occupancy: { mean: number; ci: number };
  adr: { mean: number; ci: number };
  revpar: { mean: number; ci: number };
  lostPrice: number;
  lostFull: number;
}

export interface PairedComparison {
  strategy: Strategy;
  baseline: Strategy;
  /** ndryshimi mesatar i të ardhurave (€/vit) dhe intervali 95% */
  diffMean: number;
  diffCi: number;
  /** ndryshimi mesatar në % ndaj baseline */
  pctMean: number;
  /** në sa seed-e strategjia ka fituar më shumë se baseline */
  wins: number;
  significant: boolean;
}

export interface MonteCarloResult {
  config: SimConfig;
  seeds: number[];
  runs: Record<Strategy, RunResult[]>;
  summary: Record<Strategy, Summary>;
  comparisons: PairedComparison[];
}

const summarize = (strategy: Strategy, runs: RunResult[]): Summary => {
  const pick = (f: (r: RunResult) => number) => {
    const xs = runs.map(f);
    return { mean: mean(xs), ci: ci95(xs) };
  };
  return {
    strategy,
    n: runs.length,
    revenue: pick((r) => r.revenue),
    occupancy: pick((r) => r.occupancy),
    adr: pick((r) => r.adr),
    revpar: pick((r) => r.revpar),
    lostPrice: mean(runs.map((r) => r.lostPrice)),
    lostFull: mean(runs.map((r) => r.lostFull)),
  };
};

const paired = (a: RunResult[], b: RunResult[], strategy: Strategy, baseline: Strategy): PairedComparison => {
  const diffs = a.map((r, i) => r.revenue - b[i].revenue);
  const pcts = a.map((r, i) => ((r.revenue - b[i].revenue) / b[i].revenue) * 100);
  const m = mean(diffs);
  const c = ci95(diffs);
  return { strategy, baseline, diffMean: m, diffCi: c, pctMean: mean(pcts), wins: diffs.filter((d) => d > 0).length, significant: Math.abs(m) > c };
};

export const monteCarlo = (cfg: SimConfig = DEFAULT_CONFIG, seeds: number[] = Array.from({ length: 30 }, (_, i) => i + 1)): MonteCarloResult => {
  const runs: Record<Strategy, RunResult[]> = { static: [], rules: [], ai: [] };
  for (const seed of seeds) {
    const scenario = generateScenario(cfg, seed); // e njëjta kërkesë për të tri strategjitë
    for (const s of STRATEGIES) runs[s].push(simulate(cfg, s, seed, scenario));
  }
  return {
    config: cfg,
    seeds,
    runs,
    summary: { static: summarize("static", runs.static), rules: summarize("rules", runs.rules), ai: summarize("ai", runs.ai) },
    comparisons: [
      paired(runs.rules, runs.static, "rules", "static"),
      paired(runs.ai, runs.static, "ai", "static"),
      paired(runs.ai, runs.rules, "ai", "rules"),
    ],
  };
};
