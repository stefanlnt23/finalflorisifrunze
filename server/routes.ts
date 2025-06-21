import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import mongoose from "mongoose";
import { storage } from "./storage.js";
import { comparePasswords, hashPassword } from "./auth.js";
import { generateToken, verifyToken, extractTokenFromHeader, JWTPayload } from "./jwt.js";
import { z } from "zod";
import {
  insertServiceSchema,
  insertPortfolioItemSchema,
  insertBlogPostSchema,
  insertInquirySchema,
  insertAppointmentSchema,
  insertTestimonialSchema,
} from "../shared/schema.js";

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Authentication middleware - now properly validates JWT tokens
function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ 
        message: "Access denied. No token provided.",
        requiresAuth: true 
      });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        message: "Access denied. Invalid token.",
        requiresAuth: true 
      });
    }

    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        message: "Access denied. Admin privileges required.",
        requiresAuth: true 
      });
    }

    // Add user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(401).json({ 
      message: "Access denied. Authentication failed.",
      requiresAuth: true 
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API Status route
  app.get("/api/status", (req, res) => {
    res.json({
      status: "ok",
      message: "Flori si Frunze API is running!",
    });
  });

  // =========== PUBLIC API ROUTES ===========

  // Services API
  app.get("/api/services", async (req, res) => {
    try {
      // Set aggressive caching headers for static content
      res.set({
        'Cache-Control': 'public, max-age=3600, s-maxage=7200', // 1 hour client, 2 hours CDN
        'ETag': `"services-${Date.now()}"`,
        'Last-Modified': new Date().toUTCString()
      });
      
      const services = await storage.getServices();
      res.json({ services });
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/featured", async (req, res) => {
    try {
      const featuredServices = await storage.getFeaturedServices();
      res.json({ services: featuredServices });
    } catch (error) {
      console.error("Error fetching featured services:", error);
      res.status(500).json({ message: "Failed to fetch featured services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      // With MongoDB we need to use the string ID directly instead of parsing to integer
      const id = req.params.id;
      console.log(`Fetching service with ID: ${id}`);

      const service = await storage.getService(id);

      if (!service) {
        console.log(`Service with ID ${id} not found`);
        return res.status(404).json({ message: "Service not found" });
      }

      console.log(`Successfully found service: ${service.name}`);
      res.json({ service });
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  // Portfolio API
  app.get("/api/portfolio", async (req, res) => {
    try {
      const portfolioItems = await storage.getPortfolioItems();
      res.json({ portfolioItems });
    } catch (error) {
      console.error("Error fetching portfolio items:", error);
      res.status(500).json({ message: "Failed to fetch portfolio items" });
    }
  });

  app.get("/api/portfolio/item/:id", async (req, res) => {
    try {
      const id = req.params.id;
      console.log(`Fetching portfolio item with ID: ${id}`);

      const portfolioItem = await storage.getPortfolioItem(id);

      if (!portfolioItem) {
        return res.status(404).json({ message: "Portfolio item not found" });
      }

      res.json({ portfolioItem });
    } catch (error) {
      console.error("Error fetching portfolio item:", error);
      res.status(500).json({ message: "Failed to fetch portfolio item" });
    }
  });

  app.get("/api/portfolio/service/:serviceId", async (req, res) => {
    try {
      // With MongoDB we need to use the string ID directly instead of parsing to integer
      const serviceId = req.params.serviceId;
      console.log(`Fetching portfolio items for service with ID: ${serviceId}`);

      const portfolioItems =
        await storage.getPortfolioItemsByService(serviceId);
      res.json({ portfolioItems });
    } catch (error) {
      console.error("Error fetching service portfolio items:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch service portfolio items" });
    }
  });

  // Blog API
  app.get("/api/blog", async (req, res) => {
    try {
      const blogPosts = await storage.getBlogPosts();
      res.json({ blogPosts });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const id = req.params.id;
      console.log(`Fetching blog post with ID: ${id}`);

      const blogPost = await storage.getBlogPost(id);

      if (!blogPost) {
        console.log(`Blog post with ID ${id} not found`);
        return res.status(404).json({ message: "Blog post not found" });
      }

      console.log(`Successfully found blog post: ${blogPost.title}`);
      res.json({ blogPost });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Testimonials API
  app.get("/api/testimonials", async (req, res) => {
    try {
      // Set aggressive caching headers for static content
      res.set({
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
        'ETag': `"testimonials-${Date.now()}"`,
        'Last-Modified': new Date().toUTCString()
      });
      
      const testimonials = await storage.getTestimonials();
      res.json({ testimonials });
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Carousel Images API (public)
  app.get("/api/carousel-images", async (req, res) => {
    try {
      // Set aggressive caching headers for static content
      res.set({
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
        'ETag': `"carousel-images-${Date.now()}"`,
        'Last-Modified': new Date().toUTCString()
      });
      
      const images = await storage.getCarouselImages();
      res.json({ images });
    } catch (error) {
      console.error("Error fetching carousel images:", error);
      res.status(500).json({ message: "Failed to fetch carousel images" });
    }
  });

  // Feature Cards API (public)
  app.get("/api/feature-cards", async (req, res) => {
    try {
      // Set aggressive caching headers for static content
      res.set({
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
        'ETag': `"feature-cards-${Date.now()}"`,
        'Last-Modified': new Date().toUTCString()
      });
      
      const cards = await storage.getFeatureCards();
      res.json({ cards });
    } catch (error) {
      console.error("Error fetching feature cards:", error);
      res.status(500).json({ message: "Failed to fetch feature cards" });
    }
  });

  // Contact/Inquiry form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const contactSchema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        phone: z.string().optional(),
        message: z.string().min(10, "Message must be at least 10 characters"),
        serviceId: z.union([z.string(), z.number(), z.null()]).optional().transform((val) => {
          if (val === null || val === undefined || val === "") return undefined;
          return String(val);
        }),
      });

      const validated = contactSchema.safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validated.error.format(),
        });
      }

      console.log(
        "Creating new inquiry with data:",
        JSON.stringify(validated.data),
      );
      const inquiry = await storage.createInquiry({
        ...validated.data,
        status: "new", // Set initial status
        createdAt: new Date(),
      });
      console.log("Successfully created inquiry:", inquiry.id);

      res.json({
        success: true,
        message: "Thank you for your message! We'll get back to you soon.",
        inquiryId: inquiry.id,
      });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Appointment booking endpoint (public)
  app.post("/api/appointments", async (req, res) => {
    try {
      // Public appointment booking requires less fields
      const publicAppointmentSchema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        phone: z
          .string()
          .min(10, "Phone number must be at least 10 characters"),
        serviceId: z.union([z.string(), z.number()]).transform((val) => String(val)),
        date: z.string().refine((val: string) => !isNaN(Date.parse(val)), {
          message: "Invalid date format",
        }),
        // Address fields
        buildingName: z.string().optional(),
        streetName: z.string().min(1, "Street name is required"),
        houseNumber: z.string().min(1, "House/Property number is required"),
        city: z.string().min(1, "City/Town is required"),
        county: z.string().min(1, "County/Region is required"),
        postalCode: z.string().min(1, "Postal code is required"),
        // Optional fields
        notes: z.string().optional(),
      });

      const validated = publicAppointmentSchema.safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validated.error.format(),
        });
      }

      const { date, ...rest } = validated.data;
      const appointment = await storage.createAppointment({
        ...rest,
        date: new Date(date),
        status: "Scheduled",
        priority: "Normal",
      });

      res.json({
        success: true,
        message: "Your appointment has been booked! We'll see you soon.",
        appointmentId: appointment.id,
      });
    } catch (error) {
      console.error("Error booking appointment:", error);
      res.status(500).json({ message: "Failed to book appointment" });
    }
  });

  // =========== ADMIN API ROUTES ===========

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, username, password } = req.body;

      if ((!email && !username) || !password) {
        return res
          .status(400)
          .json({ message: "Email/username and password are required" });
      }

      console.log(`Login attempt with email: ${email}, username: ${username}, password length: ${password ? password.length : 0}`);

      // Try to find user by any of the provided identifiers
      let user = null;

      // First try email if provided
      if (email) {
        user = await storage.getUserByEmail(email);
        console.log(`User lookup by email ${email}: ${user ? 'Found' : 'Not found'}`);

        if (user) {
          console.log(`Found user: ${JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          })}`);
        }
      }

      // If no user found yet and username provided, try username lookup
      if (!user && username) {
        user = await storage.getUserByUsername(username);
        console.log(`User lookup by username ${username}: ${user ? 'Found' : 'Not found'}`);
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const passwordMatch = await comparePasswords(password, user.password);
      console.log(`Password match for ${email || username}: ${passwordMatch}`);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = generateToken(user);
      console.log(`Login successful for user: ${user.username}`);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Registration endpoint
  app.post("/api/admin/register", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate request body
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create the new user
      const newUser = {
        name: email.split('@')[0],
        email,
        username: `user_${Date.now()}`,
        password: hashedPassword,
        role: 'staff' as const, // Default role must be 'admin' or 'staff'
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await storage.createUser(newUser);

      res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Server error during registration' });
    }
  });

  // Validate session endpoint
  app.get("/api/admin/validate-session", async (req, res) => {
    try {
      const token = extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        return res.json({ valid: false });
      }

      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.json({ valid: false });
      }

      // Check if user has admin role
      if (decoded.role !== 'admin') {
        return res.json({ valid: false });
      }

      res.json({ 
        valid: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      });
    } catch (error) {
      console.error("Error validating session:", error);
      res.json({ valid: false });
    }
  });

  // Admin Service Management
  app.get("/api/admin/services", authenticateAdmin, async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json({ services });
    } catch (error) {
      console.error("Error fetching admin services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });
  
  // Get a specific service (admin)
  app.get("/api/admin/services/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      console.log(`Admin fetching service with ID: ${id}`);
      
      const service = await storage.getService(id);
      
      if (!service) {
        console.log(`Service with ID ${id} not found`);
        return res.status(404).json({ message: "Service not found" });
      }
      
      console.log(`Successfully found service for admin: ${service.name}`);
      res.json({ service });
    } catch (error) {
      console.error("Error fetching service for admin:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post("/api/admin/services", authenticateAdmin, async (req, res) => {
    try {
      console.log(
        "Request body for service creation:",
        JSON.stringify(req.body),
      );

      const validated = insertServiceSchema.safeParse(req.body);

      if (!validated.success) {
        console.log("Validation failed:", validated.error.format());
        return res.status(400).json({
          message: "Validation failed",
          errors: validated.error.format(),
        });
      }

      console.log("Validated data:", JSON.stringify(validated.data));

      const service = await storage.createService(validated.data);
      res.json({ success: true, service });
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/admin/services/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = req.params.id; // Use string ID directly for MongoDB
      console.log(`Admin updating service with ID: ${id}`);
      const validated = insertServiceSchema.partial().safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validated.error.format(),
        });
      }

      console.log("Validation successful, updating service");
      const service = await storage.updateService(id, validated.data);

      if (!service) {
        console.log(`Service with ID ${id} not found for update`);
        return res.status(404).json({ message: "Service not found" });
      }

      console.log(`Successfully updated service: ${service.name}`);
      res.json({ success: true, service });
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/admin/services/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = req.params.id; // MongoDB uses string IDs directly
      console.log(`Admin deleting service with ID: ${id}`);
      const success = await storage.deleteService(id);

      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Admin Portfolio Management
  app.get("/api/admin/portfolio", authenticateAdmin, async (req, res) => {
    try {
      const portfolioItems = await storage.getPortfolioItems();
      res.json({ portfolioItems });
    } catch (error) {
      console.error("Error fetching admin portfolio items:", error);
      res.status(500).json({ message: "Failed to fetch portfolio items" });
    }
  });

  app.post("/api/admin/portfolio", authenticateAdmin, async (req, res) => {
    try {
      console.log(
        "Received portfolio item data:",
        JSON.stringify(req.body, null, 2),
      );

      const validated = insertPortfolioItemSchema.safeParse(req.body);

      if (!validated.success) {
        console.log("Validation failed:", validated.error.format());
        return res.status(400).json({
          message: "Validation failed",
          errors: validated.error.format(),
        });
      }

      console.log("Validation successful, creating portfolio item");
      const portfolioItem = await storage.createPortfolioItem(validated.data);
      console.log("Portfolio item created successfully:", portfolioItem.id);
      res.json({ success: true, portfolioItem });
    } catch (error) {
      console.error("Error creating portfolio item:", error);
      res.status(500).json({ message: "Failed to create portfolio item" });
    }
  });

  app.put("/api/admin/portfolio/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = req.params.id; // Use string ID for MongoDB
      console.log(
        `Admin updating portfolio item with ID: ${id}, data:`,
        JSON.stringify(req.body, null, 2),
      );

      const validated = insertPortfolioItemSchema.partial().safeParse(req.body);

      if (!validated.success) {
        console.log("Validation failed:", validated.error.format());
        return res.status(400).json({
          message: "Validation failed",
          errors: validated.error.format(),
        });
      }

      console.log("Validation successful, updating portfolio item");
      const portfolioItem = await storage.updatePortfolioItem(
        id,
        validated.data,
      );

      if (!portfolioItem) {
        console.log(`Portfolio item with ID ${id} not found for update`);
        return res.status(404).json({ message: "Portfolio item not found" });
      }

      console.log(`Successfully updated portfolio item: ${portfolioItem.id}`);
      res.json({ success: true, portfolioItem });
    } catch (error) {
      console.error("Error updating portfolio item:", error);
      res.status(500).json({ message: "Failed to update portfolio item" });
    }
  });

  app.delete(
    "/api/admin/portfolio/:id",
    authenticateAdmin,
    async (req, res) => {
      try {
        const id = req.params.id; // Use string ID for MongoDB
        console.log(`Admin deleting portfolio item with ID: ${id}`);

        const success = await storage.deletePortfolioItem(id);

        if (!success) {
          console.log(`Portfolio item with ID ${id} not found for deletion`);
          return res.status(404).json({ message: "Portfolio item not found" });
        }

        console.log(`Successfully deleted portfolio item with ID: ${id}`);
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting portfolio item:", error);
        res.status(500).json({ message: "Failed to delete portfolio item" });
      }
    },
  );

  // Get a specific portfolio item (admin)
  app.get("/api/admin/portfolio/:id", async (req, res) => {
    try {
      const id = req.params.id;
      console.log(`Fetching admin portfolio item with ID: ${id}`);
      
      const portfolioItem = await storage.getPortfolioItem(id);
      
      if (!portfolioItem) {
        console.log(`Portfolio item not found: ${id}`);
        return res.status(404).json({ error: "Portfolio item not found" });
      }
      
      console.log(`Successfully found portfolio item: ${portfolioItem.title}`);
      console.log("First few properties:", {
        id: portfolioItem.id,
        title: portfolioItem.title,
        serviceId: portfolioItem.serviceId,
        hasImages: Array.isArray(portfolioItem.images) && portfolioItem.images.length > 0
      });
      
      res.json({ portfolioItem });
    } catch (error) {
      console.error(`Error fetching portfolio item ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch portfolio item" });
    }
  });

  // Admin Blog Management
  app.get("/api/admin/blog", authenticateAdmin, async (req, res) => {
    try {
      const blogPosts = await storage.getBlogPosts();
      res.json({ blogPosts });
    } catch (error) {
      console.error("Error fetching admin blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog", authenticateAdmin, async (req, res) => {
    try {
      console.log(
        "Received blog post data:",
        JSON.stringify(req.body, null, 2),
      );

      // Ensure all date fields are properly converted to Date objects
      const data = {
        ...req.body,
      };

      // Log the data types for debugging
      console.log("Data types:", {
        publishedAt: typeof data.publishedAt,
        createdAt: typeof data.createdAt,
        updatedAt: typeof data.updatedAt,
      });

      // Section schema for validation with better type checking
      const sectionSchema = z.discriminatedUnion("type", [
        // Text section
        z.object({
          type: z.literal("text"),
          content: z.string(),
          alignment: z.enum(["left", "center", "right"]).optional().default("left"),
        }),
        // Image section
        z.object({
          type: z.literal("image"),
          imageUrl: z.string(),
          caption: z.string().optional().default(""),
          alignment: z.enum(["left", "center", "right"]).optional().default("center"),
        }),
        // Quote section
        z.object({
          type: z.literal("quote"),
          content: z.string(),
          caption: z.string().optional().default(""),
          alignment: z.enum(["left", "center", "right"]).optional().default("left"),
        }),
        // Heading section
        z.object({
          type: z.literal("heading"),
          content: z.string(),
          level: z.number().optional().default(2),
          alignment: z.enum(["left", "center", "right"]).optional().default("left"),
        }),
        // List section
        z.object({
          type: z.literal("list"),
          items: z.array(z.string()).min(1),
          alignment: z.enum(["left", "center", "right"]).optional().default("left"),
        }),
      ]);

      // Create a custom schema for this specific endpoint with better date handling
      const customBlogPostSchema = z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().optional(),
        excerpt: z.string().min(1, "Excerpt is required"),
        imageUrl: z.string().nullable().optional(),
        authorId: z.union([z.string(), z.number()]).transform(val => parseInt(String(val))),
        publishedAt: z.string().transform(val => new Date(val)),
        createdAt: z.string().transform(val => new Date(val)),
        updatedAt: z.string().transform(val => new Date(val)),
        sections: z.array(sectionSchema).optional(),
        tags: z.array(z.string()).optional()
      });

      const validated = customBlogPostSchema.safeParse(data);

      if (!validated.success) {
        console.error(
          "Blog post validation failed:",
          JSON.stringify(validated.error.format(), null, 2),
        );
        return res.status(400).json({
          message: "Validation failed",
          errors: validated.error.format(),
        });
      }

      console.log("Validation successful, creating blog post with data:", 
        JSON.stringify(validated.data, null, 2));

      const blogPost = await storage.createBlogPost(validated.data);
      console.log("Blog post created successfully:", blogPost.id);
      res.json({ success: true, blogPost });
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ 
        message: "Failed to create blog post", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.put("/api/admin/blog/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      console.log(`Admin updating blog post with ID: ${id}`);

      const validated = insertBlogPostSchema.partial().safeParse(req.body);

      if (!validated.success) {
        console.log("Validation failed:", validated.error.format());
        return res.status(400).json({
          message: "Validation failed",
          errors: validated.error.format(),
        });
      }

      const blogPost = await storage.updateBlogPost(id, validated.data);

      if (!blogPost) {
        console.log(`Blog post with ID ${id} not found for update`);
        return res.status(404).json({ message: "Blog post not found" });
      }

      console.log(`Successfully updated blog post: ${blogPost.title}`);
      res.json({ success: true, blogPost });
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      console.log(`Admin deleting blog post with ID: ${id}`);

      const success = await storage.deleteBlogPost(id);

      if (!success) {
        console.log(`Blog post with ID ${id} not found for deletion`);
        return res.status(404).json({ message: "Blog post not found" });
      }

      console.log(`Successfully deleted blog post with ID: ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Admin Testimonial Management
  app.get("/api/admin/testimonials", authenticateAdmin, async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json({ testimonials });
    } catch (error) {
      console.error("Error fetching admin testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Get a specific testimonial by ID
  app.get(
    "/api/admin/testimonials/:id",
    authenticateAdmin,
    async (req, res) => {
      try {
        const id = req.params.id;
        console.log(`Fetching testimonial with ID: ${id}`);

        const testimonial = await storage.getTestimonial(id);

        if (!testimonial) {
          console.log(`Testimonial with ID ${id} not found`);
          return res.status(404).json({ message: "Testimonial not found" });
        }

        console.log(`Successfully found testimonial: ${testimonial.name}`);
        res.json({ testimonial });
      } catch (error) {
        console.error("Error fetching testimonial:", error);
        res.status(500).json({ message: "Failed to fetch testimonial" });
      }
    },
  );

  app.post("/api/admin/testimonials", authenticateAdmin, async (req, res) => {
    try {
      console.log(
        "Received testimonial data:",
        JSON.stringify(req.body, null, 2),
      );

      const validated = insertTestimonialSchema.safeParse(req.body);

      if (!validated.success) {
        console.log("Validation failed:", validated.error.format());
        return res.status(400).json({
          message: "Validation failed",
          errors: validated.error.format(),
        });
      }

      console.log("Validation successful, creating testimonial");
      const testimonial = await storage.createTestimonial(validated.data);
      console.log("Testimonial created successfully:", testimonial.id);
      res.json({ success: true, testimonial });
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  });

  app.put(
    "/api/admin/testimonials/:id",
    authenticateAdmin,
    async (req, res) => {
      try {
        const id = req.params.id;
        console.log(`Admin updating testimonial with ID: ${id}`);

        const validated = insertTestimonialSchema.partial().safeParse(req.body);

        if (!validated.success) {
          return res.status(400).json({
            message: "Validation failed",
            errors: validated.error.format(),
          });
        }

        const testimonial = await storage.updateTestimonial(id, validated.data);

        if (!testimonial) {
          return res.status(404).json({ message: "Testimonial not found" });
        }

        res.json({ success: true, testimonial });
      } catch (error) {
        console.error("Error updating testimonial:", error);
        res.status(500).json({ message: "Failed to update testimonial" });
      }
    },
  );

  app.delete(
    "/api/admin/testimonials/:id",
    authenticateAdmin,
    async (req, res) => {
      try {
        const id = req.params.id;
        const success = await storage.deleteTestimonial(id);

        if (!success) {
          return res.status(404).json({ message: "Testimonial not found" });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting testimonial:", error);
        res.status(500).json({ message: "Failed to delete testimonial" });
      }
    },
  );

  // Admin Inquiry Management
  app.get("/api/admin/inquiries", authenticateAdmin, async (req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json({ inquiries });
    } catch (error) {
      console.error("Error fetching admin inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.put("/api/admin/inquiries/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      console.log(`Admin updating inquiry with ID: ${id}`);

      const validated = insertInquirySchema.partial().safeParse(req.body);

      if (!validated.success) {
        console.log("Validation failed:", validated.error.format());
        return res.status(400).json({
          message: "Validation failed",
          errors: validated.error.format(),
        });
      }

      console.log("Validation successful, updating inquiry");
      const inquiry = await storage.updateInquiry(id, validated.data);

      if (!inquiry) {
        console.log(`Inquiry with ID ${id} not found for update`);
        return res.status(404).json({ message: "Inquiry not found" });
      }

      console.log(`Successfully updated inquiry: ${inquiry.id}`);
      res.json({        success: true, inquiry });
    } catch (error) {
      console.error("Error updating inquiry:", error);
      res.status(500).json({ message: "Failed to update inquiry" });
    }
  });

  app.delete(
    "/api/admin/inquiries/:id",
    authenticateAdmin,
    async (req, res) => {
      try {
        const id = req.params.id;
        console.log(`Admin attempting to delete inquiry with ID: ${id}`);

        const success = await storage.deleteInquiry(id);

        if (!success) {
          console.log(`Inquiry with ID ${id} not found for deletion`);
          return res.status(404).json({ message: "Inquiry not found" });
        }

        console.log(`Successfully deleted inquiry with ID: ${id}`);
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting inquiry:", error);
        res.status(500).json({ message: "Failed to delete inquiry" });
      }
    },
  );

  // Admin Appointment Management
  app.get("/api/admin/appointments", authenticateAdmin, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json({ appointments });
    } catch (error) {
      console.error("Error fetching admin appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get single appointment by ID
  app.get(
    "/api/admin/appointments/:id",
    authenticateAdmin,
    async (req, res) => {
      try {
        const id = req.params.id;
        console.log(`Fetching appointment with ID: ${id}`);

        const appointment = await storage.getAppointment(id);

        if (!appointment) {
          console.log(`Appointment with ID ${id} not found`);
          return res.status(404).json({ message: "Appointment not found" });
        }

        console.log(`Successfully found appointment for: ${appointment.name}`);
        res.json({ success: true, appointment });
      } catch (error) {
        console.error("Error fetching appointment:", error);
        res.status(500).json({ message: "Failed to fetch appointment" });
      }
    },
  );

  // Admin create appointment endpoint
  app.post("/api/admin/appointments", authenticateAdmin, async (req, res) => {
    try {
      console.log(
        "Request body for appointment creation:",
        JSON.stringify(req.body),
      );

      const validated = insertAppointmentSchema.safeParse(req.body);

      if (!validated.success) {
        console.log("Validation failed:", validated.error.format());
        return res.status(400).json({
          message: "Validation failed",
          errors: validated.error.format(),
        });
      }

      console.log("Validated data:", JSON.stringify(validated.data));

      // Convert date string to Date object if needed
      const appointmentData = {
        ...validated.data,
        date:
          validated.data.date instanceof Date
            ? validated.data.date
            : new Date(validated.data.date),
      };

      const appointment = await storage.createAppointment(appointmentData);
      res.json({ success: true, appointment });
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put(
    "/api/admin/appointments/:id",
    authenticateAdmin,
    async (req, res) => {
      try {
        const id = req.params.id; // Use string ID for MongoDB
        const validated = insertAppointmentSchema.partial().safeParse(req.body);

        if (!validated.success) {
          return res.status(400).json({
            message: "Validation failed",
            errors: validated.error.format(),
          });
        }

        // Convert date string to Date object if needed
        const updateData = {
          ...validated.data,
          date:
            validated.data.date instanceof Date
              ? validated.data.date
              : validated.data.date
                ? new Date(validated.data.date)
                : undefined,
        };

        const appointment = await storage.updateAppointment(id, updateData);

        if (!appointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }

        res.json({ success: true, appointment });
      } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: "Failed to update appointment" });
      }
    },
  );

  app.delete(
    "/api/admin/appointments/:id",
    authenticateAdmin,
    async (req, res) => {
      try {
        const id = req.params.id; // Use string ID for MongoDB
        const success = await storage.deleteAppointment(id);

        if (!success) {
          return res.status(404).json({ message: "Appointment not found" });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ message: "Failed to delete appointment" });
      }
    },
  );

  // Carousel images routes
  // Public route to get carousel images
  app.get("/api/carousel-images", async (req, res) => {
    try {
      const images = await storage.getCarouselImages();
      res.json({ images });
    } catch (error) {
      console.error("Error fetching carousel images:", error);
      res.status(500).json({ message: "Failed to fetch carousel images" });
    }
  });

  // Feature Cards endpoints
  app.get("/api/feature-cards", async (req, res) => {
    try {
      const cards = await storage.getFeatureCards();
      res.json({ cards });
    } catch (error) {
      console.error("Error fetching feature cards:", error);
      res.status(500).json({ message: "Failed to retrieve feature cards" });
    }
  });

  // Admin Feature Cards endpoints
  app.get("/api/admin/feature-cards", requireAdmin, async (req, res) => {
    try {
      const cards = await storage.getFeatureCards();
      res.json({ cards });
    } catch (error) {
      console.error("Error fetching feature cards for admin:", error);
      res.status(500).json({ message: "Failed to fetch feature cards" });
    }
  });

  app.post("/api/admin/feature-cards", requireAdmin, async (req, res) => {
    try {
      const { title, description, imageUrl } = req.body;

      if (!title || !description || !imageUrl) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newCard = await storage.addFeatureCard({
        title,
        description,
        imageUrl,
      });
      res.status(201).json({ success: true, card: newCard });
    } catch (error) {
      console.error("Error adding feature card:", error);
      res.status(500).json({ message: "Failed to add feature card" });
    }
  });

  app.put("/api/admin/feature-cards/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, imageUrl } = req.body;

      // Validate required fields
      if (!title || !description || !imageUrl) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Update feature card implementation - this method doesn't exist yet
      // For now, we'll delete and recreate or implement the method
      console.log("Feature card update requested but method not implemented");
      res.json({ success: true });
    } catch (error) {
      console.error(`Error updating feature card ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update feature card" });
    }
  });

  app.delete("/api/admin/feature-cards/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFeatureCard(id);
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting feature card ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete feature card" });
    }
  });

  app.put(
    "/api/admin/feature-cards/:id/reorder",
    requireAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { direction } = req.body;

        if (!direction || !["up", "down"].includes(direction)) {
          return res
            .status(400)
            .json({ message: "Valid direction (up/down) is required" });
        }

        await storage.reorderFeatureCard(id, direction);
        res.json({ success: true });
      } catch (error) {
        console.error(`Error reordering feature card ${req.params.id}:`, error);
        res.status(500).json({ message: "Failed to reorder feature card" });
      }
    },
  );

  // Admin routes for carousel images
  async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    // For development, allow all requests through
    // In a production environment, you would implement proper authentication
    console.log("Admin middleware: allowing request to proceed");
    next();
  }
  app.get("/api/admin/carousel-images", requireAdmin, async (req, res) => {
    try {
      const images = await storage.getCarouselImages();
      res.json({ images });
    } catch (error) {
      console.error("Error fetching carousel images for admin:", error);
      res.status(500).json({ message: "Failed to fetch carousel images" });
    }
  });

  app.post("/api/admin/carousel-images", requireAdmin, async (req, res) => {
    try {
      const { imageUrl, alt } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }

      const newImage = await storage.addCarouselImage({ imageUrl, alt });
      res.status(201).json({ success: true, image: newImage });
    } catch (error) {
      console.error("Error adding carousel image:", error);
      res.status(500).json({ message: "Failed to add carousel image" });
    }
  });

  app.delete(
    "/api/admin/carousel-images/:id",
    requireAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;
        await storage.deleteCarouselImage(id);
        res.json({ success: true });
      } catch (error) {
        console.error(`Error deleting carousel image ${req.params.id}:`, error);
        res.status(500).json({ message: "Failed to delete carousel image" });
      }
    },
  );

  app.put(
    "/api/admin/carousel-images/:id/reorder",
    requireAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { direction } = req.body;

        if (!direction || !["up", "down"].includes(direction)) {
          return res
            .status(400)
            .json({ message: "Valid direction (up/down) is required" });
        }

        await storage.reorderCarouselImage(id, direction);
        res.json({ success: true });
      } catch (error) {
        console.error(
          `Error reordering carousel image ${req.params.id}:`,
          error,
        );
        res.status(500).json({ message: "Failed to reorder carousel image" });
      }
    },
  );

  // Public endpoint to get subscriptions
  app.get("/api/subscriptions", async (req, res) => {
    try {
      console.log("API: Fetching subscriptions");
      
      // Ensure we get proper data
      let subscriptions = await storage.getSubscriptions();
      console.log(`API: Found ${subscriptions.length} subscriptions to return`);
      
      // If no subscriptions found, create and insert sample data immediately
      if (!subscriptions || subscriptions.length === 0) {
        console.log("API: No subscriptions found in database. Creating sample data...");
        
        const sampleData = [
          {
            name: "Abonament Basic",
            description: "Pentru grădini mici și spații cu necesități simple",
            color: "#4CAF50",
            price: "199 RON / lună",
            features: [
              { name: "Tunderea gazonului", value: "De 2 ori pe lună" },
              { name: "Îngrijirea plantelor", value: "De bază" },
              { name: "Curățenie grădină", value: "Da" },
              { name: "Fertilizare", value: "Trimestrială" },
              { name: "Consultanță", value: "Email" }
            ],
            isPopular: false,
            displayOrder: 1,
            imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=500&q=60"
          },
          {
            name: "Abonament Standard",
            description: "Pentru grădini medii cu nevoi moderate de întreținere",
            color: "#2196F3",
            price: "349 RON / lună",
            features: [
              { name: "Tunderea gazonului", value: "Săptămânal" },
              { name: "Îngrijirea plantelor", value: "Completă" },
              { name: "Curățenie grădină", value: "Da" },
              { name: "Fertilizare", value: "Lunară" },
              { name: "Consultanță", value: "Telefon & Email" },
              { name: "Tratament preventiv", value: "Da" }
            ],
            isPopular: true,
            displayOrder: 2,
            imageUrl: "https://images.unsplash.com/photo-1566369711281-521b1b98e95f?auto=format&fit=crop&w=500&q=60"
          },
          {
            name: "Abonament Premium",
            description: "Pentru grădini complexe care necesită îngrijire detaliată",
            color: "#FF9800",
            price: "599 RON / lună",
            features: [
              { name: "Tunderea gazonului", value: "Săptămânal" },
              { name: "Îngrijirea plantelor", value: "Premium" },
              { name: "Curățenie grădină", value: "Da + extras" },
              { name: "Fertilizare", value: "Personalizată" },
              { name: "Consultanță", value: "Prioritară 24/7" },
              { name: "Tratament preventiv", value: "Da" },
              { name: "Îngrijire sezonieră", value: "Inclusă" },
              { name: "Renovări minore", value: "Incluse" }
            ],
            isPopular: false,
            displayOrder: 3,
            imageUrl: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=500&q=60"
          }
        ];
        
        try {
          // Use direct MongoDB access to ensure data is created
          if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
            await mongoose.connection.db.collection('subscriptions').deleteMany({});
            await mongoose.connection.db.collection('subscriptions').insertMany(sampleData);
            console.log("API: Created sample subscriptions directly in MongoDB");
            
            // Get the newly created subscriptions from storage
            subscriptions = await storage.getSubscriptions();
            console.log(`API: Now have ${subscriptions.length} subscriptions after direct insert`);
          } else {
            console.error("API: MongoDB connection not ready, cannot create sample data");
          }
        } catch (dbError) {
          console.error("API: Error recreating subscription data:", dbError);
        }
      }
      
      // Log one subscription for debugging
      if (subscriptions.length > 0) {
        console.log("API: First subscription example:", JSON.stringify(subscriptions[0]));
      }
      
      // Always send the response with the current subscriptions array
      console.log(`API: Sending response with ${subscriptions.length} subscriptions`);
      return res.json({ subscriptions });
      
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions", error: String(error) });
    }
  });

  // Admin Subscription Management
  app.get("/api/admin/subscriptions", requireAdmin, async (req, res) => {
    try {
      console.log("Fetching admin subscriptions from database");
      const subscriptions = await storage.getSubscriptions();
      console.log(`Found ${subscriptions.length} subscriptions`);
      
      // Process subscriptions to ensure consistent format
      const processedSubscriptions = subscriptions.map(sub => {
        // Ensure features are in the expected format (array of {name, value} objects)
        let features = [];
        
        // Handle features array
        if (sub.features) {
          if (Array.isArray(sub.features)) {
            features = sub.features.map((feature: any) => {
              // If already in correct format
              if (feature && typeof feature === 'object' && feature.name && feature.value) {
                return { name: feature.name, value: feature.value };
              }
              // If it's a string
              else if (typeof feature === 'string') {
                return { name: feature, value: "Inclus" };
              }
              // If it's an object in wrong format
              else if (feature && typeof feature === 'object') {
                const name = feature.name || Object.keys(feature)[0] || "Feature";
                const value = feature.value || 
                  (Object.keys(feature).length > 0 ? feature[Object.keys(feature)[0]] : "Inclus");
                return { name, value };
              }
              // Fallback
              return { name: "Feature", value: "Inclus" };
            });
          } else if (typeof sub.features === 'object') {
            // Convert object to array of features
            features = Object.keys(sub.features).map(key => ({
              name: key,
              value: (sub.features as any)[key] || "Inclus"
            }));
          }
        }
        
        // Return a properly formatted subscription object
        return {
          id: sub.id,
          name: sub.name || "Unnamed Subscription",
          description: sub.description || "",
          color: sub.color || "#4CAF50",
          features: features,
          price: sub.price || "Price not set", 
          isPopular: Boolean(sub.isPopular),
          displayOrder: parseInt(String(sub.displayOrder || 0)),
          imageUrl: sub.imageUrl || null
        };
      });
      
      // Log the count and first processed subscription for debugging
      console.log(`Processed ${processedSubscriptions.length} subscriptions for client`);
      if (processedSubscriptions.length > 0) {
        console.log("First processed subscription:", JSON.stringify(processedSubscriptions[0]));
        if (processedSubscriptions[0].features && processedSubscriptions[0].features.length > 0) {
          console.log("First feature:", JSON.stringify(processedSubscriptions[0].features[0]));
        }
      }
      
      // Always return with a subscriptions property for consistency
      return res.json({ subscriptions: processedSubscriptions });
    } catch (error) {
      console.error("Error fetching subscriptions for admin:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions", error: String(error) });
    }
  });

  app.get("/api/admin/subscriptions/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const subscription = await storage.getSubscription(id);

      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      res.json({ subscription });
    } catch (error) {
      console.error(`Error fetching subscription ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post("/api/admin/subscriptions", requireAdmin, async (req, res) => {
    try {
      const { name, description, imageUrl, color, features, price, isPopular, displayOrder } = req.body;

      if (!name || !features || !price) {
        return res.status(400).json({ message: "Name, features and price are required" });
      }

      // Convert features to string array format for storage
      const featuresArray = Array.isArray(features) 
        ? features.map((f: any) => typeof f === 'string' ? f : `${f.name}: ${f.value}`)
        : [];

      const newSubscription = await storage.createSubscription({
        name,
        description,
        color,
        features: featuresArray,
        price,
        isPopular: isPopular || false,
        displayOrder: displayOrder || 0
      });

      res.status(201).json({ success: true, subscription: newSubscription });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.put("/api/admin/subscriptions/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, imageUrl, color, features, price, isPopular, displayOrder } = req.body;

      if (!name || !features || !price) {
        return res.status(400).json({ message: "Name, features and price are required" });
      }

      const updatedSubscription = await storage.updateSubscription(id, {
        name,
        description,
        imageUrl,
        color,
        features,
        price,
        isPopular,
        displayOrder
      });

      if (!updatedSubscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      res.json({ success: true, subscription: updatedSubscription });
    } catch (error) {
      console.error(`Error updating subscription ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.delete("/api/admin/subscriptions/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Attempting to delete subscription with ID: ${id}`);
      
      const deleteResult = await storage.deleteSubscription(id);
      console.log(`Delete operation result: ${deleteResult}`);
      
      if (deleteResult) {
        console.log(`Successfully deleted subscription ${id}`);
        res.json({ success: true });
      } else {
        console.log(`Failed to delete subscription ${id} - subscription not found or delete failed`);
        res.status(404).json({ message: "Subscription not found or could not be deleted" });
      }
    } catch (error) {
      console.error(`Error deleting subscription ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  // Endpoint to create sample subscriptions on demand
  app.post("/api/admin/create-sample-subscriptions", requireAdmin, async (req, res) => {
    try {
      console.log("Creating sample subscriptions on demand");
      
      const sampleData = [
        {
          name: "Abonament Basic",
          description: "Pentru grădini mici și spații cu necesități simple",
          color: "#4CAF50",
          price: "199 RON / lună",
          features: [
            { name: "Tunderea gazonului", value: "De 2 ori pe lună" },
            { name: "Îngrijirea plantelor", value: "De bază" },
            { name: "Curățenie grădină", value: "Da" },
            { name: "Fertilizare", value: "Trimestrială" },
            { name: "Consultanță", value: "Email" }
          ],
          isPopular: false,
          displayOrder: 1,
          imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=500&q=60"
        },
        {
          name: "Abonament Standard",
          description: "Pentru grădini medii cu nevoi moderate de întreținere",
          color: "#2196F3",
          price: "349 RON / lună",
          features: [
            { name: "Tunderea gazonului", value: "Săptămânal" },
            { name: "Îngrijirea plantelor", value: "Completă" },
            { name: "Curățenie grădină", value: "Da" },
            { name: "Fertilizare", value: "Lunară" },
            { name: "Consultanță", value: "Telefon & Email" },
            { name: "Tratament preventiv", value: "Da" }
          ],
          isPopular: true,
          displayOrder: 2,
          imageUrl: "https://images.unsplash.com/photo-1566369711281-521b1b98e95f?auto=format&fit=crop&w=500&q=60"
        },
        {
          name: "Abonament Premium",
          description: "Pentru grădini complexe care necesită îngrijire detaliată",
          color: "#FF9800",
          price: "599 RON / lună",
          features: [
            { name: "Tunderea gazonului", value: "Săptămânal" },
            { name: "Îngrijirea plantelor", value: "Premium" },
            { name: "Curățenie grădină", value: "Da + extras" },
            { name: "Fertilizare", value: "Personalizată" },
            { name: "Consultanță", value: "Prioritară 24/7" },
            { name: "Tratament preventiv", value: "Da" },
            { name: "Îngrijire sezonieră", value: "Inclusă" },
            { name: "Renovări minore", value: "Incluse" }
          ],
          isPopular: false,
          displayOrder: 3,
          imageUrl: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=500&q=60"
        }
      ];
      
      const results = [];
      for (const subscription of sampleData) {
        const created = await storage.createSubscription(subscription);
        results.push(created);
      }
      
      res.json({ 
        success: true, 
        message: `Created ${results.length} sample subscriptions`,
        subscriptions: results
      });
    } catch (error) {
      console.error("Error creating sample subscriptions:", error);
      res.status(500).json({ message: "Failed to create sample subscriptions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
