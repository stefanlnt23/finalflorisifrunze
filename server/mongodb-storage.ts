import { IStorage } from './storage';
import {
  User, Service, PortfolioItem, BlogPost, Inquiry, Appointment, Testimonial,
  mapUserToSchema, mapServiceToSchema, mapPortfolioItemToSchema, mapBlogPostToSchema,
  mapInquiryToSchema, mapAppointmentToSchema, mapTestimonialToSchema
} from './mongodb';
import { InsertUser, InsertService, InsertPortfolioItem, InsertBlogPost, InsertInquiry, InsertAppointment, InsertTestimonial } from '@shared/schema';
import mongoose from 'mongoose';
import { log } from './vite';
import * as crypto from 'crypto';
import { Db, ObjectId } from 'mongodb';
import { Collection } from 'mongodb';

export interface CarouselImage {
  id: string;
  imageUrl: string;
  alt: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureCard {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  order: number;
}

export class MongoDBStorage implements IStorage {
  private db: any;

  constructor() {
    // Initialize the database connection when the class is instantiated
    this.initDb();
  }

  private async initDb() {
    try {
      // Get the database connection from mongoose
      const connection = mongoose.connection;
      if (connection.readyState === 1) { // 1 = connected
        this.db = connection.db;
        log('MongoDB storage: Database connection initialized', 'mongodb');
      } else {
        log('MongoDB storage: Waiting for database connection...', 'mongodb');
        // Set up event handler for when connection is established
        mongoose.connection.once('connected', () => {
          this.db = mongoose.connection.db;
          log('MongoDB storage: Database connection initialized', 'mongodb');
        });
      }
    } catch (error) {
      log(`Error initializing database connection: ${error}`, 'mongodb');
    }
  }

  // User operations
  async getUser(id: string | number): Promise<any | undefined> {
    try {
      const user = await User.findById(id);
      return user ? mapUserToSchema(user) : undefined;
    } catch (error) {
      log(`Error fetching user with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    try {
      const user = await User.findOne({ username });
      return user ? mapUserToSchema(user) : undefined;
    } catch (error) {
      log(`Error fetching user with username ${username}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    try {
      const user = await User.findOne({ email });
      return user ? mapUserToSchema(user) : undefined;
    } catch (error) {
      log(`Error fetching user with email ${email}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getUsers(): Promise<any[]> {
    try {
      const users = await User.find();
      return users.map(mapUserToSchema);
    } catch (error) {
      log(`Error fetching users: ${error}`, 'mongodb');
      return [];
    }
  }

  async createUser(insertUser: InsertUser): Promise<any> {
    try {
      // Use the password hashing utility
      const hashedPassword = await import('./auth').then(auth => auth.hashPassword(insertUser.password));

      const newUser = new User({
        ...insertUser,
        password: hashedPassword
      });
      const savedUser = await newUser.save();
      return mapUserToSchema(savedUser);
    } catch (error) {
      log(`Error creating user: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updateUser(id: string | number, userData: Partial<InsertUser>): Promise<any | undefined> {
    try {
      // If password is being updated, hash it
      const updatedData = { ...userData };
      if (updatedData.password) {
        updatedData.password = await import('./auth').then(auth => auth.hashPassword(updatedData.password as string));
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { ...updatedData, updatedAt: new Date() },
        { new: true }
      );
      return updatedUser ? mapUserToSchema(updatedUser) : undefined;
    } catch (error) {
      log(`Error updating user with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deleteUser(id: string | number): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting user with id ${id}: ${error}`, 'mongodb');
      return false;
    }
  }

  // Service operations
  async getService(id: number | string): Promise<any | undefined> {
    try {
      log(`MongoDB: Fetching service with id ${id}`, 'mongodb');
      const service = await Service.findById(id);
      if (!service) {
        log(`MongoDB: Service with id ${id} not found`, 'mongodb');
        return undefined;
      }
      return mapServiceToSchema(service);
    } catch (error) {
      log(`Error fetching service with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getServices(): Promise<any[]> {
    try {
      const services = await Service.find();
      return services.map(mapServiceToSchema);
    } catch (error) {
      log(`Error fetching services: ${error}`, 'mongodb');
      return [];
    }
  }

  async getFeaturedServices(): Promise<any[]> {
    try {
      log(`Fetching featured services from MongoDB...`, 'mongodb');
      const services = await Service.find({ isFeatured: true });
      log(`Found ${services.length} featured services`, 'mongodb');
      return services.map(mapServiceToSchema);
    } catch (error) {
      log(`Error fetching featured services: ${error}`, 'mongodb');
      return [];
    }
  }

  async createService(insertService: InsertService): Promise<any> {
    try {
      // Map the data correctly to match MongoDB schema
      const serviceData = {
        name: insertService.name,
        description: insertService.description,
        shortDesc: insertService.shortDesc,
        price: insertService.price,
        imageUrl: insertService.imageUrl,
        isFeatured: insertService.featured
      };

      const newService = new Service(serviceData);
      const savedService = await newService.save();
      return mapServiceToSchema(savedService);
    } catch (error) {
      log(`Error creating service: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<any | undefined> {
    try {
      // Map the data correctly to match MongoDB schema
      const mappedData: any = {
        updatedAt: new Date()
      };

      if (serviceData.name) mappedData.name = serviceData.name;
      if (serviceData.description) mappedData.description = serviceData.description;
      if (serviceData.shortDesc !== undefined) mappedData.shortDesc = serviceData.shortDesc;
      if (serviceData.price) mappedData.price = serviceData.price;
      if (serviceData.imageUrl !== undefined) mappedData.imageUrl = serviceData.imageUrl;
      if (serviceData.featured !== undefined) mappedData.isFeatured = serviceData.featured;

      const updatedService = await Service.findByIdAndUpdate(
        id,
        mappedData,
        { new: true }
      );
      return updatedService ? mapServiceToSchema(updatedService) : undefined;
    } catch (error) {
      log(`Error updating service with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deleteService(id: number | string): Promise<boolean> {
    try {
      log(`Attempting to delete service with id ${id}`, 'mongodb');

      // Convert string numeric ID to number if needed (for compatibility)
      let serviceId = id;

      log(`Looking for service with ID: ${serviceId}`, 'mongodb');

      const result = await Service.findByIdAndDelete(serviceId);
      log(`Delete result: ${result ? 'Success' : 'Not found'}`, 'mongodb');

      if (!result) {
        log(`Service with ID ${serviceId} not found`, 'mongodb');
        return false;
      }

      // Also delete any related portfolio items
      await PortfolioItem.deleteMany({ serviceId: serviceId });
      log(`Deleted related portfolio items for service ${serviceId}`, 'mongodb');

      return true;
    } catch (error) {
      log(`Error deleting service with id ${id}: ${error}`, 'mongodb');
      return false;
    }
  }

  // Portfolio operations
  async getPortfolioItem(id: string | number): Promise<any | undefined> {
    try {
      const item = await PortfolioItem.findById(id);
      return item ? mapPortfolioItemToSchema(item) : undefined;
    } catch (error) {
      log(`Error fetching portfolio item with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getPortfolioItems(): Promise<any[]> {
    try {
      const items = await PortfolioItem.find();
      return items.map(mapPortfolioItemToSchema);
    } catch (error) {
      log(`Error fetching portfolio items: ${error}`, 'mongodb');
      return [];
    }
  }

  async getPortfolioItemsByService(serviceId: string | number): Promise<any[]> {
    try {
      log(`MongoDB: Fetching portfolio items for service ID ${serviceId}`, 'mongodb');
      const items = await PortfolioItem.find({ serviceId });
      return items.map(mapPortfolioItemToSchema);
    } catch (error) {
      log(`Error fetching portfolio items for service ${serviceId}: ${error}`, 'mongodb');
      return [];
    }
  }

  async createPortfolioItem(insertPortfolioItem: InsertPortfolioItem): Promise<any> {
    try {
      // Ensure required fields are present
      const portfolioData = {
        ...insertPortfolioItem,
        featured: insertPortfolioItem.featured || false,
        status: insertPortfolioItem.status || 'Draft',
        viewCount: insertPortfolioItem.viewCount || 0
      };

      const newItem = new PortfolioItem(portfolioData);
      const savedItem = await newItem.save();
      return mapPortfolioItemToSchema(savedItem);
    } catch (error) {
      log(`Error creating portfolio item: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updatePortfolioItem(id: string | number, portfolioItemData: Partial<InsertPortfolioItem>): Promise<any | undefined> {
    try {
      const updatedItem = await PortfolioItem.findByIdAndUpdate(
        id,
        { ...portfolioItemData, updatedAt: new Date() },
        { new: true }
      );
      return updatedItem ? mapPortfolioItemToSchema(updatedItem) : undefined;
    } catch (error) {
      log(`Error updating portfolio item with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deletePortfolioItem(id: string | number): Promise<boolean> {
    try {
      const result = await PortfolioItem.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting portfolio item with id ${id}: ${error}`, 'mongodb');
      return false;
    }
  }

  // Blog operations
  async getBlogPost(id: number | string): Promise<any | undefined> {
    try {
      log(`Fetching blog post with ID: ${id}`, 'mongodb');
      const post = await BlogPost.findById(id);
      if (!post) {
        log(`Blog post with ID ${id} not found`, 'mongodb');
        return undefined;
      }
      return mapBlogPostToSchema(post);
    } catch (error) {
      log(`Error fetching blog post with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getBlogPosts(): Promise<any[]> {
    try {
      const posts = await BlogPost.find().sort({ publishedAt: -1 });
      return posts.map(mapBlogPostToSchema);
    } catch (error) {
      log(`Error fetching blog posts: ${error}`, 'mongodb');
      return [];
    }
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<any> {
    try {
      log(`Creating blog post with data: ${JSON.stringify(insertBlogPost)}`, 'mongodb');

      // Log the schema of the BlogPost model
      log(`BlogPost schema: ${JSON.stringify(BlogPost.schema.paths)}`, 'mongodb');

      const now = new Date();
      const postData = {
        ...insertBlogPost,
        imageUrl: insertBlogPost.imageUrl || null,
        createdAt: insertBlogPost.createdAt || now,
        updatedAt: insertBlogPost.updatedAt || now
      };

      log(`Processed blog post data for MongoDB: ${JSON.stringify(postData)}`, 'mongodb');

      const newPost = new BlogPost(postData);
      log(`New blog post instance created: ${JSON.stringify(newPost)}`, 'mongodb');

      const savedPost = await newPost.save();
      log(`Blog post created successfully with ID: ${savedPost._id}`, 'mongodb');
      return mapBlogPostToSchema(savedPost);
    } catch (error) {
      log(`Error creating blog post: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updateBlogPost(id: number | string, blogPostData: Partial<InsertBlogPost>): Promise<any | undefined> {
    try {
      log(`Updating blog post with ID: ${id}, data: ${JSON.stringify(blogPostData)}`, 'mongodb');
      const now = new Date();
      const updateData = {
        ...blogPostData,
        imageUrl: blogPostData.imageUrl || null,
        updatedAt: now
      };
      const updatedPost = await BlogPost.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!updatedPost) {
        log(`Blog post with ID ${id} not found for update`, 'mongodb');
        return undefined;
      }

      log(`Blog post updated successfully`, 'mongodb');
      return mapBlogPostToSchema(updatedPost);
    } catch (error) {
      log(`Error updating blog post with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deleteBlogPost(id: number | string): Promise<boolean> {
    try {
      log(`Deleting blog post with ID: ${id}`, 'mongodb');
      const result = await BlogPost.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting blog post with id ${id}: ${error}`, 'mongodb');
      return false;
    }
  }

  // Inquiry operations
  async getInquiry(id: number | string): Promise<any | undefined> {
    try {
      log(`Fetching inquiry with ID: ${id}`, 'mongodb');

      // Ensure we have a valid MongoDB ObjectId
      let objectId;
      try {
        objectId = new mongoose.Types.ObjectId(id.toString());
        log(`Converted ID ${id} to ObjectId: ${objectId}`, 'mongodb');
      } catch (error) {
        log(`Failed to convert ID ${id} to ObjectId: ${error}`, 'mongodb');
        return undefined;
      }

      const inquiry = await Inquiry.findById(objectId);

      if (!inquiry) {
        log(`Inquiry with ID ${id} not found`, 'mongodb');
        return undefined;
      }

      log(`Successfully found inquiry: ${inquiry._id}`, 'mongodb');
      return mapInquiryToSchema(inquiry);
    } catch (error) {
      log(`Error fetching inquiry with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getInquiries(): Promise<any[]> {
    try {
      const inquiries = await Inquiry.find().sort({ createdAt: -1 });
      return inquiries.map(mapInquiryToSchema);
    } catch (error) {
      log(`Error fetching inquiries: ${error}`, 'mongodb');
      return [];
    }
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<any> {
    try {
      log(`Creating new inquiry with data: ${JSON.stringify(insertInquiry)}`, 'mongodb');

      // Convert serviceId to ObjectId if it exists
      const inquiryData = {
        ...insertInquiry,
        serviceId: insertInquiry.serviceId ? new mongoose.Types.ObjectId(insertInquiry.serviceId.toString()) : null,
        status: insertInquiry.status || 'new'
      };

      const newInquiry = new Inquiry(inquiryData);
      const savedInquiry = await newInquiry.save();
      log(`Successfully created inquiry with ID: ${savedInquiry._id}`, 'mongodb');
      return mapInquiryToSchema(savedInquiry);
    } catch (error) {
      log(`Error creating inquiry: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updateInquiry(id: number | string, inquiryData: Partial<InsertInquiry>): Promise<any | undefined> {
    try {
      log(`Updating inquiry with ID: ${id}, data: ${JSON.stringify(inquiryData)}`, 'mongodb');

      // Ensure we have a valid MongoDB ObjectId
      let objectId;
      try {
        objectId = new mongoose.Types.ObjectId(id.toString());
        log(`Converted ID ${id} to ObjectId: ${objectId}`, 'mongodb');
      } catch (error) {
        log(`Failed to convert ID ${id} to ObjectId: ${error}`, 'mongodb');
        return undefined;
      }

      // Convert serviceId to ObjectId if it exists in the update data
      const updateData = {
        ...inquiryData,
        serviceId: inquiryData.serviceId ? new mongoose.Types.ObjectId(inquiryData.serviceId.toString()) : undefined,
        updatedAt: new Date()
      };

      log(`Finding and updating inquiry with ObjectId: ${objectId}`, 'mongodb');
      const updatedInquiry = await Inquiry.findByIdAndUpdate(
        objectId,
        updateData,
        { new: true }
      );

      if (!updatedInquiry) {
        log(`Inquiry with ID ${id} not found for update`, 'mongodb');
        return undefined;
      }

      log(`Successfully updated inquiry: ${updatedInquiry._id}`, 'mongodb');
      return mapInquiryToSchema(updatedInquiry);
    } catch (error) {
      log(`Error updating inquiry with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deleteInquiry(id: number | string): Promise<boolean> {
    try {
      log(`Attempting to delete inquiry with ID: ${id}`, 'mongodb');

      // Ensure we have a valid MongoDB ObjectId
      let objectId;
      try {
        objectId = new mongoose.Types.ObjectId(id.toString());
        log(`Converted ID ${id} to ObjectId: ${objectId}`, 'mongodb');
      } catch (error) {
        log(`Failed to convert ID ${id} to ObjectId: ${error}`, 'mongodb');
        return false;
      }

      log(`Finding and deleting inquiry with ObjectId: ${objectId}`, 'mongodb');
      const result = await Inquiry.findByIdAndDelete(objectId);

      if (!result) {
        log(`Inquiry with ID ${id} not found for deletion`, 'mongodb');
        return false;
      }

      log(`Successfully deleted inquiry with ID: ${id}`, 'mongodb');
      return true;
    } catch (error) {
      log(`Error deleting inquiry with id ${id}: ${error}`, 'mongodb');
      return false;
    }
  }

  // Appointment operations
  async getAppointment(id: string | number): Promise<any | undefined> {
    try {
      const appointment = await Appointment.findById(id);
      return appointment ? mapAppointmentToSchema(appointment) : undefined;
    } catch (error) {
      log(`Error fetching appointment with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getAppointments(): Promise<any[]> {
    try {
      const appointments = await Appointment.find().sort({ date: 1 });
      return appointments.map(mapAppointmentToSchema);
    } catch (error) {
      log(`Error fetching appointments: ${error}`, 'mongodb');
      return [];
    }
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<any> {
    try {
      log(`Creating new appointment with data: ${JSON.stringify(insertAppointment)}`, 'mongodb');

      // Ensure serviceId is a valid ObjectId
      const appointmentData = {
        ...insertAppointment,
        serviceId: insertAppointment.serviceId 
          ? new mongoose.Types.ObjectId(insertAppointment.serviceId.toString()) 
          : null
      };

      const newAppointment = new Appointment(appointmentData);
      const savedAppointment = await newAppointment.save();
      log(`Successfully created appointment with ID: ${savedAppointment._id}`, 'mongodb');
      return mapAppointmentToSchema(savedAppointment);
    } catch (error) {
      log(`Error creating appointment: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updateAppointment(id: string | number, appointmentData: Partial<InsertAppointment>): Promise<any | undefined> {
    try {
      log(`Updating appointment with ID: ${id}, data: ${JSON.stringify(appointmentData)}`, 'mongodb');

      // Process serviceId if it exists in the update data
      const updateData: any = {
        ...appointmentData,
        updatedAt: new Date()
      };

      if (appointmentData.serviceId) {
        updateData.serviceId = new mongoose.Types.ObjectId(appointmentData.serviceId.toString());
      }

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!updatedAppointment) {
        log(`Appointment with ID ${id} not found for update`, 'mongodb');
        return undefined;
      }

      log(`Successfully updated appointment: ${updatedAppointment._id}`, 'mongodb');
      return mapAppointmentToSchema(updatedAppointment);
    } catch (error) {
      log(`Error updating appointment with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deleteAppointment(id: string | number): Promise<boolean> {
    try {
      const result = await Appointment.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting appointment with id ${id}: ${error}`, 'mongodb');
      return false;
    }
  }

  // Testimonial operations
  async getTestimonial(id: number | string): Promise<any | undefined> {
    try {
      log(`Fetching testimonial with ID: ${id}`, 'mongodb');
      const testimonial = await Testimonial.findById(id);
      return testimonial ? mapTestimonialToSchema(testimonial) : undefined;
    } catch (error) {
      log(`Error fetching testimonial with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getTestimonials(): Promise<any[]> {
    try {
      const testimonials = await Testimonial.find().sort({ displayOrder: 1 });
      return testimonials.map(mapTestimonialToSchema);
    } catch (error) {
      log(`Error fetching testimonials: ${error}`, 'mongodb');
      return [];
    }
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<any> {
    try {
      const newTestimonial = new Testimonial(insertTestimonial);
      const savedTestimonial = await newTestimonial.save();
      return mapTestimonialToSchema(savedTestimonial);
    } catch (error) {
      log(`Error creating testimonial: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updateTestimonial(id: number | string, testimonialData: Partial<InsertTestimonial>): Promise<any | undefined> {
    try {
      const updatedTestimonial = await Testimonial.findByIdAndUpdate(
        id,
        { ...testimonialData, updatedAt: new Date() },
        { new: true }
      );
      return updatedTestimonial ? mapTestimonialToSchema(updatedTestimonial) : undefined;
    } catch (error) {
      log(`Error updating testimonial with id ${id}: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deleteTestimonial(id: number | string): Promise<boolean> {
    try {
      log(`Attempting to delete testimonial with ID: ${id}`, 'mongodb');
      const result = await Testimonial.findByIdAndDelete(id);
      log(`Delete testimonial result: ${result ? 'Success' : 'Not found'}`, 'mongodb');
      return !!result;
    } catch (error) {
      log(`Error deleting testimonial with id ${id}: ${error}`, 'mongodb');
      return false;
    }
  }

  // Carousel Images methods
  async getCarouselImages(): Promise<any[]> {
    try {
      if (!this.db) {
        log('Database connection not initialized yet, initializing now...', 'mongodb');
        await this.initDb();
        if (!this.db) {
          log('Could not initialize database connection', 'mongodb');
          return [];
        }
      }

      // Check if collection exists and create it if not
      const collections = await this.db.listCollections({name: 'carouselImages'}).toArray();
      if (collections.length === 0) {
        await this.db.createCollection('carouselImages');
        log('Created carouselImages collection', 'mongodb');
      }

      const images = await this.db.collection('carouselImages')
        .find({})
        .sort({ order: 1 })
        .toArray();

      return images.map(image => ({
        id: image._id.toString(),
        imageUrl: image.imageUrl,
        alt: image.alt || '',
        order: image.order,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt
      }));
    } catch (error) {
      console.error("Error fetching carousel images:", error);
      throw error;
    }
  }

  async addCarouselImage(image: { imageUrl: string; alt?: string }): Promise<any> {
    try {
      if (!this.db) {
        log('Database connection not initialized yet, initializing now...', 'mongodb');
        await this.initDb();
        if (!this.db) {
          log('Could not initialize database connection', 'mongodb');
          throw new Error('Database connection not initialized');
        }
      }

      // Check if collection exists and create it if not
      const collections = await this.db.listCollections({name: 'carouselImages'}).toArray();
      if (collections.length === 0) {
        await this.db.createCollection('carouselImages');
        log('Created carouselImages collection', 'mongodb');
      }

      // Get highest order to place new image at the end
      const highestOrderImage = await this.db.collection('carouselImages')
        .find({})
        .sort({ order: -1 })
        .limit(1)
        .toArray();

      const nextOrder = highestOrderImage.length > 0 ? highestOrderImage[0].order + 1 : 0;

      const timestamp = new Date();
      const result = await this.db.collection('carouselImages').insertOne({
        imageUrl: image.imageUrl,
        alt: image.alt || 'Garden showcase',
        order: nextOrder,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      return {
        id: result.insertedId.toString(),
        imageUrl: image.imageUrl,
        alt: image.alt || 'Garden showcase',
        order: nextOrder,
        createdAt: timestamp,
        updatedAt: timestamp
      };
    } catch (error) {
      console.error("Error adding carousel image:", error);
      throw error;
    }
  }

  async deleteCarouselImage(id: string): Promise<void> {
    try {
      if (!this.db) {
        log('Database connection not initialized yet, initializing now...', 'mongodb');
        await this.initDb();
        if (!this.db) {
          log('Could not initialize database connection', 'mongodb');
          throw new Error('Database connection not initialized');
        }
      }

      // Find the image to get its order
      const image = await this.db.collection('carouselImages').findOne({ 
        _id: new ObjectId(id) 
      });

      if (!image) {
        throw new Error('Carousel image not found');
      }

      // Delete the image
      await this.db.collection('carouselImages').deleteOne({ 
        _id: new ObjectId(id) 
      });

      // Update order of remaining images
      await this.db.collection('carouselImages').updateMany(
        { order: { $gt: image.order } },
        { $inc: { order: -1 } }
      );
    } catch (error) {
      console.error(`Error deleting carousel image ${id}:`, error);
      throw error;
    }
  }

  async reorderCarouselImage(id: string, direction: 'up' | 'down'): Promise<void> {
    try {
      if (!this.db) {
        log('Database connection not initialized yet, initializing now...', 'mongodb');
        await this.initDb();
        if (!this.db) {
          log('Could not initialize database connection', 'mongodb');
          throw new Error('Database connection not initialized');
        }
      }

      // Find the image
      const image = await this.db.collection('carouselImages').findOne({ 
        _id: new ObjectId(id) 
      });

      if (!image) {
        throw new Error('Carousel image not found');
      }

      // Find adjacent image
      const adjacentOrder = direction === 'up' ? image.order - 1 : image.order + 1;

      const adjacentImage = await this.db.collection('carouselImages').findOne({ 
        order: adjacentOrder 
      });

      if (!adjacentImage) {
        // No adjacent image, can't reorder
        return;
      }

      // Swap orders
      await this.db.collection('carouselImages').updateOne(
        { _id: image._id },
        { $set: { order: adjacentOrder, updatedAt: new Date() } }
      );

      await this.db.collection('carouselImages').updateOne(
        { _id: adjacentImage._id },
        { $set: { order: image.order, updatedAt: new Date() } }
      );
    } catch (error) {
      console.error(`Error reordering carousel image ${id}:`, error);
      throw error;
    }
  }

    // Feature Cards methods
    async getFeatureCards(): Promise<any[]> {
        try {
          if (!this.db) {
            log('Database connection not initialized yet, initializing now...', 'mongodb');
            await this.initDb();
            if (!this.db) {
              log('Could not initialize database connection', 'mongodb');
              return [];
            }
          }
    
          // Check if collection exists and create it if not
          const collections = await this.db.listCollections({name: 'featureCards'}).toArray();
          if (collections.length === 0) {
            await this.db.createCollection('featureCards');
            log('Created featureCards collection', 'mongodb');
          }
    
          const cards = await this.db.collection('featureCards')
            .find({})
            .sort({ order: 1 })
            .toArray();
    
          return cards.map(card => ({
            id: card._id.toString(),
            imageUrl: card.imageUrl,
            title: card.title,
            description: card.description,
            order: card.order,
          }));
        } catch (error) {
          console.error("Error fetching feature cards:", error);
          throw error;
        }
      }
    
      async addFeatureCard(card: { imageUrl: string; title: string; description: string }): Promise<any> {
        try {
          if (!this.db) {
            log('Database connection not initialized yet, initializing now...', 'mongodb');
            await this.initDb();
            if (!this.db) {
              log('Could not initialize database connection', 'mongodb');
              throw new Error('Database connection not initialized');
            }
          }
    
          // Check if collection exists and create it if not
          const collections = await this.db.listCollections({name: 'featureCards'}).toArray();
          if (collections.length === 0) {
            await this.db.createCollection('featureCards');
            log('Created featureCards collection', 'mongodb');
          }
    
          // Get highest order to place new card at the end
          const highestOrderCard = await this.db.collection('featureCards')
            .find({})
            .sort({ order: -1 })
            .limit(1)
            .toArray();
    
          const nextOrder = highestOrderCard.length > 0 ? highestOrderCard[0].order + 1 : 0;
    
          const result = await this.db.collection('featureCards').insertOne({
            imageUrl: card.imageUrl,
            title: card.title,
            description: card.description,
            order: nextOrder,
          });
    
          return {
            id: result.insertedId.toString(),
            imageUrl: card.imageUrl,
            title: card.title,
            description: card.description,
            order: nextOrder,
          };
        } catch (error) {
          console.error("Error adding feature card:", error);
          throw error;
        }
      }
    
      async deleteFeatureCard(id: string): Promise<void> {
        try {
          if (!this.db) {
            log('Database connection not initialized yet, initializing now...', 'mongodb');
            await this.initDb();
            if (!this.db) {
              log('Database connection not initialized', 'mongodb');
              throw new Error('Database connection not initialized');
            }
          }
    
          // Find the card to get its order
          const card = await this.db.collection('featureCards').findOne({ 
            _id: new ObjectId(id) 
          });
    
          if (!card) {
            throw new Error('Feature card not found');
          }
    
          // Delete the card
          await this.db.collection('featureCards').deleteOne({ 
            _id: new ObjectId(id) 
          });
    
          // Update order of remaining cards
          await this.db.collection('featureCards').updateMany(
            { order: { $gt: card.order } },
            { $inc: { order: -1 } }
          );
        } catch (error) {
          console.error(`Error deleting feature card ${id}:`, error);
          throw error;
        }
      }
    
      async reorderFeatureCard(id: string, direction: 'up' | 'down'): Promise<void> {
        try {
          if (!this.db) {
            log('Database connection not initialized yet, initializing now...', 'mongodb');
            await this.initDb();
            if (!this.db) {
              log('Could not initialize database connection', 'mongodb');
              throw new Error('Database connection not initialized');
            }
          }
    
          // Find the card
          const card = await this.db.collection('featureCards').findOne({ 
            _id: new ObjectId(id) 
          });
    
          if (!card) {
            throw new Error('Feature card not found');
          }
    
          // Find adjacent card
          const adjacentOrder = direction === 'up' ? card.order - 1 : card.order + 1;
    
          const adjacentCard = await this.db.collection('featureCards').findOne({ 
            order: adjacentOrder 
          });
    
          if (!adjacentCard) {
            // No adjacent card, can't reorder
            return;
          }
    
          // Swap orders
          await this.db.collection('featureCards').updateOne(
            { _id: card._id },
            { $set: { order: adjacentOrder } }
          );
    
          await this.db.collection('featureCards').updateOne(
            { _id: adjacentCard._id },
            { $set: { order: card.order } }
          );
        } catch (error) {
          console.error(`Error reordering feature card ${id}:`, error);
          throw error;
        }
      }

  // Initialize demo data 
  async seedDemoData(): Promise<void> {
    try {
      // Check if we already have data
      const userCount = await User.countDocuments();

      if (userCount === 0) {
        log('Seeding demo data to MongoDB...', 'mongodb');

        // Create admin user
        const adminUser = await this.createUser({
          name: 'Admin User',
          email: 'admin@example.com',
          username: 'admin',
          password: 'password123',
          role: 'admin'
        });

        // Create services
        const service1 = await this.createService({
          name: 'Garden Maintenance',
          description: 'Our garden maintenance service includes weeding, pruning, lawn care, and general upkeep to keep your garden looking its best year-round.',
          shortDesc: 'Regular maintenance to keep your garden healthy and beautiful',
          price: "From $125/month",
          imageUrl: '/images/services/maintenance.jpg',
          featured: true
        });

        const service2 = await this.createService({
          name: 'Landscape Design',
          description: 'Our landscape design service creates beautiful, functional outdoor spaces tailored to your preferences and site conditions.',
          shortDesc: 'Custom designs to transform your outdoor space',
          price: "From $350",
          imageUrl: '/images/services/design.jpg',
          featured: true
        });

        const service3 = await this.createService({
          name: 'Planting Services',
          description: 'Our planting services include selection, placement, and installation of trees, shrubs, perennials, and seasonal flowers.',
          shortDesc: 'Expert plant selection and installation',
          price: "From $200",
          imageUrl: '/images/services/planting.jpg',
          featured: true
        });

        // Create portfolio items
        await this.createPortfolioItem({
          title: 'Modern Backyard Transformation',
          description: 'Complete redesign of a neglected backyard into a modern outdoor living space with native plants and sustainable features.',
          serviceId: "2",
          imageUrl: '/images/portfolio/backyard1.jpg',
          date: new Date('2023-05-15'),
          featured: true,
          status: 'Published',
          viewCount: 0,
          location: 'London, UK',
          projectDuration: '4 weeks',
          difficultyLevel: 'Moderate'
        });

        await this.createPortfolioItem({
          title: 'Drought-Resistant Front Yard',
          description: 'Conversion of a water-hungry lawn into a beautiful, low-maintenance xeriscape with native plants.',
          serviceId: "3",
          imageUrl: '/images/portfolio/frontyard1.jpg',
          date: new Date('2023-07-22'),
          featured: false,
          status: 'Published',
          viewCount: 0,
          location: 'Manchester, UK',
          projectDuration: '2 weeks',
          difficultyLevel: 'Easy'
        });

        // Create testimonials
        await this.createTestimonial({
          name: 'Sarah Johnson',
          role: 'Homeowner',
          content: 'The team transformed our boring backyard into a beautiful outdoor living space that we use all the time. Professional, punctual, and a pleasure to work with!',
          rating: 5,
          imageUrl: '/images/testimonials/person1.jpg',
          displayOrder: 1
        });

        await this.createTestimonial({
          name: 'Michael Rodriguez',
          role: 'Business Owner',
          content: 'We hired them to maintain the landscaping at our office building, and the service has been exceptional. Our clients always comment on how beautiful our entrance looks.',
          rating: 5,
          imageUrl: '/images/testimonials/person2.jpg',
          displayOrder: 2
        });

        // Create blog posts
        const now = new Date();
        await this.createBlogPost({
          title: 'Top 10 Plants for Shade Gardens',
          content: 'Long-form content about the best shade plants...',
          excerpt: 'Discover beautiful plants that thrive in shaded areas and create stunning garden displays even without direct sunlight.',
          imageUrl: '/images/blog/shade-plants.jpg',
          authorId: "1", // Add authorId field
          publishedAt: new Date('2023-04-12'),
          createdAt: now,
          updatedAt: now
        });

        await this.createBlogPost({
          title: 'How to Create a Pollinator-Friendly Garden',
          content: 'Long-form content about attracting pollinators...',
          excerpt: 'Learn how to support local ecosystems by creating a garden that attracts and nourishes important pollinators like bees and butterflies.',
          imageUrl: '/images/blog/pollinators.jpg',
          authorId: "1", // Add authorId field
          publishedAt: new Date('2023-05-18'),
          createdAt: now,
          updatedAt: now
        });

            // Create feature cards
            await this.addFeatureCard({
                imageUrl: '/images/feature-cards/card1.jpg',
                title: 'Expert Landscaping',
                description: 'Transform your outdoor space with our expert landscaping services.'
            });

            await this.addFeatureCard({
                imageUrl: '/images/feature-cards/card2.jpg',
                title: 'Garden Design',
                description: 'Create the garden of your dreams with our professional design services.'
            });

            await this.addFeatureCard({
                imageUrl: '/images/feature-cards/card3.jpg',
                title: 'Lawn Care',
                description: 'Keep your lawn green and healthy with our comprehensive lawn care programs.'
            });

            await this.addFeatureCard({
                imageUrl: '/images/feature-cards/card4.jpg',
                title: 'Maintenance Services',
                description: 'Enjoy a beautiful garden year-round with our maintenance services.'
            });

        log('Demo data successfully seeded to MongoDB', 'mongodb');
      } else {
        log('Database already contains data, skipping seed operation', 'mongodb');
      }
    } catch (error) {
      log(`Error seeding demo data: ${error}`, 'mongodb');
      throw error;
    }
  }
}