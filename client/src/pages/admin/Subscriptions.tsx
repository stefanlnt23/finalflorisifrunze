import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Subscription } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminSubscriptions() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch subscriptions
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/subscriptions'],
    queryFn: async () => {
    try {
      console.log("Fetching subscriptions from admin API endpoint...");
      const response = await apiRequest('GET', '/api/admin/subscriptions');

      if (!response) {
        console.error("No response from server");
        return [];
      }

      console.log("Raw API response:", response);

      // More robust handling of different response formats
      let subscriptionsData;
      
      if (Array.isArray(response)) {
        // Direct array response
        console.log("API returned array directly");
        subscriptionsData = response;
      } else if (response.subscriptions && Array.isArray(response.subscriptions)) {
        // Object with subscriptions property that is an array
        console.log("API returned object with subscriptions property");
        subscriptionsData = response.subscriptions;
      } else if (typeof response === 'object') {
        // Some other object, try to extract useful data
        console.log("API returned unexpected format, trying to extract data");
        const possibleArrays = Object.values(response).filter(val => Array.isArray(val));
        subscriptionsData = possibleArrays.length > 0 ? possibleArrays[0] : [];
      } else {
        // Unexpected response format
        console.error("Unexpected API response format:", response);
        subscriptionsData = [];
      }
      
      console.log(`Found ${subscriptionsData.length} subscriptions`);

      if (subscriptionsData.length > 0) {
        console.log("First subscription from API:", subscriptionsData[0]);
        
        // More detailed debugging for first subscription
        const firstSub = subscriptionsData[0];
        console.log("First subscription ID:", firstSub.id);
        console.log("First subscription name:", firstSub.name);
        console.log("First subscription price:", firstSub.price);
        
        if (firstSub.features) {
          console.log("Features data type:", typeof firstSub.features);
          console.log("Is features an array:", Array.isArray(firstSub.features));
          if (Array.isArray(firstSub.features) && firstSub.features.length > 0) {
            console.log("First feature:", firstSub.features[0]);
          }
        } else {
          console.log("Features property is missing or null");
        }

        // Check feature format and normalize if needed
        subscriptionsData.forEach(sub => {
          if (!sub.features) {
            console.warn(`Subscription ${sub.id} missing features property, setting to empty array`);
            sub.features = [];
          } else if (!Array.isArray(sub.features)) {
            console.warn(`Subscription ${sub.id} has invalid features format:`, sub.features);
            
            // Try to convert non-array features to array
            if (typeof sub.features === 'object') {
              sub.features = Object.entries(sub.features).map(([key, value]) => ({
                name: key,
                value: value || "Inclus"
              }));
            } else {
              sub.features = [];
            }
          } else {
            // Ensure each feature has name and value properties
            sub.features = sub.features.map(feature => {
              if (feature === null || feature === undefined) {
                return { name: "Feature", value: "Inclus" };
              } else if (typeof feature === 'string') {
                return { name: feature, value: "Inclus" };
              } else if (typeof feature === 'object') {
                if (feature.name && feature.value) {
                  return feature; // Already in correct format
                } else if (feature.name) {
                  return { name: feature.name, value: "Inclus" };
                } else {
                  // Try to extract from object
                  const keys = Object.keys(feature);
                  if (keys.length > 0) {
                    return { name: keys[0], value: feature[keys[0]] || "Inclus" };
                  }
                  return { name: "Feature", value: "Inclus" };
                }
              } else {
                return { name: String(feature), value: "Inclus" };
              }
            });
          }
          
          // Ensure other required properties have default values
          if (!sub.name) sub.name = "Unnamed Subscription";
          if (!sub.price) sub.price = "Price not set";
          if (!sub.color) sub.color = "#4CAF50";
          if (sub.isPopular === undefined) sub.isPopular = false;
          if (sub.displayOrder === undefined) sub.displayOrder = 0;
        });
      }

      // If we have no subscriptions, try to create sample data
      if (subscriptionsData.length === 0) {
        console.log("No subscriptions found, attempting to create samples...");
        try {
          const createResponse = await apiRequest('POST', '/api/admin/create-sample-subscriptions');
          console.log("Create sample response:", createResponse);
          
          const refreshedResponse = await apiRequest('GET', '/api/admin/subscriptions');
          if (Array.isArray(refreshedResponse)) {
            subscriptionsData = refreshedResponse;
          } else if (refreshedResponse && refreshedResponse.subscriptions) {
            subscriptionsData = refreshedResponse.subscriptions;
          }
          console.log(`Created ${subscriptionsData.length} sample subscriptions`);
        } catch (createError) {
          console.error("Error creating sample subscriptions:", createError);
        }
      }

      return subscriptionsData;
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      return [];
    }
  },
    refetchOnWindowFocus: false,
  });

  const subscriptions = data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/admin/subscriptions/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Subscription Deleted",
        description: "The subscription has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the subscription",
        variant: "destructive",
      });
    },
  });

  // Handle delete
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the subscription "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout 
      title="Abonamente" 
      description="Manage your subscription plans"
      action={
        <Link href="/admin/subscriptions/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <i className="fas fa-plus mr-2"></i> Add Subscription
          </Button>
        </Link>
      }
    >
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">Loading subscriptions...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <i className="fas fa-exclamation-circle text-3xl text-red-500 mb-4"></i>
              <p className="text-gray-500">Error loading subscriptions</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-tags text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No subscriptions found</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first subscription plan</p>
              <Link href="/admin/subscriptions/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <i className="fas fa-plus mr-2"></i> Add Subscription
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Popular</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <span 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: subscription.color }}
                          ></span>
                          <span className="font-medium">{subscription.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">{subscription.price}</td>
                      <td className="py-4 px-4">
                        {subscription.features.length} features
                      </td>
                      <td className="py-4 px-4">
                        {subscription.isPopular ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <i className="fas fa-check-circle mr-1"></i> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/admin/subscriptions/${subscription.id}/edit`)}
                          >
                            <i className="fas fa-edit mr-1"></i> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(subscription.id.toString(), subscription.name)}
                          >
                            <i className="fas fa-trash-alt mr-1"></i> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}