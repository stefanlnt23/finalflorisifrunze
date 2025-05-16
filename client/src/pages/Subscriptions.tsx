
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Subscription } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 ${
                    subscription.isPopular ? 'transform scale-105' : ''
                  }`}
                  style={{ borderTopColor: subscription.color }}
                >
                  <div className="p-6">
                    <h3 
                      className="text-2xl font-bold text-center mb-6"
                      style={{ color: subscription.color }}
                    >
                      {subscription.name}
                    </h3>
                    
                    {subscription.features.map((feature, index) => (
                      <div 
                        key={index} 
                        className="py-3 border-b border-gray-100 last:border-0"
                      >
                        <p className="text-gray-700">{feature.name}: {feature.value}</p>
                      </div>
                    ))}
                    
                    <div className="mt-6 text-center">
                      <Link href="/contact">
                        <Button className="bg-green-600 hover:bg-green-700 w-full">
                          Contact Us
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
