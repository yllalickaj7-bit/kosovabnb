import { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ListingCard } from "./ListingCard";

interface ListingRowProps {
  title: string;
  listings: {
    id: string;
    title: string;
    location: string;
    distance: string;
    dates: string;
    price: number;
    rating: number;
    images_url: string[];
  }[];
}

export const ListingRow = ({ title, listings }: ListingRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.getBoundingClientRect().width || 280;
    const gap = 16;
    const distance = (cardWidth + gap) * 2;
    scrollRef.current.scrollBy({ left: dir === "left" ? -distance : distance, behavior: "smooth" });
  };

  if (listings.length === 0) return null;

  return (
    <section className="mb-8 sm:mb-10">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
        <div className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="h-8 w-8 rounded-full border border-border bg-white flex items-center justify-center hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="h-8 w-8 rounded-full border border-border bg-white flex items-center justify-center hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2"
      >
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="flex-shrink-0 w-[48%] sm:w-[220px] md:w-[240px] lg:w-[260px] snap-start"
          >
            <ListingCard
              id={listing.id}
              title={listing.title}
              location={listing.location}
              distance={listing.distance}
              dates={listing.dates}
              price={listing.price}
              rating={Number(listing.rating)}
              images={listing.images_url || []}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
