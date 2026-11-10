import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Star, ArrowLeft, Heart, Share, Wifi, Utensils, Car, Wind, Users, Bed, Bath, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { BookingWidget } from "@/components/BookingWidget";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { MobileNav } from "@/components/MobileNav";
import { PriceInsight } from "@/components/PriceInsight";
import { LeafletMap } from "@/components/LeafletMap";
import { SEOHead, createProductSchema, createBreadcrumbSchema } from "@/components/SEOHead";

const amenityIcons: Record<string, React.ElementType> = {
  "Wi-Fi": Wifi,
  "Kuzhinë": Utensils,
  "Parking": Car,
  "Ajër i kondicionuar": Wind,
};

const ListingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-6xl mx-auto px-6 pt-28">
          <div className="animate-pulse space-y-4" aria-busy="true">
            <div className="h-8 bg-secondary rounded w-1/2" />
            <div className="grid grid-cols-4 gap-2 h-96">
              <div className="col-span-2 row-span-2 bg-secondary rounded-xl" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-secondary rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!listing) return null;

  const images = listing.images_url || [];

  const breadcrumbs = [
    { name: "KosovaBnB", url: "https://kosovabnb.lovable.app/" },
    { name: listing.location.split(",")[0].trim(), url: `https://kosovabnb.lovable.app/?search=${encodeURIComponent(listing.location.split(",")[0].trim())}` },
    { name: listing.title, url: `https://kosovabnb.lovable.app/listing/${listing.id}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${listing.title} – ${listing.location} | KosovaBnB`}
        description={listing.description || `${listing.title} në ${listing.location}. ${listing.bedrooms} dhoma gjumi, ${listing.bathrooms} banjo, deri në ${listing.guests} mysafirë. Çmimi: €${listing.price}/natë.`}
        canonical={`https://kosovabnb.lovable.app/listing/${listing.id}`}
        ogImage={images[0]}
        ogType="product"
        jsonLd={[createProductSchema(listing), createBreadcrumbSchema(breadcrumbs)]}
      />
      <Header />

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-24 md:pb-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li><a href="/" className="hover:text-foreground transition-colors">KosovaBnB</a></li>
            <li aria-hidden="true">/</li>
            <li><a href={`/?search=${encodeURIComponent(listing.location.split(",")[0].trim())}`} className="hover:text-foreground transition-colors">{listing.location.split(",")[0].trim()}</a></li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground font-medium truncate max-w-[200px]" aria-current="page">{listing.title}</li>
          </ol>
        </nav>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {listing.title}
        </h1>

        {/* Rating / Location Row */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-foreground text-foreground" aria-hidden="true" />
            <span className="font-semibold">{Number(listing.rating).toFixed(2)}</span>
            <span className="text-muted-foreground ml-1">(24 komente)</span>
          </div>
          <span className="text-foreground underline font-medium cursor-pointer">{listing.location}</span>
          <div className="flex items-center gap-3 ml-auto">
            <button className="flex items-center gap-1.5 underline font-medium text-sm hover:text-primary transition-colors" aria-label="Ndaj këtë vendbanim">
              <Share className="h-4 w-4" aria-hidden="true" />
              Ndaj
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="flex items-center gap-1.5 underline font-medium text-sm hover:text-primary transition-colors"
              aria-label={liked ? "Hiq nga të preferuarat" : "Ruaj në të preferuara"}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-primary text-primary" : ""}`} aria-hidden="true" />
              Ruaj
            </button>
          </div>
        </div>

        {/* Image Grid */}
        <div className="hidden md:grid grid-cols-4 gap-2 h-[480px] rounded-2xl overflow-hidden mb-8">
          <div className="col-span-2 row-span-2 relative">
            <img
              src={images[0]}
              alt={`${listing.title} - foto kryesore`}
              className="w-full h-full object-cover"
              loading="eager"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"; }}
            />
          </div>
          {images.slice(1, 5).map((img, i) => (
            <div key={i} className="relative overflow-hidden">
              <img
                src={img}
                alt={`${listing.title} - foto ${i + 2}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"; }}
              />
            </div>
          ))}
        </div>

        {/* Mobile Image Carousel */}
        <div className="md:hidden relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
          <img
            src={images[galleryIndex]}
            alt={`${listing.title} - foto ${galleryIndex + 1}`}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"; }}
          />
          <button
            onClick={() => setGalleryIndex(prev => Math.max(0, prev - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow"
            aria-label="Foto e mëparshme"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => setGalleryIndex(prev => Math.min(images.length - 1, prev + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow"
            aria-label="Foto tjetër"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="absolute bottom-3 right-3 bg-foreground/70 text-white text-xs font-medium px-2 py-1 rounded-full" aria-label={`Foto ${galleryIndex + 1} nga ${images.length}`}>
            {galleryIndex + 1} / {images.length}
          </div>
        </div>

        {/* Content + Widget Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          {/* Left: Details */}
          <article>
            {/* Host info */}
            <section className="flex items-center justify-between py-6 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold">
                  E mirëpritur nga {listing.host_name}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {listing.guests} mysafirë · {listing.bedrooms} dhoma gjumi · {listing.bathrooms} banjo
                </p>
              </div>
              <div className="h-12 w-12 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-lg flex-shrink-0" aria-hidden="true">
                {(listing.host_name || "H").charAt(0)}
              </div>
            </section>

            {/* Highlights */}
            <section className="py-6 border-b border-border space-y-4" aria-label="Veçoritë kryesore">
              {[
                { icon: Star, title: "E vlerësuar lart", desc: `Ky vend ka notë ${Number(listing.rating).toFixed(1)} nga mysafirët` },
                { icon: Users, title: "I mirë për grupe", desc: `Deri në ${listing.guests} mysafirë` },
                { icon: Bed, title: `${listing.bedrooms} dhoma gjumi`, desc: "Hapësira private për pushim" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <Icon className="h-6 w-6 text-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-medium text-sm">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Description */}
            {listing.description && (
              <section className="py-6 border-b border-border" aria-label="Përshkrimi">
                <p className="text-sm text-foreground leading-relaxed">{listing.description}</p>
              </section>
            )}

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <section className="py-6 border-b border-border" aria-label="Pajisjet">
                <h3 className="text-lg font-semibold mb-4">Çfarë ofrohet</h3>
                <ul className="grid grid-cols-2 gap-3">
                  {listing.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity] || Wifi;
                    return (
                      <li key={amenity} className="flex items-center gap-3 text-sm">
                        <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
                        <span>{amenity}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <section className="py-6"><PriceInsight id={listing.id} type={listing.type} price={Number(listing.price)} /></section>

            {/* Map */}
            {(listing as any).lat && (listing as any).lng && (
              <section className="py-6" aria-label="Vendndodhja në hartë">
                <h3 className="text-lg font-semibold mb-4">Ku do të jeni</h3>
                <LeafletMap lat={(listing as any).lat} lng={(listing as any).lng} title={listing.title} />
                <p className="text-sm text-muted-foreground mt-2">{listing.location}</p>
              </section>
            )}
          </article>

          {/* Right: Booking Widget */}
          <aside className="hidden lg:block">
            <BookingWidget
              listingId={listing.id}
              price={listing.price}
              rating={Number(listing.rating)}
              listingTitle={listing.title}
              location={listing.location}
            />
          </aside>
        </div>

        {/* Mobile Booking Bar */}
        <div className="fixed bottom-16 left-0 right-0 md:bottom-0 lg:hidden bg-card border-t border-border px-6 py-3 z-40">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-lg">€{listing.price}</span>
              <span className="text-muted-foreground text-sm"> natë</span>
            </div>
            <button
              onClick={() => setMobileBookingOpen(true)}
              className="gradient-brand text-white font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              Rezervo
            </button>
          </div>
        </div>
      </main>

      <Drawer open={mobileBookingOpen} onOpenChange={setMobileBookingOpen}>
        <DrawerContent className="max-h-[90vh] overflow-y-auto px-4 pb-8">
          <DrawerHeader>
            <DrawerTitle>Rezervo {listing.title}</DrawerTitle>
          </DrawerHeader>
          <BookingWidget
            listingId={listing.id}
            price={listing.price}
            rating={Number(listing.rating)}
            listingTitle={listing.title}
            location={listing.location}
          />
        </DrawerContent>
      </Drawer>

      <MobileNav />
    </div>
  );
};

export default ListingPage;
