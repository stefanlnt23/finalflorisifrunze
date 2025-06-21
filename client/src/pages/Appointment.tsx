
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
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  email: z.string().email("Vă rugăm să introduceți o adresă de email validă"),
  phone: z.string().min(10, "Numărul de telefon trebuie să aibă cel puțin 10 caractere"),
  serviceId: z.string().min(1, "Vă rugăm să selectați un serviciu"),
  date: z.date({
    required_error: "Vă rugăm să selectați o dată",
  }).refine(date => {
    // Must be at least tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return date >= tomorrow;
  }, {
    message: "Programarea trebuie să fie cu cel puțin o zi în avans",
  }),
  // Address fields
  buildingName: z.string().optional(),
  streetName: z.string().min(1, "Numele străzii este obligatoriu"),
  houseNumber: z.string().min(1, "Numărul casei/proprietății este obligatoriu"),
  city: z.string().min(1, "Orașul este obligatoriu"),
  county: z.string().min(1, "Județul este obligatoriu"),
  postalCode: z.string().optional().default("000000"),
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
      buildingName: "",
      streetName: "",
      houseNumber: "",
      city: "",
      county: "",
      postalCode: "000000",
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
        serviceId: values.serviceId, // Keep as string ObjectId
        date: format(values.date, "yyyy-MM-dd'T'HH:mm:ss") // API expects ISO format
      };
      
      // Make API request
      const response = await apiRequest("POST", "/api/appointments", appointmentData);
      
      // Handle success
      setIsSuccess(true);
      toast({
        title: "Programare Confirmată",
        description: "Programarea dvs. a fost înregistrată cu succes.",
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Programarea a eșuat",
        description: "A apărut o problemă la înregistrarea programării. Vă rugăm să încercați din nou.",
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
                <CardTitle className="text-center text-2xl">Programare Confirmată!</CardTitle>
                <CardDescription className="text-center">
                  Vă mulțumim pentru programarea făcută la noi.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Am trimis un email de confirmare cu toate detaliile. Echipa noastră vă va contacta în curând pentru a confirma programarea.
                </p>
                <div className="flex flex-col space-y-4">
                  <Link href="/services">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Vezi Mai Multe Servicii
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      Înapoi la Pagina Principală
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
              Programează o Vizită
            </h1>
            <p className="text-xl text-gray-600">
              Planifică un serviciu cu echipa noastră de grădinari experți
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Detalii Programare</CardTitle>
                  <CardDescription>
                    Completați formularul de mai jos pentru a programa serviciul de grădinărit.
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
                            <FormLabel>Nume Complet</FormLabel>
                            <FormControl>
                              <Input placeholder="Numele dvs. complet" {...field} />
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
                                <Input placeholder="Adresa dvs. de email" type="email" {...field} />
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
                              <FormLabel>Număr de Telefon</FormLabel>
                              <FormControl>
                                <Input placeholder="Numărul dvs. de telefon" {...field} />
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
                            <FormLabel>Serviciu</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selectați un serviciu" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoading ? (
                                  <SelectItem value="loading" disabled>Se încarcă serviciile...</SelectItem>
                                ) : services.length === 0 ? (
                                  <SelectItem value="none" disabled>Nu există servicii disponibile</SelectItem>
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
                            <FormLabel>Data Programării</FormLabel>
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
                                      <span>Alegeți o dată</span>
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
                              Selectați o dată cu cel puțin o zi în avans.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Address Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                          Adresa pentru Serviciu
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="buildingName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nume Clădire (Opțional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Numele clădirii" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="streetName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Numele Străzii *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Numele străzii" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="houseNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Numărul Casei *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nr. casei/proprietății" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Orașul *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Orașul" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="county"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Județul *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Județul/Regiunea" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          

                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instrucțiuni Speciale</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Vă rugăm să furnizați orice informație suplimentară despre nevoile dvs."
                                className="resize-none"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Orice detalii sau cerințe specifice pentru programarea dvs.
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
                            Se procesează...
                          </>
                        ) : (
                          "Programează"
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
                  <CardTitle>De ce să ne alegeți?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <p className="text-gray-600">Grădinari experți cu ani de experiență</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <p className="text-gray-600">Practici de grădinărit ecologice</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <p className="text-gray-600">Opțiuni flexibile de programare</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1 mr-3">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <p className="text-gray-600">Garanție completă a serviciilor</p>
                    </li>
                  </ul>
                  
                  <div className="mt-6 border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Întrebări?</h3>
                    <p className="text-gray-600 mb-4">
                      Dacă aveți întrebări despre serviciile noastre sau despre procesul de programare, nu ezitați să ne contactați.
                    </p>
                    <Link href="/contact">
                      <Button variant="outline" className="w-full">
                        Contactați-ne
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
