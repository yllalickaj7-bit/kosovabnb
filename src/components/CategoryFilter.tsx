import { useRef } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Building2, Hotel, BedDouble, Castle, Tent, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export type CategoryType = "Të gjitha" | "Apartamente" | "Hotele" | "Motele" | "Vila" | "Kamping" | "Dizajn";

const categories: { name: CategoryType; Icon: React.ElementType; label: string }[] = [
  { name: "Të gjitha", Icon: Sparkles, label: "Të gjitha" },
  { name: "Apartamente", Icon: Building2, label: "Apartamente" },
  { name: "Hotele", Icon: Hotel, label: "Hotele" },
  { name: "Motele", Icon: BedDouble, label: "Motele" },
  { name: "Vila", Icon: Castle, label: "Vila" },
  { name: "Kamping", Icon: Tent, label: "Kamping" },
  { name: "Dizajn", Icon: Sparkles, label: "Dizajn" },
];

interface CategoryFilterProps {
  activeCategory: CategoryType;
  onCategoryChange: (cat: CategoryType) => void;
}

export const CategoryFilter = ({ activeCategory, onCategoryChange }: CategoryFilterProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="glass fixed top-[128px] sm:top-20 left-0 right-0 z-40 border-b border-border/60">
      <div className="max-w-[1760px] mx-auto px-6 flex items-center gap-3 h-16">
        {/* Scroll Left */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-full border border-border bg-white hover:shadow-md transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Categories */}
        <div
          ref={scrollRef}
          className="flex items-center gap-6 overflow-x-auto hide-scrollbar flex-1"
        >
          {categories.map(({ name, Icon, label }) => (
            <button
              key={name}
              onClick={() => onCategoryChange(name)}
              className={`flex flex-col items-center gap-1 pb-1 flex-shrink-0 relative group transition-all duration-200 ${
                activeCategory === name
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-6 w-6 transition-colors ${
                  activeCategory === name ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span className="text-xs font-medium whitespace-nowrap">{label}</span>
              {activeCategory === name && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Scroll Right */}
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-full border border-border bg-white hover:shadow-md transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-border flex-shrink-0" />

        {/* Filter Button */}
        <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border border-border rounded-xl bg-white hover:shadow-md transition-all text-sm font-medium">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden md:inline">Filtro</span>
        </button>
      </div>
    </div>
  );
};
