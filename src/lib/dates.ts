// Ndihmës datash pa varësi (UTC, formati YYYY-MM-DD). Përdoren nga çmimi, simulatori dhe parashikimi.

const MS_DAY = 86_400_000;

export const parseYmd = (s: string): number => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) throw new Error(`Datë e pavlefshme: ${s}`);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

export const formatYmd = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

export const addDays = (ymd: string, n: number): string => formatYmd(parseYmd(ymd) + n * MS_DAY);

/** Diferenca në ditë: b - a */
export const diffDays = (a: string, b: string): number => Math.round((parseYmd(b) - parseYmd(a)) / MS_DAY);

/** ISO: 1 = e hënë ... 7 = e diel (njësoj si extract(isodow) në PostgreSQL) */
export const isoDow = (ymd: string): number => {
  const d = new Date(parseYmd(ymd)).getUTCDay();
  return d === 0 ? 7 : d;
};

export const round2 = (x: number): number => Math.round(x * 100) / 100;
