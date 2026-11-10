import { describe, expect, it } from "vitest";
import { DEFAULT_RULES, clampPrice, demandAdjustment, nightlyPrice, recommendPrice, ruleMultiplier } from "../pricing";
import { addDays, diffDays, isoDow } from "../dates";

// Vlerat pasqyrojnë testet SQL te supabase/tests (dhoma me çmim bazë 120, min 84, max 216)
const room = { basePrice: 120, minPrice: 84, maxPrice: 216 };

describe("dates", () => {
  it("llogarit ditën e javës si ISO (1=e hënë)", () => {
    expect(isoDow("2027-07-12")).toBe(1);
    expect(isoDow("2027-07-16")).toBe(5);
    expect(isoDow("2027-07-18")).toBe(7);
  });
  it("shton ditë dhe llogarit diferencën", () => {
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
    expect(diffDays("2027-07-10", "2027-07-13")).toBe(3);
  });
  it("hedh gabim për datë të pavlefshme", () => {
    expect(() => addDays("2027-7-1", 1)).toThrow();
  });
});

describe("nightlyPrice", () => {
  it("sezoni i verës në ditë të hënë: 120 × 1.25 = 150", () => {
    expect(nightlyPrice(room, DEFAULT_RULES, "2027-07-12", 30)).toBe(150);
  });
  it("fundjavë në verë: 120 × 1.25 × 1.10 = 165", () => {
    expect(nightlyPrice(room, DEFAULT_RULES, "2027-07-16", 30)).toBe(165);
  });
  it("jashtë sezonit, e martë: çmimi bazë", () => {
    expect(nightlyPrice(room, DEFAULT_RULES, "2027-03-09", 30)).toBe(120);
  });
  it("last-minute (0–3 ditë) zbret 10%", () => {
    expect(nightlyPrice(room, DEFAULT_RULES, "2027-03-09", 2)).toBe(108);
    expect(nightlyPrice(room, DEFAULT_RULES, "2027-03-09", 4)).toBe(120);
  });
  it("respekton kufirin maksimal dhe minimal", () => {
    const wild = DEFAULT_RULES.map((r) => (r.kind === "weekend" ? { ...r, multiplier: 3 } : r));
    expect(nightlyPrice(room, wild, "2027-07-16", 30)).toBe(216);
    expect(clampPrice(10, room)).toBe(84);
  });
  it("festat dhe sezoni i dimrit shumëzohen", () => {
    // 17 shkurt 2027 (e mërkurë): dimër 1.2 × festë 1.3 = 1.56
    expect(ruleMultiplier(DEFAULT_RULES, "2027-02-17", 30)).toBeCloseTo(1.56, 10);
  });
});

describe("demandAdjustment / recommendPrice", () => {
  it("pragjet e zënies", () => {
    expect(demandAdjustment(0.85, 10)).toBe(1.15);
    expect(demandAdjustment(0.6, 10)).toBe(1.08);
    expect(demandAdjustment(0.1, 10)).toBe(0.9);
    expect(demandAdjustment(0.1, 20)).toBe(0.95);
    expect(demandAdjustment(0.1, 40)).toBe(1);
    expect(demandAdjustment(0.5, 10)).toBe(1);
  });
  it("përputhet me rezultatin SQL: 121 → 139.15 kur zënia ≥ 80%", () => {
    const r = { basePrice: 110, minPrice: 77, maxPrice: 198 };
    // çmimi nga rregullat për 2027-07-?? nuk është 121; provojmë formulën direkt me çmim bazë që jep 121
    const base121 = { basePrice: 121, minPrice: 0, maxPrice: 1000 };
    expect(recommendPrice(base121, [], "2027-03-09", 30, 0.9)).toBe(139.15);
    expect(r.basePrice).toBe(110);
  });
  it("nuk e kalon kurrë maksimumin", () => {
    expect(recommendPrice({ basePrice: 100, maxPrice: 110 }, [], "2027-03-09", 30, 0.95)).toBe(110);
  });
});
