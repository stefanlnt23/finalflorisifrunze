
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
}

export default function FeaturesSection() {
  const { data: featureCardsData, isLoading } = useQuery({
    queryKey: ['/api/feature-cards'],
    refetchOnWindowFocus: false,
  });

  const features: FeatureCard[] = featureCardsData?.cards || [];
  const [autoPlay, setAutoPlay] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Initialize Embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  // Effect to update current slide when emblaApi is available
  useEffect(() => {
    if (emblaApi) {
      const onSelect = () => {
        setCurrentSlide(emblaApi.selectedScrollSnap());
      };
      
      emblaApi.on("select", onSelect);
      return () => {
        emblaApi.off("select", onSelect);
      };
    }
  }, [emblaApi]);

  // Auto-rotate carousel
  useEffect(() => {
    if (!autoPlay || !emblaApi || features.length <= 4) return;

    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, emblaApi, features.length]);

  // Pause autoplay on hover
  const handleMouseEnter = () => setAutoPlay(false);
  const handleMouseLeave = () => setAutoPlay(true);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100 animate-pulse h-72">
            <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5 mt-1"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
            De Ce Să Ne Alegeți
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">De Ce Să Ne Alegeți</h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-gray-600">
            Suntem dedicați să oferim servicii excepționale pentru grădină cu expertiză și grijă.
          </p>
        </div>

        {features.length > 0 && (
          <div 
            className="relative" 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
          >
            {features.length <= 4 ? (
              // Regular grid for 4 or fewer items
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature) => (
                  <div key={feature.id} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow h-full">
                    {feature.imageUrl && (
                      <div className="mb-4 h-48 overflow-hidden rounded-lg">
                        <img 
                          src={feature.imageUrl} 
                          alt={feature.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              // Carousel for more than 4 items
              <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {features.map((feature) => (
                      <div 
                        key={feature.id} 
                        className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] px-3"
                      >
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow h-full">
                          {feature.imageUrl && (
                            <div className="mb-4 h-48 overflow-hidden rounded-lg">
                              <img 
                                src={feature.imageUrl} 
                                alt={feature.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                          <p className="text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={() => emblaApi?.scrollPrev()}
                  className="absolute top-1/2 -left-4 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-green-50 border border-green-200 z-10 hidden md:flex items-center justify-center"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-6 w-6 text-green-600" />
                </button>
                
                <button
                  onClick={() => emblaApi?.scrollNext()}
                  className="absolute top-1/2 -right-4 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-green-50 border border-green-200 z-10 hidden md:flex items-center justify-center"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-6 w-6 text-green-600" />
                </button>

                {/* Slide indicators */}
                <div className="flex justify-center mt-6 space-x-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        currentSlide === index ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                      onClick={() => emblaApi?.scrollTo(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
