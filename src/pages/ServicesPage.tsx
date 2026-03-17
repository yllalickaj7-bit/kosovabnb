import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { Car, Camera, ShieldCheck, Luggage } from "lucide-react";

const services = [
  { icon: Car, title: "Transport", desc: "Transfer nga aeroporti dhe transport lokal", emoji: "🚗" },
  { icon: Camera, title: "Fotografi", desc: "Fotografë profesional për udhëtimin tënd", emoji: "📸" },
  { icon: ShieldCheck, title: "Sigurime udhëtimi", desc: "Mbroje udhëtimin me sigurim gjithëpërfshirës", emoji: "🛡️" },
  { icon: Luggage, title: "Guida turistike", desc: "Guida lokale me përvojë në të gjitha qytetet", emoji: "🧳" },
];

const ServicesPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1760px] mx-auto px-4 sm:px-6 pt-[144px] pb-24 md:pb-8">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full gradient-brand text-white text-xs font-semibold mb-4">
            {t("comingSoon")}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {t("servicesTitle")}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">{t("servicesDesc")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {services.map((svc) => (
            <div
              key={svc.title}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-all group cursor-pointer"
            >
              <span className="text-4xl mb-4 block">{svc.emoji}</span>
              <h3 className="font-semibold text-card-foreground mb-1">{svc.title}</h3>
              <p className="text-sm text-muted-foreground">{svc.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default ServicesPage;
