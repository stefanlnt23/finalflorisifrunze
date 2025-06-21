import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ImageLightbox } from "@/components/ui/image-lightbox";
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
      portfolioItem.images.forEach((_: any, index: number) => {
        initialStates[index] = "before";
      });
      setBeforeAfterStates(initialStates);
    }
  }, [portfolioItem]);

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

              <div className="grid lg:grid-cols-2 gap-16 items-start mb-12">
                {/* Left Column - Project Description */}
                <div className="space-y-6">
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
                  <div className="space-y-6">
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
                      <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
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

      {/* Main Content */}
      <div className="bg-white">
        {/* Before & After Transformations - Redesigned */}
        {portfolioItem.images && portfolioItem.images.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Transformările Realizate
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Descoperiți cum am transformat fiecare spațiu, pas cu pas
                  </p>
                  <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-emerald-600 mx-auto mt-6 rounded-full"></div>
                </div>

                <div className="space-y-16">
                  {portfolioItem.images.map((image: any, index: number) => {
                    const currentState = beforeAfterStates[index] || "before";
                    const currentImage =
                      currentState === "before" ? image.before : image.after;

                    return (
                      <div
                        key={index}
                        className={`bg-gradient-to-br ${getGreenShade(index)} rounded-3xl shadow-2xl overflow-hidden`}
                      >
                        <div className="p-8 lg:p-12">
                          <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Column - Description */}
                            <div className="space-y-6">
                              <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <span className="text-white font-bold text-lg">
                                    {index + 1}
                                  </span>
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                  {image.caption ||
                                    `Transformarea ${index + 1}`}
                                </h3>
                              </div>

                              {image.richDescription && (
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-green-200/50 shadow-lg">
                                  <h4 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs">
                                        ℹ
                                      </span>
                                    </div>
                                    Despre Această Transformare
                                  </h4>
                                  <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">
                                    {image.richDescription}
                                  </p>
                                </div>
                              )}

                              {/* Current View Indicator */}
                              <div className="flex items-center gap-4">
                                <div
                                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                                    currentState === "before"
                                      ? "bg-red-100 border-red-300 text-red-700"
                                      : "bg-gray-100 border-gray-300 text-gray-600"
                                  }`}
                                >
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      currentState === "before"
                                        ? "bg-red-500"
                                        : "bg-gray-400"
                                    }`}
                                  ></div>
                                  <span className="font-medium">Înainte</span>
                                </div>

                                <div
                                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                                    currentState === "after"
                                      ? "bg-green-100 border-green-300 text-green-700"
                                      : "bg-gray-100 border-gray-300 text-gray-600"
                                  }`}
                                >
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      currentState === "after"
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                    }`}
                                  ></div>
                                  <span className="font-medium">După</span>
                                </div>
                              </div>
                            </div>

                            {/* Right Column - Interactive Image */}
                            <div className="relative">
                              <div className="relative group">
                                <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl bg-white">
                                  <img
                                    src={currentImage}
                                    alt={`${currentState === "before" ? "Before" : "After"} ${image.caption || `Transformation ${index + 1}`}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />

                                  {/* Overlay gradient */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>

                                {/* Toggle Button */}
                                <Button
                                  onClick={() => toggleBeforeAfter(index)}
                                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 shadow-xl border border-white/50 px-6 py-3 rounded-full font-medium"
                                >
                                  <span className="mr-2">Arată</span>
                                  <span
                                    className={`font-bold ${currentState === "before" ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {currentState === "before"
                                      ? "După"
                                      : "Înainte"}
                                  </span>
                                </Button>

                                {/* Corner Label */}
                                <div
                                  className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
                                    currentState === "before"
                                      ? "bg-red-500 text-white"
                                      : "bg-green-500 text-white"
                                  }`}
                                >
                                  {currentState === "before"
                                    ? "Înainte"
                                    : "După"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      Feedback de la Client
                    </h2>
                  </div>

                  <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-12 text-center relative">
                      <Quote className="w-16 h-16 text-green-200 mx-auto mb-8" />
                      <blockquote className="text-2xl font-medium text-gray-800 mb-8 italic leading-relaxed">
                        "{portfolioItem.clientTestimonial.comment}"
                      </blockquote>
                      <div className="text-xl font-semibold text-green-700">
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
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
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
