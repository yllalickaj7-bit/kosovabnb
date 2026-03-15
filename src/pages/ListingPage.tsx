import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Star, ArrowLeft, Heart, Share, Wifi, Utensils, Car, Wind, Users, Bed, Bath, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { BookingWidget } from "@/components/BookingWidget";
import { MobileNav } from "@/components/MobileNav";
import { LeafletMap } from "@/components/LeafletMap";

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
        <div className="max-w-6xl mx-auto px-6 pt-28">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/2" />
            <div className="grid grid-cols-4 gap-2 h-96">
              <div className="col-span-2 row-span-2 bg-secondary rounded-xl" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-secondary rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const images = listing.images_url || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-24 md:pb-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kthehu
        </button>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {listing.title}
        </h1>

        {/* Rating / Location Row */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-foreground text-foreground" />
            <span className="font-semibold">{Number(listing.rating).toFixed(2)}</span>
            <span className="text-muted-foreground ml-1">(24 komente)</span>
          </div>
          <span className="text-foreground underline font-medium cursor-pointer">{listing.location}</span>
          <div className="flex items-center gap-3 ml-auto">
            <button className="flex items-center gap-1.5 underline font-medium text-sm hover:text-primary transition-colors">
              <Share className="h-4 w-4" />
              Ndaj
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="flex items-center gap-1.5 underline font-medium text-sm hover:text-primary transition-colors"
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-primary text-primary" : ""}`} />
              Ruaj
            </button>
          </div>
        </div>

        {/* Image Grid */}
        <div className="hidden md:grid grid-cols-4 gap-2 h-[480px] rounded-2xl overflow-hidden mb-8">
          {/* Main image */}
          <div className="col-span-2 row-span-2 relative">
            <img
              src={images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"; }}
            />
          </div>
          {/* Small images */}
          {images.slice(1, 5).map((img, i) => (
            <div key={i} className="relative overflow-hidden">
              <img
                src={img}
                alt={`${listing.title} ${i + 2}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"; }}
              />
            </div>
          ))}
        </div>

        {/* Mobile Image Carousel */}
        <div className="md:hidden relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
          <img
            src={images[galleryIndex]}
            alt={listing.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"; }}
          />
          <button
            onClick={() => setGalleryIndex(prev => Math.max(0, prev - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setGalleryIndex(prev => Math.min(images.length - 1, prev + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 right-3 bg-foreground/70 text-white text-xs font-medium px-2 py-1 rounded-full">
            {galleryIndex + 1} / {images.length}
          </div>
        </div>

        {/* Content + Widget Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          {/* Left: Details */}
          <div>
            {/* Host info */}
            <div className="flex items-center justify-between py-6 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold">
                  E mirëpritur nga {listing.host_name}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {listing.guests} mysafirë · {listing.bedrooms} dhoma gjumi · {listing.bathrooms} banjo
                </p>
              </div>
              <div className="h-12 w-12 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {(listing.host_name || "H").charAt(0)}
              </div>
            </div>

            {/* Highlights */}
            <div className="py-6 border-b border-border space-y-4">
              {[
                { icon: Star, title: "E vlerësuar lart", desc: `Ky vend ka notë ${Number(listing.rating).toFixed(1)} nga mysafirët` },
                { icon: Users, title: "I mirë për grupe", desc: `Deri në ${listing.guests} mysafirë` },
                { icon: Bed, title: `${listing.bedrooms} dhoma gjumi`, desc: "Hapësira private për pushim" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <Icon className="h-6 w-6 text-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="py-6 border-b border-border">
                <p className="text-sm text-foreground leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="py-6 border-b border-border">
                <h3 className="text-lg font-semibold mb-4">Çfarë ofrohet</h3>
                <div className="grid grid-cols-2 gap-3">
                  {listing.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity] || Wifi;
                    return (
                      <div key={amenity} className="flex items-center gap-3 text-sm">
                        <Icon className="h-5 w-5 text-foreground" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Map */}
            {(listing as any).lat && (listing as any).lng && (
              <div className="py-6">
                <h3 className="text-lg font-semibold mb-4">Ku do të jeni</h3>
                <LeafletMap lat={(listing as any).lat} lng={(listing as any).lng} title={listing.title} />
                <p className="text-sm text-muted-foreground mt-2">{listing.location}</p>
              </div>
            )}
          </div>

          {/* Right: Booking Widget */}
          <div className="hidden lg:block">
            <BookingWidget
              price={listing.price}
              rating={Number(listing.rating)}
              listingTitle={listing.title}
              location={listing.location}
            />
          </div>
        </div>

        {/* Mobile Booking Bar */}
        <div className="fixed bottom-16 left-0 right-0 md:bottom-0 lg:hidden bg-white border-t border-border px-6 py-3 z-40">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-lg">€{listing.price}</span>
              <span className="text-muted-foreground text-sm"> nata</span>
            </div>
            <button
              onClick={() => {
                const msg = `Përshëndetje! Jam i interesuar për: *${listing.title}* në ${listing.location}. Çmimi: €${listing.price}/nata.`;
                window.open(`https://wa.me/38349000000?text=${encodeURIComponent(msg)}`, "_blank");
              }}
              className="gradient-brand text-white font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              Rezervo
            </button>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default ListingPage;
