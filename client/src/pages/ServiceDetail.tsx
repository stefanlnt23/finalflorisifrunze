import MainLayout from "@/components/layouts/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ServiceDetail() {
  const { id } = useParams();
  // With MongoDB we use the string ID directly, no need to parse as integer
  const serviceId = id;

  console.log("Service Detail Page - serviceId:", serviceId);

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

  console.log("Service Detail Page - serviceData:", serviceData);
  console.log("Service Detail Page - error:", serviceError);

  const service = serviceData?.service;
  const portfolioItems = portfolioData?.portfolioItems || [];

  if (!serviceId) {
    return (
      <MainLayout>
        <div className="py-16 bg-red-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-red-700 mb-4">Invalid Service ID</h1>
            <p className="text-lg text-red-600 mb-6">The service ID provided is not valid.</p>
            <Link href="/services">
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
            <Link href="/services">
              <Button className="bg-green-600 hover:bg-green-700">View All Services</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero section */}
      <div className="py-16 bg-gradient-to-b from-green-50 to-white">
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
                Book This Service
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Service details section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {service.imageUrl && (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={service.imageUrl} 
                  alt={service.name} 
                  className="w-full h-auto"
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Service</h2>
              <div className="prose prose-green max-w-none mb-6">
                <p className="text-gray-600">{service.description}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Why Choose Our {service.name} Service?</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                      <i className="fas fa-check text-green-600 text-xs"></i>
                    </div>
                    <p className="text-gray-600">Experienced and knowledgeable professionals</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                      <i className="fas fa-check text-green-600 text-xs"></i>
                    </div>
                    <p className="text-gray-600">Eco-friendly practices and sustainable solutions</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                      <i className="fas fa-check text-green-600 text-xs"></i>
                    </div>
                    <p className="text-gray-600">Tailored approaches for your specific needs</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                      <i className="fas fa-check text-green-600 text-xs"></i>
                    </div>
                    <p className="text-gray-600">Satisfaction guaranteed</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio section */}
      {!portfolioLoading && portfolioItems.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Our {service.name} Portfolio
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/portfolio">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  View All Portfolio Projects
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Call to action */}
      <section className="py-12 bg-green-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to transform your garden?</h2>
          <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
            Contact us today to schedule your {service.name} service or request a free consultation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/appointment?service=${service.id}`}>
              <Button className="bg-white text-green-600 hover:bg-gray-100">
                Book Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="text-white border-white hover:bg-green-700">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}