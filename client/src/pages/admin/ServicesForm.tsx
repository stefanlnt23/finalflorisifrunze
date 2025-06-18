import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
import { Plus, Trash2 } from "lucide-react";

// Extend the schema with validation and make optional fields required for form
const formSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Description is required"),
  shortDesc: z.string().min(10, "Short description must be at least 10 characters"),
  price: z.string().min(1, "Price is required"),
  imageUrl: z.string().optional(),
  featured: z.boolean().default(false),
  
  // Extended fields
  duration: z.string().optional(),
  coverage: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  includes: z.array(z.string()).optional(),
  faqs: z.array(
    z.object({
      question: z.string(),
      answer: z.string()
    })
  ).optional(),
  recommendedFrequency: z.string().optional(),
  seasonalAvailability: z.array(z.string()).optional(),
  galleryImages: z.array(z.string()).optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminServicesForm() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = !!id;

  // Fetch service data if editing
  const { data, isLoading: isLoadingService, error: serviceError } = useQuery({
    queryKey: ['/api/admin/services', id],
    queryFn: async () => {
      if (!id) {
        console.log("No ID provided for service fetch");
        return null;
      }
      console.log(`Fetching service with ID: ${id}`);
      const responseData = await apiRequest("GET", `/api/admin/services/${id}`);
      console.log("Service data loaded:", JSON.stringify(responseData, null, 2));
      
      if (!responseData.service) {
        console.error("Service data is missing in the response");
        throw new Error("Service data not found in response");
      }
      
      return responseData;
    },
    enabled: isEditing,
    retry: 3,
    staleTime: 0, // Always fetch fresh data when editing
    refetchOnWindowFocus: false
  });

  const service = data?.service;
  
  // Log any errors that occur during fetching
  useEffect(() => {
    if (serviceError) {
      console.error("Error fetching service:", serviceError);
    }
  }, [serviceError]);
  
  // Log when service data changes
  useEffect(() => {
    if (service) {
      console.log("Service data available for form:", JSON.stringify(service, null, 2));
    }
  }, [service]);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDesc: "",
      price: "",
      imageUrl: "",
      featured: false,
      
      // New fields
      duration: "",
      coverage: "",
      benefits: [],
      includes: [],
      faqs: [],
      recommendedFrequency: "",
      seasonalAvailability: [],
      galleryImages: []
    },
  });
  
  // Field arrays for dynamic fields
  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = 
    useFieldArray({ control: form.control, name: "benefits" as const });
    
  const { fields: includeFields, append: appendInclude, remove: removeInclude } = 
    useFieldArray({ control: form.control, name: "includes" as const });
    
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = 
    useFieldArray({ control: form.control, name: "faqs" as const });
    
  const { fields: seasonFields, append: appendSeason, remove: removeSeason } = 
    useFieldArray({ control: form.control, name: "seasonalAvailability" as const });
    
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = 
    useFieldArray({ control: form.control, name: "galleryImages" as const });

  // Update form values when service data is loaded
  useEffect(() => {
    if (service) {
      console.log("Populating form with service data:", service);
      
      // Ensure all arrays are properly handled
      const benefits = Array.isArray(service.benefits) ? service.benefits : [];
      const includes = Array.isArray(service.includes) ? service.includes : [];
      const faqs = Array.isArray(service.faqs) ? service.faqs : [];
      const seasonalAvailability = Array.isArray(service.seasonalAvailability) ? service.seasonalAvailability : [];
      const galleryImages = Array.isArray(service.galleryImages) ? service.galleryImages : [];
      
      form.reset({
        name: service.name || "",
        description: service.description || "",
        shortDesc: service.shortDesc || "",
        price: service.price || "",
        imageUrl: service.imageUrl || "",
        featured: Boolean(service.featured),
        
        // New fields
        duration: service.duration || "",
        coverage: service.coverage || "",
        benefits: benefits,
        includes: includes,
        faqs: faqs,
        recommendedFrequency: service.recommendedFrequency || "",
        seasonalAvailability: seasonalAvailability,
        galleryImages: galleryImages
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
                <Tabs defaultValue="basics" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="basics">Basic Information</TabsTrigger>
                    <TabsTrigger value="details">Service Details</TabsTrigger>
                    <TabsTrigger value="benefits">Benefits & Includes</TabsTrigger>
                    <TabsTrigger value="extras">Gallery & FAQs</TabsTrigger>
                  </TabsList>
                  
                  {/* Basic Information Tab */}
                  <TabsContent value="basics" className="space-y-6">
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
                          <FormLabel>Main Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormDescription>
                            The main image representing the service
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
                  </TabsContent>
                  
                  {/* Service Details Tab */}
                  <TabsContent value="details" className="space-y-6">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Duration</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 1-2 hours, 3-5 days" {...field} />
                          </FormControl>
                          <FormDescription>
                            How long does this service typically take to complete?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="coverage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coverage Area</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Up to 500 sq ft" {...field} />
                          </FormControl>
                          <FormDescription>
                            What area does this service typically cover?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="recommendedFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recommended Frequency</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Weekly, Monthly, Seasonally" {...field} />
                          </FormControl>
                          <FormDescription>
                            How often should this service be performed?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Seasonal Availability</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {seasonFields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2">
                            <FormField
                              control={form.control}
                              name={`seasonalAvailability.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input placeholder="e.g. Spring, Summer" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => removeSeason(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => appendSeason("")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Season
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Benefits & Includes Tab */}
                  <TabsContent value="benefits" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Service Benefits</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {benefitFields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2">
                            <FormField
                              control={form.control}
                              name={`benefits.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input placeholder="e.g. Improves soil health" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => removeBenefit(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => appendBenefit("")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Benefit
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">What's Included</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {includeFields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2">
                            <FormField
                              control={form.control}
                              name={`includes.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input placeholder="e.g. Initial consultation" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => removeInclude(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => appendInclude("")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Gallery & FAQs Tab */}
                  <TabsContent value="extras" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Gallery Images</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {galleryFields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2">
                            <FormField
                              control={form.control}
                              name={`galleryImages.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input placeholder="https://example.com/gallery1.jpg" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              onClick={() => removeGallery(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => appendGallery("")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Image URL
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {faqFields.map((field, index) => (
                          <div key={field.id} className="space-y-4 pb-4 border-b border-gray-100">
                            <FormField
                              control={form.control}
                              name={`faqs.${index}.question`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Question {index + 1}</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. How often should I water my garden?" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`faqs.${index}.answer`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Answer</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Provide a detailed answer..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeFaq(index)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove FAQ
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendFaq({ question: "", answer: "" })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add FAQ
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                
                <Separator className="my-6" />
                
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
