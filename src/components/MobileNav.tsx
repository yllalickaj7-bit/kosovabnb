import { Home, Heart, LogIn } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { icon: Home, label: "Eksploro", path: "/", active: true },
    { icon: Heart, label: "Dëshirat", path: "/wishlists" },
    { icon: LogIn, label: "Hyr", path: "/login" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-border">
      <div className="flex items-center justify-around py-2">
        {items.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const isExplore = label === "Eksploro";
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 py-1 px-4 min-w-0"
            >
              <Icon
                className={`h-6 w-6 transition-colors ${
                  isActive && isExplore
                    ? "text-primary"
                    : isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive && isExplore
                    ? "text-primary"
                    : isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
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
