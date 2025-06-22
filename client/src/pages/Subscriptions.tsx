import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Subscription } from "@shared/schema";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Star, Check, Users, Leaf, Droplets, Award, Clock, Scissors, Shield, Wrench, Palette } from "lucide-react";

export default function Subscriptions() {
  // Fetch subscriptions
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/subscriptions'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/subscriptions');
        if (!response.ok) {
          return [] as Subscription[];
        }
        const data = await response.json();
        if (!data || !data.subscriptions) {
          return [] as Subscription[];
        }
        return (data.subscriptions || []).map((sub: any) => ({
          id: sub.id || `temp-${Math.random()}`,
          name: sub.name || "Subscription",
          description: sub.description || "",
          imageUrl: sub.imageUrl || null,
          color: sub.color || "#4CAF50",
          features: Array.isArray(sub.features) ? sub.features : [],
          price: sub.price || "0 RON",
          isPopular: Boolean(sub.isPopular),
          displayOrder: parseInt(sub.displayOrder || "0")
        })) as Subscription[];
      } catch (err) {
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const subscriptions = data || [];
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Get popular subscription for testimonial
  const popularPlan = subscriptions.find(sub => sub.isPopular) || subscriptions[0];

  return (
    <MainLayout>
      <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Leaf className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Planuri de Abonament
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Alege planul perfect pentru grădina ta. Servicii profesionale de întreținere cu preturi transparente și fără surprize.
            </p>
            
            {/* Enhanced value propositions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Fără Angajament</span>
                <span className="text-sm text-gray-600 mt-1">Poți anula oricând</span>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">500+ Clienți</span>
                <span className="text-sm text-gray-600 mt-1">Evaluare medie 4.9/5</span>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Răspuns în 24h</span>
                <span className="text-sm text-gray-600 mt-1">Support rapid inclus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Nu s-au putut încărca planurile de abonament. Vă rugăm să încercați din nou mai târziu.</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <p>Nu există planuri de abonament disponibile momentan.</p>
          </div>
        ) : (
          <>
            {/* Pricing Cards */}
            <div className="py-16 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((subscription) => (
                    <Card 
                      key={subscription.id} 
                      className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                        subscription.isPopular ? 'ring-2 ring-green-500 scale-105' : ''
                      }`}
                      style={{ 
                        background: 'white',
                        minHeight: 'auto'
                      }}
                    >
                      {/* Enhanced Popular Badge */}
                      {subscription.isPopular && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 text-sm font-bold shadow-lg animate-pulse">
                            <Star className="w-4 h-4 mr-2 fill-current" />
                            RECOMANDAT
                          </Badge>
                        </div>
                      )}

                      {/* Enhanced Card Header */}
                      <div className="p-8 text-center border-b border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{subscription.name}</h3>
                        <div className="mb-6">
                          <span 
                            className="text-5xl font-black"
                            style={{ color: subscription.color }}
                          >
                            {subscription.price.split(' ')[0]}
                          </span>
                          <span className="text-gray-500 text-xl font-medium ml-2">
                            {subscription.price.split(' ').slice(1).join(' ')}
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">{subscription.description}</p>
                        
                        {/* Enhanced Best for section */}
                        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: `${subscription.color}10` }}>
                          <p className="text-sm font-semibold" style={{ color: subscription.color }}>Perfect pentru:</p>
                          <p className="text-sm text-gray-700 font-medium">
                            {subscription.displayOrder === 0 ? 'Proprietari cu grădini mici (până la 100 mp)' :
                             subscription.displayOrder === 1 ? 'Case cu grădini medii (100-300 mp)' :
                             subscription.displayOrder === 2 ? 'Proprietăți cu sisteme de irigații existente' :
                             subscription.displayOrder === 3 ? 'Clienți care doresc redesign complet' :
                             subscription.displayOrder === 4 ? 'Vile și proprietăți premium (300+ mp)' :
                             'Clienți care preferă soluții 100% ecologice'}
                          </p>
                        </div>
                      </div>

                      {/* Standardized Features */}
                      <CardContent className="p-8">
                        <div className="space-y-3">
                          {Array.isArray(subscription.features) && subscription.features.slice(0, 4).map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: subscription.color }}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <span className="text-gray-700 font-medium text-sm">
                                  {typeof feature === 'object' && feature.name ? feature.name : String(feature)}
                                </span>
                              </div>
                            </div>
                          ))}
                          
                          {subscription.features.length > 4 && (
                            <div className="text-center pt-3">
                              <span className="text-sm font-medium" style={{ color: subscription.color }}>
                                +{subscription.features.length - 4} servicii incluse
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      {/* Enhanced CTA Button */}
                      <CardFooter className="p-8 pt-0">
                        <Link href="/contact" className="w-full">
                          <Button 
                            className="w-full py-4 text-lg font-bold rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105 transform"
                            style={{ 
                              backgroundColor: subscription.color,
                              color: 'white'
                            }}
                          >
                            {subscription.isPopular ? 'Alege Planul Recomandat' : 'Alege Planul'}
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Testimonial Section */}
            <div className="bg-gray-50 py-16 px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Ce spun clienții noștri</h3>
                  <div className="flex items-center justify-center space-x-8 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">4.9/5</div>
                      <div className="text-sm text-gray-600">Evaluare medie</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">500+</div>
                      <div className="text-sm text-gray-600">Clienți mulțumiți</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">98%</div>
                      <div className="text-sm text-gray-600">Recomandă serviciile</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex justify-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 mb-4 italic text-sm">
                      "Planul Premium Garden a depășit așteptările. Grădina arată fantastic!"
                    </blockquote>
                    <cite className="text-gray-600 font-medium text-sm">Maria P., București</cite>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex justify-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 mb-4 italic text-sm">
                      "Serviciu profesionist, echipă punctuală. Recomand cu încredere!"
                    </blockquote>
                    <cite className="text-gray-600 font-medium text-sm">Alexandru M., Cluj</cite>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex justify-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 mb-4 italic text-sm">
                      "Cel mai bun raport calitate-preț. Suntem clienți de 3 ani."
                    </blockquote>
                    <cite className="text-gray-600 font-medium text-sm">Elena D., Timișoara</cite>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Comparison Table */}
            <div className="py-16 px-4 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Compară Planurile</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Vezi toate caracteristicile organizate pe categorii pentru a face cea mai bună alegere
                  </p>
                </div>

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-2 rounded-xl h-auto">
                    <TabsTrigger 
                      value="basic" 
                      className="py-3 px-6 text-sm font-semibold rounded-lg transition-all duration-300 hover:bg-green-100 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg cursor-pointer min-h-[44px]"
                    >
                      Servicii de Bază
                    </TabsTrigger>
                    <TabsTrigger 
                      value="advanced" 
                      className="py-3 px-6 text-sm font-semibold rounded-lg transition-all duration-300 hover:bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg cursor-pointer min-h-[44px]"
                    >
                      Servicii Avansate
                    </TabsTrigger>
                    <TabsTrigger 
                      value="premium" 
                      className="py-3 px-6 text-sm font-semibold rounded-lg transition-all duration-300 hover:bg-orange-100 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg cursor-pointer min-h-[44px]"
                    >
                      Servicii Premium
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    {/* Basic Services Comparison */}
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Servicii de Bază</th>
                              {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((sub) => (
                                <th key={sub.id} className="px-6 py-4 text-center text-sm font-semibold" style={{ color: sub.color }}>
                                  {sub.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
{[
                              { name: 'Tundere gazon', icon: Scissors },
                              { name: 'Curățare spații verzi', icon: Leaf },
                              { name: 'Tratamente fitosanitare', icon: Shield },
                              { name: 'Consultanță', icon: Users }
                            ].map((feature, index) => (
                              <tr key={feature.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  <div className="flex items-center space-x-3">
                                    <feature.icon className="w-5 h-5 text-green-600" />
                                    <span>{feature.name}</span>
                                  </div>
                                </td>
                                {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((sub) => {
                                  const hasFeature = sub.features.some(f => 
                                    (typeof f === 'object' ? f.name : f).toLowerCase().includes(feature.name.toLowerCase().split(' ')[0])
                                  );
                                  return (
                                    <td key={`${sub.id}-${feature.name}`} className="px-6 py-4 text-center">
                                      {hasFeature ? (
                                        <div className="flex justify-center">
                                          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: sub.color }}>
                                            <Check className="w-5 h-5 text-white font-bold" />
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-lg">—</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6">
                    {/* Advanced Services Comparison */}
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Servicii Avansate</th>
                              {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((sub) => (
                                <th key={sub.id} className="px-6 py-4 text-center text-sm font-semibold" style={{ color: sub.color }}>
                                  {sub.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
{[
                              { name: 'Design peisagistic', icon: Palette },
                              { name: 'Sisteme irigații', icon: Droplets },
                              { name: 'Plantare arbori', icon: Leaf },
                              { name: 'Amenajări decorative', icon: Award }
                            ].map((feature, index) => (
                              <tr key={feature.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  <div className="flex items-center space-x-3">
                                    <feature.icon className="w-5 h-5 text-blue-600" />
                                    <span>{feature.name}</span>
                                  </div>
                                </td>
                                {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((sub) => {
                                  const hasFeature = sub.features.some(f => 
                                    (typeof f === 'object' ? f.name : f).toLowerCase().includes(feature.name.toLowerCase().split(' ')[0])
                                  );
                                  return (
                                    <td key={`${sub.id}-${feature.name}`} className="px-6 py-4 text-center">
                                      {hasFeature ? (
                                        <div className="flex justify-center">
                                          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: sub.color }}>
                                            <Check className="w-5 h-5 text-white font-bold" />
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-lg">—</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="premium" className="space-y-6">
                    {/* Premium Services Comparison */}
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Servicii Premium</th>
                              {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((sub) => (
                                <th key={sub.id} className="px-6 py-4 text-center text-sm font-semibold" style={{ color: sub.color }}>
                                  {sub.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
{[
                              { name: 'Servicii urgență', icon: Clock },
                              { name: 'Design personalizat', icon: Palette },
                              { name: 'Elemente decorative', icon: Award },
                              { name: 'Întreținere săptămânală', icon: Wrench }
                            ].map((feature, index) => (
                              <tr key={feature.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  <div className="flex items-center space-x-3">
                                    <feature.icon className="w-5 h-5 text-orange-600" />
                                    <span>{feature.name}</span>
                                  </div>
                                </td>
                                {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((sub) => {
                                  const hasFeature = sub.features.some(f => 
                                    (typeof f === 'object' ? f.name : f).toLowerCase().includes(feature.name.toLowerCase().split(' ')[0])
                                  );
                                  return (
                                    <td key={`${sub.id}-${feature.name}`} className="px-6 py-4 text-center">
                                      {hasFeature ? (
                                        <div className="flex justify-center">
                                          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: sub.color }}>
                                            <Check className="w-5 h-5 text-white font-bold" />
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-lg">—</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="py-16 px-4 bg-gray-50">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Întrebări Frecvente</h2>
                  <p className="text-gray-600">Răspunsuri la cele mai frecvente întrebări despre planurile noastre</p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      q: "Pot să-mi schimb planul în orice moment?",
                      a: "Da, poți să-ți modifici planul oricând. Diferența de preț se calculează proporțional pentru perioada rămasă."
                    },
                    {
                      q: "Ce se întâmplă dacă nu sunt mulțumit de servicii?",
                      a: "Oferim garanție de satisfacție. Dacă nu ești mulțumit, revenim să corectăm problema fără costuri suplimentare."
                    },
                    {
                      q: "Sunt incluse materialele în preț?", 
                      a: "Materialele de bază sunt incluse. Pentru materiale premium sau plante speciale, te vom informa în prealabil."
                    },
                    {
                      q: "Cât timp durează să văd rezultate?",
                      a: "Primele îmbunătățiri sunt vizibile imediat, iar rezultatele complete se observă în 2-4 săptămâni."
                    }
                  ].map((faq, index) => (
                    <Collapsible key={index}>
                      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-white p-6 text-left hover:bg-gray-50">
                        <span className="font-medium text-gray-900">{faq.q}</span>
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-6 pb-6 text-gray-600">
                        {faq.a}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}