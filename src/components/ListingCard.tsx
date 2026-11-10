import { useState, useRef, useCallback } from "react";
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

  // Touch swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const swipeDelta = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isSwiping.current = false;
    swipeDelta.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    swipeDelta.current = touchStartX.current - touchEndX.current;
    if (Math.abs(swipeDelta.current) > 10) {
      isSwiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    const threshold = 40;
    if (swipeDelta.current > threshold && currentImage < images.length - 1) {
      setCurrentImage(prev => prev + 1);
    } else if (swipeDelta.current < -threshold && currentImage > 0) {
      setCurrentImage(prev => prev - 1);
    }
    isSwiping.current = false;
    swipeDelta.current = 0;
  }, [currentImage, images.length]);

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleCardClick = () => {
    if (!isSwiping.current) {
      navigate(`/listing/${id}`);
    }
  };

  // Show max 5 dots, centered around current
  const maxDots = 5;
  const totalImages = images.length;
  let dotStart = 0;
  let dotEnd = totalImages;
  if (totalImages > maxDots) {
    dotStart = Math.max(0, currentImage - Math.floor(maxDots / 2));
    dotEnd = dotStart + maxDots;
    if (dotEnd > totalImages) {
      dotEnd = totalImages;
      dotStart = dotEnd - maxDots;
    }
  }
  const visibleDots = images.slice(dotStart, dotEnd);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-pointer group"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image Container */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-secondary mb-3 card-shadow group-hover:card-shadow-hover transition-shadow duration-300"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={currentImage}
            src={images[currentImage] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"}
            alt={`${title} - ${location}`}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 0.15 }}
            className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-105"
            draggable={false}
            loading="lazy"
            width={400}
            height={400}
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

        {/* Carousel Controls - desktop hover arrows */}
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

            {/* Dot Indicators - Airbnb style with max 5 visible, scaling */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-[5px]">
              {visibleDots.map((_, i) => {
                const realIndex = dotStart + i;
                const isActive = realIndex === currentImage;
                const distFromActive = Math.abs(realIndex - currentImage);
                const isEdge = (i === 0 && dotStart > 0) || (i === visibleDots.length - 1 && dotEnd < totalImages);
                
                let size = isActive ? 7 : distFromActive === 1 ? 5.5 : 4.5;
                if (isEdge && !isActive) size = 3.5;

                return (
                  <div
                    key={realIndex}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: isActive ? "white" : "rgba(255,255,255,0.5)",
                    }}
                  />
                );
              })}
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
        <p className="text-sm text-foreground mt-1.5">
          <span className="inline-block rounded-full bg-primary/10 text-primary font-bold px-2.5 py-0.5">€{price}</span>
          <span className="text-muted-foreground font-normal ml-1">/ natë</span>
        </p>
      </div>
    </motion.div>
  );
};
