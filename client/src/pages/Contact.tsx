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
import { Badge } from "@/components/ui/badge";
import { Service } from "@shared/schema";
import { Phone, Mail, MapPin, Clock, MessageCircle, Calendar, Star, Shield, CheckCircle2, ExternalLink } from "lucide-react";

// Enhanced form validation schema with better error messages
const contactFormSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere").max(50, "Numele este prea lung"),
  email: z.string().email("Adresa de email nu este validă"),
  phone: z.string().optional().refine(
    (phone) => !phone || phone.length >= 10,
    "Numărul de telefon trebuie să aibă cel puțin 10 cifre"
  ),
  serviceId: z.string().optional(),
  message: z.string().min(20, "Mesajul trebuie să aibă cel puțin 20 de caractere").max(1000, "Mesajul este prea lung")
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

    // Keep serviceId as string or null - backend will handle conversion
    const serviceId = data.serviceId && data.serviceId !== "" ? data.serviceId : null;

    apiRequest("POST", "/api/contact", {
        ...data,
        serviceId
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
      {/* Enhanced Page Header */}
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <MessageCircle className="w-12 h-12 text-green-600 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Contactează-ne</h1>
            </div>
            <p className="text-xl text-gray-700 mb-8">
              Ai întrebări despre serviciile noastre sau dorești să programezi o consultație? 
              Ia legătura cu echipa noastră astăzi și primește un răspuns în maxim 24 de ore.
            </p>
            
            {/* Quick Contact Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm">
                <Clock className="w-8 h-8 text-green-600 mb-2" />
                <span className="font-semibold text-gray-900">Răspuns în 24h</span>
                <span className="text-sm text-gray-600">Timp mediu de răspuns</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm">
                <Star className="w-8 h-8 text-green-600 mb-2" />
                <span className="font-semibold text-gray-900">4.9/5 Evaluare</span>
                <span className="text-sm text-gray-600">Satisfacția clienților</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm">
                <Shield className="w-8 h-8 text-green-600 mb-2" />
                <span className="font-semibold text-gray-900">Consultație Gratuită</span>
                <span className="text-sm text-gray-600">Fără obligații</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Quick Action Buttons */}
            <div className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <a href="tel:+40742650670" className="block">
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Phone className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Sună Acum</h3>
                      <p className="text-green-600 font-bold text-xl">+40 742 650 670</p>
                      <p className="text-sm text-gray-600 mt-2">Disponibil 8:00 - 18:00</p>
                    </CardContent>
                  </Card>
                </a>
                
                <a href="https://wa.me/40742650670" target="_blank" rel="noopener noreferrer" className="block">
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">WhatsApp</h3>
                      <p className="text-green-600 font-bold">Mesaj Direct</p>
                      <p className="text-sm text-gray-600 mt-2">Răspuns în 5 minute</p>
                    </CardContent>
                  </Card>
                </a>
                
                <Link href="/services" className="block">
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Programează</h3>
                      <p className="text-green-600 font-bold">Consultație</p>
                      <p className="text-sm text-gray-600 mt-2">Consultație gratuită</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="mb-20">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Trimite-ne un Mesaj</h2>
                <p className="text-gray-600 mb-2">Completează formularul de mai jos și te vom contacta în maxim 24 de ore.</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
                    Consultație gratuită
                  </span>
                  <span className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
                    Fără obligații
                  </span>
                  <span className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
                    Răspuns rapid
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Contact Form - Takes 2 columns */}
                <div className="lg:col-span-2">
                  {formSubmitted ? (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-8 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                        <h3 className="text-2xl font-semibold mb-4 text-green-800">Mesaj Trimis cu Succes!</h3>
                        <p className="text-green-700 mb-6 text-lg">
                          Mulțumim pentru mesaj! Echipa noastră va răspunde în maxim 24 de ore.
                        </p>
                        <div className="space-y-3 mb-6">
                          <p className="text-sm text-green-600">Pentru răspuns urgent, ne poți contacta direct:</p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a href="tel:+40742650670" className="text-green-600 hover:text-green-800 font-medium">
                              📞 +40 742 650 670
                            </a>
                            <a href="https://wa.me/40742650670" className="text-green-600 hover:text-green-800 font-medium">
                              💬 WhatsApp
                            </a>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setFormSubmitted(false)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Trimite alt mesaj
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="shadow-lg">
                      <CardContent className="p-8">
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base font-medium">Nume Complet *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Introduceți numele dvs." 
                                        className="h-12 border-2 focus:border-green-500" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-600" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base font-medium">Adresa de Email *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="email" 
                                        placeholder="nume@exemplu.com" 
                                        className="h-12 border-2 focus:border-green-500" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-600" />
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
                                    <FormLabel className="text-base font-medium">Număr de Telefon</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="+40 7XX XXX XXX" 
                                        className="h-12 border-2 focus:border-green-500" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-600" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="serviceId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base font-medium">Serviciu de Interes</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingServices}>
                                      <FormControl>
                                        <SelectTrigger className="h-12 border-2 focus:border-green-500">
                                          <SelectValue placeholder="Alegeți un serviciu" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {isLoadingServices ? (
                                          <SelectItem value="loading" disabled>Se încarcă serviciile...</SelectItem>
                                        ) : services.length === 0 ? (
                                          <SelectItem value="none" disabled>Nu există servicii disponibile</SelectItem>
                                        ) : (
                                          services.map((service: Service) => (
                                            <SelectItem key={service.id} value={String(service.id)}>
                                              {service.name}
                                            </SelectItem>
                                          ))
                                        )}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage className="text-red-600" />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="message"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-medium">Mesajul Dvs. *</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Descrieți proiectul dvs., mărimea grădinii, serviciile de care aveți nevoie și orice alte detalii relevante..." 
                                      className="min-h-40 border-2 focus:border-green-500 resize-none" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-600" />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Minimum 20 caractere ({field.value?.length || 0}/20)
                                  </p>
                                </FormItem>
                              )}
                            />
                            
                            {/* Anti-spam notice */}
                            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                              <Shield className="w-4 h-4" />
                              <span>Formularul este protejat împotriva spam-ului. Datele dvs. sunt în siguranță.</span>
                            </div>
                            
                            <Button 
                              type="submit" 
                              className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-semibold transition-all duration-300 hover:shadow-lg"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                  Se trimite mesajul...
                                </>
                              ) : (
                                <>
                                  <Mail className="w-5 h-5 mr-2" />
                                  Trimite Mesajul
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Enhanced Contact Information Sidebar */}
                <div className="space-y-6">
                  
                  {/* Testimonial Snippet */}
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-current" />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-600">5.0/5</span>
                      </div>
                      <blockquote className="text-gray-700 italic mb-4">
                        "Echipa Flori și Frunze a transformat complet grădina noastră. Profesionalism excepțional și rezultate peste așteptări!"
                      </blockquote>
                      <cite className="text-sm font-medium text-green-700">— Maria P., Client mulțumit</cite>
                    </CardContent>
                  </Card>

                  {/* Enhanced Contact Cards */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Contactează-ne Direct</h3>
                    
                    {/* Phone Card */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div className="mr-3">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                              <Phone className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">Contact Telefonic</h4>
                            <a 
                              href="tel:+40742650670" 
                              className="text-green-600 hover:text-green-700 font-bold"
                            >
                              +40 742 650 670
                            </a>
                            <p className="text-xs text-gray-600">08:00 - 18:00</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Email Card */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div className="mr-3">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                              <Mail className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">Email</h4>
                            <a 
                              href="mailto:info@florisifrunze.com" 
                              className="text-green-600 hover:text-green-700 font-bold text-sm"
                            >
                              info@florisifrunze.com
                            </a>
                            <p className="text-xs text-gray-600">Răspuns în 24h</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* WhatsApp Card */}
                    <Card className="hover:shadow-md transition-shadow border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div className="mr-3">
                            <div className="w-12 h-12 rounded-xl bg-green-200 flex items-center justify-center">
                              <MessageCircle className="w-6 h-6 text-green-700" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">WhatsApp</h4>
                            <a 
                              href="https://wa.me/40742650670" 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-medium transition-colors text-sm"
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Mesaj
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Location Card */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">Locația Noastră</h4>
                            <p className="text-gray-600 text-sm mb-2">
                              Strada Alexandru Lăpușneanu 14<br />
                              Iași, 700057, România
                            </p>
                            <a 
                              href="https://maps.google.com/?q=Strada+Alexandru+Lăpușneanu+14,+Iași,+700057,+România"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-xs"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Vezi pe hartă
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Map Section - Separate section right after contact */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Map Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Locația Noastră</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Ne găsești în inima Iașului, cu acces facil din toate zonele orașului. 
                Oferim servicii în tot Iașul și împrejurimile.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Interactive Map */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden shadow-xl">
                  <div className="relative h-96 lg:h-[500px]">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2712.8234567!2d27.5879167!3d47.1584593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40cafb7cf639ddbb%3A0x7ccb80da5426f53c!2sStrada%20Alexandru%20L%C4%83pu%C8%99neanu%2014%2C%20Ia%C8%99i%20700057%2C%20Romania!5e0!3m2!1sen!2sus!4v1695735029358!5m2!1sen!2sus"
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Flori și Frunze - Strada Alexandru Lăpușneanu 14, Iași"
                      className="w-full h-full"
                    ></iframe>
                    
                    {/* Map Overlay with Actions */}
                    <div className="absolute top-4 right-4 space-y-2">
                      <a
                        href="https://maps.google.com/?q=Strada+Alexandru+Lăpușneanu+14,+Iași,+700057,+România"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg shadow-md transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4 inline mr-2" />
                        Deschide în Google Maps
                      </a>
                      <a
                        href="https://maps.google.com/?q=Strada+Alexandru+Lăpușneanu+14,+Iași,+700057,+România&dirflg=d"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors text-sm font-medium"
                      >
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Obține Direcții
                      </a>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Location Details */}
              <div className="space-y-6">
                
                {/* Address Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-green-600" />
                      Adresa Completă
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <p className="font-medium">Strada Alexandru Lăpușneanu 14</p>
                      <p>Iași, 700057</p>
                      <p>Județul Iași, România</p>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        <strong>Puncte de reper:</strong><br />
                        Aproape de Centrul Vechi al Iașului<br />
                        La 5 minute de Palas Mall
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Transportation */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Cum să Ajungi</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                          <i className="fas fa-car text-blue-600 text-xs"></i>
                        </div>
                        <div>
                          <p className="font-medium">Cu mașina</p>
                          <p className="text-gray-600">Parcare disponibilă în zonă</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                          <i className="fas fa-bus text-green-600 text-xs"></i>
                        </div>
                        <div>
                          <p className="font-medium">Transport public</p>
                          <p className="text-gray-600">Liniile 28, 34, 42</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-3 mt-0.5">
                          <i className="fas fa-walking text-yellow-600 text-xs"></i>
                        </div>
                        <div>
                          <p className="font-medium">Pe jos</p>
                          <p className="text-gray-600">10 min din centru</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Radius */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-green-800 flex items-center">
                      <div className="w-5 h-5 rounded-full bg-green-600 mr-2"></div>
                      Raza de Acoperire
                    </h3>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex justify-between">
                        <span>Iași (centrul urbain):</span>
                        <Badge variant="secondary" className="bg-green-200 text-green-800">0-15 km</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Zona metropolitană:</span>
                        <Badge variant="secondary" className="bg-green-200 text-green-800">15-30 km</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Proiecte speciale:</span>
                        <Badge variant="secondary" className="bg-green-200 text-green-800">30+ km</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-3">
                      Costurile de transport sunt incluse în prețul proiectelor din Iași
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer is included in MainLayout */}
    </MainLayout>
  );
}