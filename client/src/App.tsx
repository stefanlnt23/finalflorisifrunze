import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Public Page imports
import Home from "@/pages/Home";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import BlogDetail from "@/pages/BlogDetail";
import Portfolio from "@/pages/Portfolio";
import PortfolioDetail from "@/pages/PortfolioDetail";
import Appointment from "@/pages/Appointment";

// Admin Page imports
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import FrontPage from './pages/admin/FrontPage';
import FeatureCards from './pages/admin/FeatureCards';

// Lazy load admin pages to improve initial load time
const AdminServices = React.lazy(() => import("@/pages/admin/Services"));
const AdminServicesForm = React.lazy(() => import("@/pages/admin/ServicesForm"));
const AdminPortfolio = React.lazy(() => import("@/pages/admin/Portfolio"));
const AdminPortfolioForm = React.lazy(() => import("@/pages/admin/PortfolioForm"));
const AdminTestimonials = React.lazy(() => import("@/pages/admin/Testimonials"));
const AdminTestimonialsForm = React.lazy(() => import("@/pages/admin/TestimonialsForm"));
const AdminBlogPosts = React.lazy(() => import("@/pages/admin/BlogPosts"));
const AdminBlogPostForm = React.lazy(() => import("@/pages/admin/BlogPostForm"));
const AdminInquiries = React.lazy(() => import("@/pages/admin/Inquiries"));
const AdminAppointments = React.lazy(() => import("@/pages/admin/Appointments"));
const AdminAppointmentsForm = React.lazy(() => import("@/pages/admin/AppointmentsForm"));
const AdminFrontPage = React.lazy(() => import("@/pages/admin/FrontPage"));
const AdminFeatureCards = React.lazy(() => import("@/pages/admin/FeatureCards"));

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/services/:id" component={ServiceDetail} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:id" component={BlogDetail} />
      <Route path="/contact" component={Contact} />
      <Route path="/appointment" component={Appointment} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/portfolio/:id" component={PortfolioDetail} />

      {/* Admin Routes */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />

      {/* Admin Services */}
      <Route path="/admin/services/new">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminServicesForm />
        </React.Suspense>
      </Route>
      <Route path="/admin/services/:id">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminServicesForm />
        </React.Suspense>
      </Route>
      <Route path="/admin/services">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminServices />
        </React.Suspense>
      </Route>

      {/* Admin Portfolio */}
      <Route path="/admin/portfolio/new">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminPortfolioForm />
        </React.Suspense>
      </Route>
      <Route path="/admin/portfolio/:id">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminPortfolioForm />
        </React.Suspense>
      </Route>
      <Route path="/admin/portfolio">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminPortfolio />
        </React.Suspense>
      </Route>

      {/* Admin Testimonials */}
      <Route path="/admin/testimonials/new">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminTestimonialsForm />
        </React.Suspense>
      </Route>
      <Route path="/admin/testimonials/:id">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminTestimonialsForm />
        </React.Suspense>
      </Route>
      <Route path="/admin/testimonials">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminTestimonials />
        </React.Suspense>
      </Route>
          <Route path="/admin/frontpage">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminFrontPage />
        </React.Suspense>
      </Route>
      <Route path="/admin/feature-cards">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminFeatureCards />
        </React.Suspense>
      </Route>

      {/* Admin Blog Posts */}
      <Route path="/admin/blog/new">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminBlogPostForm />
        </React.Suspense>
      </Route>
      <Route path="/admin/blog/:id">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminBlogPostForm />
        </React.Suspense>
      </Route>
      <Route path="/admin/blog">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminBlogPosts />
        </React.Suspense>
      </Route>

      {/* Admin Inquiries */}
      <Route path="/admin/inquiries">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminInquiries />
        </React.Suspense>
      </Route>

      {/* Admin Appointments */}
      <Route path="/admin/appointments/new">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminAppointmentsForm />
        </React.Suspense>
      </Route>
      <Route path="/admin/appointments/:id">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminAppointmentsForm />
        </React.Suspense>
      </Route>
      <Route path="/admin/appointments">
        <React.Suspense fallback={<div>Loading...</div>}>
          <AdminAppointments />
        </React.Suspense>
      </Route>



      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;