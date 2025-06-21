import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Subscription } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export default function Subscriptions() {
  // Fetch subscriptions
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/subscriptions'],
    queryFn: async () => {
      try {
        console.log("Fetching subscriptions from API...");
        const response = await fetch('/api/subscriptions');

        // Check if the response is ok
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          return [] as Subscription[];
        }

        // Parse the JSON response
        const data = await response.json();
        console.log("API response data:", data);

        if (!data || !data.subscriptions) {
          console.error("No subscriptions data in response");
          return [] as Subscription[];
        }

        // Log each subscription for debugging
        if (data.subscriptions && data.subscriptions.length > 0) {
          console.log(`Retrieved ${data.subscriptions.length} subscriptions`);
          console.log("First subscription:", data.subscriptions[0]);
        } else {
          console.error("API returned empty subscriptions array");
        }

        // Map to ensure proper format
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
        console.error("Error fetching subscriptions:", err);
        throw err; // Let the query handle the error
      }
    },
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const subscriptions = data || [];

  console.log("Rendered subscriptions:", subscriptions);

  // For entry animations
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout>
      <div className={`container mx-auto px-4 py-12 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Variante de abonament de întreținere:
          </h1>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 subscription-grid max-w-7xl mx-auto">
              {subscriptions.map((subscription) => (
                <Card 
                  key={subscription.id} 
                  className={`bg-white rounded-2xl overflow-hidden flex flex-col transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 subscription-card subscription-level-${subscription.displayOrder || 0}`}
                  style={{ 
                    boxShadow: `0 10px 30px -5px ${subscription.color || '#4CAF50'}30`,
                    borderWidth: (subscription.displayOrder || 0) > 1 ? '3px' : '1px',
                    borderColor: (subscription.displayOrder || 0) === 4 ? `${subscription.color}` : 
                               (subscription.displayOrder || 0) === 3 ? `${subscription.color}80` : 'rgb(229, 231, 235)',
                    zIndex: subscription.displayOrder || 0,
                    minHeight: '700px'
                  }}
                >
                  {/* Popular badge & premium effect */}
                  {subscription.isPopular && (
                    <div 
                      className="absolute top-5 right-0 z-10 bg-yellow-500 text-white text-xs uppercase font-bold py-2 px-5 rounded-l-full shadow-lg"
                      style={{ backgroundColor: subscription.color || '#4CAF50' }}
                    >
                      <span className="relative z-10">Popular</span>
                      <span className="absolute inset-0 bg-white opacity-20 animate-pulse"></span>
                    </div>
                  )}

                  {/* Premium tier effects */}
                  {(subscription.displayOrder || 0) >= 3 && (
                    <div className="absolute top-0 left-0 w-full h-3 z-10" style={{ 
                      background: `linear-gradient(90deg, transparent, ${subscription.color}, transparent)`,
                      animation: 'shimmer 2s infinite linear'
                    }}></div>
                  )}

                  {/* Card Header with integrated image background */}
                  <div className="relative">
                    {/* Background image or color */}
                    <div className="absolute inset-0 z-0">
                      {subscription.imageUrl ? (
                        <div className="w-full h-full overflow-hidden">
                          <img 
                            src={subscription.imageUrl} 
                            alt={subscription.name}
                            className="w-full h-full object-cover"
                          />
                          <div 
                            className="absolute inset-0"
                            style={{ 
                              background: `linear-gradient(to bottom, ${subscription.color}CC, ${subscription.color}99)`,
                              opacity: 0.85
                            }}
                          ></div>
                        </div>
                      ) : (
                        <div 
                          className="w-full h-full" 
                          style={{ backgroundColor: subscription.color || '#4CAF50' }}
                        >
                          <div className="absolute inset-0 bg-white opacity-10 flex items-center justify-center">
                            <div className="w-3/4 h-1/2 rounded-full bg-white opacity-10"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content overlay */}
                    <div className="relative z-10 pt-8 pb-4 px-6 text-center">
                      {/* Title */}
                      <h2 
                        className="text-2xl font-extrabold mb-2 text-white" 
                      >
                        {subscription.name}
                      </h2>

                      {/* Description */}
                      <p className="text-white text-opacity-90 mb-3 text-sm max-w-xs mx-auto">
                        {subscription.description || `Plan ${subscription.name} pentru întreținerea spațiilor verzi`}
                      </p>

                      {/* Price badge */}
                      <div 
                        className="mx-auto mt-2 mb-3 py-2 px-6 rounded-full inline-block bg-white shadow-lg"
                      >
                        <p 
                          className="text-xl font-extrabold" 
                          style={{ color: subscription.color || '#4CAF50' }}
                        >
                          {subscription.price}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Features list */}
                  <CardContent className="flex-grow p-6 bg-white relative">
                    <div className={`grid gap-3 ${subscription.features.length > 6 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                      {Array.isArray(subscription.features) && subscription.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="py-3 px-4 border border-gray-100 rounded-lg transition-all hover:bg-gray-50 hover:shadow-sm"
                        >
                          <div className="flex justify-between items-start text-sm group">
                            <span className="text-gray-700 group-hover:font-medium transition-all flex items-start">
                              <span 
                                className="w-6 h-6 min-w-6 rounded-full mr-3 flex-shrink-0 flex items-center justify-center text-white text-xs mt-0.5"
                                style={{ backgroundColor: subscription.color || '#4CAF50' }}
                              >
                                ✓
                              </span>
                              <span className="flex-grow leading-relaxed">{typeof feature === 'object' && feature.name ? feature.name + ':' : String(feature)}</span>
                            </span>
                            {typeof feature === 'object' && feature.value && (
                              <span 
                                className="text-gray-900 font-bold group-hover:text-green-600 transition-all ml-3 flex-shrink-0 text-right"
                                style={{ color: subscription.color || '#4CAF50' }}
                              >
                                {feature.value}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  {/* Card Footer with button */}
                  <CardFooter className="p-5 pt-2 mt-auto bg-gray-50 sticky bottom-0">
                    <Link href="/contact" className="w-full">
                      <Button 
                        className={`w-full py-3 font-bold text-lg text-center relative overflow-hidden transition-all group hover:shadow-xl rounded-xl ${
                          (subscription.displayOrder || 0) >= 3 ? 'subscription-premium-button' : ''
                        }`}
                        style={{ 
                          backgroundColor: subscription.color || '#4CAF50',
                          color: '#FFFFFF',
                          boxShadow: (subscription.displayOrder || 0) >= 3 ? `0 8px 20px -4px ${subscription.color}70` : 'none'
                        }}
                      >
                        <span className="relative z-10 group-hover:scale-110 inline-block transition-transform duration-300">
                          {(subscription.displayOrder || 0) >= 3 ? 'Alege Planul Premium!' : 'Discută Cu Noi!'}
                        </span>
                        <span 
                          className={`absolute inset-0 w-full h-full scale-0 rounded-xl transition-transform duration-300 group-hover:scale-100 ${
                            (subscription.displayOrder || 0) >= 3 ? 'opacity-40 bg-white' : 'opacity-30 bg-white'
                          }`}
                        ></span>
                        {(subscription.displayOrder || 0) === 4 && (
                          <span className="absolute -inset-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 blur-sm animate-pulse"></span>
                        )}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Section */}
        {!isLoading && !error && subscriptions.length > 0 && (
          <div className="mt-24 max-w-5xl mx-auto fade-in-section">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Comparație Între Planuri</h2>
              <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Mai jos puteți vedea o comparație detaliată între toate planurile noastre de abonament pentru a vă ajuta să faceți cea mai bună alegere.
              </p>
            </div>

            <div className="overflow-x-auto border rounded-lg shadow-sm">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caracteristică</th>
                    {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((sub) => (
                      <th 
                        key={sub.id} 
                        className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                        style={{ color: sub.color }}
                      >
                        {sub.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Preț</td>
                    {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((sub) => (
                      <td key={`${sub.id}-price`} className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium" style={{ color: sub.color }}>
                        {sub.price}
                      </td>
                    ))}
                  </tr>

                  {/* Generate rows for all unique features */}
                  {Array.from(new Set(subscriptions.flatMap(sub => 
                    sub.features.map(f => typeof f === 'object' ? f.name : f)
                  ))).map((featureName, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {featureName}
                      </td>
                      {subscriptions.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((sub) => {
                        const feature = sub.features.find(f => 
                          (typeof f === 'object' && f.name === featureName) || f === featureName
                        );
                        const value = feature ? (typeof feature === 'object' ? feature.value : 'Da') : 'Nu';
                        return (
                          <td key={`${sub.id}-${featureName}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            {value === 'Da' || value === 'Included' ? (
                              <span className="text-green-500">✓</span>
                            ) : value === 'Nu' || value === 'No' ? (
                              <span className="text-red-500">✗</span>
                            ) : (
                              <span>{value}</span>
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
        )}

        {/* FAQ Section */}
        {!isLoading && !error && subscriptions.length > 0 && (
          <div className="mt-24 max-w-4xl mx-auto fade-in-section">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Întrebări Frecvente</h2>
              <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ce include un abonament de întreținere?</h3>
                <p className="text-gray-600">Abonamentele noastre includ vizite regulate pentru tuns gazonul, fertilizare, tratamente împotriva dăunătorilor, și menținerea generală a spațiului verde, în funcție de nivelul ales.</p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pot schimba planul pe parcurs?</h3>
                <p className="text-gray-600">Da, puteți face upgrade sau downgrade la abonamentul dvs. oricând. Modificările vor intra în vigoare la următoarea perioadă de facturare.</p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Care este frecvența vizitelor?</h3>
                <p className="text-gray-600">Frecvența vizitelor variază în funcție de pachetul ales, de la o vizită lunară la abonamentul Basic, până la vizite săptămânale la pachetele premium.</p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Se poate personaliza un abonament?</h3>
                <p className="text-gray-600">Absolut! Contactați-ne pentru a discuta despre nevoile specifice ale grădinii dumneavoastră și vom crea un plan personalizat.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
