import { Home, Heart, LogIn, User, Compass, Briefcase } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const items = [
    { icon: Home, label: t("homes"), path: "/" },
    { icon: Compass, label: t("experiences"), path: "/experiences" },
    { icon: Briefcase, label: t("services"), path: "/services" },
    { icon: Heart, label: t("wishlist"), path: "/wishlists" },
    ...(user
      ? [{ icon: User, label: "Profili", path: "/profile" }]
      : [{ icon: LogIn, label: t("login"), path: "/auth" }]),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {items.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 min-w-0"
            >
              <Icon
                className={`h-5 w-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[9px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-safe-bottom" />
    </nav>
  );
};
