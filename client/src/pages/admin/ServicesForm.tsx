import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
import { insertServiceSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Extend the schema with validation
const formSchema = insertServiceSchema.extend({
  shortDesc: z.string().min(10, "Short description must be at least 10 characters"),
  // Add any additional validation here
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminServicesForm() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = !!id;

  // Fetch service data if editing
  const { data, isLoading: isLoadingService } = useQuery({
    queryKey: ['/api/admin/services', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest("GET", `/api/admin/services/${id}`);
      const data = await response.json();
      return data;
    },
    enabled: isEditing,
  });

  const service = data?.service;

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDesc: "", // Added shortDesc field
      price: "",
      imageUrl: "",
      featured: false
    },
  });

  // Update form values when service data is loaded
  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description,
        shortDesc: service.shortDesc || "",
        price: service.price,
        imageUrl: service.imageUrl || "",
        featured: !!service.featured
      });
    }
  }, [service, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return await apiRequest("POST", "/api/admin/services", values);
    },
    onSuccess: () => {
      toast({
        title: "Service Created",
        description: "The service has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] }); // Also invalidate front-end query
      setLocation("/admin/services");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create the service",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return await apiRequest("PUT", `/api/admin/services/${id}`, values);
    },
    onSuccess: () => {
      toast({
        title: "Service Updated",
        description: "The service has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] }); // Also invalidate front-end query
      setLocation("/admin/services");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update the service",
        variant: "destructive",
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? "Edit Service" : "Add New Service"}
      description={isEditing ? "Update service details" : "Create a new gardening service"}
      action={
        <Button 
          variant="outline" 
          onClick={() => setLocation("/admin/services")}
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Services
        </Button>
      }
    >
      <Card>
        <CardContent className="pt-6">
          {isEditing && isLoadingService ? (
            <div className="flex items-center justify-center p-6">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mr-3"></i>
              <p>Loading service data...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter service name" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of the gardening service you provide
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shortDesc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief overview of the service" {...field} />
                      </FormControl>
                      <FormDescription>
                        A short summary that will appear in service listings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a detailed description of the service"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what the service includes and why customers should choose it
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $99, From $199, $50-$100/hour" {...field} />
                      </FormControl>
                      <FormDescription>
                        The price or price range for the service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        An image representing the service (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured Service</FormLabel>
                        <FormDescription>
                          Display this service prominently on the homepage
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

                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation("/admin/services")}
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
                      isEditing ? "Update Service" : "Create Service"
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