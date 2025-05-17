
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Configuration parameters
interface BlogPublisherConfig {
  baseUrl: string;
  credentials: {
    email: string;
    password: string;
  };
  authToken?: string;
}

// Section types that match your blog schema
type TextSection = {
  type: 'text';
  content: string;
  alignment: 'left' | 'center' | 'right';
};

type ImageSection = {
  type: 'image';
  imageUrl: string;
  caption?: string;
  alignment: 'left' | 'center' | 'right';
};

type QuoteSection = {
  type: 'quote';
  content: string;
  caption?: string;
};

type HeadingSection = {
  type: 'heading';
  content: string;
  level: 2 | 3 | 4;
};

type ListSection = {
  type: 'list';
  items: string[];
};

type BlogSection = TextSection | ImageSection | QuoteSection | HeadingSection | ListSection;

// Blog post structure
interface BlogPost {
  title: string;
  excerpt: string;
  content?: string;
  imageUrl?: string;
  tags?: string[];
  sections: BlogSection[];
  publishedAt?: Date;
}

/**
 * BlogPublisher class to handle authentication and blog post creation
 */
class BlogPublisher {
  private config: BlogPublisherConfig;
  private api: ReturnType<typeof axios.create>;
  
  /**
   * Initialize the blog publisher
   * @param config Configuration including base URL and credentials
   */
  constructor(config: BlogPublisherConfig) {
    this.config = config;
    
    // Create axios instance with base URL
    this.api = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  /**
   * Authenticate with the API
   * @returns Promise resolving to authentication status
   */
  async authenticate(): Promise<boolean> {
    try {
      console.log(`Authenticating as ${this.config.credentials.email}...`);
      const response = await this.api.post('/api/admin/login', this.config.credentials);
      
      if (response.status === 200 && response.data.token) {
        this.config.authToken = response.data.token;
        
        // Set the auth token for all future requests
        this.api.defaults.headers.common['Authorization'] = `Bearer ${this.config.authToken}`;
        
        console.log('Authentication successful!');
        return true;
      } else {
        console.error('Authentication failed:', response.data.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error.response?.data?.message || error.message);
      return false;
    }
  }
  
  /**
   * Create a new blog post
   * @param blogPost Blog post data
   * @returns Promise resolving to the created blog post
   */
  async createBlogPost(blogPost: BlogPost): Promise<any> {
    try {
      if (!this.config.authToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          throw new Error('Authentication required before creating a blog post');
        }
      }
      
      // Prepare the data for submission
      const now = new Date();
      const submissionData = {
        ...blogPost,
        content: this.generateCombinedContent(blogPost.sections),
        imageUrl: blogPost.imageUrl || null,
        authorId: 1, // Default author ID
        publishedAt: blogPost.publishedAt ? blogPost.publishedAt.toISOString() : now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        sections: blogPost.sections,
        tags: blogPost.tags || []
      };
      
      console.log(`Creating blog post: ${blogPost.title}`);
      console.log('Data being sent:', JSON.stringify(submissionData, null, 2));
      
      const response = await this.api.post('/api/admin/blog', submissionData);
      
      if (response.status === 200) {
        console.log(`Successfully created blog post: ${blogPost.title}`);
        return response.data.blogPost;
      } else {
        throw new Error(`Failed to create blog post: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error creating blog post:', error.response?.data || error.message);
      throw error;
    }
  }
  
  /**
   * Generate combined content from all text sections (for backward compatibility)
   * @param sections Array of blog sections
   * @returns Combined text content
   */
  private generateCombinedContent(sections: BlogSection[]): string {
    let combinedContent = '';
    
    sections.forEach(section => {
      if (section.type === 'text') {
        combinedContent += section.content + '\n\n';
      } else if (section.type === 'heading') {
        combinedContent += section.content + '\n\n';
      }
    });
    
    return combinedContent.trim();
  }
  
  /**
   * Update an existing blog post
   * @param id Blog post ID
   * @param blogPost Blog post data to update
   * @returns Promise resolving to the updated blog post
   */
  async updateBlogPost(id: string, blogPost: Partial<BlogPost>): Promise<any> {
    try {
      if (!this.config.authToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          throw new Error('Authentication required before updating a blog post');
        }
      }
      
      // Prepare the data for submission
      const now = new Date();
      const submissionData = {
        ...blogPost,
        updatedAt: now.toISOString(),
      };
      
      // If sections are provided, regenerate the content field
      if (blogPost.sections) {
        submissionData.content = this.generateCombinedContent(blogPost.sections);
      }
      
      console.log(`Updating blog post with ID: ${id}`);
      
      const response = await this.api.put(`/api/admin/blog/${id}`, submissionData);
      
      if (response.status === 200) {
        console.log(`Successfully updated blog post: ${id}`);
        return response.data.blogPost;
      } else {
        throw new Error(`Failed to update blog post: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error updating blog post:', error.response?.data || error.message);
      throw error;
    }
  }
  
  /**
   * Delete a blog post
   * @param id Blog post ID
   * @returns Promise resolving to success status
   */
  async deleteBlogPost(id: string): Promise<boolean> {
    try {
      if (!this.config.authToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          throw new Error('Authentication required before deleting a blog post');
        }
      }
      
      console.log(`Deleting blog post with ID: ${id}`);
      
      const response = await this.api.delete(`/api/admin/blog/${id}`);
      
      if (response.status === 200) {
        console.log(`Successfully deleted blog post: ${id}`);
        return true;
      } else {
        throw new Error(`Failed to delete blog post: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error deleting blog post:', error.response?.data || error.message);
      throw error;
    }
  }
  
  /**
   * Load a blog post from a JSON file
   * @param filePath Path to the JSON file
   * @returns BlogPost object
   */
  static loadBlogFromFile(filePath: string): BlogPost {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent) as BlogPost;
    } catch (error) {
      throw new Error(`Failed to load blog post from file: ${error.message}`);
    }
  }
  
  /**
   * Save a blog post to a JSON file
   * @param blogPost Blog post data
   * @param filePath Path to save the JSON file
   */
  static saveBlogToFile(blogPost: BlogPost, filePath: string): void {
    try {
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      fs.writeFileSync(filePath, JSON.stringify(blogPost, null, 2), 'utf8');
      console.log(`Blog post saved to ${filePath}`);
    } catch (error) {
      throw new Error(`Failed to save blog post to file: ${error.message}`);
    }
  }
  
  /**
   * Create blog sections helper functions
   */
  
  // Text section
  static createTextSection(content: string, alignment: 'left' | 'center' | 'right' = 'left'): TextSection {
    return {
      type: 'text',
      content,
      alignment
    };
  }
  
  // Image section
  static createImageSection(
    imageUrl: string, 
    caption?: string, 
    alignment: 'left' | 'center' | 'right' = 'center'
  ): ImageSection {
    return {
      type: 'image',
      imageUrl,
      caption,
      alignment
    };
  }
  
  // Quote section
  static createQuoteSection(content: string, caption?: string): QuoteSection {
    return {
      type: 'quote',
      content,
      caption
    };
  }
  
  // Heading section
  static createHeadingSection(content: string, level: 2 | 3 | 4 = 2): HeadingSection {
    return {
      type: 'heading',
      content,
      level
    };
  }
  
  // List section
  static createListSection(items: string[]): ListSection {
    return {
      type: 'list',
      items
    };
  }
}

/**
 * Example usage of the BlogPublisher class
 */
async function example() {
  // Configure the blog publisher
  const config: BlogPublisherConfig = {
    baseUrl: 'http://localhost:5000', // Change to your API URL
    credentials: {
      email: 'admin@example.com', // Change to your admin email
      password: 'your-password' // Change to your admin password
    }
  };
  
  const publisher = new BlogPublisher(config);
  
  // Create a sample blog post with various section types
  const blogPost: BlogPost = {
    title: 'Complete Guide to Organic Gardening',
    excerpt: 'Learn the essential techniques for successful organic gardening with our comprehensive guide.',
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
    tags: ['organic', 'gardening', 'sustainability', 'plants'],
    sections: [
      // Introduction
      BlogPublisher.createHeadingSection('Introduction to Organic Gardening'),
      BlogPublisher.createTextSection(
        'Organic gardening is more than just avoiding synthetic chemicals; it\'s about creating a sustainable ecosystem in your garden that works with nature rather than against it. This guide will walk you through the essential principles and techniques to create a thriving organic garden.'
      ),
      
      // Image section
      BlogPublisher.createImageSection(
        'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
        'A beautiful organic vegetable garden with diverse crops',
        'center'
      ),
      
      // Principles section
      BlogPublisher.createHeadingSection('Core Principles of Organic Gardening', 3),
      BlogPublisher.createTextSection(
        'Understanding these fundamental principles will help you create a garden that\'s not only productive but also environmentally sustainable and healthy.'
      ),
      BlogPublisher.createListSection([
        'Build healthy soil with compost and natural amendments',
        'Encourage biodiversity to maintain ecological balance',
        'Use natural pest control methods',
        'Practice water conservation',
        'Choose organic and heirloom seeds'
      ]),
      
      // Soil section
      BlogPublisher.createHeadingSection('Building Healthy Soil', 3),
      BlogPublisher.createTextSection(
        'The foundation of organic gardening is healthy, living soil. Rich, well-balanced soil teeming with microorganisms provides plants with all the nutrients they need to thrive.',
        'left'
      ),
      BlogPublisher.createQuoteSection(
        'Feed the soil, not the plants. When you build healthy soil, you grow healthy plants that are more resistant to pests and diseases.',
        'Organic Gardening Principle'
      ),
      
      // Conclusion
      BlogPublisher.createHeadingSection('Conclusion'),
      BlogPublisher.createTextSection(
        'Organic gardening is a journey of continuous learning and adaptation. By working with nature and following these principles, you can create a beautiful, productive garden that provides healthy food and supports the environment. Start small, observe closely, and enjoy the rewarding process of growing your own organic produce.'
      )
    ]
  };
  
  try {
    // Authenticate first
    await publisher.authenticate();
    
    // Create the blog post
    const createdBlog = await publisher.createBlogPost(blogPost);
    console.log('Created blog post ID:', createdBlog.id);
    
    // Optionally save the blog post structure to a file
    BlogPublisher.saveBlogToFile(blogPost, './blog-examples/organic-gardening.json');
    
  } catch (error) {
    console.error('Failed to publish blog:', error);
  }
}

// Uncomment to run the example:
// example();

// Export the BlogPublisher class
export default BlogPublisher;
