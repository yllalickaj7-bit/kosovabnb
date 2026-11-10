// Asistent lokal pa AI: kuptohet kërkesa me rregulla të thjeshta dhe kërkohet direkt te tabela `listings`.
// Përdoret kur funksioni `chat` (Claude) nuk është i vendosur, që chatbot-i të punojë gjithsesi.
export interface ListingLite {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  guests: number | null;
  rating: number | null;
}

export interface Parsed {
  city?: string;
  guests?: number;
  maxPrice?: number;
  type?: string;
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ë/g, "e").replace(/ç/g, "c");

const TYPES: [RegExp, string][] = [
  [/\bvil(a|e|at)\b|villa/, "Vila"],
  [/apartament|apartment|\bflat\b/, "Apartamente"],
  [/hotel/, "Hotele"],
  [/motel/, "Motele"],
  [/kamp|camp/, "Kamping"],
];

export const parseQuery = (text: string, cities: string[]): Parsed => {
  const t = norm(text);
  const out: Parsed = {};
  out.city = cities.find((c) => t.includes(norm(c)));
  const g = t.match(/(\d{1,2})\s*(vete|persona|persona|mysafir|guest|people|pax)/) ?? t.match(/per\s+(\d{1,2})\b/) ?? t.match(/for\s+(\d{1,2})\b/);
  if (g) out.guests = Math.min(20, Number(g[1]));
  const p = t.match(/(?:nen|deri ne|max(?:imum)?|under|below|up to)\s*€?\s*(\d{2,4})/) ?? t.match(/€\s*(\d{2,4})/) ?? t.match(/(\d{2,4})\s*(?:€|euro)/);
  if (p) out.maxPrice = Number(p[1]);
  out.type = TYPES.find(([re]) => re.test(t))?.[1];
  return out;
};

export const search = (all: ListingLite[], q: Parsed): ListingLite[] =>
  all
    .filter((l) => (!q.city || norm(l.location).includes(norm(q.city))) && (!q.type || l.type === q.type) &&
      (!q.maxPrice || Number(l.price) <= q.maxPrice) && (!q.guests || (l.guests ?? 99) >= q.guests))
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 4);

export const reply = (found: ListingLite[], q: Parsed, lang: "sq" | "en"): string => {
  const sq = lang === "sq";
  if (found.length === 0)
    return sq
      ? "Nuk gjeta asgjë me këto kritere. Provo një qytet tjetër, çmim më të lartë ose më pak mysafirë."
      : "I found nothing matching that. Try another city, a higher price or fewer guests.";
  const head = sq ? `Gjeta ${found.length} opsione${q.city ? ` në ${q.city}` : ""}:` : `Here are ${found.length} options${q.city ? ` in ${q.city}` : ""}:`;
  const lines = found.map((l) => `• ${l.title} (${l.location}) · €${Math.round(Number(l.price))}/${sq ? "natë" : "night"}${l.rating ? ` · ★${l.rating}` : ""}\n  /listing/${l.id}`);
  const tail = sq ? "Hap lidhjen për të parë datat dhe për të rezervuar." : "Open a link to see dates and book.";
  return [head, ...lines, tail].join("\n");
};
