import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { ArrowLeft, Calendar, MapPin, Clock, Star, Quote, Heart, Share2, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export default function PortfolioDetail() {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

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

  // Update view count when the page loads
  useEffect(() => {
    // In a real application, you would update the view count here
    // This would typically be an API call to increment the view count
  }, [id]);

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
                      <Badge variant="outline" className="text-base px-3 py-1 bg-white/20 text-white border-white/30 mb-4">
                        {service.name}
                      </Badge>
                    )}
                    <h2 className="text-3xl font-bold text-white mb-4">
                      Detalii Proiect
                    </h2>
                    <p className="text-xl text-white/90 leading-relaxed">
                      {portfolioItem.description}
                    </p>
                  </div>
                  
                  {portfolioItem.challenges && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <h3 className="text-xl font-semibold text-white mb-3">Provocări</h3>
                      <p className="text-white/80">{portfolioItem.challenges}</p>
                    </div>
                  )}
                  
                  {portfolioItem.solution && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <h3 className="text-xl font-semibold text-white mb-3">Soluția</h3>
                      <p className="text-white/80">{portfolioItem.solution}</p>
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
                      <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current text-red-400' : ''}`} />
                      {isLiked ? 'Îmi place' : 'Apreciază'}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-[#134c29] border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                      onClick={() => navigator.share?.({ title: portfolioItem.title, url: window.location.href })}
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
                                ? 'border-white scale-105'
                                : 'border-white/30 hover:border-white/60'
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
                    <h3 className="text-lg font-bold mb-2 text-white">Locație</h3>
                    <p className="text-white/80">{portfolioItem.location || "Nespecificat"}</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6 text-center">
                    <Clock className="w-8 h-8 text-white mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2 text-white">Durată</h3>
                    <p className="text-white/80">{portfolioItem.projectDuration || "Nespecificat"}</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6 text-center">
                    <Eye className="w-8 h-8 text-white mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2 text-white">Complexitate</h3>
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


        {/* Before & After Transformations */}
        {portfolioItem.images && portfolioItem.images.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Transformările Realizate
                  </h2>
                  <p className="text-lg text-gray-600">
                    Vedere înainte și după pentru fiecare etapă
                  </p>
                </div>

                <div className="space-y-10">
                  {portfolioItem.images.map((image: any, index: number) => (
                    <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden">
                      <div className="p-8">
                        <h3 className="text-xl font-bold text-center mb-6 text-gray-900">
                          {image.caption || `Transformarea ${index + 1}`}
                        </h3>

                        {/* Before-After Comparison */}
                        <div className="grid lg:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-bold">Î</span>
                              </div>
                              <h4 className="text-xl font-semibold text-gray-900">
                                Înainte de Transformare
                              </h4>
                            </div>
                            <div className="aspect-square overflow-hidden rounded-xl shadow-lg">
                              <img
                                src={image.before}
                                alt={`Before ${image.caption || `Transformation ${index + 1}`}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-bold">D</span>
                              </div>
                              <h4 className="text-xl font-semibold text-gray-900">
                                După Transformare
                              </h4>
                            </div>
                            <div className="aspect-square overflow-hidden rounded-xl shadow-lg">
                              <img
                                src={image.after}
                                alt={`After ${image.caption || `Transformation ${index + 1}`}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {image.richDescription && (
                          <div className="bg-green-50 rounded-xl p-8 border border-green-100">
                            <h4 className="text-xl font-bold mb-4 text-gray-900">
                              Despre Această Transformare
                            </h4>
                            <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">
                              {image.richDescription}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
                Contactează-ne pentru a discuta despre proiectul tău. Oferim consultanță gratuită și planuri personalizate pentru fiecare spațiu.
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