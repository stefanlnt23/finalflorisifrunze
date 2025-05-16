import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { comparePasswords } from "./auth";
import { z } from "zod";
import {
  insertServiceSchema,
  insertPortfolioItemSchema,
  insertBlogPostSchema,
  insertInquirySchema,
  insertAppointmentSchema,
  insertTestimonialSchema,
} from "@shared/schema";

// Authentication middleware
function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  // For simplicity, we're not implementing real auth in this example
  // In a real application, you'd check session/token validity here
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API Status route
  app.get("/api/status", (req, res) => {
    res.json({
      status: "ok",
      message: "Green Garden Services API is running!",
    });
  });

  // =========== PUBLIC API ROUTES ===========

  // Services API
  app.get("/api/services", async (req, res) => {
    try {
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
        return res.status(404).json({ message: "Service not found" });
      }

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
      const testimonials = await storage.getTestimonials();
      res.json({ testimonials });
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
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
        serviceId: z.string().optional(), // Changed to string for MongoDB IDs
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
        serviceId: z.union([z.string(), z.number()]),
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
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordsMatch = await comparePasswords(password, user.password);
      if (!passwordsMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      // In a real app you would create a session or JWT token here
      res.json({
        success: true,
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
      const id = parseInt(req.params.id);
      const validated = insertServiceSchema.partial().safeParse(req.body);

      if (!validated.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validated.error.format(),
        });
      }

      const service = await storage.updateService(id, validated.data);

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

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
      console.log(`Fetching admin portfolio item with ID: ${req.params.id}`);
      const portfolioItem = await storage.getPortfolioItem(req.params.id);
      if (!portfolioItem) {
        console.log(`Portfolio item not found: ${req.params.id}`);
        return res.status(404).json({ error: "Portfolio item not found" });
      }
      console.log("Returning portfolio item data for admin editing");
      res.json({ portfolioItem });
    } catch (error) {
      console.error("Error fetching portfolio item:", error);
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
        publishedAtIsDate: data.publishedAt instanceof Date,
        createdAtIsDate: data.createdAt instanceof Date,
        updatedAtIsDate: data.updatedAt instanceof Date,
      });

      console.log("Processed blog post data:", JSON.stringify(data, null, 2));

      // Create a custom schema for this specific endpoint
      const customBlogPostSchema = z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().min(1, "Content is required"),
        excerpt: z.string().min(1, "Excerpt is required"),
        imageUrl: z.string().nullable().optional(),
        authorId: z.number().default(1),
        publishedAt: z.string().transform((val) => new Date(val)),
        createdAt: z.string().transform((val) => new Date(val)),
        updatedAt: z.string().transform((val) => new Date(val)),
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

      console.log("Validation successful, creating blog post");
      const blogPost = await storage.createBlogPost(validated.data);
      console.log("Blog post created successfully:", blogPost.id);
      res.json({ success: true, blogPost });
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
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
      res.json({ success: true, inquiry });
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

      // Update feature card implementation
      await storage.updateFeatureCard(id, {
        title,
        description,
        imageUrl,
      });
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
    // Placeholder for admin check
    // In real implementation, check user role from session/token
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

  const httpServer = createServer(app);
  return httpServer;
}
