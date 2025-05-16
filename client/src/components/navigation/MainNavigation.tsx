
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function MainNavigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: "/", label: "Acasă" },
    { path: "/services", label: "Servicii" },
    { path: "/portfolio", label: "Portofoliu" },
    { path: "/blog", label: "Blog" },
    { path: "/contact", label: "Contact" },
    { path: "/admin", label: "Admin", className: "text-gray-500 hover:text-gray-700" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={`font-medium ${
              location === link.path
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation Button */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-500 hover:text-gray-900 focus:outline-none"
        >
          <i className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 absolute top-full left-0 right-0 z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location === link.path
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/appointment"
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
