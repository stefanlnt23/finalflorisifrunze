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

## Recent Changes

### June 21, 2025 - Portfolio Details Page Complete Redesign
- **Modern Hero Section**: Replaced full-screen layout with optimized height hero section featuring gradient background
- **Enhanced Typography**: Improved title and description sizing for better readability and visual hierarchy
- **Interactive Gallery**: Added image navigation with arrows, thumbnails, and counter display
- **Professional Layout**: Clean project statistics cards with icons and hover effects
- **Enhanced Transformations**: Larger, more readable transformation descriptions with improved styling
- **User Engagement**: Added interactive features like heart button and share functionality
- **Responsive Design**: Optimized spacing and layout for all device sizes
- **Two-Column Integration**: Moved project details and gallery into green hero background, eliminating duplicate sections
- **Image Enlargement**: Added click-to-enlarge functionality for all gallery images with modal viewing
- **Impact**: Transformed basic portfolio layout into engaging, magazine-style presentation without tabs, with efficient space usage

### June 21, 2025 - Brand Logo, Navigation, and Contact Updates
- **Complete Logo Replacement**: Created and deployed new "Flori si Frunze" SVG logo with gardening design elements
- **Logo Assets**: Added enhanced `logo.svg` (240x70px) and `logo-mobile.svg` (180x55px) with larger, more visible elements
- **Consistent Branding**: Updated all logo instances across header, navigation, and footer components
- **Design Elements**: Features green color scheme with gardening icons and Romanian subtitle
- **Mobile Logo Fix**: Resolved duplicate logo issue on mobile devices by hiding header logo on small screens
- **Navigation Improvements**: Enhanced responsive navigation with better spacing, centered layout, and improved hover states
- **Contact Information**: Added official contact number +40 742 650 670 to contact page and WhatsApp button
- **Impact**: Professional, cohesive branding with optimal visibility and complete contact information across all devices

### June 21, 2025 - Image Caching Optimization
- **Critical Fix**: Resolved major image caching issues affecting carousel performance
- **CachedImage Component**: Complete rewrite using browser-native caching instead of localStorage
- **Performance Features**: Added Intersection Observer for lazy loading and priority loading for critical images
- **Service Worker**: Implemented aggressive resource caching for images and API responses
- **Resource Hints**: Added preconnect, dns-prefetch, and prefetch directives for faster loading
- **Server Headers**: Enhanced API endpoints with proper cache control headers
- **Impact**: Images now cache properly, eliminating reload issues on carousel/slider components

### Components Updated
- `client/src/components/ui/cached-image.tsx` - Complete rewrite
- `client/src/components/ui/home-carousel.tsx` - Updated to use new caching
- `client/src/components/ui/services-carousel.tsx` - Updated to use new caching
- `client/src/components/sections/FeaturesSection.tsx` - Updated to use new caching
- `server/routes.ts` - Added cache headers and new API endpoints
- `client/sw.js` - New service worker for advanced caching
- `client/index.html` - Added resource hints for performance
- `client/src/main.tsx` - Service worker registration

## Changelog

- June 21, 2025. Initial setup
- June 21, 2025. Major image caching optimization implemented

## User Preferences

Preferred communication style: Simple, everyday language.