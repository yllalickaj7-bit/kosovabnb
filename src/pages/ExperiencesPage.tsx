import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { Compass, Mountain, Utensils, Music } from "lucide-react";

const experiences = [
  { icon: Mountain, title: "Hiking në Bjeshkët e Nemuna", desc: "Udhëtim 3-ditor në malet e Pejës", emoji: "🏔️" },
  { icon: Utensils, title: "Kuzhinë tradicionale", desc: "Mëso receta kosovare me vendorë", emoji: "🍽️" },
  { icon: Music, title: "Natë kulturore në Prizren", desc: "Muzikë live dhe art lokal", emoji: "🎵" },
  { icon: Compass, title: "Tura në qytetin e vjetër", desc: "Eksploro historinë e Prishtinës", emoji: "🏛️" },
];

const ExperiencesPage = () => {
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
            {t("experiencesTitle")}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">{t("experiencesDesc")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {experiences.map((exp) => (
            <div
              key={exp.title}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-all group cursor-pointer"
            >
              <span className="text-4xl mb-4 block">{exp.emoji}</span>
              <h3 className="font-semibold text-card-foreground mb-1">{exp.title}</h3>
              <p className="text-sm text-muted-foreground">{exp.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default ExperiencesPage;
