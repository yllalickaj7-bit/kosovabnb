import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { ListingRow } from "@/components/ListingRow";
import { SEOHead, createBreadcrumbSchema } from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

const serviceListings = [
  {
    id: "svc-1",
    title: "Transfer nga Aeroporti i Prishtinës",
    location: "Prishtinë, Kosovë",
    distance: "5 km larg",
    dates: "24/7",
    price: 25,
    rating: 4.93,
    images_url: [
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    ],
  },
  {
    id: "svc-2",
    title: "Fotograf profesional për udhëtime",
    location: "Prizren, Kosovë",
    distance: "85 km larg",
    dates: "Me rezervim",
    price: 50,
    rating: 4.98,
    images_url: [
      "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800",
    ],
  },
  {
    id: "svc-3",
    title: "Guidë turistike e certifikuar",
    location: "Prishtinë, Kosovë",
    distance: "5 km larg",
    dates: "Çdo ditë",
    price: 30,
    rating: 4.90,
    images_url: [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
    ],
  },
  {
    id: "svc-4",
    title: "Rent-a-Car me çmime të volitshme",
    location: "Prishtinë, Kosovë",
    distance: "5 km larg",
    dates: "24/7",
    price: 35,
    rating: 4.82,
    images_url: [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800",
    ],
  },
  {
    id: "svc-5",
    title: "Spa & Wellness në hotel",
    location: "Pejë, Kosovë",
    distance: "78 km larg",
    dates: "Çdo ditë",
    price: 45,
    rating: 4.87,
    images_url: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
      "https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800",
    ],
  },
  {
    id: "svc-6",
    title: "Përkthyes profesional",
    location: "Prishtinë, Kosovë",
    distance: "5 km larg",
    dates: "Me rezervim",
    price: 20,
    rating: 4.75,
    images_url: [
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800",
    ],
  },
];

const servicesByCity = [
  { city: "Prishtinë", listings: serviceListings.filter((l) => l.location.includes("Prishtinë")) },
  { city: "Prizren", listings: serviceListings.filter((l) => l.location.includes("Prizren")) },
  { city: "Pejë", listings: serviceListings.filter((l) => l.location.includes("Pejë")) },
].filter((g) => g.listings.length > 0);

const ServicesPage = () => {
  const { t } = useLanguage();

  const breadcrumbs = [
    { name: "KosovaBnB", url: "https://kosovabnb.lovable.app/" },
    { name: "Shërbime", url: "https://kosovabnb.lovable.app/services" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Shërbime Turistike në Kosovë | KosovaBnB"
        description="Gjej shërbime profesionale për udhëtimin tënd në Kosovë: transfer aeroporti, guidë turistike, rent-a-car, spa dhe më shumë."
        canonical="https://kosovabnb.lovable.app/services"
        jsonLd={createBreadcrumbSchema(breadcrumbs)}
      />
      <Header />
      <main className="max-w-[1760px] mx-auto px-4 sm:px-6 pt-[140px] sm:pt-[100px] pb-24 md:pb-8">
        <section className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {t("servicesTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("servicesDesc")}</p>
        </section>

        {servicesByCity.map(({ city, listings }) => (
          <ListingRow
            key={city}
            title={`${t("services")} ${t("in")} ${city}`}
            listings={listings}
          />
        ))}
      </main>
      <MobileNav />
    </div>
  );
};

export default ServicesPage;
