import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layouts/MainLayout";
import { HomeCarousel } from "@/components/ui/home-carousel";
import { ServicesCarousel } from "@/components/ui/services-carousel";

// Default feature cards as fallback
const defaultFeatureCards = [
  {
    id: "1",
    title: "Expert Gardeners",
    description: "Our team consists of certified and experienced gardening professionals",
    icon: "fa-check",
    imageUrl: "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    order: 1
  },
  {
    id: "2",
    title: "Eco-Friendly Practices",
    description: "We use sustainable methods and materials in all our garden work",
    icon: "fa-leaf",
    imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    order: 2
  },
  {
    id: "3",
    title: "Reliable Service",
    description: "Always on time with consistent, dependable garden maintenance",
    icon: "fa-calendar-check",
    imageUrl: "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    order: 3
  },
  {
    id: "4",
    title: "Satisfaction Guaranteed",
    description: "We stand behind our work with a 100% satisfaction guarantee",
    icon: "fa-award",
    imageUrl: "https://images.unsplash.com/photo-1589923188900-85e90f6f61c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    order: 4
  }
];

export default function Home() {
  // State for the testimonial carousel
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  // Add state to track if this is the initial render
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Get services data
  const { data: servicesData, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services'],
    refetchOnWindowFocus: false,
    staleTime: 300000, // Keep data fresh for 5 minutes
    gcTime: 600000, // Cache data for 10 minutes
    refetchOnMount: false // Don't refetch when component mounts if data exists
  });

  // Get testimonials data
  const { data: testimonialsData, isLoading: isLoadingTestimonials } = useQuery({
    queryKey: ['/api/testimonials'],
    refetchOnWindowFocus: false,
    staleTime: 300000, // Keep data fresh for 5 minutes
    gcTime: 600000, // Cache data for 10 minutes
    refetchOnMount: false // Don't refetch when component mounts if data exists
  });

  // Feature services (limit to 3)
  const featuredServices = servicesData?.services?.filter(service => service.featured).slice(0, 3) || [];

  // Testimonials
  const testimonials = testimonialsData?.testimonials || [];

  // Get feature cards
  const { data: featureCardsData } = useQuery({
    queryKey: ['/api/feature-cards'],
    refetchOnWindowFocus: false,
    staleTime: 300000, // Keep data fresh for 5 minutes
    gcTime: 600000, // Cache data for 10 minutes
    refetchOnMount: false // Don't refetch when component mounts if data exists
  });

  // Feature cards with fallback to defaults if none exist
  const featureCards = featureCardsData?.cards?.length ? featureCardsData.cards : defaultFeatureCards;

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setActiveTestimonial((current) => 
        current === testimonials.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Set isInitialRender to false after the first render
  useEffect(() => {
    // Use a timeout to ensure the animation plays on the first render
    const timer = setTimeout(() => {
      setIsInitialRender(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-20 md:py-32 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-green-300 animate-blob"></div>
          <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-green-200 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-green-400 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
              <span className={`inline-block px-4 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-6 ${isInitialRender ? 'animate-fadeIn' : ''}`}>
                Servicii Profesionale de Grădinărit
              </span>
              <h1 className={`text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900 ${isInitialRender ? 'animate-slideUp' : ''}`}>
                Gradina ta pasunea noastra... <span className="text-green-600 relative">
                  Paradis
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-green-200 -z-10"></span>
                </span>
              </h1>
              <p className={`text-lg mb-8 text-gray-700 max-w-lg ${isInitialRender ? 'animate-fadeIn animation-delay-300' : ''}`}>
                Servicii profesionale de grădinărit pentru a face grădina ta frumoasă, sustenabilă și înfloritoare pe tot parcursul anului. Echipa noastră de experți îți transformă visele despre grădină în realitate.
              </p>
              <div className={`flex flex-wrap gap-4 ${isInitialRender ? 'animate-slideUp animation-delay-500' : ''}`}>
                <Link href="/contact">
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                    Obține o Ofertă Gratuită
                  </Button>
                </Link>
                <Link href="/blog">
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-full transform hover:scale-105">
                    Află Mai Multe
                  </Button>
                </Link>
              </div>
              <div className={`mt-8 flex items-center text-gray-600 ${isInitialRender ? 'animate-fadeIn animation-delay-700' : ''}`}>
                <span className="flex items-center mr-6">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  Echipă cu Experiență
                </span>
                <span className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  Garanție de Calitate
                </span>
              </div>
            </div>
            <div className={`md:w-1/2 ${isInitialRender ? 'animate-slideIn' : ''}`}>
              <div className="shadow-2xl rounded-lg overflow-hidden border-8 border-white transform transition-all hover:rotate-1 hover:scale-105">
                <HomeCarousel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Section - Replacement for first ParallaxSection */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-full h-full bg-pattern-leaves"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center w-full">
            <h2 className={`text-4xl font-bold text-white mb-4 ${isInitialRender ? 'animate-pulse' : ''}`}>Transformă Grădina Ta</h2>
            <p className="text-xl text-white max-w-2xl mx-auto mb-6">
              Servicii profesionale pentru a face grădina ta să strălucească în fiecare anotimp
            </p>
            <Link href="/contact">
              <Button className="px-8 py-3 bg-white text-green-600 rounded-full hover:bg-green-50 transition-colors shadow-xl transform hover:scale-105">
                Programează o Consultație
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-green-50 opacity-50 clip-path-slant"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4 hover-float">
              Servicii de Experți
            </span>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 text-gray-900 ${isInitialRender ? 'animate-fadeIn' : ''}`}>
              Serviciile Noastre
            </h2>
            <div className={`w-24 h-1 bg-green-500 mx-auto mb-6 ${isInitialRender ? 'animate-grow' : ''}`}></div>
            <p className="text-gray-600 text-lg">
              Oferim servicii complete de grădinărit și amenajare peisagistică pentru a menține spațiul tău exterior frumos și sănătos în toate anotimpurile.
            </p>
          </div>

          {/* Services Carousel */}
          <div className={`px-4 md:px-8 lg:px-12 ${isInitialRender ? 'animate-slideUp animation-delay-300' : ''}`}>
            <div className="overflow-visible">
              <p className="text-sm text-gray-500 text-center mb-2 md:hidden">
                ← Swipe pentru a vedea mai multe servicii →
              </p>
              <ServicesCarousel />
            </div>
          </div>

          <div className={`text-center mt-12 ${isInitialRender ? 'animate-bounce animation-delay-500' : ''}`}>
            <Link href="/services">
              <Button className="bg-green-600 hover:bg-green-700 transform transition-all hover:scale-105">
                Vezi Toate Serviciile
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Inspirational Banner - Replacement for second ParallaxSection */}
      <section className="relative py-24 flex items-center justify-center overflow-hidden bg-design-pattern">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-90"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className={`text-4xl font-bold text-white mb-6 ${isInitialRender ? 'animate-glow' : ''}`}>Design Peisagistic Inspirațional</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Creăm spații exterioare captivante, transformate cu artă și funcționalitate
          </p>
          <Link href="/portfolio">
            <Button className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Vezi Portofoliul Nostru
            </Button>
          </Link>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 fade-in-view">De Ce Să Ne Alegeți</h2>
            <p className="text-gray-600">
              Suntem dedicați să oferim servicii excepționale pentru grădină cu expertiză și grijă.
            </p>
          </div>

          {/* Feature Cards with Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {featureCards.map((card, index) => (
              <div 
                key={card.id} 
                className={`relative group overflow-hidden rounded-xl border-2 border-green-100 shadow-md hover:shadow-xl transition-all duration-300 h-80 ${isInitialRender ? 'stagger-animate' : ''}`}
                style={{ animationDelay: isInitialRender ? `${index * 150}ms` : '0ms' }}
              >
                <div className="absolute inset-0 bg-cover bg-center transform transition-transform group-hover:scale-110" 
                  style={{ backgroundImage: `url(${card.imageUrl})` }}>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-green-900/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center transform transition-transform translate-y-2 group-hover:translate-y-0">
                  <h3 className="text-lg font-bold text-white mb-1 drop-shadow-md">{card.title}</h3>
                  <p className="text-green-50 text-sm mb-4 max-w-[85%] leading-snug drop-shadow-md transform transition-all opacity-80 group-hover:opacity-100">{card.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/services">
              <Button className="bg-green-600 hover:bg-green-700 transform hover:scale-105 transition">
                Explorează Serviciile Noastre
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 fade-in-view">Ce Spun Clienții Noștri</h2>
            <p className="text-gray-600">
              Află de la clienții noștri mulțumiți despre experiențele lor cu serviciile noastre.
            </p>
          </div>

          {isLoadingTestimonials ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="animate-pulse w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                      <div className="space-y-2 w-full">
                        <div className="animate-pulse h-3 bg-gray-200 rounded w-full"></div>
                        <div className="animate-pulse h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
                        <div className="animate-pulse h-3 bg-gray-200 rounded w-4/6 mx-auto"></div>
                      </div>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* Show testimonials with proper handling for fewer than 3 */}
                {testimonials.length <= 3 ? (
                  // If we have 3 or fewer testimonials, show them directly
                  testimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="shadow-lg transform transition-all duration-300 hover:scale-105 hover:rotate-1">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          {testimonial.imageUrl ? (
                            <img 
                              src={testimonial.imageUrl} 
                              alt={testimonial.name}
                              className="w-16 h-16 object-cover rounded-full border-2 border-green-200"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                              <i className="fas fa-user text-green-600 text-2xl"></i>
                            </div>
                          )}
                          <div className="flex items-center justify-center">
                            {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                              <i key={i} className="fas fa-star text-yellow-400 text-sm mr-0.5"></i>
                            ))}
                          </div>
                          <blockquote className="text-lg italic text-gray-800">"{testimonial.content}"</blockquote>
                          <div>
                            <p className="font-bold text-gray-900">{testimonial.name}</p>
                            {testimonial.company && (
                              <p className="text-sm text-gray-600">{testimonial.company}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  // If we have more than 3 testimonials, show 3 at a time with pagination
                  [0, 1, 2].map((offset) => {
                    const index = (activeTestimonial + offset) % testimonials.length;
                    const testimonial = testimonials[index];

                    return testimonial ? (
                      <Card key={`${testimonial.id}-${index}`} className="shadow-lg transform transition-all duration-300 hover:scale-105 hover:rotate-1">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center space-y-4">
                            {testimonial.imageUrl ? (
                              <img 
                                src={testimonial.imageUrl} 
                                alt={testimonial.name}
                                className="w-16 h-16 object-cover rounded-full border-2 border-green-200"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                <i className="fas fa-user text-green-600 text-2xl"></i>
                              </div>
                            )}
                            <div className="flex items-center justify-center">
                              {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                                <i key={i} className="fas fa-star text-yellow-400 text-sm mr-0.5"></i>
                              ))}
                            </div>
                            <blockquote className="text-lg italic text-gray-800">"{testimonial.content}"</blockquote>
                            <div>
                              <p className="font-bold text-gray-900">{testimonial.name}</p>
                              {testimonial.company && (
                                <p className="text-sm text-gray-600">{testimonial.company}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null;
                  })
                )}
              </div>

              {/* Pagination dots */}
              {testimonials.length > 3 && (
                <div className="flex justify-center space-x-2 mt-6">
                  {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, index) => (
                    <button
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        Math.floor(activeTestimonial / 3) === index ? "bg-green-600" : "bg-gray-300"
                      }`}
                      onClick={() => setActiveTestimonial(index * 3)}
                      aria-label={`Testimonial page ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-center mt-4 space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  onClick={() => setActiveTestimonial((activeTestimonial - 3 + testimonials.length) % testimonials.length)}
                >
                  <i className="fas fa-chevron-left mr-2"></i>
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  onClick={() => setActiveTestimonial((activeTestimonial + 3) % testimonials.length)}
                >
                  Următor
                  <i className="fas fa-chevron-right ml-2"></i>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500">Nu există mărturii disponibile momentan.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer is included in MainLayout */}
    </MainLayout>
  );
}
