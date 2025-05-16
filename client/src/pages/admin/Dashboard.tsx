import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  
  // Check if user should be redirected to login page
  // This is a simple check since we don't have proper auth in this demo
  useEffect(() => {
    // In a real app, you would check for session/token validity
    // For demo purposes, we're assuming anyone who reaches this page is authenticated
  }, []);

  // Fetch data
  const { data: servicesData } = useQuery({
    queryKey: ['/api/services'],
    refetchOnWindowFocus: false,
  });
  
  const { data: appointmentsData } = useQuery({
    queryKey: ['/api/admin/appointments'],
    refetchOnWindowFocus: false,
  });
  
  const { data: inquiriesData } = useQuery({
    queryKey: ['/api/admin/inquiries'],
    refetchOnWindowFocus: false,
  });

  // Count data
  const services = servicesData?.services || [];
  const appointments = appointmentsData?.appointments || [];
  const inquiries = inquiriesData?.inquiries || [];
  
  // Recent data
  const recentAppointments = [...appointments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);
  
  const recentInquiries = [...inquiries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  // Admin navigation items
  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "fas fa-chart-line" },
    { label: "Services", path: "/admin/services", icon: "fas fa-tools" },
    { label: "Portfolio", path: "/admin/portfolio", icon: "fas fa-images" },
    { label: "Appointments", path: "/admin/appointments", icon: "fas fa-calendar-alt" },
    { label: "Inquiries", path: "/admin/inquiries", icon: "fas fa-envelope" },
    { label: "Blog Posts", path: "/admin/blog", icon: "fas fa-blog" },
    { label: "Testimonials", path: "/admin/testimonials", icon: "fas fa-star" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-400 rounded-md flex items-center justify-center">
              <i className="fas fa-leaf text-white text-lg"></i>
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">
              Green Garden
            </span>
          </div>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    location === item.path 
                      ? "bg-green-50 text-green-700" 
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                  }`}>
                    <i className={`${item.icon} mr-3 w-5 text-center`}></i>
                    {item.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 absolute bottom-0 w-64">
          <div className="border-t pt-4">
            <Link href="/">
              <a className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <i className="fas fa-home mr-3"></i> 
                View Website
              </a>
            </Link>
            <Link href="/">
              <a className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <i className="fas fa-sign-out-alt mr-3"></i> 
                Sign Out
              </a>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="bg-white p-4 shadow-sm md:hidden w-full fixed top-0 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-400 rounded-md flex items-center justify-center">
            <i className="fas fa-leaf text-white text-lg"></i>
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">
            Green Garden
          </span>
        </div>
        <button 
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          onClick={() => document.getElementById("mobile-menu")?.classList.toggle("hidden")}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* Mobile menu */}
      <div id="mobile-menu" className="fixed inset-0 bg-gray-800 bg-opacity-75 z-10 hidden md:hidden">
        <div className="bg-white w-64 min-h-screen shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-400 rounded-md flex items-center justify-center">
                <i className="fas fa-leaf text-white text-lg"></i>
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">
                Green Garden
              </span>
            </div>
            <button 
              className="text-gray-500"
              onClick={() => document.getElementById("mobile-menu")?.classList.add("hidden")}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <nav>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a 
                      className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        location === item.path 
                          ? "bg-green-50 text-green-700" 
                          : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                      }`}
                      onClick={() => document.getElementById("mobile-menu")?.classList.add("hidden")}
                    >
                      <i className={`${item.icon} mr-3 w-5 text-center`}></i>
                      {item.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 pt-4 md:p-8 md:pt-8 mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500">Welcome to the admin dashboard</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link href="/admin/services">
                <Button className="bg-green-600 hover:bg-green-700">
                  <i className="fas fa-plus mr-2"></i> Add Service
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold">{services.length}</p>
                  <div className="ml-2 flex items-center text-green-600 text-xs font-medium">
                    <i className="fas fa-leaf mr-1"></i> 
                    <span>Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pending Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold">{appointments.length}</p>
                  <div className="ml-2 flex items-center text-yellow-600 text-xs font-medium">
                    <i className="fas fa-clock mr-1"></i> 
                    <span>Upcoming</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">New Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold">{inquiries.filter(i => i.status === 'new').length}</p>
                  <div className="ml-2 flex items-center text-blue-600 text-xs font-medium">
                    <i className="fas fa-envelope mr-1"></i> 
                    <span>Unread</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Completed Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'completed').length}</p>
                  <div className="ml-2 flex items-center text-green-600 text-xs font-medium">
                    <i className="fas fa-check-circle mr-1"></i> 
                    <span>Done</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Latest scheduled services</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {recentAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <div className="mr-4 mt-1">
                          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
                            <i className="fas fa-calendar-alt"></i>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {appointment.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.date).toLocaleDateString()} - {services.find(s => s.id === appointment.serviceId)?.name || 'Service'}
                          </p>
                        </div>
                        <div className="inline-flex items-center text-sm font-medium text-blue-600">
                          <Link href={`/admin/appointments`}>
                            <a>View</a>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No recent appointments
                  </div>
                )}
                <div className="mt-4 text-center">
                  <Link href="/admin/appointments">
                    <a className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      View all appointments →
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Inquiries</CardTitle>
                <CardDescription>Latest customer messages</CardDescription>
              </CardHeader>
              <CardContent>
                {recentInquiries.length > 0 ? (
                  <div className="space-y-4">
                    {recentInquiries.map((inquiry) => (
                      <div key={inquiry.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <div className="mr-4 mt-1">
                          <span className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            inquiry.status === 'new' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <i className="fas fa-envelope"></i>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {inquiry.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {inquiry.message.substring(0, 50)}...
                          </p>
                        </div>
                        <div className="inline-flex items-center text-sm font-medium text-blue-600">
                          <Link href={`/admin/inquiries`}>
                            <a>View</a>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No recent inquiries
                  </div>
                )}
                <div className="mt-4 text-center">
                  <Link href="/admin/inquiries">
                    <a className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      View all inquiries →
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}