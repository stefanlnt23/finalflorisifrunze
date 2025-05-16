
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselImage {
  id: string;
  imageUrl: string;
  alt: string;
  order: number;
}

export function HomeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  
  // Initialize Embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "center"
  });

  const { data: carouselData, isLoading } = useQuery({
    queryKey: ['/api/carousel-images'],
    refetchOnWindowFocus: false,
  });

  const images: CarouselImage[] = carouselData?.images || [];

  // Effect to update current slide index when emblaApi is available
  useEffect(() => {
    if (emblaApi) {
      const onSelect = () => {
        setCurrentIndex(emblaApi.selectedScrollSnap());
      };
      
      emblaApi.on("select", onSelect);
      return () => {
        emblaApi.off("select", onSelect);
      };
    }
  }, [emblaApi]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || !emblaApi || images.length <= 1) return;

    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, emblaApi, images.length]);

  // Handle mouse interactions
  const handleMouseEnter = () => setAutoPlay(false);
  const handleMouseLeave = () => setAutoPlay(true);

  // Navigation handlers
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  // If there are no images, show at least a placeholder or fallback images
  if (isLoading) {
    return (
      <div className="relative w-full h-[400px] bg-gray-100 animate-pulse rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Fallback images if none are returned from the API
  const finalImages = images.length > 0 ? images : [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1558904541-efa843a96f01',
      alt: 'Garden landscape',
      order: 1
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
      alt: 'Beautiful garden',
      order: 2
    }
  ];

  return (
    <div 
      className="relative w-full" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex">
          {finalImages.map((image) => (
            <div key={image.id} className="flex-[0_0_100%] min-w-0">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.alt || "Carousel image"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation controls */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-green-700" />
      </button>
      
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-green-700" />
      </button>

      {/* Pagination indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {finalImages.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
