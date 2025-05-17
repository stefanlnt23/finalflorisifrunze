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
    { path: "/subscriptions", label: "Abonamente" },
    { path: "/blog", label: "Blog" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={`font-medium transition-colors duration-200 ${
              location === link.path
                ? "text-[#c8a055]"
                : "text-white hover:text-[#c8a055]"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Logo and Navigation Button */}
      <div className="md:hidden flex items-center space-x-4">
        <Link href="/" className="flex items-center">
          <img 
            src="https://i.imgur.com/eHGs2HM.png" 
            alt="Flori si Frunze Logo" 
            className="h-8 w-auto"
          />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-[#c8a055] hover:text-white focus:outline-none"
        >
          <i className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1f2328] border-t border-[#c8a055]/30 absolute top-full left-0 right-0 z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location === link.path
                    ? "text-[#c8a055] bg-[#2a2f36]"
                    : "text-white hover:text-[#c8a055] hover:bg-[#2a2f36]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/appointment"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#1f2328] bg-[#c8a055] hover:bg-[#d9b978]"
            >
              Programează o Întâlnire
            </Link>
          </div>
        </div>
      )}
    </>
  );
}