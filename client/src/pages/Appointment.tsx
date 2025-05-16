import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const appointmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  serviceId: z.string().refine(val => !isNaN(parseInt(val)), {
    message: "Please select a service"
  }),
  date: z.date({
    required_error: "Please select a date",
  }).refine(date => {
    // Must be at least tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return date >= tomorrow;
  }, {
    message: "Appointment must be at least 1 day in advance",
  }),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function Appointment() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Parse query parameters to get preselected service
  const params = new URLSearchParams(location.split("?")[1]);
  const preselectedService = params.get("service");

  // Get services from API
  const { data, isLoading } = useQuery({
    queryKey: ['/api/services'],
    refetchOnWindowFocus: false,
  });

  const services = data?.services || [];

  // Form definition
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceId: preselectedService || "",
      notes: "",
    },
  });

  // Handle form submission
  async function onSubmit(values: AppointmentFormValues) {
    setIsSubmitting(true);
    try {
      // Convert form data to API format
      const appointmentData = {
        ...values,
        serviceId: parseInt(values.serviceId),
        date: format(values.date, "yyyy-MM-dd'T'HH:mm:ss") // API expects ISO format
      };
      
      // Make API request
      const response = await apiRequest("POST", "/api/appointments", appointmentData);
      
      // Handle success
      setIsSuccess(true);
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully scheduled.",
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Booking Failed",
        description: "There was a problem booking your appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <MainLayout>
        <div className="py-16 bg-gradient-to-b from-green-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-check text-green-600 text-2xl"></i>
                </div>
                <CardTitle className="text-center text-2xl">Appointment Confirmed!</CardTitle>
                <CardDescription className="text-center">
                  Thank you for scheduling an appointment with us.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  We've sent a confirmation email with all the details. Our team will be in touch soon to confirm your appointment.
                </p>
                <div className="flex flex-col space-y-4">
                  <Link href="/services">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      View More Services
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      Return to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Book an Appointment
            </h1>
            <p className="text-xl text-gray-600">
              Schedule a service with our expert gardening team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Details</CardTitle>
                  <CardDescription>
                    Fill out the form below to schedule your gardening service.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Your email address" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Your phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="serviceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoading ? (
                                  <SelectItem value="loading" disabled>Loading services...</SelectItem>
                                ) : services.length === 0 ? (
                                  <SelectItem value="none" disabled>No services available</SelectItem>
                                ) : (
                                  services.map((service) => (
                                    <SelectItem key={service.id} value={service.id.toString()}>
                                      {service.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Appointment Date</FormLabel>
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
                                  disabled={(date) => {
                                    // Disable dates in the past and today
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return date < today;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Select a date at least one day in advance.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please provide any additional information about your needs"
                                className="resize-none"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Any specific details or requirements for your appointment.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Processing...
                          </>
                        ) : (
                          "Book Appointment"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Why Choose Us?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <p className="text-gray-600">Expert gardeners with years of experience</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <p className="text-gray-600">Eco-friendly gardening practices</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <p className="text-gray-600">Flexible scheduling options</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <p className="text-gray-600">Comprehensive service guarantee</p>
                    </li>
                  </ul>
                  
                  <div className="mt-6 border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Questions?</h3>
                    <p className="text-gray-600 mb-4">
                      If you have any questions about our services or booking process, please don't hesitate to contact us.
                    </p>
                    <Link href="/contact">
                      <Button variant="outline" className="w-full">
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}