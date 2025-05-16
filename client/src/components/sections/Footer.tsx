
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const quickLinks = [
    { href: "/", label: "Acasă" },
    { href: "/about", label: "Despre Noi" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const services = [
    { href: "/services", label: "Întreținere Grădini" },
    { href: "/services", label: "Amenajare Peisagistică" },
    { href: "/services", label: "Plantare & Tundere" },
    { href: "/services", label: "Sisteme de Irigație" },
  ];

  const socialLinks = [
    { href: "#", icon: "fab fa-facebook-f" },
    { href: "#", icon: "fab fa-instagram" },
    { href: "#", icon: "fab fa-twitter" },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-300 rounded-md flex items-center justify-center">
                <i className="fas fa-leaf text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold text-white">
                Green Garden
              </span>
            </div>
            <p className="text-gray-400 mb-6">
              Transformăm spațiile exterioare în grădini frumoase și sustenabile din 2010.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.href} 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <i className={link.icon}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Link-uri Rapide</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Servicii</h3>
            <ul className="space-y-3">
              {services.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Abonează-te</h3>
            <p className="text-gray-400 mb-4">
              Primește ultimele noutăți și sfaturi pentru grădina ta.
            </p>
            <form className="flex">
              <Input 
                type="email" 
                placeholder="Adresa ta de email" 
                className="rounded-r-none text-gray-800 focus:outline-none" 
              />
              <Button 
                type="submit" 
                className="rounded-l-none bg-green-600 hover:bg-green-700"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-500">
            &copy; {new Date().getFullYear()} Green Garden Services. Toate drepturile rezervate.
          </p>
        </div>
      </div>
    </footer>
  );
}
