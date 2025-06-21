import React, { Suspense } from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useScrollRestoration } from "./hooks/use-scroll-restoration";

// Public Pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Portfolio from "./pages/Portfolio";
import PortfolioDetail from "./pages/PortfolioDetail";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import NotFound from "./pages/not-found";
import Appointment from "./pages/Appointment";
import Features from "./pages/Features";
import Docs from "./pages/Docs";
import Subscriptions from "./pages/Subscriptions";

// Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminServices = React.lazy(() => import('./pages/admin/Services'));
const AdminServicesForm = React.lazy(() => import('./pages/admin/ServicesForm'));
const AdminBlogPosts = React.lazy(() => import('./pages/admin/BlogPosts'));
const AdminBlogPostForm = React.lazy(() => import('./pages/admin/BlogPostForm'));
const AdminFeatureCards = React.lazy(() => import('./pages/admin/FeatureCards'));
const AdminPortfolio = React.lazy(() => import('./pages/admin/Portfolio'));
const AdminPortfolioForm = React.lazy(() => import('./pages/admin/PortfolioForm'));
const AdminAppointments = React.lazy(() => import('./pages/admin/Appointments'));
const AdminAppointmentsForm = React.lazy(() => import('./pages/admin/AppointmentsForm'));
const AdminFrontPage = React.lazy(() => import('./pages/admin/FrontPage'));
const AdminInquiries = React.lazy(() => import('./pages/admin/Inquiries'));
const AdminTestimonials = React.lazy(() => import('./pages/admin/Testimonials'));
const AdminTestimonialsForm = React.lazy(() => import('./pages/admin/TestimonialsForm'));
const AdminSubscriptions = React.lazy(() => import('./pages/admin/Subscriptions'));
const AdminSubscriptionsForm = React.lazy(() => import('./pages/admin/SubscriptionsForm'));
const AdminLogin = React.lazy(() => import('./pages/admin/Login'));

function Router() {
  // Use the scroll restoration hook
  useScrollRestoration();
  
  return (
    <AuthProvider>
      <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading...</div>}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/services" component={Services} />
          <Route path="/services/:id" component={ServiceDetail} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/portfolio/:id" component={PortfolioDetail} />
          <Route path="/about" component={About} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:id" component={BlogDetail} />
          <Route path="/contact" component={Contact} />
          <Route path="/appointment" component={Appointment} />
          <Route path="/features" component={Features} />
          <Route path="/docs" component={Docs} />
          <Route path="/subscriptions" component={Subscriptions} />

          {/* Admin routes */}
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin/dashboard">
            <ProtectedRoute component={AdminDashboard} />
          </Route>
          <Route path="/admin/services">
            <ProtectedRoute component={AdminServices} />
          </Route>
          <Route path="/admin/services/new">
            <ProtectedRoute component={AdminServicesForm} />
          </Route>
          <Route path="/admin/services/:id/edit">
            <ProtectedRoute component={AdminServicesForm} />
          </Route>
          <Route path="/admin/blog">
            <ProtectedRoute component={AdminBlogPosts} />
          </Route>
          <Route path="/admin/blog/new">
            <ProtectedRoute component={AdminBlogPostForm} />
          </Route>
          <Route path="/admin/blog/:id/edit">
            <ProtectedRoute component={AdminBlogPostForm} />
          </Route>
          <Route path="/admin/blog/:id">
            <ProtectedRoute component={AdminBlogPostForm} />
          </Route>
          <Route path="/admin/feature-cards">
            <ProtectedRoute component={AdminFeatureCards} />
          </Route>
          <Route path="/admin/portfolio">
            <ProtectedRoute component={AdminPortfolio} />
          </Route>
          <Route path="/admin/portfolio/new">
            <ProtectedRoute component={AdminPortfolioForm} />
          </Route>
          <Route path="/admin/portfolio/:id/edit">
            <ProtectedRoute component={AdminPortfolioForm} />
          </Route>
          <Route path="/admin/appointments">
            <ProtectedRoute component={AdminAppointments} />
          </Route>
          <Route path="/admin/appointments/:id">
            <ProtectedRoute component={AdminAppointmentsForm} />
          </Route>
          <Route path="/admin/frontpage">
            <ProtectedRoute component={AdminFrontPage} />
          </Route>
          <Route path="/admin/inquiries">
            <ProtectedRoute component={AdminInquiries} />
          </Route>
          <Route path="/admin/testimonials">
            <ProtectedRoute component={AdminTestimonials} />
          </Route>
          <Route path="/admin/testimonials/new">
            <ProtectedRoute component={AdminTestimonialsForm} />
          </Route>
          <Route path="/admin/testimonials/:id/edit">
            <ProtectedRoute component={AdminTestimonialsForm} />
          </Route>
          <Route path="/admin/testimonials/:id">
            <ProtectedRoute component={AdminTestimonialsForm} />
          </Route>
          <Route path="/admin/subscriptions">
            <ProtectedRoute component={AdminSubscriptions} />
          </Route>
          <Route path="/admin/subscriptions/new">
            <ProtectedRoute component={AdminSubscriptionsForm} />
          </Route>
          <Route path="/admin/subscriptions/:id/edit">
            <ProtectedRoute component={AdminSubscriptionsForm} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Suspense>
      <Toaster />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}
