import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { CategoryFilter, CategoryType } from "@/components/CategoryFilter";
import { ListingRow } from "@/components/ListingRow";
import { ListingCardSkeleton } from "@/components/ListingCardSkeleton";
import { MobileNav } from "@/components/MobileNav";
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

  // Group listings by location (city name - first part before comma)
  const grouped = useMemo(() => {
    if (!listings) return [];
    const map = new Map<string, typeof listings>();
    for (const listing of listings) {
      const city = listing.location.split(",")[0].trim();
      if (!map.has(city)) map.set(city, []);
      map.get(city)!.push(listing);
    }
    // Sort by number of listings (most first)
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [listings]);

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} />
      <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Main Content */}
      <main className="max-w-[1760px] mx-auto px-4 sm:px-6 pt-[200px] sm:pt-[144px] pb-24 md:pb-8">
        {/* Results count */}
        {!isLoading && listings && (
          <div className="mb-4 text-sm text-muted-foreground">
            {listings.length > 0
              ? `${listings.length} vendbanime të gjetura${searchQuery ? ` në ${searchQuery}` : ""}`
              : "Asnjë rezultat nuk u gjet"}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-10">
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
            <div className="text-6xl mb-4">🏔️</div>
            <h3 className="text-xl font-semibold mb-2">Asnjë vendbanim nuk u gjet</h3>
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
