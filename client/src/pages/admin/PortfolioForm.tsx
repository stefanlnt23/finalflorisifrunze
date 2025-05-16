

import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Trash2, Plus, MoveUp, MoveDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Import types and helper functions
import { 
  FormValues, 
  ImagePair, 
  formSchema, 
  generateSeoTags,
  addImagePair,
  removeImagePair,
  moveImagePairUp,
  moveImagePairDown,
  updateImagePair
} from "./portfolio/PortfolioFormTypes";

// Import the preview component
import PortfolioFormPreview from "./portfolio/PortfolioFormPreview";

export default function AdminPortfolioForm() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = !!id;
  const [activeTab, setActiveTab] = useState("details");
  
  // State for image pairs
  const [imagePairs, setImagePairs] = useState<ImagePair[]>([
    { before: "", after: "", caption: "", order: 0 }
  ]);

  // Fetch portfolio item data if editing
  const { data, isLoading: isLoadingItem } = useQuery({
    queryKey: ['/api/portfolio', id],
    queryFn: async () => {
      if (!id) return null;
      console.log("Fetching portfolio item data for editing, ID:", id);
      const response = await apiRequest("GET", `/api/admin/portfolio/${id}`);
      const data = await response.json();
      console.log("Received portfolio item data:", data);
      return data;
    },
    enabled: isEditing,
  });

  // Fetch services for the dropdown
  const { data: servicesData, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services'],
    refetchOnWindowFocus: false,
  });

  const services = (servicesData as any)?.services || [];
  const portfolioItem = data?.portfolioItem;

  // Get service name for the selected service
  const getServiceName = (serviceId: any): string => {
    if (!serviceId) return "No Service";
    const service = services.find((s: any) => s.id === serviceId);
    return service ? service.name : "Unknown Service";
  };

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      serviceId: undefined,
      date: new Date(),
      location: "",
      projectDuration: "",
      difficultyLevel: undefined,
      featured: false,
      status: "Draft",
      seo: {
        metaTitle: "",
        metaDescription: "",
        tags: []
      },
      clientTestimonial: {
        clientName: "",
        comment: "",
        displayPermission: false
      }
    },
  });

  // Update form values when portfolio item data is loaded
  useEffect(() => {
    if (portfolioItem) {
      form.reset({
        title: portfolioItem.title,
        description: portfolioItem.description,
        imageUrl: portfolioItem.imageUrl || "",
        serviceId: portfolioItem.serviceId,
        date: portfolioItem.date ? new Date(portfolioItem.date) : new Date(),
        location: portfolioItem.location || "",
        projectDuration: portfolioItem.projectDuration || "",
        difficultyLevel: portfolioItem.difficultyLevel || undefined,
        featured: portfolioItem.featured || false,
        status: portfolioItem.status || "Draft",
        seo: portfolioItem.seo || {
          metaTitle: "",
          metaDescription: "",
          tags: []
        },
        clientTestimonial: portfolioItem.clientTestimonial || {
          clientName: "",
          comment: "",
          displayPermission: false
        }
      });
      
      // Set image pairs if they exist
      if (portfolioItem.images && portfolioItem.images.length > 0) {
        setImagePairs(portfolioItem.images);
      }
    }
  }, [portfolioItem, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Add image pairs to the values and map date to completionDate
      const dataToSubmit = {
        ...values,
        completionDate: values.date, // Map date to completionDate for MongoDB
        images: imagePairs.filter(pair => pair.before && pair.after)
      };
      console.log("Submitting portfolio item:", dataToSubmit);
      return await apiRequest("POST", "/api/admin/portfolio", dataToSubmit);
    },
    onSuccess: () => {
      toast({
        title: "Portfolio Item Created",
        description: "The portfolio item has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      setLocation("/admin/portfolio");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create the portfolio item",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Add image pairs to the values and map date to completionDate
      const dataToSubmit = {
        ...values,
        completionDate: values.date, // Map date to completionDate for MongoDB
        images: imagePairs.filter(pair => pair.before && pair.after)
      };
      console.log("Updating portfolio item:", dataToSubmit);
      return await apiRequest("PUT", `/api/admin/portfolio/${id}`, dataToSubmit);
    },
    onSuccess: () => {
      toast({
        title: "Portfolio Item Updated",
        description: "The portfolio item has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio', id] });
      setLocation("/admin/portfolio");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update the portfolio item",
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

  // Helper function to generate SEO tags
  const handleGenerateSeoTags = () => {
    const title = form.getValues("title");
    const description = form.getValues("description");
    generateSeoTags(title, description, form.setValue, toast);
  };

  return (
    <AdminLayout
      title={isEditing ? "Edit Portfolio Item" : "Add New Portfolio Item"}
      description={isEditing ? "Update project details" : "Add a new project to your portfolio"}
      action={
        <Button 
          variant="outline" 
          onClick={() => setLocation("/admin/portfolio")}
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Portfolio
        </Button>
      }
    >
      {isEditing && isLoadingItem ? (
        <div className="flex items-center justify-center p-6">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mr-3"></i>
          <p>Loading portfolio item data...</p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormLabel>Status:</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              {field.value === "Published" ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                                  Draft
                                </Badge>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Draft">
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                              Draft
                            </Badge>
                          </SelectItem>
                          <SelectItem value="Published">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              Published
                            </Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormLabel>Featured:</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setLocation("/admin/portfolio")}
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
                    isEditing ? "Update Project" : "Add Project"
                  )}
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="details">Project Details</TabsTrigger>
                <TabsTrigger value="images">Before/After Images</TabsTrigger>
                <TabsTrigger value="testimonial">Client Testimonial</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              {/* Project Details Tab */}
              <TabsContent value="details" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Enter the core details about this project</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter project title" {...field} />
                          </FormControl>
                          <FormDescription>
                            A concise title for the project
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
                              placeholder="Enter a detailed description of the project"
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Describe the project scope, challenges, and outcomes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="serviceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Related Service</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                // Only parse if it's a valid number
                                const parsedValue = !isNaN(Number(value)) ? parseInt(value) : value;
                                field.onChange(parsedValue);
                              }}
                              value={field.value ? field.value.toString() : undefined}
                              disabled={isLoadingServices}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a service category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingServices ? (
                                  <SelectItem value="loading" disabled>Loading services...</SelectItem>
                                ) : services.length === 0 ? (
                                  <SelectItem value="none" disabled>No services available</SelectItem>
                                ) : (
                                  services.map((service: any) => (
                                    <SelectItem key={service.id} value={service.id.toString()}>
                                      {service.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The type of service this project falls under
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Completion Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              When the project was completed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>Additional information about the project</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., London, UK" {...field} />
                            </FormControl>
                            <FormDescription>
                              Where the project was completed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="projectDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Duration</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 2 weeks" {...field} />
                            </FormControl>
                            <FormDescription>
                              How long the project took to complete
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="difficultyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="Complex">Complex</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The complexity level of the project
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
                          <FormLabel>Main Image URL (Legacy)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormDescription>
                            A URL to a main image showcasing the project (for backward compatibility)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Before/After Images Tab */}
              <TabsContent value="images" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Before & After Images</CardTitle>
                    <CardDescription>
                      Add before and after images to showcase your work
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {imagePairs.map((pair, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Image Pair {index + 1}</h3>
                            <div className="flex space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => moveImagePairUp(index, imagePairs, setImagePairs)}
                                disabled={index === 0}
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => moveImagePairDown(index, imagePairs, setImagePairs)}
                                disabled={index === imagePairs.length - 1}
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeImagePair(index, imagePairs, setImagePairs, toast)}
                                disabled={imagePairs.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <FormLabel>Before Image URL</FormLabel>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="https://example.com/before.jpg"
                                  value={pair.before}
                                  onChange={(e) => updateImagePair(index, "before", e.target.value, imagePairs, setImagePairs)}
                                />
                              </div>
                              {pair.before && (
                                <div className="mt-2 relative h-40 border rounded-md overflow-hidden">
                                  <img
                                    src={pair.before}
                                    alt="Before"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Invalid+Image+URL";
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <FormLabel>After Image URL</FormLabel>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="https://example.com/after.jpg"
                                  value={pair.after}
                                  onChange={(e) => updateImagePair(index, "after", e.target.value, imagePairs, setImagePairs)}
                                />
                              </div>
                              {pair.after && (
                                <div className="mt-2 relative h-40 border rounded-md overflow-hidden">
                                  <img
                                    src={pair.after}
                                    alt="After"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Invalid+Image+URL";
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <FormLabel>Caption</FormLabel>
                            <Input
                              placeholder="Short caption for the transformation"
                              value={pair.caption || ""}
                              onChange={(e) => updateImagePair(index, "caption", e.target.value, imagePairs, setImagePairs)}
                            />
                            
                            <FormLabel>Detailed Description</FormLabel>
                            <Textarea
                              placeholder="Provide a detailed description of the transformation"
                              className="min-h-[100px] mt-2"
                              value={pair.richDescription || ""}
                              onChange={(e) => updateImagePair(index, "richDescription", e.target.value, imagePairs, setImagePairs)}
                            />
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addImagePair(imagePairs, setImagePairs)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Another Image Pair
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Client Testimonial Tab */}
              <TabsContent value="testimonial" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Testimonial</CardTitle>
                    <CardDescription>
                      Add a testimonial from the client for this project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="clientTestimonial.clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter client name" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of the client who provided the testimonial
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientTestimonial.comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Comment</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter client testimonial"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            What the client said about the project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientTestimonial.displayPermission"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Permission to Display
                            </FormLabel>
                            <FormDescription>
                              Check this box to confirm you have permission to display this testimonial
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Search Engine Optimization</CardTitle>
                    <CardDescription>
                      Optimize your portfolio item for search engines
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateSeoTags}
                      >
                        <i className="fas fa-magic mr-2"></i> Auto-Generate SEO
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name="seo.metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input placeholder="SEO title for search engines" {...field} />
                          </FormControl>
                          <FormDescription>
                            Title that appears in search engine results
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seo.metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description for search engines"
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Short description that appears in search results (max 160 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seo.tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keywords/Tags</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="garden, landscaping, plants (comma separated)"
                              value={field.value?.join(", ") || ""}
                              onChange={(e) => {
                                const tags = e.target.value
                                  .split(",")
                                  .map(tag => tag.trim())
                                  .filter(tag => tag.length > 0);
                                field.onChange(tags);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Keywords that help search engines categorize your content
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-6 pt-4">
                <PortfolioFormPreview
                  title={form.getValues("title") || ""}
                  description={form.getValues("description") || ""}
                  imageUrl={form.getValues("imageUrl")}
                  featured={form.getValues("featured") || false}
                  status={form.getValues("status") || "Draft"}
                  serviceId={form.getValues("serviceId")}
                  serviceName={getServiceName(form.getValues("serviceId"))}
                  date={form.getValues("date") || new Date()}
                  location={form.getValues("location")}
                  projectDuration={form.getValues("projectDuration")}
                  difficultyLevel={form.getValues("difficultyLevel")}
                  imagePairs={imagePairs}
                  clientTestimonial={{
                    clientName: form.getValues("clientTestimonial.clientName"),
                    comment: form.getValues("clientTestimonial.comment"),
                    displayPermission: form.getValues("clientTestimonial.displayPermission") || false
                  }}
                />
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      )}
    </AdminLayout>
  );
}
