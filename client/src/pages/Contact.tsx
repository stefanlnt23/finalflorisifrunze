import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Service } from "@shared/schema";

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  serviceId: z.string().optional(),
  message: z.string().min(10, "Please provide more details in your message")
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Fetch services for the dropdown
  const { data: servicesData, isLoading: isLoadingServices } = useQuery<{ services: Service[] }>({
    queryKey: ['/api/services'],
    refetchOnWindowFocus: false,
  });

  const services = servicesData?.services || [];

  // Form setup
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceId: "",
      message: ""
    }
  });

  // Handle form submission
  function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);

    // Convert serviceId to number if present
    const serviceId = data.serviceId ? parseInt(data.serviceId, 10) : null;

    apiRequest("POST", "/api/contact", {
        ...data,
        serviceId,
        status: "new" // Set initial status of inquiry
      })
      .then(response => {
        console.log("Inquiry submitted successfully:", response);
        setIsSubmitting(false);
        setFormSubmitted(true);
        toast({
          title: "Message Sent!",
          description: "Thank you for contacting us. We'll get back to you shortly.",
        });
        form.reset();
      })
      .catch(error => {
        console.error("Error submitting form:", error);
        setIsSubmitting(false);
        toast({
          title: "Something went wrong!",
          description: "Please try again later or contact us directly by phone.",
          variant: "destructive"
        });
      });
  }

  return (
    <MainLayout>

      {/* Page Header */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contactează-ne</h1>
            <p className="text-lg text-gray-700">
              Ai întrebări despre serviciile noastre sau dorești să programezi o consultație? 
              Ia legătura cu echipa noastră astăzi.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Trimite un Mesaj</h2>

                {formSubmitted ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="mb-6 text-green-500 text-6xl">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <h3 className="text-xl font-semibold mb-4">Thank You!</h3>
                      <p className="text-gray-600 mb-6">
                        Your message has been received. We'll get back to you as soon as possible.
                      </p>
                      <Button 
                        onClick={() => setFormSubmitted(false)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Send Another Message
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 sm:p-8">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nume</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="you@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Telefon (Opțional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="(123) 456-7890" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="serviceId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Serviciu (Opțional)</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingServices}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a service" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {isLoadingServices ? (
                                        <SelectItem value="loading" disabled>Loading services...</SelectItem>
                                      ) : services.length === 0 ? (
                                        <SelectItem value="none" disabled>No services available</SelectItem>
                                      ) : (
                                        services.map((service: Service) => (
                                          <SelectItem key={service.id} value={String(service.id)}>
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
                          </div>
                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mesaj</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Spune-ne despre proiectul sau întrebarea ta..." 
                                    className="min-h-32" 
                                    {...field} 
                                  />
                                </FormControl>
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
                                Se trimite...
                              </>
                            ) : "Trimite Mesaj"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informații de Contact</h2>

                <div className="space-y-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="mr-4 mt-1">
                          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                            <i className="fas fa-map-marker-alt"></i>
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Locația Noastră</h3>
                          <p className="text-gray-600">
                            123 Garden Street<br />
                            Greenville, 12345<br />
                            United States
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="mr-4 mt-1">
                          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                            <i className="fas fa-phone-alt"></i>
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Numere de Telefon</h3>
                          <p className="text-gray-600 mb-2">
                            <span className="font-medium">Birou Principal:</span> (123) 456-7890
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Suport Clienți:</span> (123) 456-7891
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="mr-4 mt-1">
                          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                            <i className="fas fa-envelope"></i>
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Adrese de Email</h3>
                          <p className="text-gray-600 mb-2">
                            <span className="font-medium">Informații Generale:</span> info@greengarden.com
                          </p>
                          <p className="text-gray-600 mb-2">
                            <span className="font-medium">Suport Clienți:</span> support@greengarden.com
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Oportunități de Angajare:</span> careers@greengarden.com
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="mr-4 mt-1">
                          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                            <i className="fas fa-clock"></i>
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Program de Lucru</h3>
                          <div className="text-gray-600 space-y-1">
                            <p className="flex justify-between">
                              <span>Luni - Vineri:</span>
                              <span>8:00 - 18:00</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Sâmbătă:</span>
                              <span>9:00 - 16:00</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Duminică:</span>
                              <span>Închis</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Connect With Us</h3>
                    <div className="flex space-x-4">
                      <a href="#" className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                        <i className="fab fa-facebook-f"></i>
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                        <i className="fab fa-twitter"></i>
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                        <i className="fab fa-instagram"></i>
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg overflow-hidden shadow-lg h-96">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d86548.59146097608!2d27.524152207715388!3d47.156575624825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40cafb7cf639ddbb%3A0x7ccb80da5426f53c!2sIasi%2C%20Romania!5e0!3m2!1sen!2sus!4v1695735029358!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Iasi, Romania Map"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer is included in MainLayout */}
    </MainLayout>
  );
}