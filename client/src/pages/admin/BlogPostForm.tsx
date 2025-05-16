
import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, XCircle, ImageIcon, Type, Move } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { insertBlogPostSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Section schema for blog content
const sectionSchema = z.object({
  type: z.enum(["text", "image", "quote", "list", "heading"]),
  content: z.string().min(1, "Content is required"),
  imageUrl: z.string().optional(),
  caption: z.string().optional(),
  level: z.number().optional(),
  items: z.array(z.string()).optional(),
  alignment: z.enum(["left", "center", "right"]).optional().default("left"),
});

// Extended schema with validation for rich content
const formSchema = insertBlogPostSchema.extend({
  content: z.string().optional(),
  sections: z.array(sectionSchema).optional(),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(150, "Excerpt must be less than 150 characters"),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminBlogPostForm() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = !!id;
  const [previewContent, setPreviewContent] = useState("");

  // Fetch blog post data if editing
  const { data, isLoading: isLoadingPost } = useQuery({
    queryKey: ['/api/blog', id],
    queryFn: async () => {
      if (!id) return null;
      console.log(`Fetching blog post with ID: ${id}`);
      const response = await apiRequest("GET", `/api/blog/${id}`);
      const data = await response.json();
      console.log("Retrieved blog post data:", data);
      return data;
    },
    enabled: isEditing,
  });

  const blogPost = data?.blogPost;

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      sections: [{ type: "text", content: "", alignment: "left" }],
      tags: []
    },
  });

  // Field array for sections
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "sections"
  });

  // Tag input state
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Update form values when blog post data is loaded
  useEffect(() => {
    if (blogPost) {
      // Parse sections from content if not present
      let parsedSections = blogPost.sections || [];
      
      if (!parsedSections.length && blogPost.content) {
        parsedSections = [{ type: "text", content: blogPost.content, alignment: "left" }];
      }
      
      form.reset({
        title: blogPost.title,
        content: blogPost.content || "",
        excerpt: blogPost.excerpt,
        imageUrl: blogPost.imageUrl || "",
        publishedAt: new Date(blogPost.publishedAt),
        createdAt: new Date(blogPost.createdAt),
        updatedAt: new Date(blogPost.updatedAt),
        sections: parsedSections,
        tags: blogPost.tags || []
      });
      
      setTags(blogPost.tags || []);
    }
  }, [blogPost, form]);

  // Preview content change handler
  useEffect(() => {
    const sections = form.watch("sections");
    if (sections) {
      let html = "";
      sections.forEach(section => {
        switch(section.type) {
          case "text":
            html += `<div class="text-gray-700 mb-5" style="text-align: ${section.alignment}">${section.content.replace(/\n/g, "<br>")}</div>`;
            break;
          case "image":
            html += `
              <figure class="mb-8">
                <img src="${section.imageUrl}" alt="${section.caption || ''}" class="w-full h-auto rounded-lg shadow-md mb-2" />
                ${section.caption ? `<figcaption class="text-sm text-gray-500 text-center">${section.caption}</figcaption>` : ''}
              </figure>
            `;
            break;
          case "quote":
            html += `
              <blockquote class="border-l-4 border-green-600 pl-4 italic my-6 text-gray-700">
                ${section.content}
                ${section.caption ? `<footer class="text-sm mt-2 text-gray-500">— ${section.caption}</footer>` : ''}
              </blockquote>
            `;
            break;
          case "heading":
            const level = section.level || 2;
            html += `<h${level} class="text-gray-900 font-bold mb-4 ${level === 2 ? 'text-2xl' : level === 3 ? 'text-xl' : 'text-lg'}">${section.content}</h${level}>`;
            break;
          case "list":
            if (section.items && section.items.length) {
              html += `<ul class="list-disc pl-6 mb-5">`;
              section.items.forEach(item => {
                html += `<li class="mb-1">${item}</li>`;
              });
              html += `</ul>`;
            }
            break;
        }
      });
      setPreviewContent(html);
    }
  }, [form.watch("sections")]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("Creating new blog post - sending request");
      try {
        const response = await apiRequest("POST", "/api/admin/blog", values);
        console.log("Server response:", response);
        
        if (!response.ok) {
          // Try to extract error message from response
          const errorData = await response.json().catch(() => ({}));
          console.error("Server returned error:", errorData);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        console.error("Network or parsing error:", error);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log("Blog post created successfully");
      toast({
        title: "Blog Post Created",
        description: "The blog post has been successfully created",
      });
      // Invalidate both admin and public blog queries
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog'] });
      setLocation("/admin/blog");
    },
    onError: (error: any) => {
      console.error("Error creating blog post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create the blog post",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log(`Updating blog post with ID: ${id}`, values);
      return await apiRequest("PUT", `/api/admin/blog/${id}`, values);
    },
    onSuccess: () => {
      toast({
        title: "Blog Post Updated",
        description: "The blog post has been successfully updated",
      });
      // Invalidate both admin and public blog queries
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog', id] });
      setLocation("/admin/blog");
    },
    onError: (error: any) => {
      console.error("Error updating blog post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update the blog post",
        variant: "destructive",
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Add a new section at specific position
  const addSection = (type: string, index: number) => {
    let newSection;
    switch (type) {
      case "text":
        newSection = { type: "text", content: "", alignment: "left" };
        break;
      case "image":
        newSection = { type: "image", imageUrl: "", caption: "", alignment: "center" };
        break;
      case "quote":
        newSection = { type: "quote", content: "", caption: "" };
        break;
      case "heading":
        newSection = { type: "heading", content: "", level: 2 };
        break;
      case "list":
        newSection = { type: "list", items: [""] };
        break;
    }
    append(newSection as any, { focusIndex: index + 1 });
  };

  // Add tag handler
  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      const newTags = [...tags, tagInput];
      setTags(newTags);
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  // Remove tag handler
  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    form.setValue("tags", newTags);
  };

  // Add list item
  const addListItem = (sectionIndex: number) => {
    const currentSection = form.getValues(`sections.${sectionIndex}`);
    const items = currentSection.items || [];
    items.push("");
    form.setValue(`sections.${sectionIndex}.items`, items);
  };
  
  // Remove list item
  const removeListItem = (sectionIndex: number, itemIndex: number) => {
    const currentSection = form.getValues(`sections.${sectionIndex}`);
    const items = currentSection.items || [];
    items.splice(itemIndex, 1);
    form.setValue(`sections.${sectionIndex}.items`, items);
  };

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    const now = new Date();
    
    // Generate content from sections for backward compatibility
    let combinedContent = "";
    if (values.sections && values.sections.length > 0) {
      values.sections.forEach(section => {
        if (section.type === "text") {
          combinedContent += section.content + "\n\n";
        }
      });
    }
    
    // Clean up sections data to ensure it's properly formatted for submission
    const cleanedSections = values.sections?.map(section => {
      // Make sure each section has the required fields based on its type
      switch(section.type) {
        case "text":
          return {
            type: section.type,
            content: section.content || "",
            alignment: section.alignment || "left"
          };
        case "image":
          return {
            type: section.type,
            imageUrl: section.imageUrl || "",
            caption: section.caption || "",
            alignment: section.alignment || "center"
          };
        case "quote":
          return {
            type: section.type,
            content: section.content || "",
            caption: section.caption || ""
          };
        case "heading":
          return {
            type: section.type,
            content: section.content || "",
            level: section.level || 2
          };
        case "list":
          return {
            type: section.type,
            items: section.items || []
          };
        default:
          return section;
      }
    });
    
    // Ensure all dates are valid Date objects
    const publishedAt = values.publishedAt instanceof Date ? values.publishedAt : new Date(values.publishedAt);
    
    try {
      const submissionData = {
        ...values,
        content: combinedContent.trim(), // Keep this for backward compatibility
        imageUrl: values.imageUrl || null,
        authorId: 1, // Add authorId field
        publishedAt: publishedAt.toISOString(), // Convert to ISO string format
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        sections: cleanedSections // Use cleaned sections data
      };

      console.log("Submitting blog post data:", JSON.stringify(submissionData, null, 2));

      if (isEditing) {
        console.log("Updating existing blog post...");
        updateMutation.mutate(submissionData);
      } else {
        console.log("Creating new blog post...");
        createMutation.mutate(submissionData);
      }
    } catch (error) {
      console.error("Error preparing submission data:", error);
      toast({
        title: "Form Error",
        description: "There was a problem preparing your submission",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout
      title={isEditing ? "Edit Blog Post" : "Create New Blog Post"}
      description={isEditing ? "Update post details" : "Write a new blog post"}
      action={
        <Button 
          variant="outline" 
          onClick={() => setLocation("/admin/blog")}
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Blog Posts
        </Button>
      }
    >
      <Card>
        <CardContent className="pt-6">
          {isEditing && isLoadingPost ? (
            <div className="flex items-center justify-center p-6">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mr-3"></i>
              <p>Loading blog post data...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter blog post title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormField
                      control={form.control}
                      name="publishedAt"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Publication Date</FormLabel>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a brief summary of the post"
                          className="min-h-16"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A short summary that will appear in blog listings (max 150 characters)
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
                      <FormLabel>Featured Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          value={field.value || ''} 
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormDescription>
                        A URL to the main image for the blog post
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Tags</h3>
                    <div className="text-sm text-gray-500">Add relevant keywords</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={tagInput} 
                      onChange={e => setTagInput(e.target.value)} 
                      placeholder="Add tag" 
                      className="flex-1"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag} className="bg-green-600 hover:bg-green-700">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <div key={index} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => removeTag(index)} 
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border rounded-md p-4 bg-gray-50">
                  <Tabs defaultValue="editor">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Blog Content</h3>
                      <TabsList>
                        <TabsTrigger value="editor">Editor</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="editor" className="mt-0">
                      <div className="space-y-6">
                        {fields.map((field, index) => (
                          <div key={field.id} className="border rounded-md p-4 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {field.type === "text" && <Type size={18} />}
                                {field.type === "image" && <ImageIcon size={18} />}
                                {field.type === "quote" && <i className="fas fa-quote-left"></i>}
                                {field.type === "heading" && <i className="fas fa-heading"></i>}
                                {field.type === "list" && <i className="fas fa-list"></i>}
                                <span className="font-medium capitalize">{field.type} Section</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {index > 0 && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => move(index, index - 1)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <i className="fas fa-arrow-up"></i>
                                  </Button>
                                )}
                                {index < fields.length - 1 && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => move(index, index + 1)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <i className="fas fa-arrow-down"></i>
                                  </Button>
                                )}
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => remove(index)}
                                  className="text-red-500 h-8 w-8 p-0"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </Button>
                              </div>
                            </div>

                            {field.type === "text" && (
                              <div className="space-y-3">
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.content`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Textarea 
                                          rows={5}
                                          placeholder="Enter text content here..." 
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.alignment`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Alignment</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select alignment" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="left">Left</SelectItem>
                                          <SelectItem value="center">Center</SelectItem>
                                          <SelectItem value="right">Right</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}

                            {field.type === "image" && (
                              <div className="space-y-3">
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.imageUrl`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Image URL</FormLabel>
                                      <FormControl>
                                        <Input placeholder="https://example.com/image.jpg" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.caption`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Caption (optional)</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Image caption" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.alignment`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Alignment</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select alignment" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="left">Left</SelectItem>
                                          <SelectItem value="center">Center</SelectItem>
                                          <SelectItem value="right">Right</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}

                            {field.type === "quote" && (
                              <div className="space-y-3">
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.content`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Quote Text</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          rows={3}
                                          placeholder="Enter quote text here..." 
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.caption`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Attribution (optional)</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Quote attribution" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}

                            {field.type === "heading" && (
                              <div className="space-y-3">
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.content`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Heading Text</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Enter heading text" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`sections.${index}.level`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Heading Level</FormLabel>
                                      <Select
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                        defaultValue={field.value?.toString()}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select heading level" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="2">Heading 2</SelectItem>
                                          <SelectItem value="3">Heading 3</SelectItem>
                                          <SelectItem value="4">Heading 4</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}

                            {field.type === "list" && (
                              <div className="space-y-3">
                                <div>
                                  <FormLabel>List Items</FormLabel>
                                  {form.getValues(`sections.${index}.items`)?.map((_, itemIndex) => (
                                    <div key={itemIndex} className="flex items-center gap-2 mb-2">
                                      <Input 
                                        placeholder={`List item ${itemIndex + 1}`}
                                        {...form.register(`sections.${index}.items.${itemIndex}`)}
                                      />
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => removeListItem(index, itemIndex)}
                                        className="text-red-500 h-8 w-8 p-0"
                                      >
                                        <i className="fas fa-times"></i>
                                      </Button>
                                    </div>
                                  ))}
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => addListItem(index)}
                                    className="mt-2"
                                  >
                                    <i className="fas fa-plus mr-2"></i> Add Item
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="flex justify-center gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => addSection("text", fields.length - 1)}
                          >
                            <Type size={16} className="mr-2" /> Add Text
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => addSection("image", fields.length - 1)}
                          >
                            <ImageIcon size={16} className="mr-2" /> Add Image
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => addSection("quote", fields.length - 1)}
                          >
                            <i className="fas fa-quote-left mr-2"></i> Add Quote
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => addSection("heading", fields.length - 1)}
                          >
                            <i className="fas fa-heading mr-2"></i> Add Heading
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => addSection("list", fields.length - 1)}
                          >
                            <i className="fas fa-list mr-2"></i> Add List
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-0">
                      <div className="border rounded-md p-6 bg-white">
                        <h1 className="text-3xl font-bold mb-2">{form.watch("title")}</h1>
                        <p className="text-gray-600 mb-6">{form.watch("excerpt")}</p>
                        {form.watch("imageUrl") && (
                          <img 
                            src={form.watch("imageUrl")} 
                            alt={form.watch("title")} 
                            className="w-full h-auto rounded-lg mb-6" 
                          />
                        )}
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: previewContent }}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation("/admin/blog")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting || form.formState.isSubmitting}
                    onClick={(e) => {
                      // Only log the click, don't interfere with the form submission
                      console.log("Form submission button clicked");
                      // The actual submission will happen through form.handleSubmit(onSubmit)
                    }}
                  >
                    {isSubmitting || form.formState.isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        {isEditing ? "Updating..." : "Publishing..."}
                      </>
                    ) : (
                      isEditing ? "Update Post" : "Publish Post"
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
