import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { ArrowLeft, Calendar, MapPin, Clock, Star, Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";

export default function PortfolioDetail() {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper function to truncate text for mobile with read more
  const truncateText = (text: string, sectionKey: string, wordLimit: number = 10) => {
    const words = text.split(' ');
    const isExpanded = expandedSections[sectionKey];
    
    if (!isMobile || words.length <= wordLimit || isExpanded) {
      return text;
    }
    
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Fetch portfolio item details
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/portfolio/item", id],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/item/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio item");
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  const portfolioItem = data?.portfolioItem;

  // Fetch service details if serviceId exists
  const { data: serviceData } = useQuery({
    queryKey: ["/api/services", portfolioItem?.serviceId],
    queryFn: async () => {
      if (!portfolioItem?.serviceId) return null;
      const response = await fetch(`/api/services/${portfolioItem.serviceId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch service");
      }
      return response.json();
    },
    enabled: !!portfolioItem?.serviceId,
    refetchOnWindowFocus: false,
  });

  const service = serviceData?.service;

  // Get all images (main + gallery)
  const allImages = [
    ...(portfolioItem?.imageUrl ? [portfolioItem.imageUrl] : []),
    ...(portfolioItem?.images?.map((img: any) => img.before).filter(Boolean) || []),
    ...(portfolioItem?.images?.map((img: any) => img.after).filter(Boolean) || [])
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-80 bg-gray-200 rounded mb-8"></div>
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !portfolioItem) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="bg-red-50 p-8 rounded-lg text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-red-700 mb-4">
              Project Not Found
            </h2>
            <p className="text-red-600 mb-6">
              We couldn't find the project you're looking for. It may have been
              removed or the URL might be incorrect.
            </p>
            <Button onClick={() => window.history.back()} className="mr-4">
              Go Back
            </Button>
            <Button
              onClick={() => (window.location.href = "/portfolio")}
              variant="outline"
            >
              View All Projects
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Dynamic Hero Section - Magazine Style */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Dynamic Background Based on Project ID */}
        <div className={`absolute inset-0 ${
          portfolioItem.id.slice(-1) === '0' || portfolioItem.id.slice(-1) === '5' 
            ? 'bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900'
            : portfolioItem.id.slice(-1) === '1' || portfolioItem.id.slice(-1) === '6'
            ? 'bg-gradient-to-tr from-slate-900 via-green-900 to-emerald-800' 
            : portfolioItem.id.slice(-1) === '2' || portfolioItem.id.slice(-1) === '7'
            ? 'bg-gradient-to-bl from-green-950 via-emerald-900 to-teal-800'
            : portfolioItem.id.slice(-1) === '3' || portfolioItem.id.slice(-1) === '8'
            ? 'bg-gradient-to-tl from-green-900 via-green-800 to-emerald-900'
            : 'bg-gradient-to-r from-green-900 via-emerald-800 to-teal-900'
        }`}></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className={`absolute ${
            portfolioItem.id.slice(-1) === '0' ? 'top-10 left-10' : 
            portfolioItem.id.slice(-1) === '1' ? 'top-20 right-20' :
            portfolioItem.id.slice(-1) === '2' ? 'bottom-20 left-20' :
            'top-1/3 right-1/4'
          } w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-pulse`}></div>
          <div className={`absolute ${
            portfolioItem.id.slice(-1) === '0' ? 'bottom-20 right-10' : 
            portfolioItem.id.slice(-1) === '1' ? 'bottom-10 left-10' :
            portfolioItem.id.slice(-1) === '2' ? 'top-10 right-10' :
            'bottom-1/4 left-1/3'
          } w-48 h-48 bg-green-300/10 rounded-full blur-2xl animate-pulse delay-1000`}></div>
        </div>

        {/* Navigation */}
        <div className="relative z-10 pt-6 pb-4">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Portofoliu
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-400' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
                  onClick={() => navigator.share?.({ title: portfolioItem.title, url: window.location.href })}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Layout Based on Project */}
        <div className="relative z-10 py-12 pb-20">
          <div className="container mx-auto px-4">
            {/* Project Header */}
            <div className={`text-center mb-16 ${
              portfolioItem.id.slice(-1) % 2 === 0 ? 'max-w-4xl mx-auto' : 'max-w-5xl mx-auto'
            }`}>
              {service && (
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm mb-6">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                  {service.name}
                </div>
              )}
              
              <h1 className={`font-bold leading-tight text-white mb-6 ${
                portfolioItem.id.slice(-1) % 3 === 0 ? 'text-5xl lg:text-7xl' :
                portfolioItem.id.slice(-1) % 3 === 1 ? 'text-4xl lg:text-6xl' :
                'text-3xl lg:text-5xl'
              }`}>
                {portfolioItem.title}
              </h1>
            </div>

            {/* Dynamic Content Layout */}
            {portfolioItem.id.slice(-1) % 3 === 0 ? (
              // Layout Style 1: Image First, Text Below
              <div className="space-y-16">
                {/* Large Featured Image */}
                {allImages.length > 0 && (
                  <div className="relative max-w-6xl mx-auto">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20">
                        <div className="w-full h-[500px] object-cover rounded-2xl overflow-hidden">
                          <ImageLightbox
                            image={allImages[currentImageIndex]}
                            alt={portfolioItem.title}
                          />
                        </div>
                        
                        {/* Image Info Overlay */}
                        <div className="absolute bottom-8 left-8 right-8">
                          <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <div className="flex justify-between items-center text-white">
                              <div>
                                <p className="text-sm opacity-80">Imagine {currentImageIndex + 1} din {allImages.length}</p>
                                <p className="font-medium">Galeria Proiectului</p>
                              </div>
                              {allImages.length > 1 && (
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20" onClick={prevImage}>
                                    <ChevronLeft className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20" onClick={nextImage}>
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Content in Cards */}
                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                      <h2 className="text-2xl font-bold text-white mb-6">Despre Proiect</h2>
                      <p className="text-white/90 leading-relaxed text-lg">
                        {truncateText(portfolioItem.description, 'description', 30)}
                        {isMobile && portfolioItem.description.split(' ').length > 30 && (
                          <button
                            onClick={() => toggleSection('description')}
                            className="text-emerald-400 hover:text-emerald-300 ml-2 underline"
                          >
                            {expandedSections['description'] ? 'mai puțin' : 'mai mult'}
                          </button>
                        )}
                      </p>
                    </div>

                    {portfolioItem.challenges && (
                      <div className="bg-amber-500/10 backdrop-blur-sm rounded-2xl p-8 border border-amber-400/20">
                        <h3 className="text-xl font-semibold text-amber-300 mb-4">Provocări Întâmpinate</h3>
                        <p className="text-white/80 leading-relaxed">
                          {truncateText(portfolioItem.challenges, 'challenges', 25)}
                          {isMobile && portfolioItem.challenges.split(' ').length > 25 && (
                            <button
                              onClick={() => toggleSection('challenges')}
                              className="text-amber-400 hover:text-amber-300 ml-2 underline"
                            >
                              {expandedSections['challenges'] ? 'mai puțin' : 'mai mult'}
                            </button>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-emerald-300 mb-4">Detalii Proiect</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-emerald-400" />
                          <div>
                            <p className="text-xs text-white/60 uppercase tracking-wide">Finalizat</p>
                            <p className="text-white font-medium">{format(new Date(portfolioItem.completedAt || portfolioItem.createdAt), "MMMM yyyy")}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-emerald-400" />
                          <div>
                            <p className="text-xs text-white/60 uppercase tracking-wide">Locație</p>
                            <p className="text-white font-medium">{portfolioItem.location || "România"}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-emerald-400" />
                          <div>
                            <p className="text-xs text-white/60 uppercase tracking-wide">Durată</p>
                            <p className="text-white font-medium">{portfolioItem.duration || "2-4 săptămâni"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full bg-white text-green-900 hover:bg-green-50 shadow-xl"
                      onClick={() => (window.location.href = "/appointment")}
                    >
                      Programează Întâlnire
                    </Button>
                  </div>
                </div>
              </div>
            ) : portfolioItem.id.slice(-1) % 3 === 1 ? (
              // Layout Style 2: Split Screen
              <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto items-start">
                {/* Left: Project Info */}
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-6">Transformarea Completă</h2>
                    <p className="text-xl text-white/90 leading-relaxed mb-8">
                      {truncateText(portfolioItem.description, 'description', 25)}
                      {isMobile && portfolioItem.description.split(' ').length > 25 && (
                        <button
                          onClick={() => toggleSection('description')}
                          className="text-emerald-400 hover:text-emerald-300 ml-2 underline"
                        >
                          {expandedSections['description'] ? 'mai puțin' : 'mai mult'}
                        </button>
                      )}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <Calendar className="h-6 w-6 text-emerald-400 mb-2" />
                      <p className="text-white/60 text-sm">Finalizat în</p>
                      <p className="text-white font-bold">{format(new Date(portfolioItem.completedAt || portfolioItem.createdAt), "MMM yyyy")}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <MapPin className="h-6 w-6 text-emerald-400 mb-2" />
                      <p className="text-white/60 text-sm">Locație</p>
                      <p className="text-white font-bold">{portfolioItem.location || "România"}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <Clock className="h-6 w-6 text-emerald-400 mb-2" />
                      <p className="text-white/60 text-sm">Durată</p>
                      <p className="text-white font-bold">{portfolioItem.duration || "2-4 săpt"}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <Star className="h-6 w-6 text-yellow-400 mb-2" />
                      <p className="text-white/60 text-sm">Tip</p>
                      <p className="text-white font-bold">Premium</p>
                    </div>
                  </div>

                  {portfolioItem.solution && (
                    <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-400/20">
                      <h3 className="text-xl font-semibold text-emerald-300 mb-4">Soluția Implementată</h3>
                      <p className="text-white/80 leading-relaxed">
                        {truncateText(portfolioItem.solution, 'solution', 20)}
                        {isMobile && portfolioItem.solution.split(' ').length > 20 && (
                          <button
                            onClick={() => toggleSection('solution')}
                            className="text-emerald-400 hover:text-emerald-300 ml-2 underline"
                          >
                            {expandedSections['solution'] ? 'mai puțin' : 'mai mult'}
                          </button>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button
                      size="lg"
                      className="bg-white text-green-900 hover:bg-green-50"
                      onClick={() => (window.location.href = "/appointment")}
                    >
                      Programează Întâlnire
                    </Button>
                  </div>
                </div>

                {/* Right: Image Gallery */}
                {allImages.length > 0 && (
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl">
                        <ImageLightbox
                          image={allImages[currentImageIndex]}
                          alt={portfolioItem.title}
                        />
                      </div>
                      
                      {allImages.length > 1 && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 flex justify-between items-center">
                            <span className="text-white text-sm">{currentImageIndex + 1} / {allImages.length}</span>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20" onClick={prevImage}>
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20" onClick={nextImage}>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Strip */}
                    {allImages.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {allImages.slice(0, 4).map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`aspect-square rounded-lg overflow-hidden transition-all ${
                              currentImageIndex === index ? 'ring-2 ring-emerald-400' : 'hover:ring-1 hover:ring-white/40'
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Layout Style 3: Mosaic Layout
              <div className="space-y-12 max-w-6xl mx-auto">
                {/* Alternating Content Blocks */}
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    {allImages.length > 0 && (
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                          <div className="w-full h-[350px] object-cover rounded-xl overflow-hidden">
                            <ImageLightbox
                              image={allImages[currentImageIndex]}
                              alt={portfolioItem.title}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <h2 className="text-2xl font-bold text-white mb-4">Proiectul</h2>
                      <p className="text-white/80 leading-relaxed">
                        {truncateText(portfolioItem.description, 'description', 20)}
                        {isMobile && portfolioItem.description.split(' ').length > 20 && (
                          <button
                            onClick={() => toggleSection('description')}
                            className="text-emerald-400 hover:text-emerald-300 ml-2 underline"
                          >
                            {expandedSections['description'] ? 'mai puțin' : 'mai mult'}
                          </button>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-emerald-400" />
                        <div>
                          <p className="text-white/60 text-xs">Data finalizării</p>
                          <p className="text-white font-medium">{format(new Date(portfolioItem.completedAt || portfolioItem.createdAt), "MMM yyyy")}</p>
                        </div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-emerald-400" />
                        <div>
                          <p className="text-white/60 text-xs">Locația</p>
                          <p className="text-white font-medium">{portfolioItem.location || "România"}</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => (window.location.href = "/appointment")}
                    >
                      Solicită Ofertă
                    </Button>
                  </div>
                </div>

                {/* Image Navigation */}
                {allImages.length > 1 && (
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={prevImage}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Anterioară
                    </Button>
                    <div className="flex items-center space-x-2">
                      {allImages.slice(0, 5).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            currentImageIndex === index ? 'bg-white' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={nextImage}>
                      Următoarea
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}