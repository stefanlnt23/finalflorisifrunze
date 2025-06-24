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

### June 23, 2025 - Video Background Implementation and Deployment Fix
- **Dual Page Video Integration**: Successfully implemented gardencut.mp4 as autoplay background video for both Home and Services page hero sections
- **Advanced Performance Optimization**: Enhanced video performance with hardware acceleration (translate3d, backface-visibility, perspective), lazy loading (preload="none"), and optimized event handling
- **Mobile-First Optimization**: Added webkit-playsinline attributes, optimized touch interactions, and reduced memory usage with strategic event listener cleanup
- **Smart Loading Strategy**: Implemented delayed autoplay (100ms) to ensure smooth rendering, single-use event listeners ({ once: true }), and timeout cleanup for better resource management
- **CSS Performance Enhancements**: Added global video optimizations including image-rendering optimizations, containment properties, and hardware acceleration classes
- **Responsive Design**: Both hero sections optimized to 70vh with 600px minimum height for consistent visual proportions across devices
- **Enhanced Text Readability**: Implemented layered approach with video at z-index 0, fallback images at z-index -1, overlay at z-index 2, and content at z-index 10
- **Robust Fallback System**: Services page maintains original lawn mowing image fallback while Home page uses gradient fallback for unsupported devices
- **Production Deployment Fix**: Resolved CORS and video serving issues in production by migrating from local hosting to Cloudinary CDN
- **Cloudinary Integration**: Migrated video hosting to Cloudinary CDN (dyrmghrbm cloud) for reliable cross-platform delivery
- **CDN Video URL**: Updated both pages to use https://res.cloudinary.com/dyrmghrbm/video/upload/gardencut_xiwbj3.mp4 for consistent playback
- **Enhanced CORS Configuration**: Added comprehensive CORS headers and cache prevention to eliminate external resource conflicts
- **Cache Busting Implementation**: Added timestamp-based cache busting parameters and service worker updates to prevent cached external URL conflicts
- **Event-Driven Loading**: Optimized video loading system with minimal event listeners, silent error handling, and automatic hardware acceleration triggers
- **Content Preservation**: All existing hero content maintained with proper z-index layering and enhanced typography for video overlay compatibility
- **Mobile Layout Fix**: Fixed carousel overlap with "Transformă Grădina Ta" text on mobile by increasing top padding (pt-32) for mobile devices while maintaining desktop spacing (md:py-20)
- **Company Credit Addition**: Added Web-force.info developer credit to footer with proper styling and external link
- **Enhanced Animated Fallback**: Replaced static gradient with rich animated green background featuring floating garden elements, emoji animations, and geometric patterns
- **Custom Float Animations**: Added CSS keyframe animations for floating elements with different speeds and delays for natural movement
- **Mobile-Optimized Design**: Beautiful animated fallback specifically designed for phones where video might not load properly
- **Impact**: Professional cinematic background effect across key pages with optimized performance, deployment compatibility, enhanced mobile experience with engaging animated fallbacks

### June 22, 2025 - Email Address Update
- **Contact Information Standardization**: Updated email address from contact@florisifrunze.com to info@florisifrunze.com across all website components
- **Consistent Brand Identity**: Ensured unified contact information across ServiceDetail page, Contact page, and footer
- **Impact**: Professional consistency in all customer-facing contact information

### June 22, 2025 - About Page Complete Redesign
- **MainLayout Integration**: Fixed footer display issue by properly wrapping About page in MainLayout component
- **Reduced Visual Density**: Decreased section padding from py-20/py-32 to py-16/py-24 for less zoomed-in appearance
- **Team Section Redesign**: Replaced individual team member photos with expertise areas showcasing specialization domains
- **Floating Garden Animations**: Added animated background elements (leaves, flowers, trees, sun) with different timing delays using custom CSS animations
- **Professional Team Summary**: Created unified team card highlighting 8 specialists with combined experience statistics
- **Functional Navigation**: Added working CTA buttons linking to contact and services pages
- **Enhanced Visual Hierarchy**: Maintained professional design with proper spacing and improved readability
- **Impact**: Complete About page transformation with engaging animations, professional team presentation, and proper footer integration

### June 22, 2025 - Contact Page Complete UI/UX Redesign and Enhancement
- **Enhanced Form Validation**: Upgraded validation schema with Romanian error messages, character limits, and real-time feedback with character counters
- **Improved Visual Hierarchy**: Redesigned page header with trust signals (24h response, 4.9/5 rating, free consultation) and prominent contact statistics
- **Quick Action Buttons**: Added prominent call-to-action cards for phone, WhatsApp, and scheduling with hover animations and direct links
- **Balanced Layout Design**: Restructured to 2:1 column ratio with form taking more space and enhanced contact information sidebar
- **Enhanced Contact Information**: Redesigned contact cards with larger icons, badges for response times, and improved visual styling
- **Service Area Information**: Added comprehensive service coverage details with radius information and transport cost inclusion
- **Trust Building Elements**: Integrated testimonial snippet with 5-star rating and authentic client quote for social proof
- **Interactive Map Integration**: Enhanced map section with custom overlay buttons, location details, transportation options, and service radius visualization
- **Emergency Contact Options**: Added urgent contact information and 24/7 availability notice for emergency garden situations
- **Mobile Optimization**: Improved mobile responsiveness with larger touch targets, stacked layouts, and finger-friendly button sizing
- **Anti-Spam Protection**: Added security notice and form protection indicators to build user trust
- **Enhanced Success States**: Redesigned form success message with additional contact options and clear next steps
- **Social Media Integration**: Updated social media links with platform-specific styling and improved accessibility
- **Business Hours Enhancement**: Added detailed schedule with emergency contact information and prominent display
- **Impact**: Professional, conversion-focused contact experience with clear value propositions, multiple contact methods, and comprehensive location information

### June 22, 2025 - Subscription Page Complete UI/UX Redesign
- **Enhanced Value Propositions**: Redesigned top benefits section with prominent cards, icons, and enhanced messaging (Fără Angajament, 500+ Clienți, Răspuns în 24h)
- **Improved Pricing Cards**: Larger, bolder price typography (5xl font-black) with standardized 4-feature display and enhanced "Perfect pentru" sections with color-coded backgrounds
- **Prominent Popular Badge**: Redesigned "RECOMANDAT" badge with orange-red gradient, larger size, and animation for maximum visibility
- **Enhanced CTA Buttons**: Improved button text ("Alege Planul" vs "Începe Acum") with hover scaling effects and better visual feedback
- **Interactive Comparison Tabs**: Completely redesigned tab system with proper button styling, brand colors (green/blue/orange), hover effects, and 44px minimum touch targets for mobile
- **Icon-Enhanced Comparison Tables**: Added meaningful icons (Scissors, Leaf, Shield, Users, etc.) to all comparison features instead of simple colored dots
- **Multiple Testimonials**: Replaced single testimonial with three short testimonials plus social proof statistics (4.9/5 rating, 500+ clients, 98% recommendation rate)
- **Improved Visual Hierarchy**: Better spacing, information density, and mobile responsiveness throughout all sections
- **Customer-Friendly Language**: Enhanced feature descriptions and value propositions with specific garden size recommendations
- **Impact**: Professional, conversion-focused subscription page with clear interactive elements, reduced cognitive load, and crystal-clear value propositions for each plan

### June 22, 2025 - Service Details Page Desktop Optimization
- **Desktop Layout Optimization**: Expanded max-width to 7xl (1280px) for better screen space utilization on large displays
- **Typography Scaling**: Implemented responsive font sizing with smaller desktop typography and proper mobile-first scaling using lg: breakpoints
- **Enhanced Gallery Presentation**: Redesigned PhotoAlbum to use 60% width (3/5 columns) with minimum 400px height for prominent image display
- **Improved Information Density**: Reduced excessive padding and margins throughout all sections, showing more content above the fold
- **Better Grid Systems**: Upgraded to 4-column layouts on xl breakpoints for benefits, includes, and portfolio sections
- **Compact Component Design**: Scaled down icons, spacing, and padding specifically for desktop while maintaining mobile responsiveness
- **Professional Desktop Feel**: Eliminated "zoomed in" feeling by optimizing element sizing and spacing ratios for larger screens
- **Hero Section Enhancement**: Reduced vertical padding and implemented better proportional scaling for desktop viewing
- **Content Width Utilization**: All sections now use full available width effectively without feeling cramped on desktop displays
- **Impact**: Professional desktop experience with better space utilization, appropriate sizing, and enhanced visual hierarchy while maintaining full mobile responsiveness

### June 22, 2025 - Modern Services Grid Layout Complete Redesign
- **Enhanced Card Design**: Upgraded to rounded-2xl cards with modern shadows and hover effects including scale transforms and vertical translation
- **Modern Gradient Overlays**: Replaced solid dark overlays with sophisticated green gradient overlays (from-green-900/80 via-green-700/40 to-transparent) for better image visibility
- **Typography Improvements**: Enhanced titles to text-3xl font-black with improved text shadows for maximum prominence and readability
- **Interactive Elements**: Added comprehensive micro-interactions including hover scaling, button ripple effects, and gradient glow animations
- **Reduced Text Density**: Shortened descriptions from 150 to 80 characters with improved line spacing for better readability
- **Enhanced Button Design**: Redesigned buttons with full-width layout, animated icons, gradient backgrounds, and improved visual feedback
- **Progress Indicators**: Added floating stats badges with "10+ ani" experience indicators and floating animations
- **Service Highlights**: Integrated guarantee and eco-friendly badges with icons for quick service feature identification
- **Modern Color Accents**: Added bright green accent lines and emerald color gradients throughout the design
- **Card Proportions**: Increased card height to 72 (from 64) and improved content spacing for better breathing room
- **CSS Enhancements**: Implemented custom micro-interactions including floating animations, gradient glows, and button ripple effects
- **Impact**: Complete transformation from basic service cards to modern, interactive design with professional visual hierarchy and enhanced user engagement

### June 21, 2025 - Subscription Feature Language Standardization
- **Language Consistency**: Standardized all subscription feature values to "Inclus" (Romanian) replacing mixed "Included" (English) text
- **Database Cleanup**: Removed duplicate "Included:" text from feature names across all subscriptions
- **Data Transformation**: Updated server logic to ensure all new subscriptions use consistent Romanian language
- **Impact**: Professional Romanian-only subscription display with clean feature names and consistent value formatting

### June 21, 2025 - Browser Cache Busting Implementation
- **Server Cache Headers**: Added aggressive cache prevention headers to all API routes preventing browser caching
- **Development Cache Busting**: Implemented timestamp and random parameter injection for all API requests during development
- **Service Worker Control**: Disabled service worker registration in development mode to prevent caching conflicts
- **Query Client Updates**: Enhanced React Query with cache-busting parameters and no-cache fetch options
- **Dynamic Versioning**: Service worker now uses timestamp-based versioning for proper cache invalidation
- **Impact**: Changes to website content now appear immediately in browsers without requiring cache clearing or new browsers

### June 21, 2025 - Subscription CRUD Operations Complete Fix
- **MongoDB Import Resolution**: Fixed all `require()` statements causing edit functionality to fail by converting to proper ES6 imports using statically imported ObjectId
- **Individual Subscription Fetching**: Admin endpoint now successfully retrieves and transforms subscription data for edit forms
- **Feature Data Transformation**: Subscription features properly converted from MongoDB string format to form-compatible object format with name/value pairs
- **Authentication System Working**: JWT token validation working correctly for all admin subscription operations
- **Edit Form Data Loading**: Subscription edit forms now populate with existing data instead of showing empty fields
- **Delete Operations Fixed**: Subscription deletion now works without import errors and updates database correctly
- **Complete CRUD Functionality**: All subscription operations (Create, Read, Update, Delete) now work seamlessly through admin interface
- **Impact**: Full subscription management system operational - users can create, edit, update, and delete subscription plans with proper data persistence

### June 21, 2025 - Gallery Image Issue Fix
- **Removed Hardcoded Images**: Eliminated problematic hardcoded Unsplash URLs from ServiceDetail component
- **Authentic Gallery Content**: Services now display only their own database images and main imageUrl
- **Broken URL Resolution**: Fixed issue where broken Unsplash URL was appearing in all service galleries
- **PhotoAlbum Validation**: Enhanced with robust image validation that filters out non-loading URLs
- **Improved Height**: Increased PhotoAlbum dimensions with better responsive aspect ratios
- **Impact**: Each service now shows unique, working images with no empty thumbnails or broken URLs

### June 21, 2025 - Security Audit and Console Log Removal
- **Production Security**: Removed all console.log statements from subscription endpoints to prevent sensitive data exposure
- **Error Handling**: Replaced detailed error messages with generic responses in public API endpoints
- **Debug Information**: Eliminated logging of subscription data, features, and database details in production
- **Silent Error Handling**: Database errors now handled silently without exposing system internals
- **Impact**: Enhanced security by preventing sensitive business data from appearing in browser console logs

### June 21, 2025 - Service Worker MIME Type Fix
- **MIME Type Configuration**: Fixed Service Worker registration by serving sw.js with correct application/javascript content type
- **Browser Security**: Resolved browser rejection of Service Worker due to incorrect text/html MIME type
- **Caching Optimization**: Service Worker now properly handles image and API response caching
- **Impact**: Enhanced performance through working Service Worker functionality

### June 21, 2025 - Domain Configuration Fix
- **WWW Redirect Setup**: Added Express middleware to handle www.florisifrunze.com requests for Replit deployment
- **SEO Optimization**: Configured 301 permanent redirect from www subdomain to main domain
- **User Experience**: Both florisifrunze.com and www.florisifrunze.com now work seamlessly
- **Impact**: Improved domain accessibility and professional URL handling

### June 21, 2025 - Portfolio Details Page Complete Redesign with White Elements
- **Unified Green Background**: Extended hero section's green gradient background throughout entire page for consistent visual theme
- **Reading Experience Layout**: Transformed from compact cards to expansive article-style layout for immersive storytelling
- **Large Cinematic Images**: Wide aspect ratios (16:9 mobile, 21:9 desktop) for dramatic visual impact
- **Enhanced Spacing**: Generous padding and margins throughout for comfortable reading experience
- **White Gardening Animations**: Added floating white garden icons (Leaf, Flower2, TreePine, Sprout, Sun) with subtle animations to break up green monotone
- **White Decorative Elements**: Enhanced headers and cards with white/transparent borders, icons, and accent lines
- **Animated Garden Icons**: Floating elements with pulse and bounce animations at different delays for dynamic visual interest
- **White Section Accents**: Added white garden-themed decorative trails and borders throughout transformation cards
- **Enhanced Visual Hierarchy**: White elements provide visual breaks and improve readability against green background
- **Impact**: Magazine-style portfolio presentation with cinematic visuals, white gardening animations, and balanced color scheme preventing green monotone

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