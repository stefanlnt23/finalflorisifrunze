import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Leaf, Clock, CheckCircle2 } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
}

export default function Services() {
  // Add state to track if this is the initial render
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/services"],
    refetchOnWindowFocus: false,
    staleTime: Infinity, // Never refetch unless manually invalidated
    gcTime: Infinity, // Keep in cache indefinitely
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
    retry: 1, // Only retry once on failure
  });

  const services: Service[] = (data as { services: Service[] })?.services || [];

  // Set isInitialRender to false after the first render
  useEffect(() => {
    // Use a timeout to ensure the animation plays on the first render
    const timer = setTimeout(() => {
      setIsInitialRender(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle video loading and playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let timeoutId: NodeJS.Timeout;

    const handlePlay = () => {
      setVideoPlaying(true);
      // Force hardware acceleration after play starts
      video.style.transform = 'translate3d(0,0,0)';
    };

    const handleCanPlay = () => {
      // Delay autoplay slightly to ensure smooth rendering
      timeoutId = setTimeout(() => {
        video.play().catch(() => {
          // Silent fail for autoplay restrictions
        });
      }, 100);
    };

    video.addEventListener('canplay', handleCanPlay, { once: true });
    video.addEventListener('play', handlePlay, { once: true });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
    };
  }, []);

  return (
    <MainLayout>
      {/* Hero Section with Video Background */}
      <div className="relative py-24 overflow-hidden" style={{ height: '70vh', minHeight: '600px' }}>
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster=""
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ 
            zIndex: 0,
            willChange: 'transform',
            transform: 'translate3d(0,0,0)',
            filter: 'brightness(0.9)',
            backfaceVisibility: 'hidden',
            perspective: '1000px'
          }}
          onError={(e) => {
            console.error('Services video failed to load:', e);
            (e.target as HTMLVideoElement).style.display = 'none';
          }}
          onLoadStart={() => {
            // Optimize for mobile performance
            if (videoRef.current) {
              videoRef.current.setAttribute('playsinline', 'true');
              videoRef.current.setAttribute('webkit-playsinline', 'true');
            }
          }}
        >
          <source src="https://res.cloudinary.com/dyrmghrbm/video/upload/f_mp4,q_auto:low,w_auto,c_scale/gardencut_xiwbj3.mp4" type="video/mp4" />
        </video>

        {/* Enhanced animated fallback background for unsupported devices */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600" style={{ zIndex: -1 }}>
          {/* Animated floating garden elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large decorative circles with gradient */}
            <div className="absolute top-16 right-10 w-28 h-28 bg-gradient-to-br from-green-200/30 to-green-300/20 rounded-full animate-float"></div>
            <div className="absolute top-1/2 left-16 w-32 h-32 bg-gradient-to-br from-green-100/40 to-green-200/30 rounded-full animate-float-delay-1"></div>
            <div className="absolute bottom-24 right-1/4 w-36 h-36 bg-gradient-to-br from-green-300/20 to-green-400/15 rounded-full animate-float-delay-2"></div>
            
            {/* Floating garden tools and plants */}
            <div className="absolute top-24 left-1/4 text-green-200/40 text-3xl animate-float-slow">🌿</div>
            <div className="absolute top-2/3 right-1/4 text-green-100/50 text-2xl animate-float-delay-1">🍃</div>
            <div className="absolute bottom-40 left-20 text-green-200/40 text-3xl animate-float-delay-2">🌱</div>
            <div className="absolute top-1/3 right-16 text-green-100/60 text-2xl animate-float-slow">🌾</div>
            <div className="absolute bottom-1/4 left-1/3 text-green-200/40 text-xl animate-float">🌸</div>
            <div className="absolute top-1/5 left-1/2 text-green-100/50 text-2xl animate-float-delay-1">✂️</div>
            
            {/* Geometric patterns */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-2/3 left-1/6 w-1 h-1 bg-white rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-2/3 w-2 h-2 bg-white rounded-full animate-pulse delay-2000"></div>
            </div>
          </div>
        </div>

        {/* Semi-transparent overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" style={{ zIndex: 2 }}></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 10 }}>
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-white bg-opacity-20 text-white text-sm font-medium mb-6 animate-fadeIn">
              Experți în Grădinărit
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 text-shadow-md animate-slideIn">
              Serviciile Noastre de Grădinărit
            </h1>
            <div className="w-24 h-1 bg-green-400 mx-auto mb-8 animate-grow"></div>
            <p className="text-xl text-white text-opacity-90 mb-10 animate-slideUp animation-delay-300">
              Oferim o gamă largă de servicii profesionale de grădinărit și
              amenajare peisagistică pentru a îmbunătăți spațiul tău exterior.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fadeIn animation-delay-500">
              <Link href="/appointment">
                <Button
                  size="lg"
                  className="bg-green-600 text-white hover:bg-green-700 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  Programează o Consultație
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-green-700 transition-all transform hover:scale-105 bg-green-600/30"
                >
                  Contactează-ne
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div
          className="absolute bottom-0 left-0 w-full h-16 bg-white"
          style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}
        ></div>
      </div>

      {/* Main Services Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Services Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Servicii Complete pentru Grădina Ta
            </h2>
            <div className="w-24 h-1 bg-green-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              De la planificare și amenajare până la întreținere regulată,
              suntem aici pentru a transforma spațiul tău exterior.
            </p>
          </div>

          {/* Services Display */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card
                  key={i}
                  className="animate-pulse overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-56 bg-gray-200"></div>
                  <CardHeader className="bg-white">
                    <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-1/3"></div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-4 bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="h-10 bg-gray-200 rounded-full w-2/5"></div>
                    <div className="h-10 bg-gray-200 rounded-full w-2/5"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-12 bg-red-50 rounded-xl shadow-inner max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-6">
                <i className="fas fa-exclamation-triangle text-3xl text-red-500"></i>
              </div>
              <h3 className="text-2xl font-bold text-red-700 mb-3">
                Nu am putut încărca serviciile
              </h3>
              <p className="text-red-600 mb-6">
                Am întâmpinat o problemă în timp ce încărcăm lista de servicii.
                Te rugăm să încerci din nou.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 shadow-md"
              >
                Încearcă din nou
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {services.length === 0 ? (
                <div className="col-span-3 text-center p-16 bg-gray-50 rounded-xl">
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">
                    Actualizăm Serviciile Noastre
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Momentan actualizăm oferta noastră de servicii. Te rugăm să
                    revii mai târziu.
                  </p>
                  <Link href="/contact">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Contactează-ne pentru Detalii
                    </Button>
                  </Link>
                </div>
              ) : (
                services.map((service: Service, index: number) => (
                  <Card
                    key={service.id}
                    className={`group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-2xl hover:scale-[1.02] hover:-translate-y-2 ${isInitialRender ? "animate-fadeInUp" : ""}`}
                    style={{
                      animationDelay: isInitialRender
                        ? `${index * 150}ms`
                        : "0ms",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    {service.imageUrl ? (
                      <div className="relative w-full h-72 overflow-hidden rounded-t-2xl">
                        <SafeImage
                          src={service.imageUrl}
                          alt={service.name}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                          fallbackIcon={<Leaf className="h-16 w-16 text-green-500 mx-auto mb-4" />}
                        />
                        {/* Modern gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-700/40 to-transparent"></div>
                        {/* Bright green accent line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-400"></div>
                        {/* Overlaid title with animation */}
                        <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                          <h3 className="text-3xl font-black text-white text-shadow-2xl drop-shadow-2xl transform transition-all duration-500 group-hover:scale-105">
                            {service.name}
                          </h3>
                        </div>
                        {/* Floating stats indicator */}
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20 float-animation">
                          <span className="text-white text-xs font-semibold">★ 10+ ani</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-72 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center rounded-t-2xl">
                        <Leaf className="h-24 w-24 text-green-300 animate-pulse" />
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-400"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                          <h3 className="text-3xl font-black text-green-800 text-shadow-lg drop-shadow-lg transform transition-all duration-500 group-hover:scale-105">
                            {service.name}
                          </h3>
                        </div>
                      </div>
                    )}
                    <CardHeader className="pb-4 pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <CardDescription className="text-green-700 font-bold text-xl bg-green-50 px-3 py-1 rounded-full">
                          {service.price}
                        </CardDescription>
                        <div className="flex items-center space-x-1 text-green-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Rapid</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-6 px-6">
                      <p className="text-gray-700 leading-relaxed text-base mb-6">
                        {service.description.length > 80
                          ? `${service.description.substring(0, 80)}...`
                          : service.description}
                      </p>
                      
                      {/* Service highlights */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Garanție</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Leaf className="h-4 w-4 text-green-500" />
                          <span>Eco-friendly</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3 pt-0 pb-6 px-6">
                      <Link href={`/services/${service.id}`} className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 hover:text-green-700 hover:scale-[1.02] hover:shadow-md transition-all duration-300 transform active:scale-95 group relative overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            Află Mai Multe
                            <ChevronRight className="ml-2 h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Button>
                      </Link>
                      <Link href={`/appointment?service=${service.id}`} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-[1.02] shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 relative overflow-hidden group button-ripple gradient-glow">
                          <span className="relative z-10 flex items-center justify-center font-semibold">
                            <Clock className="mr-2 h-4 w-4 group-hover:animate-spin" />
                            Programează Acum
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Benefits Section - Moved to Bottom */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-green-50 rounded-xl p-6 shadow-md transform transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Materiale Ecologice
              </h3>
              <p className="text-gray-600">
                Folosim materiale și tehnici prietenoase cu mediul pentru toate
                proiectele noastre.
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 shadow-md transform transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Servicii Prompte
              </h3>
              <p className="text-gray-600">
                Respectăm timpul tău și oferim servicii prompte, la momentul
                convenit.
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 shadow-md transform transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Calitate Garantată
              </h3>
              <p className="text-gray-600">
                Garantăm calitatea muncii noastre și oferim servicii de
                întreținere de lungă durată.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-leaves opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Nu găsești serviciul potrivit?
                </h3>
                <p className="text-gray-600 mb-6">
                  Contactează-ne pentru o consultație personalizată și vom crea
                  o soluție adaptată nevoilor tale specifice.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/contact">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Contactează-ne
                    </Button>
                  </Link>
                  <Link href="/appointment">
                    <Button
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      Programare Consultație
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 bg-green-100 flex items-center justify-center p-8 md:p-0">
                <img
                  src="https://thumbor.unica.ro/unsafe/726x484/smart/filters:format(webp):contrast(8):quality(75)/https://www.elle.ro/wp-content/uploads/2024/02/6cfe1c7bcaf4ebff9829c228cc8cd40e.jpg"
                  alt="Personalized gardening services"
                  className="rounded-lg md:rounded-none shadow-lg md:shadow-none max-h-72 md:max-h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
