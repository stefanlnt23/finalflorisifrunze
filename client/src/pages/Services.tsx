
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Leaf, Clock, CheckCircle2 } from "lucide-react";

export default function Services() {
  // Add state to track if this is the initial render
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/services'],
    refetchOnWindowFocus: false,
    staleTime: Infinity, // Never refetch unless manually invalidated
    gcTime: Infinity, // Keep in cache indefinitely
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
    retry: 1 // Only retry once on failure
  });

  const services = data?.services || [];
  
  // Set isInitialRender to false after the first render
  useEffect(() => {
    // Use a timeout to ensure the animation plays on the first render
    const timer = setTimeout(() => {
      setIsInitialRender(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout>
      {/* Hero Section with Lawn Mower Background */}
      <div className="relative py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://media.istockphoto.com/id/1419427334/photo/banner-a-human-lawn-mower-cuts-the-grass-in-the-backyard-agricultural-machinery-for-the-care.jpg?s=2048x2048&w=is&k=20&c=tMDk5EOOGu636didpzBMOY29ZXJjM07MlKfrTs6jgg4=" 
            alt="Lawn mowing service" 
            className="object-cover object-center w-full h-full"
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-white bg-opacity-20 text-white text-sm font-medium mb-6 animate-fadeIn">
              Experți în Grădinărit
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 text-shadow-md animate-slideIn">
              Serviciile Noastre de Grădinărit
            </h1>
            <div className="w-24 h-1 bg-green-400 mx-auto mb-8 animate-grow"></div>
            <p className="text-xl text-white text-opacity-90 mb-10 animate-slideUp animation-delay-300">
              Oferim o gamă largă de servicii profesionale de grădinărit și amenajare peisagistică 
              pentru a îmbunătăți spațiul tău exterior.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fadeIn animation-delay-500">
              <Link href="/appointment">
                <Button size="lg" className="bg-green-600 text-white hover:bg-green-700 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                  Programează o Consultație
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-700 transition-all transform hover:scale-105 bg-green-600/30">
                  Contactează-ne
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}></div>
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
              De la planificare și amenajare până la întreținere regulată, suntem aici pentru a transforma spațiul tău exterior.
            </p>
          </div>

          {/* Services Display */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
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
              <h3 className="text-2xl font-bold text-red-700 mb-3">Nu am putut încărca serviciile</h3>
              <p className="text-red-600 mb-6">Am întâmpinat o problemă în timp ce încărcăm lista de servicii. Te rugăm să încerci din nou.</p>
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 shadow-md">
                Încearcă din nou
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {services.length === 0 ? (
                <div className="col-span-3 text-center p-16 bg-gray-50 rounded-xl">
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">Actualizăm Serviciile Noastre</h3>
                  <p className="text-gray-600 mb-6">Momentan actualizăm oferta noastră de servicii. Te rugăm să revii mai târziu.</p>
                  <Link href="/contact">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Contactează-ne pentru Detalii
                    </Button>
                  </Link>
                </div>
              ) : (
                services.map((service, index) => (
                  <Card key={service.id} className={`group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-white rounded-xl ${isInitialRender ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: isInitialRender ? `${index * 150}ms` : '0ms' }}>
                    {service.imageUrl ? (
                      <div className="relative w-full h-64 overflow-hidden">
                        <img 
                          src={service.imageUrl} 
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-green-100 flex items-center justify-center">
                        <Leaf className="h-24 w-24 text-green-300" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl font-bold relative group-hover:text-green-700 transition-colors duration-300">
                        {service.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-1/2"></span>
                      </CardTitle>
                      <CardDescription className="text-green-700 font-semibold text-lg">
                        {service.price}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 leading-relaxed">
                        {service.description.length > 150
                          ? `${service.description.substring(0, 150)}...`
                          : service.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-4 border-t border-gray-100">
                      <Link href={`/services/${service.id}`}>
                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 group-hover:border-green-700 group-hover:text-green-700 transition-all">
                          Află Mai Multe
                          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                      <Link href={`/appointment?service=${service.id}`}>
                        <Button className="bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all">
                          Programează
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
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Materiale Ecologice</h3>
              <p className="text-gray-600">Folosim materiale și tehnici prietenoase cu mediul pentru toate proiectele noastre.</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6 shadow-md transform transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Servicii Prompte</h3>
              <p className="text-gray-600">Respectăm timpul tău și oferim servicii prompte, la momentul convenit.</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6 shadow-md transform transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Calitate Garantată</h3>
              <p className="text-gray-600">Garantăm calitatea muncii noastre și oferim servicii de întreținere de lungă durată.</p>
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
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Nu găsești serviciul potrivit?</h3>
                <p className="text-gray-600 mb-6">Contactează-ne pentru o consultație personalizată și vom crea o soluție adaptată nevoilor tale specifice.</p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/contact">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Contactează-ne
                    </Button>
                  </Link>
                  <Link href="/appointment">
                    <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                      Programare Consultație
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 bg-green-100 flex items-center justify-center p-8 md:p-0">
                <img 
                  src="https://media.istockphoto.com/id/150684324/photo/senior-woman-trimming-flowers.jpg?s=2048x2048&w=is&k=20&c=I8wi3h97np58YRsx8an6-qqs_KID33Wm14wAB9BXILg=" 
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
