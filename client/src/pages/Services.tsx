import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Services() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/services'],
    refetchOnWindowFocus: false
  });

  const services = data?.services || [];

  return (
    <MainLayout>
      <div className="py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Serviciile Noastre de Grădinărit
            </h1>
            <p className="text-xl text-gray-600">
              Oferim o gamă largă de servicii profesionale de grădinărit și amenajare peisagistică pentru a îmbunătăți spațiul tău exterior.
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-32 bg-gray-200"></CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-50 rounded-lg">
              <h3 className="text-xl font-bold text-red-700 mb-2">Error Loading Services</h3>
              <p className="text-red-600 mb-4">We encountered a problem while loading our services.</p>
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.length === 0 ? (
                <div className="col-span-3 text-center p-8">
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Services Found</h3>
                  <p className="text-gray-600">We're currently updating our service offerings. Please check back later.</p>
                </div>
              ) : (
                services.map((service) => (
                  <Card key={service.id} className="overflow-hidden transition-all hover:shadow-lg">
                    {service.imageUrl && (
                      <div className="w-full h-56 overflow-hidden">
                        <img 
                          src={service.imageUrl} 
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription className="text-green-700 font-medium">
                        {service.price}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{service.description}</p>
                    </CardContent>
                    <CardFooter>
                      <div className="flex space-x-4">
                        <Link href={`/services/${service.id}`}>
                          <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                            Learn More
                          </Button>
                        </Link>
                        <Link href={`/appointment?service=${service.id}`}>
                          <Button className="bg-green-600 hover:bg-green-700">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}