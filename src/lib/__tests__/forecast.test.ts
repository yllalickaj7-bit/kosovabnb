import { describe, expect, it } from "vitest";
import { DEFAULT_RULES } from "../pricing";
import { alerts, bestPriceChange, forecast, forecastOccupancy, onTheBooks, pickupShare, priorOccupancy, whatIf } from "../forecast";

const room = { basePrice: 100, minPrice: 70, maxPrice: 180 };
const today = "2027-03-01";

describe("pickup", () => {
  it("pickupShare: afër 1 në ditën e qëndrimit (jo saktësisht 1), zvogëlohet me largësinë", () => {
    expect(pickupShare(0)).toBeCloseTo(Math.exp(-1 / 25), 10);
    expect(pickupShare(0)).toBeLessThan(1);
    expect(pickupShare(24)).toBeCloseTo(Math.exp(-1), 10);
    expect(pickupShare(60)).toBeLessThan(pickupShare(10));
  });
  it("onTheBooks numëron net të zëna (check-out përjashtohet)", () => {
    const otb = onTheBooks([{ checkIn: "2027-03-02", checkOut: "2027-03-04" }, { checkIn: "2027-03-03", checkOut: "2027-03-05" }], today, 6);
    expect(otb).toEqual([0, 1, 2, 1, 0, 0]);
  });
  it("onTheBooks kufizon rezervimet jashtë dritares", () => {
    expect(onTheBooks([{ checkIn: "2027-02-20", checkOut: "2027-03-03" }], today, 4)).toEqual([1, 1, 0, 0]);
  });
});

describe("forecastOccupancy", () => {
  it("në ditën e qëndrimit parashikimi ≈ zënia reale (+ pjesa e vogël e rezervimeve të po asaj dite)", () => {
    const f = forecastOccupancy(0.7, 0.5, 0, 10);
    expect(f.mean).toBeGreaterThanOrEqual(0.7);
    expect(f.mean).toBeLessThan(0.73);
  });
  it("larg datës mbështetet te a-priori", () => {
    expect(forecastOccupancy(0, 0.6, 200, 10).mean).toBeCloseTo(0.6, 2);
  });
  it("nuk bie nën zënien reale dhe nuk kalon 100%", () => {
    const f = forecastOccupancy(0.95, 0.9, 30, 10);
    expect(f.mean).toBeLessThanOrEqual(1);
    expect(f.mean).toBeGreaterThanOrEqual(0.95);
    expect(f.low).toBeLessThanOrEqual(f.mean);
    expect(f.high).toBeGreaterThanOrEqual(f.mean);
  });
});

describe("forecast", () => {
  it("kthen një rresht për çdo ditë me të ardhura të pritura pozitive", () => {
    const f = forecast([], { rooms: 10, today, days: 30, rules: DEFAULT_RULES, room });
    expect(f).toHaveLength(30);
    expect(f[0].date).toBe(today);
    expect(f.every((d) => d.expectedRevenue > 0)).toBe(true);
  });
  it("priori është më i lartë në verë se në mars", () => {
    expect(priorOccupancy(DEFAULT_RULES, "2027-07-14")).toBeGreaterThan(priorOccupancy(DEFAULT_RULES, "2027-03-09"));
  });
});

describe("whatIf / bestPriceChange", () => {
  const f = forecast([], { rooms: 10, today, days: 60, rules: DEFAULT_RULES, room });
  it("ndryshim 0% nuk ndryshon asgjë", () => {
    const w = whatIf(f[40], 10, room, 0);
    expect(w.revenue).toBeCloseTo(f[40].expectedRevenue, 6);
  });
  it("rritja e çmimit ul zënien e pritur kur kërkesa është elastike", () => {
    expect(whatIf(f[40], 10, room, 20).occupancy).toBeLessThan(f[40].forecastOcc);
  });
  it("çmimi i ri respekton kufirin maksimal", () => {
    expect(whatIf(f[40], 10, room, 30).price).toBeLessThanOrEqual(room.maxPrice);
  });
  it("kur data është pothuajse e mbushur, rritja e çmimit është optimale", () => {
    const sold = { ...f[5], otb: 10, otbOcc: 1, forecastOcc: 1 };
    expect(bestPriceChange(sold, 10, room).changePct).toBeGreaterThan(0);
  });
  it("kur kërkesa është shumë elastike, zbritja mund të jetë optimale", () => {
    const d = { ...f[50], otbOcc: 0, otb: 0, forecastOcc: 0.3 };
    expect(bestPriceChange(d, 10, room, -3).changePct).toBeLessThanOrEqual(0);
  });
});

describe("alerts", () => {
  it("sinjalizon datë në sezon të lartë me zënie të ulët", () => {
    const f = forecast([], { rooms: 10, today: "2027-06-10", days: 30, rules: DEFAULT_RULES, room, prior: () => 0.2 });
    expect(alerts(f, DEFAULT_RULES).some((a) => a.kind === "underbooked_peak")).toBe(true);
  });
  it("sinjalizon mundësi rritjeje çmimi kur pritet të mbushet (9 nga 10 dhoma të rezervuara)", () => {
    const booked = Array.from({ length: 9 }, () => ({ checkIn: today, checkOut: "2027-03-31" }));
    const f = forecast(booked, { rooms: 10, today, days: 30, rules: DEFAULT_RULES, room, prior: () => 0.8 });
    expect(alerts(f, DEFAULT_RULES).some((a) => a.kind === "sellout_raise")).toBe(true);
  });
});
