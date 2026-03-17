import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home, Building2, Castle, Tent } from "lucide-react";

const propertyTypes = [
  { value: "Apartamente", icon: Building2, label: "Apartament" },
  { value: "Vila", icon: Castle, label: "Vilë" },
  { value: "Hotele", icon: Home, label: "Hotel" },
  { value: "Kamping", icon: Tent, label: "Kamping" },
];

const BecomeHostPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(true);
    // For now just show success - can connect to backend later
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "🎉",
        description: "Aplikimi juaj u dërgua me sukses! Do ju kontaktojmë së shpejti.",
      });
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          KosovaBnB
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("becomeHostTitle")}</h1>
          <p className="text-muted-foreground">{t("becomeHostDesc")}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">{t("hostName")}</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">{t("hostPhone")}</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">{t("hostCity")}</label>
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-3">{t("propertyType")}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {propertyTypes.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setType(pt.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    type === pt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50 text-card-foreground"
                  }`}
                >
                  <pt.icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{pt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">{t("propertyDesc")}</label>
            <textarea
              required
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !type}
            className="w-full py-3 rounded-xl gradient-brand text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "..." : t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BecomeHostPage;
