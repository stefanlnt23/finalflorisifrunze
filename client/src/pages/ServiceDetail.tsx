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
  ZoomIn
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
  const landscapeDesignImages = [
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=2070&auto=format&fit=crop", // Aerial view landscape design
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=2070&auto=format&fit=crop", // Garden pathway design
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2070&auto=format&fit=crop"  // Mountain landscape view
  ];
  
  const enhancedGallery = [
    ...landscapeDesignImages,
    ...(service.galleryImages || []),
    ...(service.imageUrl ? [service.imageUrl] : [])
  ];

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


      {/* Hero section */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {service.name}
            </h1>
            <p className="text-xl text-green-600 font-medium mb-6">
              {service.price}
            </p>
            <Link href={`/appointment?service=${service.id}`}>
              <Button className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg">
                Programează Acest Serviciu
              </Button>
            </Link>
          </div>

          {/* Service highlights cards */}
          {hasDetailedInfo && (
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {service.duration && (
                <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Durată</p>
                    <p className="font-medium">{service.duration}</p>
                  </div>
                </div>
              )}

              {service.coverage && (
                <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Map className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Acoperire</p>
                    <p className="font-medium">{service.coverage}</p>
                  </div>
                </div>
              )}

              {service.recommendedFrequency && (
                <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Frecvență</p>
                    <p className="font-medium">{service.recommendedFrequency}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main content section - Vertical layout instead of tabs */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Overview Section */}
            <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
              {/* Photo Album Gallery replacing single image */}
              <div className="space-y-4">
                <PhotoAlbum 
                  images={enhancedGallery}
                  autoRotate={true}
                  rotationInterval={5000}
                  showCounter={true}
                  className="rounded-lg overflow-hidden"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Despre Acest Serviciu</h2>
                <div className="prose prose-green max-w-none mb-6">
                  <p className="text-gray-600">{service.description}</p>
                </div>

                {/* Seasonal availability */}
                {service.seasonalAvailability && service.seasonalAvailability.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-3">Disponibilitate Sezonieră</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.seasonalAvailability.map((season, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {season}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <Link href={`/appointment?service=${service.id}`}>
                    <Button className="bg-green-600 hover:bg-green-700 w-full">
                      Programează Acest Serviciu
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            {service.benefits && service.benefits.length > 0 && (
              <div className="mb-16">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Beneficiile Serviciului Nostru {service.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {service.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 mt-1 mr-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </div>
                          <p className="text-gray-700">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* What's Included Section */}
            {service.includes && service.includes.length > 0 && (
              <div className="mb-16">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Ce Include
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {service.includes.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-start">
                          <div className="flex-shrink-0 mt-1 mr-3">
                            <ArrowRight className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-gray-700">{item}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}



            {/* FAQs Section */}
            {service.faqs && service.faqs.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Întrebări Frecvente
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {service.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-700">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Portfolio section */}
      {!portfolioLoading && portfolioItems.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Portofoliul Nostru de {service.name}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square overflow-hidden cursor-pointer relative group">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform" 
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                      <ZoomIn className="text-white w-12 h-12" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/portfolio" state={{ from: 'serviceDetail' }}>
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Vezi Toate Proiectele din Portofoliu
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Call to action */}
      <section className="py-12 bg-green-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Gata să îți transformi grădina?</h2>
          <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
            Contactează-ne astăzi pentru a programa serviciul tău de {service.name} sau pentru a solicita o consultație gratuită.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/appointment?service=${service.id}`}>
              <Button className="bg-white text-green-600 hover:bg-gray-100">
                Programează Acum
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="text-white border-white hover:bg-green-700">
                Contactează-ne
              </Button>
            </Link>
          </div>
        </div>
      </section>


    </MainLayout>
  );
}