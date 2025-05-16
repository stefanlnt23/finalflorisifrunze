
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Portfolio() {
  const [, setLocation] = useLocation();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  // Fetch all portfolio items
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/portfolio'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio items');
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Fetch all services for filtering
  const { data: servicesData } = useQuery({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  const services = servicesData?.services || [];
  const portfolioItems = data?.portfolioItems || [];
  
  // Filter items based on selected service
  const filteredItems = selectedService 
    ? portfolioItems.filter((item: any) => item.serviceId === selectedService)
    : portfolioItems;
    
  // Only show published items
  const publishedItems = filteredItems.filter((item: any) => item.status === 'Published');
  
  // Get service name for display
  const getServiceName = (serviceId: string) => {
    const service = services.find((s: any) => s.id === serviceId);
    return service ? service.name : 'General Service';
  };
  
  return (
    <MainLayout>
      <div className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Portofoliul Nostru</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Răsfoiește proiectele noastre finalizate și vezi cum am transformat spațiile exterioare pentru clienții noștri valoroși.
            </p>
          </div>
          
          {/* Service Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                variant={selectedService === null ? "default" : "outline"}
                className={selectedService === null ? "bg-green-600 hover:bg-green-700" : ""}
                onClick={() => setSelectedService(null)}
              >
                Toate Proiectele
              </Button>
              
              {services.map((service: any) => (
                <Button 
                  key={service.id}
                  variant={selectedService === service.id ? "default" : "outline"}
                  className={selectedService === service.id ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => setSelectedService(service.id)}
                >
                  {service.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Portfolio Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-50 rounded-lg">
              <h3 className="text-xl font-bold text-red-700 mb-2">Error Loading Portfolio</h3>
              <p className="text-red-600 mb-4">We encountered a problem while loading our portfolio projects.</p>
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedItems.length === 0 ? (
                <div className="col-span-3 text-center p-8">
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Portfolio Items Found</h3>
                  <p className="text-gray-600">We're currently updating our portfolio. Please check back later.</p>
                </div>
              ) : (
                publishedItems.map((item: any) => (
                  <Card key={item.id} className="overflow-hidden group">
                    <div className="relative aspect-square">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-green-100 flex items-center justify-center">
                          <i className="fas fa-leaf text-5xl text-green-500"></i>
                        </div>
                      )}
                      
                      {item.featured && (
                        <Badge className="absolute top-2 right-2 bg-yellow-400 text-yellow-900">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">
                        {item.title}
                      </h3>
                      
                      <div className="text-sm text-gray-500 mb-3 flex items-center">
                        <i className="fas fa-map-marker-alt mr-1 text-green-600"></i>
                        {item.location || "Various Locations"}
                        
                        {item.date && (
                          <>
                            <span className="mx-2">•</span>
                            <i className="far fa-calendar-alt mr-1 text-green-600"></i>
                            {format(new Date(item.date), "MMM yyyy")}
                          </>
                        )}
                      </div>
                      
                      <p className="text-gray-700 line-clamp-2 mb-4">
                        {item.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                          {getServiceName(item.serviceId)}
                        </Badge>
                        
                        <Button 
                          variant="ghost" 
                          className="text-green-600 hover:text-green-800"
                          onClick={() => setLocation(`/portfolio/${item.id}`)}
                        >
                          Read More
                          <i className="fas fa-arrow-right ml-2"></i>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
          
          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ești gata să îți transformi spațiul?</h2>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              Contactează-ne astăzi pentru a discuta despre proiectul tău sau programează o programare pentru o consultație.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setLocation("/appointment")}
              >
                Programează o Întâlnire
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/contact")}
              >
                Contactează-ne
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
