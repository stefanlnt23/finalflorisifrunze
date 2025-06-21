import { Link } from "wouter";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import MainNavigation from "@/components/navigation/MainNavigation";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import logo from "@/assets/logo.svg";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo - Hidden on mobile, shown on desktop */}
            <div className="hidden md:flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center">
                <img 
                  src={logo} 
                  alt="Flori si Frunze Logo" 
                  className="h-16 lg:h-20 w-auto"
                />
              </Link>
            </div>

            {/* Navigation Component - Takes center space on desktop */}
            <div className="flex-1 md:flex md:justify-center md:px-8">
              <MainNavigation />
            </div>

            {/* Call to Action - Right side on desktop */}
            <div className="hidden md:flex items-center flex-shrink-0">
              <Link href="/appointment">
                <Button className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap">
                  Programează o Întâlnire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <Footer />
      
      {/* WhatsApp Button */}
      <WhatsAppButton phoneNumber="0742650670" />
    </div>
  );
}
