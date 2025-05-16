import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layouts/AdminLayout";
import { X } from "lucide-react";

// Form schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().default("#FFFFFF"),
  price: z.string().min(1, "Price is required"),
  features: z.array(
    z.object({
      name: z.string().min(1, "Feature name is required"),
      value: z.string().min(1, "Feature value is required"),
    })
  ),
  isPopular: z.boolean().default(false),
  displayOrder: z.number().default(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubscriptionsForm() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const params = useParams();
  const isEditing = Boolean(params.id);
  const queryClient = useQueryClient();
  const [newFeature, setNewFeature] = useState("");

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#FFFFFF",
      price: "",
      features: [],
      isPopular: false,
      displayOrder: 0,
    },
  });

  // Fetch subscription data if editing
  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: [`/api/admin/subscriptions/${params.id}`],
    queryFn: async () => {
      const response = await fetch(`/api/admin/subscriptions/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      return response.json();
    },
    enabled: isEditing,
    retry: 1
  });

  // Update form values when subscription data is loaded
  useEffect(() => {
    if (subscriptionData?.subscription && isEditing) {
      const subscription = subscriptionData.subscription;
      form.reset({
        name: subscription.name,
        description: subscription.description || "",
        color: subscription.color || "#FFFFFF",
        price: subscription.price,
        features: subscription.features || [],
        isPopular: subscription.isPopular || false,
        displayOrder: subscription.displayOrder || 0,
      });
    }
  }, [subscriptionData, form, isEditing]);

  // Add feature handler
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = form.getValues("features") || [];
      form.setValue("features", [
        ...currentFeatures,
        { name: newFeature, value: "Included" },
      ]);
      setNewFeature("");
    }
  };

  // Remove feature handler
  const handleRemoveFeature = (index: number) => {
    const currentFeatures = form.getValues("features");
    form.setValue(
      "features",
      currentFeatures.filter((_, i) => i !== index)
    );
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create subscription");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setLocation("/admin/subscriptions");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await fetch(`/api/admin/subscriptions/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update subscription");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription plan updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setLocation("/admin/subscriptions");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Basic Plan" {...field} />
                    </FormControl>
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
                        placeholder="Enter a short description of the plan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $19.99/month" {...field} />
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
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <Input
                          type="text"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Features</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a feature"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddFeature}
                    className="flex-shrink-0"
                  >
                    Add
                  </Button>
                </div>

                <div className="border rounded-md p-3 mt-2">
                  {form.watch("features").length === 0 ? (
                    <div className="text-center py-2 text-gray-500">
                      No features added yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {form.watch("features").map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{feature.name}</p>
                            <p className="text-sm text-gray-500">
                              {feature.value}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFeature(index)}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="isPopular"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Popular Plan</FormLabel>
                        <FormDescription>
                          Highlight as a popular choice for users
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/subscriptions")}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}