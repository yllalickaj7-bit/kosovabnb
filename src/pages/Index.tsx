import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { CategoryFilter, CategoryType } from "@/components/CategoryFilter";
import { ListingRow } from "@/components/ListingRow";
import { ListingCardSkeleton } from "@/components/ListingCardSkeleton";
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
        canonical={`https://kosovabnb.lovable.app/${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`}
        jsonLd={[createOrganizationSchema(), createWebSiteSchema(), createLocalBusinessSchema()]}
      />
      <Header onSearch={setSearchQuery} />
      <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <main className="max-w-[1760px] mx-auto px-4 sm:px-6 pt-[200px] sm:pt-[144px] pb-24 md:pb-8">
        {/* AI: hyrja e re e kryefaqes */}
        <section className="mb-8 rounded-3xl p-6 sm:p-8 text-white" style={{ background: "var(--gradient-brand)" }} aria-label="Asistenti AI">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Gjej qëndrimin e përsosur në Kosovë, thjesht duke e përshkruar</h1>
          <p className="opacity-90 mb-4 max-w-2xl">Shkruaj çfarë dëshiron dhe asistenti kërkon, krahason çmimet dhe të çon te rezervimi.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = (new FormData(e.currentTarget).get("q") as string) ?? "";
              window.dispatchEvent(new CustomEvent("kbnb:open-chat", { detail: v }));
            }}
            className="flex gap-2 max-w-2xl"
          >
            <input name="q" maxLength={200} placeholder="p.sh. vilë për 6 vetë në Prizren nën 150€" className="flex-1 rounded-full px-5 py-3 text-foreground bg-white outline-none" />
            <button className="rounded-full px-6 py-3 font-bold bg-accent text-accent-foreground hover:brightness-95">Pyet AI</button>
          </form>
          <div className="flex flex-wrap gap-2 mt-4 text-sm">
            <Link to="/planner" className="rounded-full bg-white/20 hover:bg-white/30 px-4 py-2">✨ Planifiko udhëtimin me AI</Link>
            <Link to="/simulator" className="rounded-full bg-white/20 hover:bg-white/30 px-4 py-2">📈 Simulatori i çmimeve</Link>
            <Link to="/host/revenue" className="rounded-full bg-white/20 hover:bg-white/30 px-4 py-2">💶 Revenue Manager</Link>
          </div>
        </section>

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
      </main>

      <MobileNav />
    </div>
  );
};

export default Index;
