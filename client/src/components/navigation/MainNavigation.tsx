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
import logoMobile from "@/assets/logo-mobile.svg";

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
    { path: "/subscriptions", label: "Abonamente" },
    { path: "/about", label: "Despre Noi" },
    { path: "/blog", label: "Blog" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-center space-x-6 lg:space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={`font-medium text-sm lg:text-base whitespace-nowrap px-2 py-1 rounded-md transition-colors ${
              location === link.path
                ? "text-gray-900 bg-gray-100"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Logo and Navigation Button */}
      <div className="md:hidden flex items-center justify-between w-full">
        <Link href="/" className="flex items-center">
          <img 
            src={logoMobile} 
            alt="Flori si Frunze Logo" 
            className="h-16 w-auto"
          />
        </Link>
        
        {/* Enhanced Mobile Menu Button */}
        <div className="relative">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col items-center justify-center w-12 h-12 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 shadow-sm"
            aria-label="Meniu principal"
          >
            <div className={`w-6 h-0.5 bg-green-600 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-green-600 rounded-full transition-all duration-300 my-1 ${mobileMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-green-600 rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </button>
          
          {/* Tooltip */}
          {!mobileMenuOpen && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Meniu
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t-2 border-green-200 absolute top-full left-0 right-0 z-50 shadow-xl">
          {/* Menu Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-green-100">
            <h3 className="text-sm font-semibold text-green-700 flex items-center">
              <i className="fas fa-leaf mr-2"></i>
              Navigare Rapidă
            </h3>
          </div>
          
          <div className="px-3 py-3 space-y-1">
            {navLinks.map((link, index) => {
              // Add icons for each navigation item
              const getIcon = (path: string) => {
                switch(path) {
                  case "/": return "fas fa-home";
                  case "/services": return "fas fa-tools";
                  case "/portfolio": return "fas fa-images";
                  case "/subscriptions": return "fas fa-tags";
                  case "/about": return "fas fa-users";
                  case "/blog": return "fas fa-blog";
                  case "/contact": return "fas fa-envelope";
                  default: return "fas fa-circle";
                }
              };
              
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`group flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    location === link.path
                      ? "text-green-700 bg-green-100 shadow-sm"
                      : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  <i className={`${getIcon(link.path)} w-5 mr-3 ${
                    location === link.path ? "text-green-600" : "text-gray-400 group-hover:text-green-600"
                  } transition-colors duration-200`}></i>
                  <span className="flex-1">{link.label}</span>
                  {location === link.path && (
                    <i className="fas fa-chevron-right text-green-600 text-sm"></i>
                  )}
                </Link>
              );
            })}
            
            {/* Separator */}
            <div className="my-3 border-t border-gray-200"></div>
            
            {/* Enhanced CTA Button */}
            <Link
              href="/appointment"
              className="group flex items-center px-4 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <i className="fas fa-calendar-plus w-5 mr-3 text-white"></i>
              <span className="flex-1">Programează o Întâlnire</span>
              <i className="fas fa-arrow-right text-white text-sm group-hover:translate-x-1 transition-transform duration-200"></i>
            </Link>
            
            {/* Quick Contact */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs font-semibold text-gray-500 mb-2 px-2">Contact Rapid</div>
              <div className="flex space-x-2">
                <a href="tel:+40742650670" className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200">
                  <i className="fas fa-phone mr-2"></i>
                  <span className="text-sm font-medium">Sună</span>
                </a>
                <a href="https://wa.me/40742650670" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-200">
                  <i className="fab fa-whatsapp mr-2"></i>
                  <span className="text-sm font-medium">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
