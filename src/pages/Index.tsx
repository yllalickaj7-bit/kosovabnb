import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { CategoryFilter, CategoryType } from "@/components/CategoryFilter";
import { ListingCard } from "@/components/ListingCard";
import { ListingCardSkeleton } from "@/components/ListingCardSkeleton";
import { MobileNav } from "@/components/MobileNav";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("Të gjitha");
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} />
      <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Main Content */}
      <main className="max-w-[1760px] mx-auto px-6 pt-[144px] pb-24 md:pb-8">
        {/* Results count */}
        {!isLoading && listings && (
          <div className="mb-6 text-sm text-muted-foreground">
            {listings.length > 0
              ? `${listings.length} vendbanime të gjetura${searchQuery ? ` në ${searchQuery}` : ""}`
              : "Asnjë rezultat nuk u gjet"}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-8">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <ListingCardSkeleton key={i} />)
            : listings?.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  location={listing.location}
                  distance={listing.distance}
                  dates={listing.dates}
                  price={listing.price}
                  rating={Number(listing.rating)}
                  images={listing.images_url || []}
                />
              ))}
        </div>

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
