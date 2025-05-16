import mongoose from 'mongoose';
import { log } from './vite';

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb+srv://stefanlenta:MABCkbbCfNeUOo1M@cluster0.3ibgvtn.mongodb.net/garden_services_db';

// Initialize MongoDB connection
export async function connectToMongoDB() {
  try {
    await mongoose.connect(DATABASE_URL);
    log('Connected to MongoDB', 'mongodb');
    
    // Check if we have any users, if not create a default admin user
    await ensureAdminUser();
    
    return mongoose.connection;
  } catch (error) {
    log(`Error connecting to MongoDB: ${error}`, 'mongodb');
    throw error;
  }
}

// Helper function to ensure we have at least one admin user
async function ensureAdminUser() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      log("No users found, creating default admin user...", "mongodb");
      
      // Import auth for password hashing
      const auth = await import('./auth');
      const hashedPassword = await auth.hashPassword('password123');
      
      // Create admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await adminUser.save();
      log("Default admin user created successfully", "mongodb");
    }
  } catch (error) {
    log(`Error creating admin user: ${error}`, "mongodb");
  }
}

// Create schemas and models for the application
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  shortDesc: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  
  // Legacy field for backward compatibility
  imageUrl: { type: String },
  
  // Before/After images
  images: [{
    before: { type: String, required: true },
    after: { type: String, required: true },
    caption: { type: String },
    richDescription: { type: String },
    order: { type: Number, default: 0 }
  }],
  
  // Project details
  location: { type: String },
  completionDate: { type: Date },
  projectDuration: { type: String },
  difficultyLevel: { type: String, enum: ['Easy', 'Moderate', 'Complex'] },
  
  // Client testimonial
  clientTestimonial: {
    clientName: { type: String },
    comment: { type: String },
    displayPermission: { type: Boolean, default: false }
  },
  
  // Featured status
  featured: { type: Boolean, default: false },
  
  // SEO fields
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    tags: [{ type: String }]
  },
  
  // Status
  status: { type: String, enum: ['Published', 'Draft'], default: 'Draft' },
  
  // Analytics
  viewCount: { type: Number, default: 0 },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  imageUrl: { type: String },
  publishedAt: { type: Date, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true }
});

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  status: { type: String, enum: ['new', 'in-progress', 'resolved', 'archived'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
  // Customer information
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  
  // Address information
  buildingName: { type: String },
  streetName: { type: String, required: true },
  houseNumber: { type: String, required: true },
  city: { type: String, required: true },
  county: { type: String, required: true },
  postalCode: { type: String, required: true },
  
  // Appointment details
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: Date, required: true },
  priority: { type: String, enum: ['Normal', 'Urgent'], default: 'Normal' },
  
  // Admin fields
  notes: { type: String },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'], default: 'Scheduled' },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  imageUrl: { type: String },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models
export const User = mongoose.model('User', userSchema);
export const Service = mongoose.model('Service', serviceSchema);
export const PortfolioItem = mongoose.model('PortfolioItem', portfolioItemSchema);
export const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export const Inquiry = mongoose.model('Inquiry', inquirySchema);
export const Appointment = mongoose.model('Appointment', appointmentSchema);
export const Testimonial = mongoose.model('Testimonial', testimonialSchema);

// Helper functions to convert between MongoDB documents and our schema types
export function mapUserToSchema(user: any): any {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    username: user.username,
    password: user.password,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export function mapServiceToSchema(service: any): any {
  return {
    id: service._id.toString(),
    name: service.name,
    description: service.description,
    shortDesc: service.shortDesc,
    price: service.price,
    imageUrl: service.imageUrl,
    featured: service.isFeatured // Map isFeatured from MongoDB to featured for frontend
  };
}

export function mapPortfolioItemToSchema(item: any): any {
  return {
    id: item._id.toString(),
    title: item.title,
    description: item.description,
    serviceId: item.serviceId ? item.serviceId.toString() : null,
    imageUrl: item.imageUrl,
    images: item.images || [],
    location: item.location,
    completionDate: item.completionDate,
    projectDuration: item.projectDuration,
    difficultyLevel: item.difficultyLevel,
    clientTestimonial: item.clientTestimonial || null,
    featured: item.featured || false,
    seo: item.seo || { metaTitle: '', metaDescription: '', tags: [] },
    status: item.status || 'Draft',
    viewCount: item.viewCount || 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

export function mapBlogPostToSchema(post: any): any {
  return {
    id: post._id.toString(),
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    imageUrl: post.imageUrl,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  };
}

export function mapInquiryToSchema(inquiry: any): any {
  return {
    id: inquiry._id.toString(),
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    message: inquiry.message,
    serviceId: inquiry.serviceId ? inquiry.serviceId.toString() : null,
    status: inquiry.status,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt
  };
}

export function mapAppointmentToSchema(appointment: any): any {
  return {
    id: appointment._id.toString(),
    name: appointment.name,
    email: appointment.email,
    phone: appointment.phone,
    buildingName: appointment.buildingName,
    streetName: appointment.streetName,
    houseNumber: appointment.houseNumber,
    city: appointment.city,
    county: appointment.county,
    postalCode: appointment.postalCode,
    serviceId: appointment.serviceId.toString(),
    date: appointment.date,
    priority: appointment.priority,
    notes: appointment.notes,
    status: appointment.status,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt
  };
}

export function mapTestimonialToSchema(testimonial: any): any {
  return {
    id: testimonial._id.toString(),
    name: testimonial.name,
    role: testimonial.role,
    content: testimonial.content,
    rating: testimonial.rating,
    imageUrl: testimonial.imageUrl,
    displayOrder: testimonial.displayOrder
  };
}
