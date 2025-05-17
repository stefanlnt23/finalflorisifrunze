import { Link } from "wouter";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import MainNavigation from "@/components/navigation/MainNavigation";

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
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <img 
                  src="https://i.imgur.com/eHGs2HM.png" 
                  alt="Green Garden Logo" 
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-700">
                  Flori si Frunze
                </span>
              </Link>
            </div>

            {/* Navigation Component */}
            <MainNavigation />

            {/* Call to Action */}
            <div className="hidden md:block">
              <Link href="/appointment">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
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
    </div>
  );
}