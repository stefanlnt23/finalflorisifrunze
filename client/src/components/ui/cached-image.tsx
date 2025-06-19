import React, { useState, useEffect } from 'react';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

export function CachedImage({ src, alt, className, ...props }: CachedImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if the image is already in the browser cache
    const cachedImage = localStorage.getItem(`img_cache_${src}`);
    
    if (cachedImage) {
      // Use the cached image source
      setImageSrc(cachedImage);
    } else {
      // Load the image and cache it
      const img = new Image();
      img.src = src;
      img.onload = () => {
        // Store the image URL in localStorage
        localStorage.setItem(`img_cache_${src}`, src);
        setImageSrc(src);
      };
      img.onerror = () => {
        // If there's an error, still set the source but don't cache
        setImageSrc(src);
      };
    }
  }, [src]);
  
  // Use a placeholder while the image is loading
  if (!imageSrc) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ aspectRatio: '16/9' }}
        {...props}
      />
    );
  }
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      {...props}
    />
  );
}
