import React from "react";
import { Link, useLocation } from "wouter";

export default function AdminNavigation() {
  const [location] = useLocation();

  // Admin navigation items
  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "fas fa-chart-line" },
    { label: "Services", path: "/admin/services", icon: "fas fa-tools" },
    { label: "Portfolio", path: "/admin/portfolio", icon: "fas fa-images" },
    { label: "Appointments", path: "/admin/appointments", icon: "fas fa-calendar-alt" },
    { label: "Inquiries", path: "/admin/inquiries", icon: "fas fa-envelope" },
    { label: "Blog Posts", path: "/admin/blog", icon: "fas fa-blog" },
    { label: "Testimonials", path: "/admin/testimonials", icon: "fas fa-star" },
    { label: "Front Page", path: "/admin/frontpage", icon: "fas fa-home" },
    { label: "Feature Cards", path: "/admin/feature-cards", icon: "fas fa-columns" },
  ];

  return (
    <>
      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <div className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  location === item.path 
                    ? "bg-green-50 text-green-700" 
                    : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                }`}>
                  <i className={`${item.icon} mr-3 w-5 text-center`}></i>
                  {item.label}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 absolute bottom-0 w-64">
        <div className="border-t pt-4">
          <Link href="/">
            <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 cursor-pointer">
              <i className="fas fa-home mr-3"></i> 
              View Website
            </div>
          </Link>
          <Link href="/">
            <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 cursor-pointer">
              <i className="fas fa-sign-out-alt mr-3"></i> 
              Sign Out
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}