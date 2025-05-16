
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ServicesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['/api/services'],
    refetchOnWindowFocus: false,
  });

  const services = servicesData?.services || [];
  const totalSlides = services.length;

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  };

  // Handle auto-play
  useEffect(() => {
    if (autoPlay && totalSlides > 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 4000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, totalSlides, currentIndex]);

  // Handle mouse interactions
  const handleMouseEnter = () => {
    setAutoPlay(false);
  };
  
  const handleMouseLeave = () => {
    setAutoPlay(true);
  };

  // Slide indicators
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <div className="animate-pulse w-8 h-8 bg-green-200 rounded-full"></div>
              </div>
              <div className="space-y-3 w-full">
                <div className="animate-pulse h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="animate-pulse h-4 bg-gray-100 rounded w-full"></div>
                <div className="animate-pulse h-4 bg-gray-100 rounded w-5/6 mx-auto"></div>
                <div className="animate-pulse h-4 bg-gray-100 rounded w-4/6 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No services available at the moment.</p>
      </div>
    );
  }

  // Show 1 card on mobile, 2 on tablets, 3 on desktop
  const visibleSlides = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  };

  // Display the correct number of slides based on viewport
  const getVisibleCards = () => {
    // Use a flexible slice approach to show the right number of cards
    const cards = [];
    
    // Determine how many cards to show (simplified - would be better with a responsive hook)
    const visibleCount = window.innerWidth < 640 ? visibleSlides.mobile : 
                         window.innerWidth < 1024 ? visibleSlides.tablet : 
                         visibleSlides.desktop;
    
    // Create a wrapped index array to handle looping
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % totalSlides;
      cards.push(services[index]);
    }
    
    return cards;
  };

  return (
    <div 
      className="relative w-full" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={sliderRef}
    >
      {/* Main slider content */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / visibleSlides.desktop)}%)` }}
        >
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className="min-w-full sm:min-w-[50%] md:min-w-[33.333%] px-2 md:px-4 transition-all duration-300"
            >
              <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 h-full">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4 h-full">
                  {service.imageUrl ? (
                    <div className="w-full h-40 overflow-hidden rounded-md mb-4">
                      <img 
                        src={service.imageUrl} 
                        alt={service.name} 
                        className="w-full h-full object-cover transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                      <span className="text-green-600 text-2xl">
                        <i className="fas fa-leaf"></i>
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-gray-600 flex-grow">
                    {service.description.length > 120
                      ? `${service.description.substring(0, 120)}...`
                      : service.description}
                  </p>
                  <div className="w-full flex flex-col items-center mt-auto">
                    <span className="text-green-600 font-semibold mb-3">{service.price}</span>
                    <Link href={`/services/${service.id}`}>
                      <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation arrows */}
      <button 
        onClick={prevSlide}
        className="absolute top-1/2 left-0 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-green-50 border border-green-200 z-10 hidden md:flex items-center justify-center"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-green-600" />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute top-1/2 right-0 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-green-50 border border-green-200 z-10 hidden md:flex items-center justify-center"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-green-600" />
      </button>
      
      {/* Slide indicators */}
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              index === currentIndex ? "bg-green-600" : "bg-gray-300"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
