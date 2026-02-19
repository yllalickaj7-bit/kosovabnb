import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ListingCardProps {
  id: string;
  title: string;
  location: string;
  distance: string;
  dates: string;
  price: number;
  rating: number;
  images: string[];
}

export const ListingCard = ({ id, title, location, distance, dates, price, rating, images }: ListingCardProps) => {
  const [liked, setLiked] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-pointer group"
      onClick={() => navigate(`/listing/${id}`)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary mb-3">
        {/* Images */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={images[currentImage] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"}
            alt={title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800";
            }}
          />
        </AnimatePresence>

        {/* Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-3 right-3 z-10 p-1"
        >
          <motion.div
            animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`h-6 w-6 drop-shadow-sm transition-colors ${
                liked ? "fill-primary text-primary" : "fill-white/30 text-white"
              }`}
            />
          </motion.div>
        </button>

        {/* Carousel Controls */}
        {images.length > 1 && (
          <>
            <AnimatePresence>
              {isHovering && (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={prevImage}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center ${currentImage === 0 ? "opacity-0 pointer-events-none" : ""}`}
                  >
                    <ChevronLeft className="h-4 w-4 text-foreground" />
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={nextImage}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center ${currentImage === images.length - 1 ? "opacity-0 pointer-events-none" : ""}`}
                  >
                    <ChevronRight className="h-4 w-4 text-foreground" />
                  </motion.button>
                </>
              )}
            </AnimatePresence>

            {/* Dot Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-200 ${
                    i === currentImage ? "w-2 h-2 bg-white" : "w-1.5 h-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-1 flex-1">
            {title}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
            <span className="text-sm font-medium">{rating.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{location}</p>
        <p className="text-sm text-muted-foreground">{distance}</p>
        <p className="text-sm text-muted-foreground">{dates}</p>
        <p className="text-sm text-foreground mt-1">
          <span className="font-semibold">€{price}</span>
          <span className="text-muted-foreground font-normal"> nata</span>
        </p>
      </div>
    </motion.div>
  );
};
