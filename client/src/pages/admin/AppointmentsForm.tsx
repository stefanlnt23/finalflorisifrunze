import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parse, set } from "date-fns";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
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
import { insertAppointmentSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Extend the schema with validation
const formSchema = insertAppointmentSchema.extend({
  // Add time field for time picker
  time: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminAppointmentsForm() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = !!id;
  const [timeValue, setTimeValue] = useState<string>("12:00");

  // Fetch services for dropdown
  const { data: servicesData } = useQuery({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/services");
      const data = await response.json();
      return data;
    },
  });

  const services = servicesData?.services || [];

  // Fetch appointment data if editing
  const { data, isLoading: isLoadingItem } = useQuery({
    queryKey: ['/api/admin/appointments', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest("GET", `/api/admin/appointments/${id}`);
      const data = await response.json();
      return data;
    },
    enabled: isEditing,
  });

  const appointment = data?.appointment;

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      buildingName: "",
      streetName: "",
      houseNumber: "",
      city: "",
      county: "",
      postalCode: "",
      serviceId: "",
      date: new Date(),
      time: "12:00",
      priority: "Normal",
      notes: "",
      status: "Scheduled"
    },
  });

  // Update form values when appointment data is loaded
  useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.date);
      const formattedTime = format(appointmentDate, "HH:mm");
      setTimeValue(formattedTime);
      
      form.reset({
        name: appointment.name,
        email: appointment.email,
        phone: appointment.phone,
        buildingName: appointment.buildingName || "",
        streetName: appointment.streetName,
        houseNumber: appointment.houseNumber,
        city: appointment.city,
        county: appointment.county,
        postalCode: appointment.postalCode,
        serviceId: appointment.serviceId.toString(),
        date: appointmentDate,
        time: formattedTime,
        priority: appointment.priority,
        notes: appointment.notes || "",
        status: appointment.status
      });
    }
  }, [appointment, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Combine date and time
      const { date, time, ...rest } = values;
      const [hours, minutes] = (time || "12:00").split(":").map(Number);
      const combinedDate = set(date, { hours, minutes });
      
      const appointmentData = {
        ...rest,
        date: combinedDate
      };
      
      const response = await apiRequest("POST", "/api/admin/appointments", appointmentData);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to create appointment");
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Appointment Created",
        description: "The appointment has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/appointments'] });
      setLocation("/admin/appointments");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create the appointment",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Combine date and time
      const { date, time, ...rest } = values;
      const [hours, minutes] = (time || "12:00").split(":").map(Number);
      const combinedDate = set(date, { hours, minutes });
      
      const appointmentData = {
        ...rest,
        date: combinedDate
      };
      
      const response = await apiRequest("PUT", `/api/admin/appointments/${id}`, appointmentData);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update appointment");
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Appointment Updated",
        description: "The appointment has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/appointments', id] });
      setLocation("/admin/appointments");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update the appointment",
        variant: "destructive",
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    console.log('Submitting appointment:', values);

    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? "Edit Appointment" : "Create New Appointment"}
      description={isEditing ? "Update appointment details" : "Schedule a new appointment"}
      action={
        <Button 
          variant="outline" 
          onClick={() => setLocation("/admin/appointments")}
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Appointments
        </Button>
      }
    >
      <Card>
        <CardContent className="pt-6">
          {isEditing && isLoadingItem ? (
            <div className="flex items-center justify-center p-6">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mr-3"></i>
              <p>Loading appointment data...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information Section */}
                  <div className="space-y-6 md:col-span-2">
                    <h3 className="text-lg font-medium border-b pb-2">Customer Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter customer name" {...field} />
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
                            <FormLabel>Mobile Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address Information Section */}
                  <div className="space-y-6 md:col-span-2">
                    <h3 className="text-lg font-medium border-b pb-2">Address Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="buildingName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Building/House Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Optional" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="houseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>House/Property Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter property number" {...field} />
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
                            <FormLabel>Street Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter street name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City/Town *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city or town" {...field} />
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
                            <FormLabel>County/Region *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter county or region" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter postal code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Appointment Details Section */}
                  <div className="space-y-6 md:col-span-2">
                    <h3 className="text-lg font-medium border-b pb-2">Appointment Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time *</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <Input
                                  type="time"
                                  value={field.value || timeValue}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    setTimeValue(e.target.value);
                                  }}
                                  className="flex-1"
                                />
                                <Clock className="ml-2 h-4 w-4 text-gray-400" />
                              </div>
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
                          <FormLabel>Service Type *</FormLabel>
                          <Select 
                            value={field.value.toString()} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {services.map((service: any) => (
                                <SelectItem key={service.id} value={service.id.toString()}>
                                  {service.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority Level</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="Normal" />
                                </FormControl>
                                <FormLabel className="font-normal">Normal</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="Urgent" />
                                </FormControl>
                                <FormLabel className="font-normal text-red-600">Urgent</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isEditing && (
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Scheduled">Scheduled</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter any additional notes or instructions"
                              className="min-h-32"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Internal notes about this appointment (not visible to customer)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation("/admin/appointments")}
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
                      isEditing ? "Update Appointment" : "Create Appointment"
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
