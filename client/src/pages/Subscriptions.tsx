
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 subscription-grid">
              {subscriptions.map((subscription) => (
                <Card 
                  key={subscription.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                  style={{ 
                    boxShadow: `0 4px 20px -5px ${subscription.color || '#FFFFFF'}40` 
                  }}
                >
                  {/* Card Header with name and image */}
                  <CardHeader className="p-0 flex flex-col relative">
                    {subscription.isPopular && (
                      <div 
                        className="absolute top-4 right-0 z-10 bg-yellow-500 text-white text-xs uppercase font-bold py-1 px-3 rounded-l-full shadow-md animate-pulse"
                        style={{ backgroundColor: subscription.color || '#4CAF50' }}
                      >
                        Popular
                      </div>
                    )}
                    <div className="p-6 text-center">
                      <h2 className="text-2xl font-bold mb-2 transition-colors duration-300" style={{ color: subscription.color || '#4CAF50' }}>
                        {subscription.name}
                      </h2>
                    </div>
                    
                    {subscription.imageUrl ? (
                      <div className="w-full h-48 overflow-hidden">
                        <img 
                          src={subscription.imageUrl} 
                          alt={subscription.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-full h-12" 
                        style={{ backgroundColor: subscription.color || '#4CAF50' }}
                      ></div>
                    )}
                  </CardHeader>
                  
                  {/* Color bar */}
                  <div 
                    className="h-2 w-full" 
                    style={{ backgroundColor: subscription.color || '#4CAF50' }}
                  ></div>
                  
                  {/* Features list */}
                  <CardContent className="flex-grow p-0">
                    <div className="px-6 py-4">
                      {Array.isArray(subscription.features) && subscription.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="py-2 border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-center text-sm group">
                            <span className="text-gray-700 group-hover:font-medium transition-all">
                              {typeof feature === 'object' && feature.name ? feature.name + ':' : feature}
                            </span>
                            {typeof feature === 'object' && feature.value && (
                              <span 
                                className="text-gray-900 font-medium group-hover:text-green-600 transition-all"
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
                  <CardFooter className="p-6 pt-2 mt-auto">
                    <Link href="/contact" className="w-full">
                      <Button 
                        className="w-full py-3 font-medium text-center relative overflow-hidden transition-all group hover:shadow-lg"
                        style={{ 
                          backgroundColor: subscription.color || '#4CAF50',
                          color: '#FFFFFF'
                        }}
                      >
                        <span className="relative z-10 group-hover:scale-110 inline-block transition-transform duration-300">
                          Discută Cu Noi!
                        </span>
                        <span 
                          className="absolute inset-0 w-full h-full scale-0 rounded-md transition-transform duration-300 group-hover:scale-100 opacity-30 bg-white"
                        ></span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
