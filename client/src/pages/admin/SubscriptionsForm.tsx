import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox"
import { FormDescription } from "@/components/ui/form";
import { X } from "lucide-react";

// Define form schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().default("#FFFFFF"),
  price: z.string().min(1, "Price is required"),
  features: z.array(
    z.union([
      z.string(),
      z.object({
        name: z.string().min(1, "Feature name is required"),
        value: z.string().min(1, "Feature value is required")
      })
    ])
  ).default([]),
  isPopular: z.boolean().default(false),
  displayOrder: z.number().default(0),
});

// Define form values type
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

  // Set form values when editing an existing subscription
  useEffect(() => {
    if (subscriptionData && !isLoading) {
      form.reset({
        name: subscriptionData.subscription.name,
        description: subscriptionData.subscription.description || "",
        color: subscriptionData.subscription.color || "#FFFFFF",
        price: subscriptionData.subscription.price || "",
        features: subscriptionData.subscription.features || [],
        isPopular: subscriptionData.subscription.isPopular || false,
        displayOrder: subscriptionData.subscription.displayOrder || 0,
      });
    }
  }, [subscriptionData, isLoading, form]);

  // Handle form submission
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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: [`/api/admin/subscriptions/${params.id}`] });
      setLocation("/admin/subscriptions");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = form.getValues("features") || [];
      form.setValue("features", [...currentFeatures, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues("features") || [];
    form.setValue(
      "features",
      currentFeatures.filter((_, i) => i !== index)
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Subscription Plan" : "Create Subscription Plan"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter plan name" {...field} />
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
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          {...field}
                        />
                        <Input
                          type="text"
                          placeholder="#FFFFFF"
                          className="flex-1"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              {...field}
                              placeholder="$29.99/month"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="displayOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                              placeholder="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter plan description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

<div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="features"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Features</FormLabel>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={newFeature}
                              onChange={(e) => setNewFeature(e.target.value)}
                              placeholder="Add a feature..."
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                if (newFeature.trim()) {
                                  // Add feature as an object with name and value properties
                                  field.onChange([...field.value, { 
                                    name: newFeature,
                                    value: newFeature
                                  }]);
                                  setNewFeature("");
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                          <div className="rounded-md border border-border p-3">
                            {field.value.length > 0 ? (
                              <ul className="space-y-2">
                                {field.value.map((feature, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center justify-between"
                                  >
                                    <span>{typeof feature === 'string' ? feature : feature.name}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newFeatures = [...field.value];
                                        newFeatures.splice(index, 1);
                                        field.onChange(newFeatures);
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-center text-muted-foreground py-2">
                                No features added
                              </div>
                            )}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}