import { 
  type User, type InsertUser,
  type Service, type InsertService,
  type PortfolioItem, type InsertPortfolioItem,
  type BlogPost, type InsertBlogPost,
  type Inquiry, type InsertInquiry,
  type Appointment, type InsertAppointment, 
  type Testimonial, type InsertTestimonial,
  type CarouselImage,
  type FeatureCard
} from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: string | number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string | number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string | number): Promise<boolean>;

  // Service operations
  getService(id: number | string): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  getFeaturedServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number | string, serviceData: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number | string): Promise<boolean>;

  // Portfolio operations
  getPortfolioItem(id: string | number): Promise<PortfolioItem | undefined>;
  getPortfolioItems(): Promise<PortfolioItem[]>;
  getPortfolioItemsByService(serviceId: number | string): Promise<PortfolioItem[]>;
  createPortfolioItem(portfolioItem: InsertPortfolioItem): Promise<PortfolioItem>;
  updatePortfolioItem(id: string | number, portfolioItemData: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined>;
  deletePortfolioItem(id: string | number): Promise<boolean>;

  // Blog operations
  getBlogPost(id: string | number): Promise<BlogPost | undefined>;
  getBlogPosts(): Promise<BlogPost[]>;
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string | number, blogPostData: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string | number): Promise<boolean>;

  // Inquiry operations
  getInquiry(id: number | string): Promise<Inquiry | undefined>;
  getInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: number | string, inquiryData: Partial<InsertInquiry>): Promise<Inquiry | undefined>;
  deleteInquiry(id: number | string): Promise<boolean>;

  // Appointment operations
  getAppointment(id: string | number): Promise<Appointment | undefined>;
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string | number, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string | number): Promise<boolean>;

  // Testimonial operations
  getTestimonial(id: number | string): Promise<Testimonial | undefined>;
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number | string, testimonialData: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number | string): Promise<boolean>;

  // Carousel Images
  getCarouselImages(): Promise<CarouselImage[]>;
  getCarouselImageById(id: string): Promise<CarouselImage | null>;
  createCarouselImage(imageData: Omit<CarouselImage, 'id'>): Promise<CarouselImage>;
  updateCarouselImage(id: string, imageData: Partial<CarouselImage>): Promise<boolean>;
  deleteCarouselImage(id: string): Promise<boolean>;
  reorderCarouselImage(id: string, direction: 'up' | 'down'): Promise<boolean>;

  // Feature Cards
  getFeatureCards(): Promise<FeatureCard[]>;
  getFeatureCardById(id: string): Promise<FeatureCard | null>;
  createFeatureCard(cardData: Omit<FeatureCard, 'id'>): Promise<FeatureCard>;
  updateFeatureCard(id: string, cardData: Partial<FeatureCard>): Promise<boolean>;
  deleteFeatureCard(id: string): Promise<boolean>;
  reorderFeatureCard(id: string, direction: 'up' | 'down'): Promise<boolean>;
}

export class MemStorage implements IStorage {
  // In-memory storage maps
  private users: Map<string | number, User>;
  private services: Map<string | number, Service>;
  private portfolioItems: Map<string | number, PortfolioItem>;
  private blogPosts: Map<string | number, BlogPost>;
  private inquiries: Map<string | number, Inquiry>;
  private appointments: Map<string | number, Appointment>;
  private testimonials: Map<string | number, Testimonial>;
  private carouselImages: Map<string, CarouselImage>;
  private featureCards: Map<string, FeatureCard>;

  // ID counters
  private userIdCounter: number;
  private serviceIdCounter: number;
  private portfolioIdCounter: number;
  private blogIdCounter: number;
  private inquiryIdCounter: number;
  private appointmentIdCounter: number;
  private testimonialIdCounter: number;
  private carouselImageIdCounter: number;
  private featureCardIdCounter: number;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.services = new Map();
    this.portfolioItems = new Map();
    this.blogPosts = new Map();
    this.inquiries = new Map();
    this.appointments = new Map();
    this.testimonials = new Map();
    this.carouselImages = new Map();
    this.featureCards = new Map();

    // Initialize ID counters
    this.userIdCounter = 1;
    this.serviceIdCounter = 1;
    this.portfolioIdCounter = 1;
    this.blogIdCounter = 1;
    this.inquiryIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.testimonialIdCounter = 1;
    this.carouselImageIdCounter = 1;
    this.featureCardIdCounter = 1;

    // Add an admin user by default
    this.createUser({
      username: 'admin',
      password: 'admin123',
      email: 'admin@greengarden.com',
      name: 'Admin User',
      role: 'admin' as const
    });

    // Seed more data
    this.seedDemoData();
  }

  private async seedDemoData() {
    // Add services
    const gardenMaintenanceId = this.serviceIdCounter;
    await this.createService({
      name: "Garden Maintenance",
      description: "Regular maintenance to keep your garden looking its best year-round. Includes weeding, pruning, mulching, and seasonal clean-up. Our expert gardeners will ensure your plants thrive in every season.",
      shortDesc: "Professional garden maintenance services for a thriving outdoor space.",
      price: "From $120/month",
      imageUrl: null,
      featured: true
    });

    await this.createService({
      name: "Landscape Design",
      description: "Transform your outdoor space with our professional landscape design services. We create beautiful, sustainable landscapes tailored to your preferences and local climate conditions.",
      shortDesc: "Custom landscape design for beautiful, sustainable outdoor spaces.",
      price: "From $500",
      imageUrl: null,
      featured: true
    });

    await this.createService({
      name: "Tree & Shrub Care",
      description: "Comprehensive care for your trees and shrubs, including pruning, fertilization, pest management, and disease treatment to ensure healthy growth and longevity.",
      shortDesc: "Expert care for healthy, thriving trees and shrubs.",
      price: "From $150",
      imageUrl: null,
      featured: true
    });

    await this.createService({
      name: "Lawn Care",
      description: "Complete lawn maintenance services including mowing, fertilization, aeration, overseeding, and pest control to keep your lawn lush, green, and healthy.",
      shortDesc: "Complete lawn maintenance for a lush, healthy yard.",
      price: "From $80/visit",
      imageUrl: null,
      featured: false
    });

    await this.createService({
      name: "Irrigation Systems",
      description: "Design, installation, and maintenance of efficient irrigation systems to ensure your garden gets the right amount of water while conserving this precious resource.",
      shortDesc: "Efficient irrigation solutions for optimal garden watering.",
      price: "From $350",
      imageUrl: null,
      featured: false
    });

    // Add portfolio items
    await this.createPortfolioItem({
      title: "Residential Garden Renovation",
      description: "Complete transformation of a neglected backyard into a vibrant garden with native plants, a water feature, and sustainable irrigation.",
      date: new Date("2023-04-15"),
      imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      serviceId: gardenMaintenanceId,
      featured: true,
      status: 'Published',
      viewCount: 0,
      location: 'London, UK',
      projectDuration: '3 weeks',
      difficultyLevel: 'Moderate'
    });

    await this.createPortfolioItem({
      title: "Commercial Landscape Project",
      description: "Designed and implemented landscaping for a corporate campus, featuring drought-resistant plants and efficient irrigation systems.",
      date: new Date("2023-05-22"),
      imageUrl: "https://images.unsplash.com/photo-1626807236036-8c9584a9f8a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      serviceId: gardenMaintenanceId,
      featured: false,
      status: 'Published',
      viewCount: 0,
      location: 'Manchester, UK',
      projectDuration: '6 weeks',
      difficultyLevel: 'Complex'
    });

    // Add blog posts
    const now = new Date();
    await this.createBlogPost({
      title: "10 Tips for a Thriving Summer Garden",
      excerpt: "Essential tips to help your garden flourish during the hot summer months, from watering techniques to pest management.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. In hac habitasse platea dictumst. Vivamus adipiscing fermentum quam volutpat aliquam. Integer et elit eget elit facilisis tristique. Nam vel iaculis mauris. Sed ullamcorper tellus erat, ultrices sem tincidunt euismod.",
      authorId: 1, // Add authorId field
      publishedAt: new Date("2023-06-01"),
      createdAt: now,
      updatedAt: now,
      imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    });

    await this.createBlogPost({
      title: "Sustainable Gardening Practices",
      excerpt: "Learn how to create an eco-friendly garden that conserves water, supports local wildlife, and reduces environmental impact.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. In hac habitasse platea dictumst. Vivamus adipiscing fermentum quam volutpat aliquam. Integer et elit eget elit facilisis tristique. Nam vel iaculis mauris. Sed ullamcorper tellus erat, ultrices sem tincidunt euismod.",
      authorId: 1, // Add authorId field
      publishedAt: new Date("2023-05-15"),
      createdAt: now,
      updatedAt: now,
      imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    });

    // Add testimonials
    await this.createTestimonial({
      name: "Sarah Johnson",
      role: "Homeowner",
      content: "Green Garden transformed my backyard into a beautiful oasis! Their team was professional, responsive, and truly cared about bringing my vision to life. I couldn't be happier with the results!",
      imageUrl: null,
      rating: 5,
      displayOrder: 1
    });

    await this.createTestimonial({
      name: "Michael Chen",
      role: "Business Owner",
      content: "We hired Green Garden to maintain the landscaping at our office building, and they've exceeded our expectations. Their attention to detail and proactive approach has made our property look exceptional year-round.",
      imageUrl: null,
      rating: 5,
      displayOrder: 2
    });

    await this.createTestimonial({
      name: "Emily Rodriguez",
      role: "Homeowner",
      content: "The landscape design service from Green Garden was excellent. They listened to our needs, worked within our budget, and created a sustainable garden that we love spending time in.",
      imageUrl: null,
      rating: 4,
      displayOrder: 3
    });

      // Add carousel images
    await this.createCarouselImage({
      imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      altText: "Beautiful Garden"
    });

    await this.createCarouselImage({
      imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      altText: "Green Plants"
    });

        // Add feature cards
    await this.createFeatureCard({
      imageUrl: "https://images.unsplash.com/photo-1592031830199-ca48fca22851?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Expert Landscaping",
      description: "We offer expert landscaping services to transform your outdoor space into a beautiful oasis.",
      displayOrder: 1
    });

    await this.createFeatureCard({
      imageUrl: "https://images.unsplash.com/photo-1601498330075-434934f7538e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Professional Gardeners",
      description: "Our professional gardeners are dedicated to providing top-notch gardening services.",
      displayOrder: 2
    });

    await this.createFeatureCard({
      imageUrl: "https://images.unsplash.com/photo-1587620962725-9e2569a7db67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Sustainable Practices",
      description: "We use sustainable gardening practices to protect the environment.",
      displayOrder: 3
    });
  }

  // User methods
  async getUser(id: string | number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'admin' // Default to admin if not specified
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string | number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string | number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Service methods
  async getService(id: string | number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getFeaturedServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.featured
    );
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const service: Service = { 
      ...insertService, 
      id, 
      imageUrl: insertService.imageUrl || null,
      featured: insertService.featured || false
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: string | number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;

    const updatedService = { ...service, ...serviceData };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: string | number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Portfolio methods
  async getPortfolioItem(id: string | number): Promise<PortfolioItem | undefined> {
    return this.portfolioItems.get(id);
  }

  async getPortfolioItems(): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values());
  }

  async getPortfolioItemsByService(serviceId: number | string): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values()).filter(
      (item) => item.serviceId === serviceId
    );
  }

  async createPortfolioItem(insertPortfolioItem: InsertPortfolioItem): Promise<PortfolioItem> {
    const id = this.portfolioIdCounter++;
    const portfolioItem: PortfolioItem = { 
      ...insertPortfolioItem, 
      id,
      serviceId: insertPortfolioItem.serviceId || null,
      featured: insertPortfolioItem.featured || false,
      status: insertPortfolioItem.status || 'Draft',
      viewCount: insertPortfolioItem.viewCount || 0
    };
    this.portfolioItems.set(id, portfolioItem);
    return portfolioItem;
  }

  async updatePortfolioItem(id: number | string, portfolioItemData: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined> {
    const portfolioItem = this.portfolioItems.get(id);
    if (!portfolioItem) return undefined;

    const updatedPortfolioItem = { ...portfolioItem, ...portfolioItemData };
    this.portfolioItems.set(id, updatedPortfolioItem);
    return updatedPortfolioItem;
  }

  async deletePortfolioItem(id: number | string): Promise<boolean> {
    return this.portfolioItems.delete(id);
  }

  // Blog methods
  async getBlogPost(id: string | number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values());
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogIdCounter++;
    const blogPost: BlogPost = { 
      ...insertBlogPost, 
      id,
      imageUrl: insertBlogPost.imageUrl || null
    };
    this.blogPosts.set(id, blogPost);
    return blogPost;
  }

  async updateBlogPost(id: string | number, blogPostData: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const blogPost = this.blogPosts.get(id);
    if (!blogPost) return undefined;

    const updatedBlogPost = { ...blogPost, ...blogPostData };
    this.blogPosts.set(id, updatedBlogPost);
    return updatedBlogPost;
  }

  async deleteBlogPost(id: string | number): Promise<boolean> {
    return this.blogPosts.delete(id);
  }

  // Inquiry methods
  async getInquiry(id: string | number): Promise<Inquiry | undefined> {
    return this.inquiries.get(id);
  }

  async getInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values());
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.inquiryIdCounter++;
    const inquiry: Inquiry = { 
      ...insertInquiry,
      id,
      status: 'new',
      phone: insertInquiry.phone || null,
      serviceId: insertInquiry.serviceId || null
    };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }

  async updateInquiry(id: string | number, inquiryData: Partial<InsertInquiry>): Promise<Inquiry | undefined> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) return undefined;

    const updatedInquiry = { ...inquiry, ...inquiryData };
    this.inquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }

  async deleteInquiry(id: string | number): Promise<boolean> {
    return this.inquiries.delete(id);
  }

  // Appointment methods
  async getAppointment(id: string | number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const appointment: Appointment = { 
      ...insertAppointment, 
      id,
      status: 'Scheduled',
      notes: insertAppointment.notes || null
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: string | number, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;

    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: string | number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Testimonial methods
  async getTestimonial(id: string | number): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialIdCounter++;
    const testimonial: Testimonial = { 
      ...insertTestimonial, 
      id,
      role: insertTestimonial.role || null,
      imageUrl: insertTestimonial.imageUrl || null,
      rating: insertTestimonial.rating || null,
      displayOrder: insertTestimonial.displayOrder || null
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  async updateTestimonial(id: string | number, testimonialData: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) return undefined;

    const updatedTestimonial = { ...testimonial, ...testimonialData };
    this.testimonials.set(id, updatedTestimonial);
    return updatedTestimonial;
  }

  async deleteTestimonial(id: string | number): Promise<boolean> {
    return this.testimonials.delete(id);
  }

    // Carousel Image methods
  async getCarouselImages(): Promise<CarouselImage[]> {
    return Array.from(this.carouselImages.values());
  }

  async getCarouselImageById(id: string): Promise<CarouselImage | null> {
    return this.carouselImages.get(id) || null;
  }

  async createCarouselImage(imageData: Omit<CarouselImage, 'id'>): Promise<CarouselImage> {
    const id = String(this.carouselImageIdCounter++);
    const carouselImage: CarouselImage = { id, ...imageData };
    this.carouselImages.set(id, carouselImage);
    return carouselImage;
  }

  async updateCarouselImage(id: string, imageData: Partial<CarouselImage>): Promise<boolean> {
    const carouselImage = this.carouselImages.get(id);
    if (!carouselImage) return false;

    const updatedCarouselImage = { ...carouselImage, ...imageData };
    this.carouselImages.set(id, updatedCarouselImage);
    return true;
  }

  async deleteCarouselImage(id: string): Promise<boolean> {
    return this.carouselImages.delete(id);
  }

  async reorderCarouselImage(id: string, direction: 'up' | 'down'): Promise<boolean> {
    const images = Array.from(this.carouselImages.values());
    const index = images.findIndex(img => img.id === id);

    if (index === -1) {
      return false;
    }

    let newIndex = index + (direction === 'up' ? -1 : 1);

    if (newIndex < 0 || newIndex >= images.length) {
      return false;
    }

    // Swap the images in the array
    [images[index], images[newIndex]] = [images[newIndex], images[index]];

    // Update the map with the reordered images
    this.carouselImages.clear();
    images.forEach(img => this.carouselImages.set(img.id, img));

    return true;
  }

  // Feature Card methods
  async getFeatureCards(): Promise<FeatureCard[]> {
    return Array.from(this.featureCards.values());
  }

  async getFeatureCardById(id: string): Promise<FeatureCard | null> {
    return this.featureCards.get(id) || null;
  }

  async createFeatureCard(cardData: Omit<FeatureCard, 'id'>): Promise<FeatureCard> {
    const id = String(this.featureCardIdCounter++);
    const featureCard: FeatureCard = { id, ...cardData };
    this.featureCards.set(id, featureCard);
    return featureCard;
  }

  async updateFeatureCard(id: string, cardData: Partial<FeatureCard>): Promise<boolean> {
    const featureCard = this.featureCards.get(id);
    if (!featureCard) return false;

    const updatedFeatureCard = { ...featureCard, ...cardData };
    this.featureCards.set(id, updatedFeatureCard);
    return true;
  }

  async deleteFeatureCard(id: string): Promise<boolean> {
    return this.featureCards.delete(id);
  }

  async reorderFeatureCard(id: string, direction: 'up' | 'down'): Promise<boolean> {
    const cards = Array.from(this.featureCards.values());
    const index = cards.findIndex(card => card.id === id);

    if (index === -1) {
      return false;
    }

    let newIndex = index + (direction === 'up' ? -1 : 1);

    if (newIndex < 0 || newIndex >= cards.length) {
      return false;
    }

    // Swap the cards in the array
    [cards[index], cards[newIndex]] = [cards[newIndex], cards[index]];

    // Update the map with the reordered cards
    this.featureCards.clear();
    cards.forEach(card => this.featureCards.set(card.id, card));

    return true;
  }
}

// Import MongoDB storage
import { MongoDBStorage } from './mongodb-storage';

// Use MongoDB storage for production
export const storage = new MongoDBStorage();