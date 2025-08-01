
import { useEffect, useState } from 'react';

interface ParallaxSectionProps {
  imageUrl: string;
  height?: string;
  children?: React.ReactNode;
  overlayOpacity?: number;
  brightnessFactor?: number;
}

export default function ParallaxSection({ 
  imageUrl, 
  height = '500px', 
  children,
  overlayOpacity = 0.2,
  brightnessFactor = 1.1
}: ParallaxSectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize scroll position on mount
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Calculate the parallax offset based on scroll position
  const parallaxOffset = scrollPosition * 0.4;

  return (
    <section 
      className="relative overflow-hidden" 
      style={{ height }}
    >
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ 
          backgroundImage: `url(${imageUrl})`,
          transform: `translateY(${parallaxOffset}px)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: `brightness(${brightnessFactor})`,
          zIndex: 1
        }}
      />
      <div 
        className={`absolute inset-0`} 
        style={{ 
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
          zIndex: 2 
        }}
      >
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          {children}
        </div>
      </div>
    </section>
  );
}
