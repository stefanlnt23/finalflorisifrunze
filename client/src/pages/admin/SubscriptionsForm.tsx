
import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertSubscriptionSchema } from "@shared/schema";

// Extended schema for client-side validation
const formSchema = insertSubscriptionSchema;

// Define form values type
type FormValues = z.infer<typeof formSchema>;

export default function SubscriptionsForm() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#FFFFFF",
      features: [{ name: "", value: "" }],
      price: "",
      isPopular: false,
      displayOrder: 0
    },
  });
  
  // Setup field array for features
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features"
  });

  // Fetch subscription data if editing
  const { isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['/api/admin/subscriptions', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest('GET', `/api/admin/subscriptions/${id}`);
      return response.subscription;
    },
    enabled: isEditing,
    onSuccess: (data) => {
      if (data) {
        // Set form values
        form.reset({
          name: data.name,
          description: data.description || "",
          color: data.color || "#FFFFFF",
          features: data.features.length > 0 ? data.features : [{ name: "", value: "" }],
          price: data.price,
          isPopular: data.isPopular || false,
          displayOrder: data.displayOrder || 0
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive",
      });
      // Redirect back to list page on error
      setLocation("/admin/subscriptions");
    },
    refetchOnWindowFocus: false,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", "/api/admin/subscriptions", values);
      const data = await response;
      if (!data.success) {
        throw new Error(data.message || "Failed to create subscription");
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Subscription Created",
        description: "The subscription has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      setLocation("/admin/subscriptions");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create the subscription",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("PUT", `/api/admin/subscriptions/${id}`, values);
      const data = await response;
      if (!data.success) {
        throw new Error(data.message || "Failed to update subscription");
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: "The subscription has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscriptions', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      setLocation("/admin/subscriptions");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update the subscription",
        variant: "destructive",
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    // Filter out empty features
    const cleanedValues = {
      ...values,
      features: values.features.filter(f => f.name.trim() && f.value.trim())
    };
    
    if (cleanedValues.features.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one feature is required",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditing) {
      updateMutation.mutate(cleanedValues);
    } else {
      createMutation.mutate(cleanedValues);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? "Edit Subscription" : "Add New Subscription"}
      description={isEditing ? "Update subscription details" : "Create a new subscription plan"}
      action={
        <Button 
          variant="outline" 
          onClick={() => setLocation("/admin/subscriptions")}
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Subscriptions
        </Button>
      }
    >
      <Card>
        <CardContent className="pt-6">
          {isEditing && isLoadingSubscription ? (
            <div className="flex items-center justify-center p-6">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mr-3"></i>
              <p>Loading subscription data...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subscription Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Basic, Pro, Luxury" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of the subscription plan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., €99/month, RON 249/year" {...field} />
                          </FormControl>
                          <FormDescription>
                            Price with currency and frequency
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of this subscription plan" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-10 h-10 border rounded-md" 
                          style={{ backgroundColor: field.value }}
                        ></div>
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Choose a color for this subscription plan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPopular"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Popular Plan</FormLabel>
                        <FormDescription>
                          Mark this as your most popular subscription plan
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">Features</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ name: "", value: "" })}
                    >
                      <i className="fas fa-plus mr-2"></i> Add Feature
                    </Button>
                  </div>
                  
                  <div className="space-y-4 border rounded-md p-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-start space-x-2">
                        <div className="grid grid-cols-2 gap-2 flex-grow">
                          <FormField
                            control={form.control}
                            name={`features.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Feature name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`features.${index}.value`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Feature value" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => fields.length > 1 && remove(index)}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    ))}
                    
                    {fields.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No features added yet. Click "Add Feature" to start.
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation("/admin/subscriptions")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      isEditing ? "Update Subscription" : "Create Subscription"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
