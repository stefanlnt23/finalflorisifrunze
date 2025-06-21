# Green Garden Services - Repository Overview

## Overview

Green Garden Services is a full-stack web application for a professional gardening and landscaping company. The application serves as both a customer-facing website and an admin management system. It's built as a modern single-page application with a Node.js backend API.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: MongoDB with Mongoose ODM (configured to support both MongoDB and PostgreSQL through Drizzle)
- **Authentication**: JWT-based authentication system
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Deployment**: Configured for both Replit and Vercel deployment

### Dual Database Support
The application is architected to support both MongoDB (currently active) and PostgreSQL:
- MongoDB is used for production with Mongoose schemas
- Drizzle ORM is configured for PostgreSQL migration path
- Storage interface abstracts database operations for easy switching

## Key Components

### Frontend Architecture
- **Component Structure**: Modular React components with TypeScript
- **Layout System**: MainLayout for public pages, AdminLayout for admin interface
- **UI Components**: Comprehensive shadcn/ui component library integration
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **API Design**: RESTful API with Express.js
- **Authentication Middleware**: JWT token validation for protected routes
- **Storage Layer**: Abstracted storage interface supporting multiple databases
- **File Organization**: Modular structure with separate route handlers
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Admin System
- **Role-based Access**: Admin and staff user roles
- **Content Management**: Full CRUD operations for all content types
- **Dashboard**: Overview of key metrics and recent activity
- **Bulk Operations**: Support for bulk actions on content items

## Data Flow

### Authentication Flow
1. User login via admin interface
2. JWT token generation and storage
3. Token validation on protected routes
4. Role-based authorization for admin functions

### Content Management Flow
1. Admin creates/edits content through forms
2. Data validation using Zod schemas
3. API endpoints handle CRUD operations
4. Database updates with immediate UI refresh
5. Public pages display updated content

### Public Website Flow
1. Static content served from database
2. Dynamic content fetched via React Query
3. Form submissions processed through API
4. Email notifications for inquiries and appointments

### Core Entities
- **Services**: Garden and landscaping services offered
- **Portfolio**: Project showcase with before/after images
- **Blog Posts**: Content marketing with structured sections
- **Appointments**: Customer booking system
- **Inquiries**: Contact form submissions
- **Testimonials**: Customer reviews and feedback
- **Subscriptions**: Service packages and pricing tiers

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18 with TypeScript support
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: jsonwebtoken for JWT handling
- **Validation**: Zod for schema validation
- **UI Components**: Extensive Radix UI component collection
- **Styling**: Tailwind CSS with custom configuration
- **Build Tools**: Vite for fast development and optimized builds

### Development Tools
- **TypeScript**: Full type safety across the stack
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind
- **Date Handling**: date-fns for date manipulation

### External Services
- **Image Hosting**: Unsplash for demo images (configurable for other services)
- **Font Icons**: Font Awesome for iconography
- **Deployment**: Vercel and Replit deployment configurations

## Deployment Strategy

### Multi-Platform Deployment
- **Replit**: Development and prototyping environment
- **Vercel**: Production deployment with serverless functions
- **Environment Flexibility**: Environment-specific configurations

### Build Process
1. TypeScript compilation for both client and server
2. Vite builds optimized frontend bundle
3. ESBuild processes server code for production
4. Static assets optimized and cached
5. Deployment via platform-specific configurations

### Environment Configuration
- **Development**: Local MongoDB with hot reloading
- **Production**: MongoDB Atlas with optimized builds
- **Security**: Environment-based JWT secrets and database credentials

## Changelog

- June 21, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.