import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Menu, User, X, MapPin, Moon, Sun, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

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

type TabType = "homes" | "experiences" | "services";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header = ({ onSearch }: HeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  const activeTab: TabType =
    location.pathname === "/experiences" ? "experiences" :
    location.pathname === "/services" ? "services" : "homes";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (searchOpen || menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen, menuOpen]);

  const handleRegionSelect = (region: string) => {
    setSearchQuery(region);
    setSearchOpen(false);
    onSearch?.(region);
  };

  const tabs: { key: TabType; label: string; path: string; isNew?: boolean }[] = [
    { key: "homes", label: t("homes"), path: "/" },
    { key: "experiences", label: t("experiences"), path: "/experiences", isNew: true },
    { key: "services", label: t("services"), path: "/services", isNew: true },
  ];

  return (
    <>
      <header className="glass fixed top-0 left-0 right-0 z-50 h-20" role="banner">
        <div className="max-w-[1760px] mx-auto px-6 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-1">
              <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none">
                <path d="M16 1C8.82 1 3 6.82 3 14c0 3.5 1.35 6.68 3.56 9.06L16 31l9.44-7.94C27.65 20.68 29 17.5 29 14c0-7.18-5.82-13-13-13z" fill="url(#brandGrad)" />
                <defs>
                  <linearGradient id="brandGrad" x1="3" y1="1" x2="29" y2="31">
                    <stop stopColor="#E61E4D" />
                    <stop offset="0.5" stopColor="#E31C5F" />
                    <stop offset="1" stopColor="#D70466" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="hidden md:block font-bold text-xl" style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                KosovaBnB
              </span>
            </a>
          </div>

          {/* Center Tabs */}
          <div className="hidden sm:flex items-center gap-1 bg-secondary/60 rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => navigate(tab.path)}
                className={`relative flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.isNew && (
                  <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full gradient-brand text-white text-[9px] font-bold leading-none">
                    NEW
                  </span>
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Nav */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate("/planner")}
              className="hidden lg:flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-semibold text-white gradient-brand hover:opacity-90 transition-opacity"
            >
              ✨ Planifikues AI
            </button>
            <button
              onClick={() => navigate("/become-host")}
              className="hidden md:flex items-center h-10 px-4 rounded-full text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              {t("becomeHost")}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "sq" ? "en" : "sq")}
              className="h-10 w-10 flex items-center justify-center rounded-full text-foreground hover:bg-secondary transition-colors text-xs font-bold"
              title={t("language")}
            >
              {lang === "sq" ? "EN" : "SQ"}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="h-10 w-10 flex items-center justify-center rounded-full text-foreground hover:bg-secondary transition-colors"
              title={theme === "light" ? t("darkMode") : t("lightMode")}
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 border border-border rounded-full px-3 py-2 hover:shadow-md transition-all bg-card"
              >
                <Menu className="h-4 w-4 text-foreground" />
                <div className={`h-7 w-7 rounded-full flex items-center justify-center ${user ? "gradient-brand" : "bg-muted-foreground/30"}`}>
                  <User className={`h-4 w-4 ${user ? "text-white" : "text-muted-foreground"}`} />
                </div>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-14 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <button onClick={() => { navigate("/planner"); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors">✨ Planifikuesi i udhëtimit (AI)</button>
                    <button onClick={() => { navigate("/simulator"); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors">📈 Simulatori i çmimeve</button>
                    <button onClick={() => { navigate("/host/revenue"); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors">💶 Revenue Manager</button>
                    <div className="border-t border-border" />
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => { navigate("/bookings"); setMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          Rezervimet e mia
                        </button>
                        <button
                          onClick={() => { navigate("/host"); setMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          Paneli i host-it
                        </button>
                        <button
                          onClick={() => { navigate("/host/revenue"); setMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          Revenue Manager
                        </button>
                        <button
                          onClick={() => { navigate("/planner"); setMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          Planifikuesi i udhëtimit
                        </button>
                        <button
                          onClick={() => { navigate("/simulator"); setMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          Simulatori i çmimeve
                        </button>
                        <button
                          onClick={() => { signOut(); setMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          {t("logout")}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { navigate("/auth"); setMenuOpen(false); }}
                          className="w-full px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors text-left"
                        >
                          {t("login")}
                        </button>
                        <button
                          onClick={() => { navigate("/auth"); setMenuOpen(false); }}
                          className="w-full px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                        >
                          {t("signup")}
                        </button>
                      </>
                    )}
                    <div className="border-t border-border">
                      <button
                        onClick={() => { navigate("/become-host"); setMenuOpen(false); }}
                        className="w-full px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                      >
                        {t("becomeHost")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Bar - fixed below header */}
      <nav className="sm:hidden glass fixed top-20 left-0 right-0 z-40" aria-label="Navigimi kryesor">
        <div className="flex items-center justify-center gap-2 px-4 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={`relative flex-1 py-2.5 rounded-full text-sm font-medium transition-all text-center ${
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.isNew && (
                <span className="absolute -top-2 left-1/2 translate-x-2 px-1.5 py-0.5 rounded-full gradient-brand text-white text-[8px] font-bold leading-none">
                  NEW
                </span>
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-sm">
            <motion.div ref={overlayRef} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="bg-card mx-4 md:mx-auto md:max-w-3xl mt-4 rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <h2 className="text-lg font-semibold text-card-foreground">{t("searchPlaces")}</h2>
                <button onClick={() => setSearchOpen(false)} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 pb-4">
                <div className="flex items-center gap-3 border-2 border-primary rounded-xl px-4 py-3">
                  <Search className="h-5 w-5 text-primary" />
                  <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("searchDestination")} className="flex-1 text-sm outline-none bg-transparent text-foreground" />
                </div>
              </div>
              <div className="px-6 pb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("searchByRegion")}</p>
                <div className="grid grid-cols-4 gap-3">
                  {regions.map((region) => (
                    <button key={region.name} onClick={() => handleRegionSelect(region.name)} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group">
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
