
import React, { useEffect, useState } from "react";
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
          displayOrder: parseInt(sub.displayOrder || 0)
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
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  React.useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <MainLayout>
      <div className={`container mx-auto px-4 py-12 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 subscription-grid">
              {subscriptions.map((subscription) => (
                <Card 
                  key={subscription.id} 
                  className={`bg-white rounded-xl overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 subscription-card subscription-level-${subscription.displayOrder}`}
                  style={{ 
                    boxShadow: `0 8px 30px -5px ${subscription.color || '#4CAF50'}30`,
                    borderWidth: subscription.displayOrder > 1 ? '3px' : '1px',
                    borderColor: subscription.displayOrder === 4 ? `${subscription.color}` : 
                               subscription.displayOrder === 3 ? `${subscription.color}80` : 'rgb(229, 231, 235)',
                    zIndex: subscription.displayOrder
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
                  {subscription.displayOrder >= 3 && (
                    <div className="absolute top-0 left-0 w-full h-2 z-10" style={{ 
                      background: `linear-gradient(90deg, transparent, ${subscription.color}, transparent)`,
                      animation: 'shimmer 2s infinite linear'
                    }}></div>
                  )}
                  
                  {/* Card Header */}
                  <CardHeader className="p-0 flex flex-col relative">
                    <div className="p-8 text-center relative">
                      {/* Price badge */}
                      <div 
                        className="absolute -top-4 right-0 left-0 mx-auto w-32 h-32 flex items-center justify-center rounded-full transform -translate-y-1/2 bg-white shadow-lg border-4"
                        style={{ borderColor: subscription.color || '#4CAF50' }}
                      >
                        <div className="text-center">
                          <p className="text-sm text-gray-500 font-medium">Preț</p>
                          <p 
                            className="text-xl font-extrabold" 
                            style={{ color: subscription.color || '#4CAF50' }}
                          >
                            {subscription.price}
                          </p>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h2 
                        className="text-3xl font-extrabold mt-12 mb-2 transition-colors duration-300" 
                        style={{ color: subscription.color || '#4CAF50' }}
                      >
                        {subscription.name}
                      </h2>
                      
                      {/* Description */}
                      <p className="text-gray-600 mt-2 mb-4 text-sm max-w-xs mx-auto">
                        {subscription.description || `Plan ${subscription.name} pentru întreținerea spațiilor verzi`}
                      </p>
                    </div>
                    
                    {/* Image or color bar */}
                    {subscription.imageUrl ? (
                      <div className="w-full h-48 overflow-hidden relative">
                        <div 
                          className="absolute inset-0 z-10 opacity-30"
                          style={{ 
                            background: `linear-gradient(to bottom, ${subscription.color}80, transparent)` 
                          }}
                        ></div>
                        <img 
                          src={subscription.imageUrl} 
                          alt={subscription.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-full h-16 relative overflow-hidden" 
                        style={{ backgroundColor: subscription.color || '#4CAF50' }}
                      >
                        <div className="absolute inset-0 bg-white opacity-10 flex items-center justify-center">
                          <div className="w-3/4 h-1/2 rounded-full bg-white opacity-10"></div>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  
                  {/* Features list */}
                  <CardContent className="flex-grow p-0 relative">
                    {/* Decorative pattern */}
                    <div 
                      className="absolute right-0 top-0 w-24 h-24 opacity-5"
                      style={{ 
                        backgroundColor: subscription.color || '#4CAF50',
                        clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
                      }}
                    ></div>
                    
                    <div className="px-8 py-6">
                      {Array.isArray(subscription.features) && subscription.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="py-3 border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50 rounded-lg px-2"
                        >
                          <div className="flex justify-between items-center text-sm group">
                            <span className="text-gray-700 group-hover:font-medium transition-all flex items-center">
                              <span 
                                className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white text-xs"
                                style={{ backgroundColor: subscription.color || '#4CAF50' }}
                              >
                                ✓
                              </span>
                              {typeof feature === 'object' && feature.name ? feature.name + ':' : feature}
                            </span>
                            {typeof feature === 'object' && feature.value && (
                              <span 
                                className="text-gray-900 font-bold group-hover:text-green-600 transition-all"
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
                  <CardFooter className="p-8 pt-4 mt-auto">
                    <Link href="/contact" className="w-full">
                      <Button 
                        className={`w-full py-4 font-bold text-lg text-center relative overflow-hidden transition-all group hover:shadow-xl rounded-xl ${
                          subscription.displayOrder >= 3 ? 'subscription-premium-button' : ''
                        }`}
                        style={{ 
                          backgroundColor: subscription.color || '#4CAF50',
                          color: '#FFFFFF',
                          boxShadow: subscription.displayOrder >= 3 ? `0 8px 20px -4px ${subscription.color}70` : 'none'
                        }}
                      >
                        <span className="relative z-10 group-hover:scale-110 inline-block transition-transform duration-300">
                          {subscription.displayOrder >= 3 ? 'Alege Planul Premium!' : 'Discută Cu Noi!'}
                        </span>
                        <span 
                          className={`absolute inset-0 w-full h-full scale-0 rounded-xl transition-transform duration-300 group-hover:scale-100 ${
                            subscription.displayOrder >= 3 ? 'opacity-40 bg-white' : 'opacity-30 bg-white'
                          }`}
                        ></span>
                        {subscription.displayOrder === 4 && (
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
                    {subscriptions.sort((a, b) => a.displayOrder - b.displayOrder).map((sub) => (
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
                    {subscriptions.sort((a, b) => a.displayOrder - b.displayOrder).map((sub) => (
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
                      {subscriptions.sort((a, b) => a.displayOrder - b.displayOrder).map((sub) => {
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
