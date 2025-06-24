import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Clock, 
  Leaf, 
  ChevronRight, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Map, 
  Award,
  X,
  ZoomIn,
  Star,
  Phone,
  Mail,
  MessageCircle,
  Shield,
  Users,
  TrendingUp,
  Heart,
  TreePine,
  Flower2,
  Sparkles,
  BadgeCheck,
  Target,
  Timer,
  Trophy
} from "lucide-react";
import { PhotoAlbum } from "@/components/ui/photo-album";

export default function ServiceDetail() {
  const { id } = useParams();
  const serviceId = id;

  const { data: serviceData, isLoading: serviceLoading, error: serviceError } = useQuery({
    queryKey: [`/api/services/${serviceId}`],
    enabled: !!serviceId,
    refetchOnWindowFocus: false
  });

  const { data: portfolioData, isLoading: portfolioLoading } = useQuery({
    queryKey: [`/api/portfolio/service/${serviceId}`],
    enabled: !!serviceId,
    refetchOnWindowFocus: false
  });

  const service = serviceData?.service;
  const portfolioItems = portfolioData?.portfolioItems || [];

  if (!serviceId) {
    return (
      <MainLayout>
        <div className="py-16 bg-red-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-red-700 mb-4">Invalid Service ID</h1>
            <p className="text-lg text-red-600 mb-6">The service ID provided is not valid.</p>
            <Link href="/services" state={{ from: 'serviceDetail' }}>
              <Button className="bg-green-600 hover:bg-green-700">View All Services</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (serviceLoading) {
    return (
      <MainLayout>
        <div className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (serviceError || !service) {
    return (
      <MainLayout>
        <div className="py-16 bg-red-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-red-700 mb-4">Service Not Found</h1>
            <p className="text-lg text-red-600 mb-6">The service you're looking for could not be found or may have been removed.</p>
            <Link href="/services" state={{ from: 'serviceDetail' }}>
              <Button className="bg-green-600 hover:bg-green-700">View All Services</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Create enhanced gallery with attached landscape design images and service gallery
  const enhancedGallery = [
    ...(service.galleryImages || []),
    ...(service.imageUrl ? [service.imageUrl] : [])
  ].filter(image => image && image.trim() !== '');

  // Determine if we have additional data beyond the basic fields
  const hasDetailedInfo = !!service.duration || !!service.coverage || 
    (service.benefits && service.benefits.length > 0) || 
    (service.includes && service.includes.length > 0) ||
    (service.faqs && service.faqs.length > 0) ||
    !!service.recommendedFrequency ||
    (service.seasonalAvailability && service.seasonalAvailability.length > 0) ||
    (service.galleryImages && service.galleryImages.length > 0);

  return (
    <MainLayout>
      {/* Enhanced Hero Section */}
      <div className="relative min-h-[70vh] bg-gradient-to-br from-green-900 via-green-700 to-green-500 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={service.imageUrl || enhancedGallery[0] || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=2070&auto=format&fit=crop"} 
            alt={service.name}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-700/60 to-green-500/40"></div>
        </div>

        {/* Floating Garden Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-float-slow opacity-20">
            <TreePine className="w-16 h-16 text-white" />
          </div>
          <div className="absolute top-32 right-20 animate-float-medium opacity-15">
            <Flower2 className="w-12 h-12 text-white" />
          </div>
          <div className="absolute bottom-40 left-1/4 animate-float-fast opacity-10">
            <Leaf className="w-20 h-20 text-white" />
          </div>
        </div>

        {/* Hero Content - Desktop Optimized */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1 lg:px-4 lg:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs lg:text-sm font-medium mb-4 lg:mb-6">
              <BadgeCheck className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              Serviciu Premium cu Garanție
            </div>

            {/* Main Title - Scaled for Desktop */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 lg:mb-6 leading-tight">
              {service.name}
            </h1>

            {/* Subtitle - Desktop Optimized */}
            <p className="text-lg md:text-xl lg:text-2xl mb-6 lg:mb-8 max-w-5xl mx-auto leading-relaxed text-green-50">
              {service.shortDesc || service.description.substring(0, 150) + "..."}
            </p>

            {/* Price with Appeal - Compact Desktop */}
            <div className="flex items-center justify-center mb-6 lg:mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 lg:px-8 lg:py-4 border border-white/20">
                <p className="text-sm lg:text-lg text-green-100 mb-1">Preț de la</p>
                <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white">{service.price}</p>
              </div>
            </div>

            {/* Primary CTA Buttons - Compact */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center items-center mb-8 lg:mb-10">
              <Link href={`/appointment?service=${service.id}`}>
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 lg:px-10 lg:py-4 text-base lg:text-lg font-bold rounded-2xl shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-300 border-2 border-orange-400">
                  <Calendar className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                  Programează Evaluare GRATUITĂ
                </Button>
              </Link>
              
              <a href="tel:+40742650670" className="inline-block">
                <Button variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white bg-white/90 backdrop-blur-sm px-6 py-3 lg:px-8 lg:py-4 text-base lg:text-lg font-semibold rounded-2xl shadow-lg">
                  <Phone className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3" />
                  Sună Acum: +40 742 650 670
                </Button>
              </a>
            </div>

            {/* Trust Indicators - Compact */}
            <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-6 text-green-100 text-xs lg:text-sm">
              <div className="flex items-center">
                <Shield className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
                Garanție 2 Ani
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
                500+ Clienți Mulțumiți
              </div>
              <div className="flex items-center">
                <Trophy className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
                10+ Ani Experiență
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" fill="none" className="w-full h-20">
            <path d="M0,120 L0,60 Q300,0 600,60 T1200,60 L1200,120 Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Service Highlights - Desktop Optimized */}
      {hasDetailedInfo && (
        <div className="py-8 lg:py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {service.duration && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 lg:mb-4 shadow-lg">
                    <Timer className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 lg:mb-2">Durată Serviciu</h3>
                  <p className="text-green-700 font-semibold text-base lg:text-lg">{service.duration}</p>
                  <p className="text-gray-600 mt-1 lg:mt-2 text-xs lg:text-sm">Livrare rapidă și eficientă</p>
                </div>
              )}

              {service.coverage && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 lg:mb-4 shadow-lg">
                    <Map className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 lg:mb-2">Acoperire</h3>
                  <p className="text-blue-700 font-semibold text-base lg:text-lg">{service.coverage}</p>
                  <p className="text-gray-600 mt-1 lg:mt-2 text-xs lg:text-sm">Deservim întreaga zonă</p>
                </div>
              )}

              {service.recommendedFrequency && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 lg:mb-4 shadow-lg">
                    <Calendar className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 lg:mb-2">Frecvență</h3>
                  <p className="text-purple-700 font-semibold text-base lg:text-lg">{service.recommendedFrequency}</p>
                  <p className="text-gray-600 mt-1 lg:mt-2 text-xs lg:text-sm">Planificare optimă</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section - Desktop Optimized */}
      {service.benefits && service.benefits.length > 0 && (
        <section className="py-10 lg:py-16 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8 lg:mb-12">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-3 lg:mb-4">
                  De Ce Să Alegi Serviciul Nostru?
                </h2>
                <p className="text-base lg:text-lg text-gray-600 max-w-4xl mx-auto">
                  Beneficiază de experiența noastră de peste 10 ani și transformă-ți grădina cu cea mai bună echipă din domeniu.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {service.benefits.map((benefit: string, index: number) => (
                  <div key={index} className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 lg:mb-4 shadow-lg">
                      <CheckCircle2 className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                    </div>
                    <p className="text-gray-800 text-sm lg:text-base leading-relaxed font-medium">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main content section - Desktop Optimized */}
      <section className="py-10 lg:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Overview Section with Enhanced Gallery - Better Desktop Layout */}
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start mb-12 lg:mb-16">
              {/* Enhanced Photo Album Gallery - Takes more space on desktop */}
              <div className="lg:col-span-3 space-y-4 lg:space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 lg:p-4 rounded-2xl lg:rounded-3xl shadow-lg">
                  <PhotoAlbum 
                    images={enhancedGallery}
                    autoRotate={true}
                    rotationInterval={5000}
                    showCounter={true}
                    className="rounded-xl lg:rounded-2xl overflow-hidden shadow-lg min-h-[300px] lg:min-h-[400px]"
                  />
                </div>
                
                {/* Gallery Stats - Compact for Desktop */}
                <div className="grid grid-cols-3 gap-2 lg:gap-3 text-center">
                  <div className="bg-green-50 p-2 lg:p-3 rounded-xl lg:rounded-2xl">
                    <div className="text-lg lg:text-xl font-bold text-green-600">{enhancedGallery.length}</div>
                    <div className="text-xs lg:text-sm text-gray-600">Imagini</div>
                  </div>
                  <div className="bg-blue-50 p-2 lg:p-3 rounded-xl lg:rounded-2xl">
                    <div className="text-lg lg:text-xl font-bold text-blue-600">10+</div>
                    <div className="text-xs lg:text-sm text-gray-600">Ani Exp.</div>
                  </div>
                  <div className="bg-purple-50 p-2 lg:p-3 rounded-xl lg:rounded-2xl">
                    <div className="text-lg lg:text-xl font-bold text-purple-600">500+</div>
                    <div className="text-xs lg:text-sm text-gray-600">Proiecte</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
                    Despre Acest Serviciu
                  </h2>
                  <div className="prose prose-green max-w-none mb-4 lg:mb-6">
                    <p className="text-gray-700 leading-relaxed text-sm lg:text-base">{service.description}</p>
                  </div>
                </div>

                {/* Seasonal availability - Compact */}
                {service.seasonalAvailability && service.seasonalAvailability.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-green-200">
                    <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-2 lg:mb-3 flex items-center">
                      <Calendar className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-green-600" />
                      Disponibilitate Sezonieră
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {service.seasonalAvailability.map((season: string, index: number) => (
                        <span key={index} className="px-2 py-1 lg:px-3 lg:py-1 bg-white border border-green-200 text-green-800 rounded-full text-xs lg:text-sm font-medium shadow-sm">
                          {season}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced CTA - Compact */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-2 border-orange-200">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">Gata să Începi?</h3>
                  <p className="text-gray-700 mb-3 lg:mb-4 text-sm lg:text-base">Contactează-ne pentru o evaluare gratuită și o ofertă personalizată.</p>
                  <div className="flex flex-col gap-2 lg:gap-3">
                    <Link href={`/appointment?service=${service.id}`} className="w-full">
                      <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white w-full py-2 lg:py-3 rounded-xl lg:rounded-2xl font-bold shadow-lg text-sm lg:text-base">
                        <Calendar className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                        Programează Acum
                      </Button>
                    </Link>
                    <a href="tel:+40742650670" className="w-full">
                      <Button variant="outline" className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 w-full py-2 lg:py-3 rounded-xl lg:rounded-2xl font-semibold text-sm lg:text-base">
                        <Phone className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                        Sună Direct
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Included Section - Desktop Optimized */}
            {service.includes && service.includes.length > 0 && (
              <div className="mb-12 lg:mb-16">
                <div className="text-center mb-6 lg:mb-8">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-3">
                    Ce Include Serviciul
                  </h2>
                  <p className="text-base lg:text-lg text-gray-600">
                    Pachet complet pentru rezultate profesionale garantate
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                  {service.includes.map((item: string, index: number) => {
                    // Determine icon based on content keywords
                    let IconComponent = CheckCircle2;
                    let iconColor = "from-green-500 to-green-600";
                    
                    if (item.toLowerCase().includes('consultație') || item.toLowerCase().includes('evaluare')) {
                      IconComponent = MessageCircle;
                      iconColor = "from-blue-500 to-blue-600";
                    } else if (item.toLowerCase().includes('plan') || item.toLowerCase().includes('design')) {
                      IconComponent = Target;
                      iconColor = "from-purple-500 to-purple-600";
                    } else if (item.toLowerCase().includes('material') || item.toLowerCase().includes('plante')) {
                      IconComponent = Leaf;
                      iconColor = "from-green-500 to-green-600";
                    } else if (item.toLowerCase().includes('vizualizare') || item.toLowerCase().includes('3d')) {
                      IconComponent = ZoomIn;
                      iconColor = "from-orange-500 to-orange-600";
                    }

                    return (
                      <div key={index} className="bg-white p-3 lg:p-4 rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${iconColor} rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <IconComponent className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 text-sm lg:text-base leading-relaxed font-medium">{item}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}



            {/* Social Proof Section - Desktop Optimized */}
            <div className="mb-12 lg:mb-16">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-white">
                <div className="text-center mb-6 lg:mb-8">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 lg:mb-3">
                    Ce Spun Clienții Noștri
                  </h2>
                  <p className="text-base lg:text-lg text-gray-300">
                    Peste 500 de grădini transformate cu succes
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-1">500+</div>
                    <div className="text-gray-300 text-sm lg:text-base">Proiecte Finalizate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-blue-400 mb-1">98%</div>
                    <div className="text-gray-300 text-sm lg:text-base">Clienți Mulțumiți</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-yellow-400 mb-1">10+</div>
                    <div className="text-gray-300 text-sm lg:text-base">Ani Experiență</div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/20">
                  <div className="flex items-center mb-3 lg:mb-4">
                    <div className="flex text-yellow-400 mr-3">
                      <Star className="w-4 h-4 lg:w-5 lg:h-5 fill-current" />
                      <Star className="w-4 h-4 lg:w-5 lg:h-5 fill-current" />
                      <Star className="w-4 h-4 lg:w-5 lg:h-5 fill-current" />
                      <Star className="w-4 h-4 lg:w-5 lg:h-5 fill-current" />
                      <Star className="w-4 h-4 lg:w-5 lg:h-5 fill-current" />
                    </div>
                    <span className="font-semibold text-sm lg:text-base">5.0/5 Stele</span>
                  </div>
                  <p className="text-sm lg:text-base italic leading-relaxed">
                    "Echipa Flori și Frunze a transformat complet grădina noastră. Profesionalismul și atenția la detalii sunt remarcabile. Recomand cu încredere!"
                  </p>
                  <div className="mt-3 lg:mt-4 text-xs lg:text-sm text-gray-300">
                    - Maria Popescu, București
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced FAQs Section - Desktop Optimized */}
            {service.faqs && service.faqs.length > 0 && (
              <div className="mb-12 lg:mb-16">
                <div className="text-center mb-6 lg:mb-8">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-3">
                    Întrebări Frecvente
                  </h2>
                  <p className="text-base lg:text-lg text-gray-600">
                    Răspunsuri clare la întrebările cele mai comune
                  </p>
                </div>

                <div className="max-w-5xl mx-auto">
                  <Accordion type="single" collapsible className="w-full space-y-3 lg:space-y-4">
                    {service.faqs.map((faq: any, index: number) => (
                      <AccordionItem key={index} value={`faq-${index}`} className="bg-white border border-gray-200 rounded-xl lg:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                        <AccordionTrigger className="text-left font-semibold text-base lg:text-lg px-4 py-3 lg:px-6 lg:py-4 hover:no-underline hover:bg-gray-50 rounded-t-xl lg:rounded-t-2xl">
                          <div className="flex items-center">
                            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 lg:mr-4 flex-shrink-0">
                              <span className="text-green-600 font-bold text-xs lg:text-sm">{index + 1}</span>
                            </div>
                            {faq.question}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 lg:px-6 lg:pb-6">
                          <div className="ml-9 lg:ml-12">
                            <p className="text-gray-700 leading-relaxed text-sm lg:text-base">{faq.answer}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {/* Additional FAQ CTA - Compact */}
                  <div className="text-center mt-6 lg:mt-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-green-200">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">Mai Ai Întrebări?</h3>
                      <p className="text-gray-700 mb-3 lg:mb-4 text-sm lg:text-base">
                        Echipa noastră de experți este gata să îți răspundă la orice întrebare specifică despre proiectul tău.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
                        <a href="tel:+40742650670">
                          <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl font-semibold text-sm lg:text-base">
                            <Phone className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                            Sună pentru Consultanță
                          </Button>
                        </a>
                        <a href="https://wa.me/40742650670" target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="border-2 border-green-300 text-green-600 hover:bg-green-50 px-4 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl font-semibold text-sm lg:text-base">
                            <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                            WhatsApp
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Portfolio section - Desktop Optimized */}
      {!portfolioLoading && portfolioItems.length > 0 && (
        <section className="py-10 lg:py-16 bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8 lg:mb-12">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-3 lg:mb-4">
                  Transformări Reale cu {service.name}
                </h2>
                <p className="text-base lg:text-lg text-gray-600 max-w-4xl mx-auto">
                  Descoperă proiectele noastre finalizate și inspiră-te pentru următoarea transformare
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
                {portfolioItems.map((item: any) => (
                  <div key={item.id} className="group relative bg-white rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3">
                    <div className="aspect-square overflow-hidden relative">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute bottom-2 lg:bottom-4 left-2 lg:left-4 right-2 lg:right-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-xs lg:text-sm font-medium bg-white/20 backdrop-blur-sm px-2 py-1 lg:px-3 lg:py-1 rounded-full">
                              Proiect Finalizat
                            </span>
                            <ZoomIn className="w-6 h-6 lg:w-8 lg:h-8" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 lg:p-4">
                      <h3 className="font-bold text-gray-900 mb-2 text-base lg:text-lg">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed line-clamp-3 text-sm lg:text-base">{item.description}</p>
                      <div className="mt-3 lg:mt-4 flex items-center justify-between">
                        <span className="text-green-600 font-semibold text-sm lg:text-base">Vezi Detalii</span>
                        <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/portfolio" state={{ from: 'serviceDetail' }}>
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 lg:px-8 lg:py-4 text-base lg:text-lg font-bold rounded-xl lg:rounded-2xl shadow-xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300">
                    <Trophy className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3" />
                    Vezi Toate Proiectele din Portofoliu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final Enhanced Call to Action */}
      <section className="py-20 bg-gradient-to-br from-green-900 via-green-800 to-green-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-float-slow">
            <TreePine className="w-24 h-24 text-white" />
          </div>
          <div className="absolute top-20 right-20 animate-float-medium">
            <Flower2 className="w-16 h-16 text-white" />
          </div>
          <div className="absolute bottom-20 left-1/3 animate-float-fast">
            <Leaf className="w-20 h-20 text-white" />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Urgency Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-full text-lg font-bold mb-8 animate-pulse">
              <Timer className="w-5 h-5 mr-2" />
              Ofertă Limitată - Consultanță GRATUITĂ
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Transformă-ți Grădina Acum!
            </h2>
            
            <p className="text-xl md:text-2xl text-green-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Nu mai aștepta! Începe transformarea grădinii tale cu echipa cu cea mai mare experiență din România. 
              <span className="font-bold text-white"> Consultanță gratuită doar în această lună!</span>
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href={`/appointment?service=${service.id}`}>
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-6 text-xl font-black rounded-3xl shadow-2xl hover:shadow-orange-500/50 transform hover:scale-110 transition-all duration-300 border-4 border-orange-400">
                  <Calendar className="w-6 h-6 mr-3" />
                  PROGRAMEAZĂ EVALUAREA GRATUITĂ
                </Button>
              </Link>
              
              <div className="text-white text-lg font-semibold">SAU</div>
              
              <a href="tel:+40742650670">
                <Button className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-green-700 px-10 py-6 text-xl font-bold rounded-3xl shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Phone className="w-6 h-6 mr-3" />
                  SUNĂ ACUM: +40 742 650 670
                </Button>
              </a>
            </div>

            {/* Contact Methods */}
            <div className="grid md:grid-cols-3 gap-8 text-white">
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                <Phone className="w-12 h-12 mb-4 text-green-300" />
                <h3 className="text-lg font-bold mb-2">Sună Direct</h3>
                <p className="text-green-100">+40 742 650 670</p>
                <p className="text-sm text-green-200 mt-2">Program: 8:00 - 18:00</p>
              </div>
              
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                <MessageCircle className="w-12 h-12 mb-4 text-green-300" />
                <h3 className="text-lg font-bold mb-2">WhatsApp</h3>
                <a href="https://wa.me/40742650670" className="text-green-100 hover:text-white">
                  Mesaj Direct
                </a>
                <p className="text-sm text-green-200 mt-2">Răspuns în 5 min</p>
              </div>
              
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                <Mail className="w-12 h-12 mb-4 text-green-300" />
                <h3 className="text-lg font-bold mb-2">Email</h3>
                <p className="text-green-100">info@florisifrunze.com</p>
                <p className="text-sm text-green-200 mt-2">Răspuns în 2 ore</p>
              </div>
            </div>

            {/* Final Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="flex flex-wrap justify-center items-center gap-8 text-green-200">
                <div className="flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  <span className="font-semibold">Garanție 2 Ani</span>
                </div>
                <div className="flex items-center">
                  <BadgeCheck className="w-6 h-6 mr-2" />
                  <span className="font-semibold">Licență Autorizată</span>
                </div>
                <div className="flex items-center">
                  <Heart className="w-6 h-6 mr-2" />
                  <span className="font-semibold">500+ Clienți Fericiți</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </MainLayout>
  );
}