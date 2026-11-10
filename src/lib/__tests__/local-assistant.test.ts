import { describe, expect, it } from "vitest";
import { parseQuery, reply, search, ListingLite } from "../local-assistant";

const L = (id: string, location: string, type: string, price: number, guests: number, rating = 4.5): ListingLite => ({ id, title: "T" + id, type, price, location, guests, rating });
const all = [L("1", "Prizren, Kosovë", "Vila", 120, 8), L("2", "Prizren, Kosovë", "Apartamente", 60, 3), L("3", "Pejë, Kosovë", "Vila", 90, 6, 4.9)];

describe("asistenti lokal", () => {
  it("kupton qytetin, mysafirët, çmimin dhe llojin", () => {
    const q = parseQuery("Dua një vilë për 6 vetë në Prizren nën 150€", ["Prizren", "Pejë"]);
    expect(q).toEqual({ city: "Prizren", guests: 6, maxPrice: 150, type: "Vila" });
  });
  it("kupton anglishten dhe shkronjat pa diakritikë", () => {
    expect(parseQuery("apartment in peje under 80", ["Prizren", "Pejë"])).toEqual({ city: "Pejë", maxPrice: 80, type: "Apartamente" });
  });
  it("filtron sipas kritereve dhe rendit sipas vlerësimit", () => {
    const r = search(all, { type: "Vila", guests: 6 });
    expect(r.map((x) => x.id)).toEqual(["3", "1"]);
    expect(search(all, { city: "Prizren", maxPrice: 100 }).map((x) => x.id)).toEqual(["2"]);
  });
  it("përgjigja përmban lidhje të brendshme ose mesazh bosh", () => {
    expect(reply(search(all, { city: "Pejë" }), { city: "Pejë" }, "sq")).toContain("/listing/3");
    expect(reply([], {}, "en")).toContain("nothing");
  });
});
