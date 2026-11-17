import { SITE } from "@/lib/site";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { CategoryFilter, CategoryType } from "@/components/CategoryFilter";
import { ListingRow } from "@/components/ListingRow";
import { ListingCardSkeleton } from "@/components/ListingCardSkeleton";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileNav } from "@/components/MobileNav";
import { SEOHead, createOrganizationSchema, createWebSiteSchema, createLocalBusinessSchema } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("Të gjitha");
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();

  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings", activeCategory, searchQuery],
    queryFn: async () => {
      let query = supabase.from("listings").select("*").order("created_at", { ascending: false });

      if (activeCategory !== "Të gjitha") {
        query = query.eq("type", activeCategory);
      }

      if (searchQuery) {
        query = query.ilike("location", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const grouped = useMemo(() => {
    if (!listings) return [];
    const map = new Map<string, typeof listings>();
    for (const listing of listings) {
      const city = listing.location.split(",")[0].trim();
      if (!map.has(city)) map.set(city, []);
      map.get(city)!.push(listing);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [listings]);

  const pageTitle = searchQuery
    ? `Vendbanime në ${searchQuery} | KosovaBnB`
    : "KosovaBnB – Vendbanime, Eksperienca & Shërbime në Kosovë";

  const pageDesc = searchQuery
    ? `Gjej vendbanime të mrekullueshme në ${searchQuery}, Kosovë. Rezervo apartamente, vila, hotele me çmimet më të mira.`
    : "Platforma kryesore për rezervimin e vendbanimeve, eksperiencave dhe shërbimeve turistike në Kosovë. Gjej vendbanimin ideal për pushimin tënd.";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={pageTitle}
        description={pageDesc}
        canonical={`${SITE}/${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`}
        jsonLd={[createOrganizationSchema(), createWebSiteSchema(), createLocalBusinessSchema()]}
      />
      <Header onSearch={setSearchQuery} />
      <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <main className="max-w-[1760px] mx-auto px-4 sm:px-6 pt-[200px] sm:pt-[144px] pb-24 md:pb-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] mb-8 text-white shadow-2xl" aria-label="Asistenti AI"
          style={{ background: "radial-gradient(1200px 500px at 85% -10%, rgba(232,167,0,.35), transparent 60%), radial-gradient(900px 500px at 0% 110%, rgba(45,91,227,.55), transparent 60%), linear-gradient(135deg,#0F1F5C 0%,#12297A 55%,#1B3FB5 100%)" }}>
          <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true" style={{ backgroundImage: "linear-gradient(135deg,#fff 25%,transparent 25%,transparent 50%,#fff 50%,#fff 75%,transparent 75%)", backgroundSize: "28px 28px" }} />
          <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 p-7 sm:p-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold mb-4">✨ Rezervo me ndihmën e AI</span>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] mb-4">Kosova, e gjetur <span className="text-accent">në një fjali.</span></h1>
              <p className="text-white/85 text-lg mb-6 max-w-xl">Shkruaj çfarë kërkon: qytetin, numrin e mysafirëve, buxhetin. Asistenti gjen pronat e lira dhe të çon te rezervimi.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = (new FormData(e.currentTarget).get("q") as string) ?? "";
                  window.dispatchEvent(new CustomEvent("kbnb:open-chat", { detail: v }));
                }}
                className="flex gap-2 max-w-xl bg-white rounded-full p-1.5 shadow-xl"
              >
                <input name="q" maxLength={200} aria-label="Pyet asistentin" placeholder="vilë për 6 vetë në Prizren nën 150€" className="flex-1 min-w-0 rounded-full px-5 py-3 text-foreground bg-transparent outline-none placeholder:text-muted-foreground/70" />
                <button className="rounded-full px-6 py-3 font-bold bg-accent text-accent-foreground hover:brightness-95 transition">Pyet AI</button>
              </form>
              <div className="flex flex-wrap gap-2 mt-5 text-sm">
                <Link to="/planner" className="rounded-full bg-white/15 hover:bg-white/25 backdrop-blur px-4 py-2 transition">✨ Planifiko udhëtimin</Link>
                <Link to="/simulator" className="rounded-full bg-white/15 hover:bg-white/25 backdrop-blur px-4 py-2 transition">📈 Simulatori</Link>
                <Link to="/host/revenue" className="rounded-full bg-white/15 hover:bg-white/25 backdrop-blur px-4 py-2 transition">💶 Revenue Manager</Link>
              </div>
            </div>
            <div className="hidden lg:grid gap-4">
              {[
                { k: listings?.length ?? "—", v: "vendbanime të gatshme" },
                { k: grouped.length || "—", v: "qytete në Kosovë" },
                { k: "24/7", v: "asistent AI për rezervim" },
              ].map((x) => (
                <div key={x.v} className="rounded-2xl bg-white/12 backdrop-blur border border-white/20 px-6 py-4 flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold">{x.k}</span>
                  <span className="text-white/80 text-sm">{x.v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Qytetet */}
        {grouped.length > 1 && !searchQuery && activeCategory === "Të gjitha" && (
          <section className="mb-10" aria-label="Qytetet">
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
              {grouped.slice(0, 8).map(([city, ls]) => (
                <button key={city} onClick={() => setSearchQuery(city)} className="snap-start shrink-0 text-left rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition px-5 py-4 min-w-[150px]">
                  <span className="block font-bold">{city}</span>
                  <span className="text-xs text-muted-foreground">{ls.length} vendbanime</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Results count */}
        {!isLoading && listings && (
          <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
            {listings.length > 0
              ? `${listings.length} vendbanime të gjetura${searchQuery ? ` në ${searchQuery}` : ""}`
              : "Asnjë rezultat nuk u gjet"}
          </p>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-10" aria-busy="true" aria-label="Duke u ngarkuar">
            {[1, 2, 3].map((section) => (
              <div key={section}>
                <div className="h-6 w-48 bg-secondary rounded animate-pulse mb-4" />
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-[48%] sm:w-[220px] md:w-[240px]">
                      <ListingCardSkeleton />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grouped Rows by Location */}
        {!isLoading && grouped.map(([city, cityListings]) => {
          const categoryLabel = activeCategory !== "Të gjitha" ? activeCategory : "Vendbanime";
          return (
            <ListingRow
              key={city}
              title={`${categoryLabel} në ${city}`}
              listings={cityListings}
            />
          );
        })}

        {/* Empty State */}
        {!isLoading && listings?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4" aria-hidden="true">🏔️</div>
            <h2 className="text-xl font-semibold mb-2">Asnjë vendbanim nuk u gjet</h2>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Provo të ndryshosh filtrat ose të kërkosh destinacion tjetër në Kosovë
            </p>
            <button
              onClick={() => { setActiveCategory("Të gjitha"); setSearchQuery(""); }}
              className="px-6 py-3 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
            >
              Pastro filtrat
            </button>
          </div>
        )}

        {/* Si funksionon + pse ne */}
        {!searchQuery && activeCategory === "Të gjitha" && (
          <>
            <section className="mt-14" aria-label="Si funksionon">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">Si funksionon</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["1", "Përshkruaj ose kërko", "Shkruaj te asistenti ose përdor filtrat: qytet, lloj, çmim, mysafirë."],
                  ["2", "Shiko çmimin real", "Disponueshmëria dhe totali llogariten nga sistemi, jo nga hamendja."],
                  ["3", "Rezervo dhe paguaj", "Konfirmim brenda disa klikimeve; pagesa është provë, pa rrezik."],
                ].map(([n, t, d]) => (
                  <div key={n} className="rounded-3xl border border-border bg-card p-6 hover:shadow-lg transition">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full gradient-brand text-white font-bold mb-4">{n}</span>
                    <h3 className="font-bold text-lg mb-1">{t}</h3>
                    <p className="text-muted-foreground text-sm">{d}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="mt-12 rounded-3xl bg-secondary/70 p-6 sm:p-10 grid gap-6 md:grid-cols-3" aria-label="Pse KosovaBnB">
              {[
                ["🤖", "Asistent që punon", "Kërkon pronat e lira dhe jep lidhje direkte; nuk shpik çmime."],
                ["🔒", "Rezervim pa dyfishim", "Baza e të dhënave nuk lejon dy rezervime në të njëjtat data."],
                ["📊", "Çmim i drejtë", "Çdo pronë tregon si krahasohet çmimi dhe kur është më lirë."],
              ].map(([i, t, d]) => (
                <div key={t as string}>
                  <div className="text-3xl mb-2" aria-hidden="true">{i}</div>
                  <h3 className="font-bold mb-1">{t}</h3>
                  <p className="text-sm text-muted-foreground">{d}</p>
                </div>
              ))}
            </section>
          </>
        )}
      </main>

      <SiteFooter />
      <MobileNav />
    </div>
  );
};

export default Index;
