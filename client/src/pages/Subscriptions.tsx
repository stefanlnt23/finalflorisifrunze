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
import { ChevronDown, Star, Check, Users, Leaf, Droplets, Award, Clock } from "lucide-react";

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
            
            {/* Value propositions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 text-green-700">
                <Award className="w-5 h-5" />
                <span className="font-medium">10+ ani experiență</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-green-700">
                <Users className="w-5 h-5" />
                <span className="font-medium">500+ clienți mulțumiți</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-green-700">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Răspuns în 24h</span>
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
                      {/* Popular Badge */}
                      {subscription.isPopular && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-20">
                          <Badge className="bg-green-500 text-white px-4 py-1 text-sm font-medium">
                            <Star className="w-4 h-4 mr-1" />
                            Cel Mai Popular
                          </Badge>
                        </div>
                      )}

                      {/* Card Header */}
                      <div className="p-8 text-center border-b border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{subscription.name}</h3>
                        <div className="mb-4">
                          <span 
                            className="text-4xl font-bold"
                            style={{ color: subscription.color }}
                          >
                            {subscription.price.split(' ')[0]}
                          </span>
                          <span className="text-gray-500 text-lg ml-1">
                            {subscription.price.split(' ').slice(1).join(' ')}
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{subscription.description}</p>
                        
                        {/* Best for section */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700">Ideal pentru:</p>
                          <p className="text-sm text-gray-600">
                            {subscription.displayOrder === 0 ? 'Grădini mici și apartamente cu balcon' :
                             subscription.displayOrder === 1 ? 'Case cu grădini medii și familii active' :
                             subscription.displayOrder === 2 ? 'Proprietăți cu sisteme de irigații' :
                             subscription.displayOrder === 3 ? 'Clienți care doresc design personalizat' :
                             subscription.displayOrder === 4 ? 'Vile și proprietăți premium' :
                             'Clienți care preferă soluții ecologice'}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      <CardContent className="p-8">
                        <div className="space-y-4">
                          {Array.isArray(subscription.features) && subscription.features.slice(0, 6).map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div 
                                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: subscription.color }}
                              >
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              <div className="flex-1">
                                <span className="text-gray-700 font-medium">
                                  {typeof feature === 'object' && feature.name ? feature.name : String(feature)}
                                </span>
                                {typeof feature === 'object' && feature.value && (
                                  <span className="text-gray-500 ml-2">({feature.value})</span>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {subscription.features.length > 6 && (
                            <div className="text-center pt-2">
                              <span className="text-sm text-gray-500">
                                +{subscription.features.length - 6} servicii suplimentare
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      {/* CTA Button */}
                      <CardFooter className="p-8 pt-0">
                        <Link href="/contact" className="w-full">
                          <Button 
                            className="w-full py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:shadow-lg"
                            style={{ 
                              backgroundColor: subscription.color,
                              color: 'white'
                            }}
                          >
                            {subscription.isPopular ? 'Alege Planul Popular' : 'Începe Acum'}
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonial Section */}
            {popularPlan && (
              <div className="bg-gray-50 py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8">Ce spun clienții noștri</h3>
                  <div className="bg-white rounded-xl p-8 shadow-lg">
                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-gray-700 mb-4 italic">
                      "Planul {popularPlan.name} a transformat complet grădina noastră. Echipa este profesionistă și rezultatele sunt impresionante. Recomand cu încredere!"
                    </blockquote>
                    <cite className="text-gray-600 font-medium">Maria P., București</cite>
                  </div>
                </div>
              </div>
            )}

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
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="basic">Servicii de Bază</TabsTrigger>
                    <TabsTrigger value="advanced">Servicii Avansate</TabsTrigger>
                    <TabsTrigger value="premium">Servicii Premium</TabsTrigger>
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
                            {['Tundere gazon', 'Curățare spații verzi', 'Tratamente fitosanitare', 'Consultanță'].map((feature, index) => (
                              <tr key={feature} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature}</td>
                                {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((sub) => {
                                  const hasFeature = sub.features.some(f => 
                                    (typeof f === 'object' ? f.name : f).toLowerCase().includes(feature.toLowerCase().split(' ')[0])
                                  );
                                  return (
                                    <td key={`${sub.id}-${feature}`} className="px-6 py-4 text-center">
                                      {hasFeature ? (
                                        <div className="flex justify-center">
                                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: sub.color }}>
                                            <Check className="w-4 h-4 text-white" />
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">—</span>
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
                            {['Design peisagistic', 'Sisteme irigații', 'Plantare arbori', 'Amenajări decorative'].map((feature, index) => (
                              <tr key={feature} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature}</td>
                                {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((sub) => {
                                  const hasFeature = sub.features.some(f => 
                                    (typeof f === 'object' ? f.name : f).toLowerCase().includes(feature.toLowerCase().split(' ')[0])
                                  );
                                  return (
                                    <td key={`${sub.id}-${feature}`} className="px-6 py-4 text-center">
                                      {hasFeature ? (
                                        <div className="flex justify-center">
                                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: sub.color }}>
                                            <Check className="w-4 h-4 text-white" />
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">—</span>
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
                            {['Servicii urgență', 'Design personalizat', 'Elemente decorative', 'Întreținere săptămânală'].map((feature, index) => (
                              <tr key={feature} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature}</td>
                                {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((sub) => {
                                  const hasFeature = sub.features.some(f => 
                                    (typeof f === 'object' ? f.name : f).toLowerCase().includes(feature.toLowerCase().split(' ')[0])
                                  );
                                  return (
                                    <td key={`${sub.id}-${feature}`} className="px-6 py-4 text-center">
                                      {hasFeature ? (
                                        <div className="flex justify-center">
                                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: sub.color }}>
                                            <Check className="w-4 h-4 text-white" />
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">—</span>
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