import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { insertTestimonialSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Extend the schema with validation
const formSchema = insertTestimonialSchema.extend({
  // Add any additional validation here
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminTestimonialsForm() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = !!id;

  // Fetch testimonial data if editing
  const { data, isLoading: isLoadingItem } = useQuery({
    queryKey: ['/api/admin/testimonials', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest("GET", `/api/admin/testimonials/${id}`);
      const data = await response.json();
      console.log('Fetched testimonial data:', data);
      return data;
    },
    enabled: isEditing,
  });

  const testimonial = data?.testimonial;
  
  // Debug logging
  console.log('Testimonial data:', testimonial);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: null,
      content: "",
      rating: 5,
      displayOrder: null,
      imageUrl: null
    },
  });

  // Update form values when testimonial data is loaded
  useEffect(() => {
    if (testimonial) {
      form.reset({
        name: testimonial.name,
        role: testimonial.role || null,
        content: testimonial.content,
        rating: testimonial.rating !== null ? Number(testimonial.rating) : 5,
        displayOrder: testimonial.displayOrder !== null ? Number(testimonial.displayOrder) : null,
        imageUrl: testimonial.imageUrl || null
      });
    }
  }, [testimonial, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", "/api/admin/testimonials", values);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to create testimonial");
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Testimonial Created",
        description: "The testimonial has been successfully created",
      });
      // Invalidate both admin and public testimonials queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      setLocation("/admin/testimonials");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create the testimonial",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("PUT", `/api/admin/testimonials/${id}`, values);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update testimonial");
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Testimonial Updated",
        description: "The testimonial has been successfully updated",
      });
      // Invalidate both admin and public testimonials queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials', id] });
      setLocation("/admin/testimonials");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update the testimonial",
        variant: "destructive",
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    // Ensure rating and displayOrder are numbers
    const formattedValues = {
      ...values,
      rating: values.rating ? Number(values.rating) : null,
      displayOrder: values.displayOrder ? Number(values.displayOrder) : null
    };

    console.log('Submitting testimonial:', formattedValues);

    if (isEditing) {
      updateMutation.mutate(formattedValues);
    } else {
      createMutation.mutate(formattedValues);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? "Edit Testimonial" : "Add New Testimonial"}
      description={isEditing ? "Update testimonial details" : "Add a new customer testimonial"}
      action={
        <Button 
          variant="outline" 
          onClick={() => setLocation("/admin/testimonials")}
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Testimonials
        </Button>
      }
    >
      <Card>
        <CardContent className="pt-6">
          {isEditing && isLoadingItem ? (
            <div className="flex items-center justify-center p-6">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mr-3"></i>
              <p>Loading testimonial data...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer name" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        The name of the customer providing the testimonial
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Role/Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Homeowner, Business Owner" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        An optional role or title for the customer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Testimonial</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter the customer's testimonial"
                          className="min-h-32"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        What the customer said about your services
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={(field.value || 5).toString()}
                          className="flex space-x-2"
                        >
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <FormItem key={rating} className="flex items-center space-x-1">
                              <FormControl>
                                <RadioGroupItem value={rating.toString()} />
                              </FormControl>
                              <FormLabel className="font-normal flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <i 
                                    key={i}
                                    className={`fas fa-star ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  ></i>
                                ))}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        The rating given by the customer (1-5 stars)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          placeholder="0" 
                          {...field} 
                          value={field.value || 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Order in which testimonials appear (lower numbers appear first)
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
                      <FormLabel>Customer Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        An optional URL to an image of the customer (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation("/admin/testimonials")}
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
                      isEditing ? "Update Testimonial" : "Add Testimonial"
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
