import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  showRetry?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}

export function SafeImage({ 
  src, 
  alt, 
  className = "", 
  fallbackIcon,
  showRetry = true,
  onError,
  onLoad 
}: SafeImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleImageError = () => {
    setImageState('error');
    onError?.();
  };

  const handleRetry = () => {
    if (retryCount < 2) { // Limit retries to prevent infinite loops
      setRetryCount(prev => prev + 1);
      setImageState('loading');
      if (imgRef.current) {
        imgRef.current.src = `${src}?retry=${retryCount + 1}&t=${Date.now()}`;
      }
    }
  };

  useEffect(() => {
    setImageState('loading');
    setRetryCount(0);
  }, [src]);

  if (imageState === 'error') {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center p-4">
          {fallbackIcon || <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />}
          <p className="text-sm text-gray-500 mb-2">Imaginea nu poate fi încărcată</p>
          {showRetry && retryCount < 2 && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Încearcă din nou
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Se încarcă...</p>
          </div>
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${imageState === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 w-full h-full object-cover`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
}