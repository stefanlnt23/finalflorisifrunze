import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { SafeImage } from "@/components/ui/safe-image";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Star,
  Quote,
  Heart,
  Share2,
  Eye,
  ChevronLeft,
  Leaf,
  Flower2,
  TreePine,
  Sprout,
  Sun,
  ChevronRight,
} from "lucide-react";

export default function PortfolioDetail() {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [isMobile, setIsMobile] = useState(false);
  const [beforeAfterStates, setBeforeAfterStates] = useState<{
    [key: number]: "before" | "after";
  }>({});
  const [isHovered, setIsHovered] = useState<{ [key: number]: boolean }>({});

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Helper function to truncate text for mobile with read more
  const truncateText = (
    text: string,
    sectionKey: string,
    wordLimit: number = 10,
  ) => {
    const words = text.split(" ");
    const isExpanded = expandedSections[sectionKey];

    if (!isMobile || words.length <= wordLimit || isExpanded) {
      return text;
    }

    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Toggle between before and after for a specific transformation
  const toggleBeforeAfter = (index: number) => {
    setBeforeAfterStates((prev) => ({
      ...prev,
      [index]: prev[index] === "before" ? "after" : "before",
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

  // Initialize before/after states
  useEffect(() => {
    if (portfolioItem?.images) {
      const initialStates: { [key: number]: "before" | "after" } = {};
      const initialHoverStates: { [key: number]: boolean } = {};
      portfolioItem.images.forEach((_: any, index: number) => {
        initialStates[index] = "before";
        initialHoverStates[index] = false;
      });
      setBeforeAfterStates(initialStates);
      setIsHovered(initialHoverStates);
    }
  }, [portfolioItem]);

  // Auto-cycle through before/after states
  useEffect(() => {
    if (!portfolioItem?.images) return;

    const intervals: { [key: number]: NodeJS.Timeout } = {};

    portfolioItem.images.forEach((_: any, index: number) => {
      intervals[index] = setInterval(() => {
        if (!isHovered[index]) {
          setBeforeAfterStates((prev) => ({
            ...prev,
            [index]: prev[index] === "before" ? "after" : "before",
          }));
        }
      }, 3000); // Change every 3 seconds
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [portfolioItem?.images, isHovered]);

  // Handle hover state for pausing auto-cycle
  const handleMouseEnter = (index: number) => {
    setIsHovered((prev) => ({ ...prev, [index]: true }));
  };

  const handleMouseLeave = (index: number) => {
    setIsHovered((prev) => ({ ...prev, [index]: false }));
  };

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

  // Update view count when the page loads
  useEffect(() => {
    // In a real application, you would update the view count here
    // This would typically be an API call to increment the view count
  }, [id]);

  // Get all images (main + gallery)
  const allImages = [
    ...(portfolioItem?.imageUrl ? [portfolioItem.imageUrl] : []),
    ...(portfolioItem?.images?.map((img: any) => img.before).filter(Boolean) ||
      []),
    ...(portfolioItem?.images?.map((img: any) => img.after).filter(Boolean) ||
      []),
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length,
    );
  };

  // Generate different green shades for each transformation
  const getGreenShade = (index: number) => {
    const shades = [
      "from-emerald-50 to-green-100",
      "from-green-50 to-emerald-100",
      "from-teal-50 to-green-100",
      "from-green-100 to-emerald-200",
      "from-emerald-100 to-teal-100",
    ];
    return shades[index % shades.length];
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
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-30"></div>

        {/* Navigation */}
        <div className="relative z-10 pt-8 pb-6">
          <div className="container mx-auto px-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Portofoliu
            </Button>
          </div>
        </div>

        {/* Hero Content with Two-Column Layout */}
        <div className="relative z-10 py-16 pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Hero Title */}
              <div className="text-center text-white mb-12">
                {portfolioItem.featured && (
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 mb-4">
                    <Star className="w-3 h-3 mr-1" />
                    Proiect Destacat
                  </Badge>
                )}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  {portfolioItem.title}
                </h1>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-start mb-12">
                {/* Left Column - Project Description */}
                <div className="space-y-6 lg:pr-4">
                  <div>
                    {service && (
                      <Badge
                        variant="outline"
                        className="text-base px-3 py-1 bg-white/20 text-white border-white/30 mb-4"
                      >
                        {service.name}
                      </Badge>
                    )}
                    <h2 className="text-3xl font-bold text-white mb-4">
                      Detalii Proiect
                    </h2>
                    <div className="text-xl text-white/90 leading-relaxed">
                      <p>
                        {truncateText(portfolioItem.description, "description")}
                      </p>
                      {isMobile &&
                        portfolioItem.description.split(" ").length > 10 && (
                          <button
                            onClick={() => toggleSection("description")}
                            className="text-white/70 hover:text-white underline text-sm mt-2 block"
                          >
                            {expandedSections["description"]
                              ? "Arată mai puțin"
                              : "Citește mai mult"}
                          </button>
                        )}
                    </div>
                  </div>

                  {portfolioItem.challenges && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <h3 className="text-xl font-semibold text-white mb-3">
                        Provocări
                      </h3>
                      <div className="text-white/80">
                        <p>
                          {truncateText(portfolioItem.challenges, "challenges")}
                        </p>
                        {isMobile &&
                          portfolioItem.challenges.split(" ").length > 10 && (
                            <button
                              onClick={() => toggleSection("challenges")}
                              className="text-white/60 hover:text-white underline text-sm mt-2 block"
                            >
                              {expandedSections["challenges"]
                                ? "Arată mai puțin"
                                : "Citește mai mult"}
                            </button>
                          )}
                      </div>
                    </div>
                  )}

                  {portfolioItem.solution && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <h3 className="text-xl font-semibold text-white mb-3">
                        Soluția
                      </h3>
                      <div className="text-white/80">
                        <p>
                          {truncateText(portfolioItem.solution, "solution")}
                        </p>
                        {isMobile &&
                          portfolioItem.solution.split(" ").length > 10 && (
                            <button
                              onClick={() => toggleSection("solution")}
                              className="text-white/60 hover:text-white underline text-sm mt-2 block"
                            >
                              {expandedSections["solution"]
                                ? "Arată mai puțin"
                                : "Citește mai mult"}
                            </button>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button
                      size="lg"
                      className="bg-white text-green-900 hover:bg-green-50 shadow-xl"
                      onClick={() => (window.location.href = "/appointment")}
                    >
                      Programează Întâlnire
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-[#124a27] border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart
                        className={`w-4 h-4 mr-2 ${isLiked ? "fill-current text-red-400" : ""}`}
                      />
                      {isLiked ? "Îmi place" : "Apreciază"}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-[#134c29] border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                      onClick={() =>
                        navigator.share?.({
                          title: portfolioItem.title,
                          url: window.location.href,
                        })
                      }
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Distribuie
                    </Button>
                  </div>
                </div>

                {/* Right Column - Photo Gallery */}
                {allImages.length > 0 && (
                  <div className="space-y-6 lg:pl-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-3">
                        Galeria Proiectului
                      </h2>
                      <p className="text-xl text-white/80">
                        Descoperiți transformarea pas cu pas
                      </p>
                    </div>

                    {/* Main Image Display */}
                    <div className="relative">
                      <div className="aspect-[5/4] lg:aspect-[4/3] xl:aspect-[3/2] overflow-hidden rounded-2xl shadow-2xl">
                        <ImageLightbox
                          image={allImages[currentImageIndex]}
                          alt={`Project image ${currentImageIndex + 1}`}
                        />
                      </div>

                      {/* Navigation Arrows */}
                      {allImages.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm"
                            onClick={nextImage}
                          >
                            <ChevronRight className="w-6 h-6" />
                          </Button>
                        </>
                      )}

                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    </div>

                    {/* Thumbnail Navigation */}
                    {allImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {allImages.map((image: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              currentImageIndex === index
                                ? "border-white scale-105"
                                : "border-white/30 hover:border-white/60"
                            }`}
                          >
                            <ImageLightbox
                              image={image}
                              alt={`Thumbnail ${index + 1}`}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Project Stats - Centered Below */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6 text-center">
                    <MapPin className="w-8 h-8 text-white mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2 text-white">
                      Locație
                    </h3>
                    <p className="text-white/80">
                      {portfolioItem.location || "Nespecificat"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6 text-center">
                    <Clock className="w-8 h-8 text-white mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2 text-white">
                      Durată
                    </h3>
                    <p className="text-white/80">
                      {portfolioItem.projectDuration || "Nespecificat"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6 text-center">
                    <Eye className="w-8 h-8 text-white mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2 text-white">
                      Complexitate
                    </h3>
                    <p className="text-white/80">
                      {portfolioItem.difficultyLevel || "Standard"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Floating White Garden Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-10 text-white/20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <Leaf size={24} />
        </div>
        <div className="absolute top-32 right-20 text-white/20 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }}>
          <Flower2 size={20} />
        </div>
        <div className="absolute bottom-40 left-16 text-white/20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }}>
          <TreePine size={28} />
        </div>
        <div className="absolute top-60 left-1/3 text-white/20 animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
          <Sprout size={16} />
        </div>
        <div className="absolute bottom-20 right-32 text-white/20 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.5s' }}>
          <Sun size={22} />
        </div>
        <div className="absolute top-80 right-10 text-white/20 animate-pulse" style={{ animationDelay: '3s', animationDuration: '3.5s' }}>
          <Leaf size={18} />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 relative z-10">
        {/* Before & After Transformations - Reading Experience */}
        {portfolioItem.images && portfolioItem.images.length > 0 && (
          <section className="py-16 bg-transparent">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16 relative">
                  {/* White decorative elements around title */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                    <div className="text-white/30 animate-pulse">
                      <Leaf size={20} />
                    </div>
                    <div className="text-white/30 animate-bounce" style={{ animationDelay: '0.5s' }}>
                      <Flower2 size={16} />
                    </div>
                    <div className="text-white/30 animate-pulse" style={{ animationDelay: '1s' }}>
                      <Sprout size={18} />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
                    Transformarea Completă
                  </h2>
                  <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                    Urmăriți povestea transformării acestui spațiu, de la primul pas până la rezultatul final
                  </p>
                  <div className="w-24 h-1 bg-gradient-to-r from-white/40 to-white/60 mx-auto mt-6 rounded-full"></div>
                  
                  {/* White garden border decoration */}
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <div className="text-white/40 animate-pulse">
                      <TreePine size={14} />
                    </div>
                    <div className="w-8 h-px bg-white/30"></div>
                    <div className="text-white/40 animate-bounce" style={{ animationDelay: '0.3s' }}>
                      <Sun size={16} />
                    </div>
                    <div className="w-8 h-px bg-white/30"></div>
                    <div className="text-white/40 animate-pulse" style={{ animationDelay: '0.6s' }}>
                      <TreePine size={14} />
                    </div>
                  </div>
                </div>

                <div className="space-y-20">
                  {portfolioItem.images.map((image: any, index: number) => {
                    const currentState = beforeAfterStates[index] || "before";
                    const currentImage =
                      currentState === "before" ? image.before : image.after;

                    return (
                      <article
                        key={index}
                        className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                      >
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4 relative">
                          {/* White decorative corner elements */}
                          <div className="absolute top-4 right-8 text-white/20 animate-pulse">
                            <Leaf size={16} />
                          </div>
                          <div className="absolute top-6 right-12 text-white/20 animate-bounce" style={{ animationDelay: '0.5s' }}>
                            <Sprout size={12} />
                          </div>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                              <span className="text-white font-bold text-xl">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                {image.caption || `Transformarea spațiului ${index + 1}`}
                              </h3>
                              {/* White garden accent line */}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-8 h-px bg-white/40"></div>
                                <div className="text-white/50 animate-pulse">
                                  <Flower2 size={12} />
                                </div>
                                <div className="w-8 h-px bg-white/40"></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="px-8 pb-8">
                          {/* Large Interactive Image */}
                          <div className="relative mb-8">
                            <div 
                              className="relative group cursor-pointer"
                              onMouseEnter={() => handleMouseEnter(index)}
                              onMouseLeave={() => handleMouseLeave(index)}
                              onClick={() => toggleBeforeAfter(index)}
                            >
                              <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl shadow-2xl bg-white/5 relative">
                                <SafeImage
                                  src={currentImage}
                                  alt={`${currentState === "before" ? "Before" : "After"} ${image.caption || `Transformation ${index + 1}`}`}
                                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                                  fallbackIcon={<Leaf className="h-20 w-20 text-white/50 mx-auto mb-4" />}
                                />
                              </div>

                              {/* Toggle Button */}
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBeforeAfter(index);
                                }}
                                size="lg"
                                className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-900 shadow-xl px-6 py-3 rounded-xl font-semibold text-sm hover:scale-105 transition-all duration-300 z-10"
                              >
                                <span>Comută la</span>
                                <span
                                  className={`ml-2 font-bold ${currentState === "before" ? "text-green-600" : "text-red-600"}`}
                                >
                                  {currentState === "before" ? "DUPĂ" : "ÎNAINTE"}
                                </span>
                              </Button>

                              {/* State Badge */}
                              <div
                                className={`absolute top-6 right-6 px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm shadow-lg ${
                                  currentState === "before"
                                    ? "bg-red-500/90 text-white"
                                    : "bg-green-500/90 text-white"
                                } transition-all duration-300`}
                              >
                                {currentState === "before" ? "ÎNAINTE" : "DUPĂ"}
                              </div>

                              {/* Interactive indicator */}
                              <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium">
                                Click pentru comutare
                              </div>
                            </div>

                            {/* State Indicators */}
                            <div className="flex items-center justify-center gap-6 mt-6">
                              <div
                                className={`flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                  currentState === "before"
                                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                    : "bg-white/10 text-white/60 border border-white/20"
                                }`}
                              >
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    currentState === "before" ? "bg-red-400" : "bg-white/40"
                                  }`}
                                ></div>
                                <span>Înainte</span>
                              </div>

                              <div
                                className={`flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                  currentState === "after"
                                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                    : "bg-white/10 text-white/60 border border-white/20"
                                }`}
                              >
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    currentState === "after" ? "bg-green-400" : "bg-white/40"
                                  }`}
                                ></div>
                                <span>După</span>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {image.richDescription && (
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 relative overflow-hidden">
                              {/* White decorative background elements */}
                              <div className="absolute top-4 right-4 text-white/10 animate-pulse">
                                <TreePine size={24} />
                              </div>
                              <div className="absolute bottom-4 left-4 text-white/10 animate-bounce" style={{ animationDelay: '1s' }}>
                                <Sun size={20} />
                              </div>
                              
                              <h4 className="text-xl font-bold text-white/95 mb-4 flex items-center gap-3 relative z-10">
                                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                  <Flower2 className="text-white" size={16} />
                                </div>
                                Povestea acestei transformări
                                
                                {/* White decorative trail */}
                                <div className="flex items-center gap-1 ml-2">
                                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                                  <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                                  <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                </div>
                              </h4>
                              
                              <div className="prose prose-invert max-w-none relative z-10">
                                <p className="text-base text-white/80 leading-relaxed whitespace-pre-line">
                                  {image.richDescription}
                                </p>
                              </div>
                              
                              {/* White garden border at bottom */}
                              <div className="flex justify-center items-center gap-3 mt-6 pt-4 border-t border-white/20">
                                <div className="text-white/30 animate-pulse">
                                  <Leaf size={14} />
                                </div>
                                <div className="w-12 h-px bg-white/30"></div>
                                <div className="text-white/30 animate-bounce" style={{ animationDelay: '0.5s' }}>
                                  <Sprout size={12} />
                                </div>
                                <div className="w-12 h-px bg-white/30"></div>
                                <div className="text-white/30 animate-pulse" style={{ animationDelay: '1s' }}>
                                  <Leaf size={14} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Client Testimonial */}
        {portfolioItem.clientTestimonial?.clientName &&
          portfolioItem.clientTestimonial?.displayPermission && (
            <section className="py-12 bg-transparent">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-3">
                      Feedback de la Client
                    </h2>
                  </div>

                  <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <CardContent className="p-8 text-center relative">
                      <blockquote className="text-lg font-medium text-white/90 mb-6 italic leading-relaxed">
                        "{portfolioItem.clientTestimonial.comment}"
                      </blockquote>
                      <div className="text-base font-semibold text-white/80">
                        — {portfolioItem.clientTestimonial.clientName}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          )}

        {/* Call to Action */}
        <section className="py-12 bg-gradient-to-br from-green-600 to-emerald-700">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-3">
                Vrei o Transformare Similară?
              </h2>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Contactează-ne pentru a discuta despre proiectul tău. Oferim
                consultanță gratuită și planuri personalizate pentru fiecare
                spațiu.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-white text-green-700 hover:bg-green-50 shadow-xl px-8 py-4 text-lg"
                  onClick={() => (window.location.href = "/appointment")}
                >
                  Programează Consultația Gratuită
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground h-11 rounded-md border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg bg-[#111827]"
                  onClick={() => (window.location.href = "/contact")}
                >
                  Contactează-ne
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
