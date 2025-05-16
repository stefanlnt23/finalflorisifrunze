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

// Define form schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().default("#FFFFFF"),
  monthlyPrice: z.coerce.number().min(0, "Price must be a positive number"),
  annualPrice: z.coerce.number().min(0, "Price must be a positive number"),
  features: z.array(z.string()),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
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
      monthlyPrice: 0,
      annualPrice: 0,
      features: [],
      isFeatured: false,
      isPopular: false,
    },
  });

  // Fetch subscription data if editing
  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: [`/api/subscriptions/${params.id}`],
    enabled: isEditing,
  });

  // Set form values when editing an existing subscription
  useEffect(() => {
    if (subscriptionData && !isLoading) {
      form.reset({
        name: subscriptionData.subscription.name,
        description: subscriptionData.subscription.description || "",
        color: subscriptionData.subscription.color || "#FFFFFF",
        monthlyPrice: subscriptionData.subscription.monthlyPrice || 0,
        annualPrice: subscriptionData.subscription.annualPrice || 0,
        features: subscriptionData.subscription.features || [],
        isFeatured: subscriptionData.subscription.isFeatured || false,
        isPopular: subscriptionData.subscription.isPopular || false,
      });
    }
  }, [subscriptionData, isLoading, form]);

  // Handle form submission
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await fetch("/api/subscriptions", {
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
      const response = await fetch(`/api/subscriptions/${params.id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: [`/api/subscriptions/${params.id}`] });
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="monthlyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="annualPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

            <div className="space-y-4">
              <FormLabel>Features</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFeature}
                >
                  Add
                </Button>
              </div>

              <ul className="space-y-2 mt-4">
                {form.watch("features")?.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-md"
                  >
                    <span>{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Featured Plan
                      </FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-6 h-6"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPopular"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Mark as Popular
                      </FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-6 h-6"
                      />
                    </FormControl>
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