// Planifikues pa AI: zgjedh qytete dhe prona nga të dhënat reale me rregulla të thjeshta (fjalë kyçe + vlerësim + afërsi).
// Përdoret kur funksioni `trip-planner` nuk është i vendosur. Disponueshmëria dhe çmimi verifikohen më pas nga baza (te faqja).
export interface PlanListing {
  id: string; title: string; type: string; price: number; location: string; guests: number | null; rating: number | null; lat: number | null; lng: number | null;
}
export interface CityChoice { city: string; nights: number; candidates: PlanListing[] }

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ë/g, "e").replace(/ç/g, "c");
const NATURE = /natyr|mal|qetesi|ajer|pyll|liqen|nature|mountain|quiet|hik|kamp/;
const CULTURE = /kultur|histori|ushqim|qytet|muze|city|food|culture|history|nightlife|jete nate/;
const NATURE_PLACES = ["peje", "rugove", "brezovic", "shtime", "kaçanik", "kacanik", "junik", "deçan", "decan", "istog"];
const CULTURE_PLACES = ["prizren", "prishtin", "gjakov", "mitrovic"];

export const splitNights = (total: number, cities: number): number[] => {
  const base = Math.floor(total / cities); const extra = total - base * cities;
  return Array.from({ length: cities }, (_, i) => base + (i < extra ? 1 : 0)).filter((n) => n > 0);
};

const dist = (a: PlanListing, b: PlanListing) => Math.hypot((a.lat ?? 0) - (b.lat ?? 0), (a.lng ?? 0) - (b.lng ?? 0));

export const chooseCities = (all: PlanListing[], prompt: string, guests: number, nights: number): CityChoice[] => {
  const t = norm(prompt);
  const fit = all.filter((l) => (l.guests ?? 99) >= guests);
  const byCity = new Map<string, PlanListing[]>();
  for (const l of fit) {
    const c = l.location.split(",")[0].trim();
    byCity.set(c, [...(byCity.get(c) ?? []), l]);
  }
  const wantsNature = NATURE.test(t), wantsCulture = CULTURE.test(t);
  const scored = [...byCity.entries()].map(([city, ls]) => {
    const sorted = [...ls].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.price - b.price);
    const c = norm(city);
    let score = sorted[0].rating ?? 0;
    if (t.includes(c)) score += 10; // qyteti i emëruar nga përdoruesi
    if (wantsNature && (NATURE_PLACES.some((p) => c.includes(p)) || ls.some((l) => l.type === "Kamping" || l.type === "Vila"))) score += 1.5;
    if (wantsCulture && CULTURE_PLACES.some((p) => c.includes(p))) score += 1.5;
    return { city, candidates: sorted, score };
  }).sort((a, b) => b.score - a.score);

  const nCities = Math.min(scored.length, nights <= 2 ? 1 : nights <= 5 ? 2 : 3);
  let picked = scored.slice(0, nCities);
  // rend sipas afërsisë: nis nga qyteti me pikë më të lartë, pastaj më i afërti
  const ordered: typeof picked = [];
  const rest = [...picked];
  let cur = rest.shift();
  while (cur) {
    ordered.push(cur);
    const last = cur.candidates[0];
    rest.sort((a, b) => dist(last, a.candidates[0]) - dist(last, b.candidates[0]));
    cur = rest.shift();
  }
  picked = ordered;
  const split = splitNights(nights, picked.length);
  return picked.map((p, i) => ({ city: p.city, nights: split[i], candidates: p.candidates }));
};
