import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Menu, User, X, MapPin } from "lucide-react";

const regions = [
  { name: "Prishtinë", emoji: "🏙️" },
  { name: "Prizren", emoji: "🏰" },
  { name: "Pejë", emoji: "🏔️" },
  { name: "Gjakovë", emoji: "🕌" },
  { name: "Mitrovicë", emoji: "🌉" },
  { name: "Ferizaj", emoji: "🌳" },
  { name: "Gjilan", emoji: "🌄" },
  { name: "Vushtrri", emoji: "🏛️" },
];

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header = ({ onSearch }: HeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  const handleRegionSelect = (region: string) => {
    setSearchQuery(region);
    setSearchOpen(false);
    onSearch?.(region);
  };

  return (
    <>
      {/* Main Header */}
      <header className="glass fixed top-0 left-0 right-0 z-50 h-20">
        <div className="max-w-[1760px] mx-auto px-6 h-full flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-1">
              <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none">
                <path
                  d="M16 1C8.82 1 3 6.82 3 14c0 3.5 1.35 6.68 3.56 9.06L16 31l9.44-7.94C27.65 20.68 29 17.5 29 14c0-7.18-5.82-13-13-13z"
                  fill="url(#brandGrad)"
                />
                <defs>
                  <linearGradient id="brandGrad" x1="3" y1="1" x2="29" y2="31">
                    <stop stopColor="#E61E4D" />
                    <stop offset="0.5" stopColor="#E31C5F" />
                    <stop offset="1" stopColor="#D70466" />
                  </linearGradient>
                </defs>
              </svg>
              <span
                className="hidden md:block font-bold text-xl"
                style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                KosovaBnB
              </span>
            </a>
          </div>

          {/* Center Search Pill */}
          <div className="flex-1 flex justify-center max-w-xl">
            <button
              onClick={() => setSearchOpen(true)}
              className="search-pill flex items-center gap-0 bg-white border border-border rounded-full h-12 cursor-pointer transition-all duration-200 hover:shadow-lg group w-full max-w-md"
            >
              <span className="px-4 text-sm font-semibold text-foreground whitespace-nowrap">
                {searchQuery || "Destinacioni"}
              </span>
              <div className="w-px h-6 bg-border" />
              <span className="px-4 text-sm font-semibold text-foreground whitespace-nowrap">Koha</span>
              <div className="w-px h-6 bg-border" />
              <span className="px-4 text-sm text-muted-foreground flex-1 text-left whitespace-nowrap">
                Shto udhëtarë
              </span>
              <div className="mr-2 h-8 w-8 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                <Search className="h-4 w-4 text-white" />
              </div>
            </button>
          </div>

          {/* Right Nav */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="hidden md:flex items-center h-10 px-4 rounded-full text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              Bëhu Host
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full text-foreground hover:bg-secondary transition-colors">
              <Globe className="h-5 w-5" />
            </button>
            <button className="flex items-center gap-2 border border-border rounded-full px-3 py-2 hover:shadow-md transition-all bg-white">
              <Menu className="h-4 w-4 text-foreground" />
              <div className="h-7 w-7 rounded-full bg-muted-foreground/30 flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-sm"
          >
            <motion.div
              ref={overlayRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white mx-4 md:mx-auto md:max-w-3xl mt-4 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Overlay Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <h2 className="text-lg font-semibold">Kërko vende</h2>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search Input */}
              <div className="px-6 pb-4">
                <div className="flex items-center gap-3 border-2 border-primary rounded-xl px-4 py-3">
                  <Search className="h-5 w-5 text-primary" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Kërko destinacionin..."
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Regions */}
              <div className="px-6 pb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Kërko sipas rajonit
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {regions.map((region) => (
                    <button
                      key={region.name}
                      onClick={() => handleRegionSelect(region.name)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <span className="text-2xl">{region.emoji}</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{region.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
