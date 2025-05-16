import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for user roles
export const userRoleEnum = pgEnum('user_role', ['admin', 'staff']);

// User model with roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default('staff'),
});

// Services offered
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  shortDesc: text("short_desc").notNull(),
  price: text("price").notNull(),
  imageUrl: text("image_url"),
  featured: boolean("featured").default(false),
});

// Portfolio/Projects
export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  serviceId: integer("service_id").references(() => services.id),
  date: timestamp("date").notNull(),

  // Additional fields will be handled in MongoDB schema
  // These are placeholders for the SQL schema
  location: text("location"),
  projectDuration: text("project_duration"),
  difficultyLevel: text("difficulty_level"),
  featured: boolean("featured").default(false),
  status: text("status").default("Draft"),
  viewCount: integer("view_count").default(0),
});

// Blog posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").notNull(),
});

// Customer inquiries/contact messages
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  serviceId: integer("service_id").references(() => services.id),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").notNull(),
});

// Appointments/Bookings
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  // Customer information
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),

  // Address information
  buildingName: text("building_name"),
  streetName: text("street_name").notNull(),
  houseNumber: text("house_number").notNull(),
  city: text("city").notNull(),
  county: text("county").notNull(),
  postalCode: text("postal_code").notNull(),

  // Appointment details
  serviceId: integer("service_id").references(() => services.id).notNull(),
  date: timestamp("date").notNull(),
  priority: text("priority").default("Normal"),

  // Admin fields
  notes: text("notes"),
  status: text("status").default("Scheduled"),
});

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role"),
  content: text("content").notNull(),
  rating: integer("rating"),
  imageUrl: text("image_url"),
  displayOrder: integer("display_order"),
});

// Create Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  name: true,
  description: true,
  shortDesc: true,
  price: true,
  imageUrl: true,
  featured: true,
});

// Image pair schema
const imagePairSchema = z.object({
  before: z.string().min(1, "Before image is required"),
  after: z.string().min(1, "After image is required"),
  caption: z.string().optional(),
  richDescription: z.string().optional(),
  order: z.number().default(0)
});

// Client testimonial schema
const clientTestimonialSchema = z.object({
  clientName: z.string().optional(),
  comment: z.string().optional(),
  displayPermission: z.boolean().default(false)
});

// SEO schema
const seoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Base schema for portfolio items
const portfolioItemBaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),

  // Legacy field for backward compatibility
  imageUrl: z.string().optional(),

  // New fields
  images: z.array(imagePairSchema).optional(),
  serviceId: z.union([z.string(), z.number()]),
  date: z.union([z.string(), z.date()]).transform(val => new Date(val)),
  location: z.string().optional(),
  projectDuration: z.string().optional(),
  difficultyLevel: z.enum(["Easy", "Moderate", "Complex"]).optional(),
  clientTestimonial: clientTestimonialSchema.optional(),
  featured: z.boolean().default(false),
  seo: seoSchema.optional(),
  status: z.enum(["Published", "Draft"]).default("Draft"),
  viewCount: z.number().default(0)
});

// Export the schema for use in validation
export const insertPortfolioItemSchema = portfolioItemBaseSchema;

// Base schema for blog posts
const blogPostBaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  imageUrl: z.string().nullable().optional(),
  authorId: z.union([z.string(), z.number()]).default("1"), // Default to admin user
  publishedAt: z.union([z.string(), z.date()]).transform(val => new Date(val)),
  createdAt: z.union([z.string(), z.date()]).transform(val => new Date(val)),
  updatedAt: z.union([z.string(), z.date()]).transform(val => new Date(val))
});

// Export the schema for use in validation
export const insertBlogPostSchema = blogPostBaseSchema;

// Base schema for inquiries
const inquiryBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional().nullable(),
  message: z.string().min(1, "Message is required"),
  serviceId: z.union([z.string(), z.number()]).optional().nullable(),
  status: z.string().default("new"),
  createdAt: z.union([z.string(), z.date()]).transform(val => new Date(val))
});

// Export the schema for use in validation
export const insertInquirySchema = inquiryBaseSchema;

// Base schema for appointments
const appointmentBaseSchema = z.object({
  // Customer information
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),

  // Address information
  buildingName: z.string().optional().nullable(),
  streetName: z.string().min(1, "Street name is required"),
  houseNumber: z.string().min(1, "House/Property number is required"),
  city: z.string().min(1, "City/Town is required"),
  county: z.string().min(1, "County/Region is required"),
  postalCode: z.string().min(1, "Postal code is required"),

  // Appointment details
  serviceId: z.union([z.string(), z.number()]),
  date: z.union([z.string(), z.date()]).transform(val => new Date(val)),
  priority: z.enum(["Normal", "Urgent"]).default("Normal"),

  // Admin fields
  notes: z.string().optional().nullable(),
  status: z.enum(["Scheduled", "Completed", "Cancelled", "Rescheduled"]).default("Scheduled")
});

// Export the schema for use in validation
export const insertAppointmentSchema = appointmentBaseSchema;

// Base schema for testimonials
const testimonialBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().optional().nullable(),
  content: z.string().min(1, "Content is required"),
  rating: z.number().min(1).max(5).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  displayOrder: z.number().optional().nullable()
});

// Export the schema for use in validation
export const insertTestimonialSchema = testimonialBaseSchema;

// Carousel Images
export interface CarouselImage {
  id: string;
  imageUrl: string;
  alt: string;
  order: number;
}

// Feature Cards
export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  order: number;
}

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
// Custom type for PortfolioItem that supports both string and number IDs
export type PortfolioItem = {
  id: string | number;
  title: string;
  description: string;
  imageUrl?: string;
  images?: Array<{
    before: string;
    after: string;
    caption?: string;
    order: number;
  }>;
  serviceId: string | number | null;
  date: Date;
  location?: string;
  projectDuration?: string;
  difficultyLevel?: 'Easy' | 'Moderate' | 'Complex';
  clientTestimonial?: {
    clientName?: string;
    comment?: string;
    displayPermission: boolean;
  };
  featured: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    tags?: string[];
  };
  status: 'Published' | 'Draft';
  viewCount: number;
};

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
// Custom type for BlogPost that supports both string and number IDs
export type BlogPost = {
  id: string | number;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string | null;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
// Custom type for Inquiry that supports both string and number IDs
export type Inquiry = {
  id: string | number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  serviceId: string | number | null;
  status: string;
  createdAt: Date;
};

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
// Custom type for Appointment that supports both string and number IDs
export type Appointment = {
  id: string | number;
  // Customer information
  name: string;
  email: string;
  phone: string;

  // Address information
  buildingName?: string | null;
  streetName: string;
  houseNumber: string;
  city: string;
  county: string;
  postalCode: string;

  // Appointment details
  serviceId: string | number;
  date: Date;
  priority: "Normal" | "Urgent";

  // Admin fields
  notes?: string | null;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled";

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
};

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
// Custom type for Testimonial that supports both string and number IDs
export type Testimonial = {
  id: string | number;
  name: string;
  role: string | null;
  content: string;
  rating: number | null;
  imageUrl: string | null;
  displayOrder: number | null;
};