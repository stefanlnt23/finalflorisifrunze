
import React from "react";
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
        const response = await apiRequest('GET', '/api/subscriptions');
        console.log("API response:", response);
        
        if (!response) {
          console.error("No response from API");
          return [] as Subscription[];
        }
        
        if (!response.subscriptions) {
          console.error("No subscriptions in response", response);
          return [] as Subscription[];
        }
        
        console.log(`Retrieved ${response.subscriptions.length} subscriptions`);
        return response.subscriptions as Subscription[];
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        return [] as Subscription[];
      }
    },
    refetchOnWindowFocus: false,
  });
  
  const subscriptions = data || [];
  
  console.log("Rendered subscriptions:", subscriptions);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
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
              <p className="text-red-500">Failed to load subscription plans. Please try again later.</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <p>No subscription plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full">
                  {/* Card Header with name and image */}
                  <CardHeader className="p-0 flex flex-col">
                    <div className="p-6 text-center">
                      <h2 className="text-2xl font-bold mb-2">{subscription.name}</h2>
                    </div>
                    
                    {subscription.imageUrl ? (
                      <div className="w-full h-48 overflow-hidden">
                        <img 
                          src={subscription.imageUrl} 
                          alt={subscription.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-full h-12" 
                        style={{ backgroundColor: subscription.color }}
                      ></div>
                    )}
                  </CardHeader>
                  
                  {/* Color bar */}
                  <div 
                    className="h-2 w-full" 
                    style={{ backgroundColor: subscription.color }}
                  ></div>
                  
                  {/* Features list */}
                  <CardContent className="flex-grow p-0">
                    <div className="px-6 py-4">
                      {subscription.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="py-2 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{feature.name}:</span>
                            <span className="text-gray-900 font-medium">{feature.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  {/* Card Footer with button */}
                  <CardFooter className="p-6 pt-2 mt-auto">
                    <Link href="/contact" className="w-full">
                      <Button 
                        className="w-full py-3 font-medium text-center"
                        style={{ 
                          backgroundColor: subscription.color,
                          color: '#FFFFFF'
                        }}
                      >
                        Discută Cu Noi!
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
