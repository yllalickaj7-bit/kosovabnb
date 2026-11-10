import { describe, expect, it } from "vitest";
import { chooseCities, splitNights, PlanListing } from "../local-planner";

const L = (id: string, city: string, type: string, rating: number, guests: number, lat: number, lng: number): PlanListing => ({ id, title: id, type, price: 80, location: `${city}, Kosovë`, guests, rating, lat, lng });
const all = [L("a", "Prishtinë", "Hotele", 4.6, 4, 42.66, 21.16), L("b", "Prizren", "Vila", 4.9, 6, 42.21, 20.74), L("c", "Pejë", "Kamping", 4.7, 4, 42.66, 20.29), L("d", "Gjakovë", "Apartamente", 4.2, 2, 42.38, 20.43)];

describe("splitNights", () => {
  it("shpërndan netët pa humbur asnjë", () => { expect(splitNights(7, 3)).toEqual([3, 2, 2]); expect(splitNights(5, 2).reduce((a, b) => a + b, 0)).toBe(5); });
});
describe("chooseCities", () => {
  it("numri i qyteteve varet nga netët; totali i netëve ruhet", () => {
    expect(chooseCities(all, "udhëtim", 2, 2)).toHaveLength(1);
    const r = chooseCities(all, "udhëtim", 2, 7);
    expect(r).toHaveLength(3); expect(r.reduce((a, c) => a + c.nights, 0)).toBe(7);
  });
  it("respekton numrin e mysafirëve dhe qytetin e emërtuar", () => {
    const r = chooseCities(all, "dua Gjakovë", 2, 3);
    expect(r[0].city).toBe("Gjakovë");
    expect(chooseCities(all, "x", 6, 6).every((c) => c.candidates.every((l) => (l.guests ?? 0) >= 6))).toBe(true);
  });
  it("preferon natyrën kur kërkohet", () => {
    expect(chooseCities(all, "natyrë dhe qetësi", 2, 2)[0].city).toBe("Prizren"); // vlerësimi më i lartë + Vila
  });
});
