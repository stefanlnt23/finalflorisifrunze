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
- **Unified Green Background**: Extended hero section's green gradient background throughout entire page for consistent visual theme
- **Compact Transformation Section**: Completely redesigned from wide layout to compact card-based design with smaller, more manageable components
- **Reduced Visual Clutter**: Removed excessive emojis and icons from transformation buttons and labels for cleaner design
- **Simplified Toggle Controls**: Streamlined before/after toggle buttons with smaller, more professional styling
- **Enhanced Client Testimonials**: Reduced text sizes (lg/base instead of 2xl/xl) and integrated with green theme using backdrop blur
- **Better Typography Hierarchy**: Simplified section titles and removed redundant "double title" issues
- **Improved Image Sizing**: Optimized transformation images to 4:3 aspect ratio for better visual balance
- **Reading Experience Layout**: Transformed from compact cards to expansive article-style layout for immersive storytelling
- **Large Cinematic Images**: Wide aspect ratios (16:9 mobile, 21:9 desktop) for dramatic visual impact
- **Enhanced Spacing**: Generous padding and margins throughout for comfortable reading experience
- **Impact**: Magazine-style portfolio presentation with cinematic visuals, storytelling approach, and comfortable reading flow

### June 21, 2025 - Subscription Cards Layout Optimization  
- **Limited Card Display**: Restricted subscription cards to maximum 3 per row instead of 4 for better visual hierarchy
- **Enhanced Card Sizing**: Increased card dimensions and spacing for improved readability
- **Smart Feature Layout**: Implemented 2-column layout for subscription features when 6+ items present
- **Text Size Optimization**: Used smaller text (xs) and icons for dense feature lists to prevent overlapping
- **Vertical Stacking**: Changed from horizontal to vertical layout for feature names/values to eliminate text collision
- **Impact**: Better organized subscription presentation with no text overlapping and improved user experience

### June 21, 2025 - Before/After Section Enhancement
- **Enhanced Button Visibility**: Significantly enlarged before/after toggle buttons with improved design
- **Automatic Cycling**: Added 3-second auto-cycling between before/after states for dynamic presentation
- **Hover Pause Control**: Auto-cycling pauses when user hovers over transformation images
- **Visual Indicators**: Added clear "Auto ▶" and "Pauzat ⏸" status indicators
- **Multiple Interaction Methods**: Users can click anywhere on image or use dedicated control buttons
- **Improved Accessibility**: Larger buttons with emojis and better contrast for easier interaction
- **Click-to-Enlarge**: Added ImageLightbox functionality for viewing transformation images in full-screen modal
- **Larger Section Size**: Significantly increased section padding, image heights (500px min), and overall visual prominence
- **Impact**: More engaging portfolio experience with automatic showcasing, full-size viewing, and dramatically increased visual impact

### June 21, 2025 - Portfolio Filter Removal
- **Simplified Portfolio Navigation**: Removed service filter buttons from portfolio page
- **Direct Content Access**: Portfolio projects now display immediately without filtering interface
- **Cleaner Design**: Eliminated clutter from "Toate Proiectele" and service category buttons
- **Streamlined Experience**: Users can browse all completed projects without navigation complexity
- **Impact**: More direct portfolio viewing experience with immediate access to all project showcases

### June 21, 2025 - Services Page Layout Optimization
- **Improved Content Priority**: Moved services to top of page, benefits section moved to bottom
- **Better User Flow**: Services now appear immediately after hero section for faster discovery
- **Enhanced Navigation**: Users can quickly see available services without scrolling past features
- **Logical Content Structure**: Benefits section provides supporting information after main content
- **Impact**: Users can immediately access core service information, improving conversion rates

### June 21, 2025 - Appointment Form Optimization
- **Simplified User Experience**: Removed postal code requirement from appointment booking form
- **Smart Default Values**: Automatically provides default postal code "000000" to maintain backend compatibility
- **Reduced Form Complexity**: Users now have fewer required fields to complete appointments
- **Seamless Integration**: Changes maintain full API compatibility without requiring backend modifications
- **Mobile-First Approach**: Streamlined form works better on all device sizes
- **Impact**: Faster appointment booking process with improved user experience and reduced form abandonment

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