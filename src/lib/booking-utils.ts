// Funksione të pastra për formularin e pagesës dhe për parashikimin e rezultatit të pagesës së simuluar.
// `paymentOutcome` pasqyron funksionin SQL `simulate_payment` (të njëjtat karta provë dhe mesazhe).

export const formatCardNumber = (v: string): string => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

export const formatExpiry = (v: string): string => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

/** Algoritmi Luhn për 16 shifra */
export const luhnValid = (digits: string): boolean => {
  if (!/^\d{16}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let d = Number(digits[15 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
};

export const cardBrand = (digits: string): "visa" | "mastercard" | "other" =>
  digits.startsWith("4") ? "visa" : digits.startsWith("5") ? "mastercard" : "other";

export interface PaymentOutcome {
  status: "succeeded" | "failed";
  reason: string | null;
}

/** today = YYYY-MM-DD */
export const paymentOutcome = (cardNumber: string, expiry: string, today: string): PaymentOutcome => {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length !== 16) return { status: "failed", reason: "Numri i kartës duhet të ketë 16 shifra" };
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry);
  if (!m) return { status: "failed", reason: "Data e skadimit duhet të jetë në formatin MM/VV" };
  const year = 2000 + Number(m[2]);
  const month = Number(m[1]);
  // karta vlen deri në fund të muajit të skadimit; skadon nga dita e parë e muajit pasardhës
  const firstOfNext = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  if (firstOfNext <= today) return { status: "failed", reason: "Karta ka skaduar" };
  if (digits === "4000000000000002") return { status: "failed", reason: "Karta u refuzua nga banka (simulim)" };
  if (digits === "4000000000009995") return { status: "failed", reason: "Fonde të pamjaftueshme (simulim)" };
  if (!luhnValid(digits)) return { status: "failed", reason: "Numri i kartës nuk është i vlefshëm" };
  return { status: "succeeded", reason: null };
};
