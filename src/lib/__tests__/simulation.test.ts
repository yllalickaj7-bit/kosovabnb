import { describe, expect, it } from "vitest";
import { Rng } from "../simulation/rng";
import { DEFAULT_CONFIG, generateScenario, simulate } from "../simulation/engine";
import { monteCarlo } from "../simulation/montecarlo";

const small = { ...DEFAULT_CONFIG, days: 120, rooms: 6 };

describe("Rng", () => {
  it("është i përcaktuar nga seed-i", () => {
    const a = new Rng(5), b = new Rng(5), c = new Rng(6);
    expect([a.next(), a.next()]).toEqual([b.next(), b.next()]);
    expect(new Rng(5).next()).not.toBe(c.next());
  });
  it("uniform në [0,1) me mesatare ~0.5", () => {
    const r = new Rng(1);
    const xs = Array.from({ length: 20000 }, () => r.next());
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThan(1);
    expect(xs.reduce((a, b) => a + b, 0) / xs.length).toBeCloseTo(0.5, 1);
  });
  it("Poisson dhe lognormal kanë mesataret e pritura", () => {
    const r = new Rng(2);
    const p = Array.from({ length: 20000 }, () => r.poisson(4));
    expect(p.reduce((a, b) => a + b, 0) / p.length).toBeCloseTo(4, 0);
    const l = Array.from({ length: 20000 }, () => r.lognormal(0.25));
    expect(l.reduce((a, b) => a + b, 0) / l.length).toBeCloseTo(1, 1);
  });
});

describe("simulate", () => {
  it("është i përsëritshëm", () => {
    const a = simulate(small, "ai", 3);
    const b = simulate(small, "ai", 3);
    expect(a.revenue).toBe(b.revenue);
    expect(a.soldNights).toBe(b.soldNights);
  });
  it("e njëjta kërkesë për çdo strategji (common random numbers)", () => {
    const sc = generateScenario(small, 4);
    const a = simulate(small, "static", 4, sc);
    const b = simulate(small, "ai", 4, sc);
    expect(a.lostFull + a.lostPrice + a.bookings).toBe(b.lostFull + b.lostPrice + b.bookings);
  });
  it("kurrë nuk tejkalon kapacitetin dhe të ardhurat mbyllen", () => {
    for (const s of ["static", "rules", "ai"] as const) {
      const r = simulate(small, s, 7);
      expect(Math.max(...r.dailyOccupancy)).toBeLessThanOrEqual(1);
      expect(r.occupancy).toBeLessThanOrEqual(1);
      expect(r.monthlyRevenue.reduce((a, b) => a + b, 0)).toBeCloseTo(r.revenue, 1);
      expect(r.bookingList.reduce((a, b) => a + b.nights, 0)).toBe(r.soldNights);
    }
  });
  it("çmimi fiks: ADR = çmimi bazë", () => {
    const r = simulate(small, "static", 9);
    expect(r.adr).toBeCloseTo(small.basePrice, 6);
  });
  it("çmimet dinamike mbeten brenda kufijve min/max", () => {
    const r = simulate(small, "ai", 11);
    expect(r.adr).toBeGreaterThanOrEqual(small.basePrice * small.minFactor - 1e-9);
    expect(r.adr).toBeLessThanOrEqual(small.basePrice * small.maxFactor + 1e-9);
  });
});

describe("monteCarlo", () => {
  it("AI fiton ndaj çmimit fiks në kërkesën e kalibruar (seed 1–30, përcaktues)", () => {
    const r = monteCarlo(DEFAULT_CONFIG, Array.from({ length: 30 }, (_, i) => i + 1));
    const aiVsStatic = r.comparisons.find((c) => c.strategy === "ai" && c.baseline === "static")!;
    expect(aiVsStatic.pctMean).toBeGreaterThan(0);
    expect(aiVsStatic.significant).toBe(true);
    expect(r.summary.static.occupancy.mean).toBeGreaterThan(0.55);
    expect(r.summary.static.occupancy.mean).toBeLessThan(0.75);
  });
  it("kur kërkesa është shumë e dobët, rregullat e sezonit e dëmtojnë të ardhurat (kufizim i dokumentuar)", () => {
    const r = monteCarlo({ ...DEFAULT_CONFIG, demandPerDay: 6 }, Array.from({ length: 30 }, (_, i) => i + 1));
    expect(r.comparisons[0].pctMean).toBeLessThan(0.5);
  });
});
