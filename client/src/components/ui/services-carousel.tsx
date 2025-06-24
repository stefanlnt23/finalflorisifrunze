
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Clock, Leaf } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SafeImage } from "./safe-image";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
}

interface ServicesData {
  services: Service[];
}

export function ServicesCarousel() {
  // Keep all useState calls at the top to maintain order
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  // Add state to track if this is the initial render
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  // Refs after state
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const isMobile = useIsMobile();
  
  // Set isInitialRender to false after the first render
  useEffect(() => {
    // Use a timeout to ensure the animation plays on the first render
    const timer = setTimeout(() => {
      setIsInitialRender(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Query
  const { data: servicesData, isLoading } = useQuery<ServicesData>({
    queryKey: ['/api/services'],
    refetchOnWindowFocus: false,
    staleTime: Infinity, // Never refetch unless manually invalidated
    gcTime: Infinity, // Keep in cache indefinitely
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
    retry: 1 // Only retry once on failure
  });

  const services = servicesData?.services || [];
  const totalSlides = services.length;

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % Math.max(1, totalSlides - 2));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + Math.max(1, totalSlides - 2)) % Math.max(1, totalSlides - 2));
  };

  // Handle auto-play with infinite loop
  useEffect(() => {
    if (autoPlay && totalSlides > 3) {
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
    if (index < Math.max(1, totalSlides - 2)) {
      setCurrentIndex(index);
    }
  };

  // Handle touch events for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setAutoPlay(false); // Pause autoplay on touch
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swipe left
      nextSlide();
    }
    
    if (touchEnd - touchStart > 75) {
      // Swipe right
      prevSlide();
    }
    
    // Resume autoplay after touch ends
    setAutoPlay(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="service-card-skeleton">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-2">
                <div className="animate-pulse w-10 h-10 bg-green-100 rounded-full"></div>
              </div>
              <div className="space-y-3 w-full">
                <div className="animate-pulse h-6 bg-gray-100 rounded w-3/4 mx-auto"></div>
                <div className="animate-pulse h-4 bg-gray-50 rounded w-full"></div>
                <div className="animate-pulse h-4 bg-gray-50 rounded w-5/6 mx-auto"></div>
                <div className="animate-pulse h-4 bg-gray-50 rounded w-4/6 mx-auto"></div>
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
  
  // If we have 3 or fewer services, just display them without carousel functionality
  if (services.length <= 3) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service: Service) => (
          <Card key={service.id} className="service-card-inner h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-2xl hover:scale-[1.02] hover:-translate-y-2">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4 h-full">
              {service.imageUrl ? (
                <div className="relative w-full h-48 overflow-hidden rounded-lg mb-4 service-image-container" style={{ willChange: 'auto' }}>
                  <SafeImage 
                    src={service.imageUrl} 
                    alt={service.name} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    fallbackIcon={<Leaf className="h-12 w-12 text-green-500 mx-auto mb-2" />}
                  />
                  {/* Modern gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-700/40 to-transparent rounded-lg"></div>
                  {/* Bright green accent line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-400"></div>
                  {/* Overlaid title with animation */}
                  <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                    <h3 className="text-2xl font-black text-white text-shadow-2xl drop-shadow-2xl service-title transform transition-all duration-500 group-hover:scale-105">{service.name}</h3>
                  </div>
                  {/* Floating stats indicator */}
                  <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                    <span className="text-white text-xs font-semibold">★ Pro</span>
                  </div>
                </div>
              ) : (
                <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-2 service-icon">
                  <span className="text-green-600 text-2xl">
                    <i className="fas fa-leaf"></i>
                  </span>
                  {/* For fallback icons, we'll keep the title separate */}
                </div>
              )}
              {!service.imageUrl && (
                <h3 className="text-xl font-semibold text-gray-900 service-title">{service.name}</h3>
              )}
              <p className="text-gray-600 flex-grow service-description">
                {service.description.length > 120
                  ? `${service.description.substring(0, 120)}...`
                  : service.description}
              </p>
              <div className="w-full flex flex-col items-center mt-auto service-price-action">
                <span className="text-green-600 font-semibold mb-3 service-price">{service.price}</span>
                <Link href={`/services/${service.id}`}>
                  <Button variant="outline" className="service-button border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 w-full transition-all duration-300">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Create a duplicated array for infinite scrolling effect
  const duplicatedServices = [...services, ...services];

  // Show 1 card on mobile, 2 on tablets, 3 on desktop
  const visibleSlides = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  };

  // Determine how many cards to show
  const visibleCount = isMobile ? visibleSlides.mobile : 
                      window.innerWidth < 1024 ? visibleSlides.tablet : 
                      visibleSlides.desktop;

  return (
    <div 
      className="relative w-full services-carousel" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={sliderRef}
    >
      {/* Main slider content */}
      <div 
        className="overflow-hidden carousel-container rounded-xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex"
          style={{ 
            transform: `translate3d(-${currentIndex * (100 / visibleCount)}%, 0, 0)`,
            transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform'
          }}
        >
          {duplicatedServices.map((service, index) => (
            <div 
              key={`${service.id}-${index}`}
              className="min-w-full sm:min-w-[50%] md:min-w-[33.333%] px-3 md:px-4 py-4 service-card"
              style={{
                willChange: 'auto',
                transform: 'translateZ(0)', // Force hardware acceleration
                backfaceVisibility: 'hidden'
              }}
            >
              <Card className="service-card-inner h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-2xl hover:scale-[1.02] hover:-translate-y-2" style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4 h-full">
                  {service.imageUrl ? (
                    <div className="relative w-full h-48 overflow-hidden rounded-lg mb-4 service-image-container" style={{ willChange: 'auto' }}>
                      <SafeImage 
                        src={service.imageUrl} 
                        alt={service.name} 
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        fallbackIcon={<Leaf className="h-12 w-12 text-green-500 mx-auto mb-2" />}
                      />
                      {/* Dark overlay for text readability */}
                      <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
                      {/* Overlaid title */}
                      <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                        <h3 className="text-2xl font-black text-white text-shadow-2xl drop-shadow-2xl service-title">{service.name}</h3>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-2 service-icon">
                      <span className="text-green-600 text-2xl">
                        <i className="fas fa-leaf"></i>
                      </span>
                    </div>
                  )}
                  {!service.imageUrl && (
                    <h3 className="text-2xl font-black text-gray-900 service-title">{service.name}</h3>
                  )}
                  <p className="text-gray-600 flex-grow service-description leading-loose text-base">
                    {service.description.length > 120
                      ? `${service.description.substring(0, 120)}...`
                      : service.description}
                  </p>
                  <div className="w-full flex flex-col items-center mt-auto service-price-action space-y-3">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-green-700 font-bold text-lg bg-green-50 px-3 py-1 rounded-full">{service.price}</span>
                      <div className="flex items-center space-x-1 text-green-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Rapid</span>
                      </div>
                    </div>
                    <Link href={`/services/${service.id}`} className="w-full">
                      <Button variant="outline" className="service-button w-full border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 hover:text-green-700 hover:scale-[1.02] hover:shadow-md transition-all duration-300 transform active:scale-95 group relative overflow-hidden">
                        <span className="relative z-10 flex items-center justify-center">
                          Află Mai Multe
                          <ChevronRight className="ml-2 h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation arrows with improved UI */}
      <button 
        onClick={prevSlide}
        className="absolute top-1/2 left-0 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-green-50 border border-green-200 z-10 flex items-center justify-center transform transition-all hover:scale-110 -translate-x-3 hover:-translate-x-1"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-green-600" />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute top-1/2 right-0 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-green-50 border border-green-200 z-10 flex items-center justify-center transform transition-all hover:scale-110 translate-x-3 hover:translate-x-1"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-green-600" />
      </button>
      
      {/* Enhanced slide indicators */}
      <div className="flex justify-center space-x-2 mt-8">
        {Array.from({ length: Math.max(1, totalSlides - 2) }).map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "bg-green-600 w-8" 
                : "bg-gray-300 hover:bg-green-300"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
