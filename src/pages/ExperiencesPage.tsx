import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { ListingRow } from "@/components/ListingRow";
import { useLanguage } from "@/contexts/LanguageContext";

const experienceListings = [
  {
    id: "exp-1",
    title: "Hiking në Bjeshkët e Nemuna",
    location: "Pejë, Kosovë",
    distance: "78 km larg",
    dates: "Çdo javë",
    price: 35,
    rating: 4.92,
    images_url: [
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    ],
  },
  {
    id: "exp-2",
    title: "Kuzhinë tradicionale kosovare",
    location: "Prizren, Kosovë",
    distance: "85 km larg",
    dates: "E shtunë & e diel",
    price: 25,
    rating: 4.97,
    images_url: [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800",
      "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800",
    ],
  },
  {
    id: "exp-3",
    title: "Wine tasting në Rahovec",
    location: "Rahovec, Kosovë",
    distance: "70 km larg",
    dates: "Çdo e premte",
    price: 20,
    rating: 4.85,
    images_url: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
      "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800",
    ],
  },
  {
    id: "exp-4",
    title: "Natë kulturore me muzikë live",
    location: "Prizren, Kosovë",
    distance: "85 km larg",
    dates: "Çdo të premten",
    price: 15,
    rating: 4.88,
    images_url: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
    ],
  },
  {
    id: "exp-5",
    title: "Tura në qytetin e vjetër",
    location: "Prishtinë, Kosovë",
    distance: "5 km larg",
    dates: "Çdo ditë",
    price: 10,
    rating: 4.78,
    images_url: [
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800",
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800",
    ],
  },
  {
    id: "exp-6",
    title: "Rafting në Lumin e Drinit",
    location: "Pejë, Kosovë",
    distance: "78 km larg",
    dates: "Maj - Shtator",
    price: 40,
    rating: 4.95,
    images_url: [
      "https://images.unsplash.com/photo-1530866495561-507c83d09e65?w=800",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
    ],
  },
];

const experiencesByCity = [
  { city: "Pejë", listings: experienceListings.filter((l) => l.location.includes("Pejë")) },
  { city: "Prizren", listings: experienceListings.filter((l) => l.location.includes("Prizren")) },
  { city: "Prishtinë", listings: experienceListings.filter((l) => l.location.includes("Prishtinë")) },
  { city: "Rahovec", listings: experienceListings.filter((l) => l.location.includes("Rahovec")) },
].filter((g) => g.listings.length > 0);

const ExperiencesPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1760px] mx-auto px-4 sm:px-6 pt-[140px] sm:pt-[100px] pb-24 md:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {t("experiencesTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("experiencesDesc")}</p>
        </div>

        {experiencesByCity.map(({ city, listings }) => (
          <ListingRow
            key={city}
            title={`${t("experiences")} ${t("in")} ${city}`}
            listings={listings}
          />
        ))}
      </main>
      <MobileNav />
    </div>
  );
};

export default ExperiencesPage;
