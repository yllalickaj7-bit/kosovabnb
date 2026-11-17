/** Adresa publike e faqes (për SEO dhe lidhje kanonike). Mund të vendoset me VITE_SITE_URL. */
export const SITE: string =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "https://kosovabnb.vercel.app");
