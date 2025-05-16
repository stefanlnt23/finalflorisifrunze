
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
                  className={`bg-white rounded-lg shadow-md overflow-hidden ${
                    subscription.isPopular ? 'transform scale-105 ring-2' : ''
                  }`}
                  style={{ borderColor: subscription.color }}
                >
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
                      className="w-full h-16" 
                      style={{ backgroundColor: subscription.color }}
                    ></div>
                  )}
                  
                  <div className="p-6">
                    <h3 
                      className="text-2xl font-bold text-center mb-3"
                      style={{ color: subscription.color }}
                    >
                      {subscription.name}
                    </h3>
                    
                    {subscription.description && (
                      <p className="text-gray-600 text-center mb-4 text-sm">{subscription.description}</p>
                    )}
                    
                    <div className="text-center my-4">
                      <span className="text-xl font-bold" style={{ color: subscription.color }}>
                        {subscription.price}
                      </span>
                    </div>
                    
                    <div className="my-6 space-y-3">
                      {subscription.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="py-2 px-3 border-b border-gray-100 last:border-0 flex justify-between"
                        >
                          <span className="text-gray-700 font-medium">{feature.name}:</span>
                          <span className="text-gray-900">{feature.value}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Link href="/contact">
                        <Button 
                          className="w-full py-2 transition-transform duration-300 hover:scale-105 font-medium"
                          style={{ 
                            backgroundColor: subscription.color,
                            color: '#FFFFFF',
                            border: 'none'
                          }}
                        >
                          Select Plan
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {subscription.isPopular && (
                    <div 
                      className="absolute top-0 right-0 bg-gradient-to-r px-4 py-1 text-white text-xs font-bold uppercase rounded-bl-lg"
                      style={{ backgroundColor: subscription.color }}
                    >
                      Most Popular
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
