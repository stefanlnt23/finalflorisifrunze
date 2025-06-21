import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean; // For above-the-fold images
  placeholder?: boolean; // Show placeholder while loading
}

// Global image cache to store loaded images
const imageCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

// Preload critical images
const preloadImage = (src: string): Promise<HTMLImageElement> => {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    
    // Set cache headers for better browser caching
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      imageCache.set(src, img);
      loadingPromises.delete(src);
      resolve(img);
    };
    
    img.onerror = () => {
      loadingPromises.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });

  loadingPromises.set(src, promise);
  return promise;
};

export function CachedImage({ 
  src, 
  alt, 
  className, 
  priority = false, 
  placeholder = true,
  ...props 
}: CachedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Priority images load immediately
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, isInView]);

  // Load image when it comes into view or is priority
  useEffect(() => {
    if (!isInView || !src) return;

    // Check if image is already cached
    if (imageCache.has(src)) {
      setIsLoaded(true);
      return;
    }

    // Load the image
    preloadImage(src)
      .then(() => {
        setIsLoaded(true);
        setIsError(false);
      })
      .catch(() => {
        setIsError(true);
        setIsLoaded(true); // Still show the image element even if failed
      });
  }, [src, isInView]);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    setIsError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsError(true);
    setIsLoaded(true);
  }, []);

  // Show placeholder while loading
  if (!isLoaded && placeholder) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        {...props}
      >
        <div className="text-gray-400">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={handleImageLoad}
      onError={handleImageError}
      style={{
        ...props.style,
        display: isError ? 'none' : 'block'
      }}
      {...props}
    />
  );
}

// Utility function to preload critical images
export const preloadCriticalImages = (imageSrcs: string[]) => {
  imageSrcs.forEach(src => {
    preloadImage(src).catch(() => {
      // Silently fail for preloading
    });
  });
};
