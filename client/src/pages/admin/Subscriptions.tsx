
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
        console.log("Fetching admin subscriptions...");
        const response = await apiRequest('GET', '/api/admin/subscriptions');
        console.log("Response from server:", response);
        
        if (!response) {
          console.error("No response from server");
          return [];
        }
        
        // Parse the response to ensure we have the subscriptions data
        const subscriptionsData = response.subscriptions || [];
        console.log(`Found ${subscriptionsData.length} subscriptions`);
        
        // If we have no subscriptions, try to create sample data
        if (subscriptionsData.length === 0) {
          console.log("No subscriptions found, attempting to create samples...");
          try {
            await apiRequest('POST', '/api/admin/create-sample-subscriptions');
            const refreshedResponse = await apiRequest('GET', '/api/admin/subscriptions');
            return refreshedResponse.subscriptions || [];
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
                            onClick={() => setLocation(`/admin/subscriptions/${subscription.id}`)}
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
