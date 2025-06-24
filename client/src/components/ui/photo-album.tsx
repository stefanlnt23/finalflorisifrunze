import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { SafeImage } from "@/components/ui/safe-image";
import { Image as ImageIcon } from "lucide-react";

interface PhotoAlbumProps {
  images: string[];
  autoRotate?: boolean;
  rotationInterval?: number;
  showCounter?: boolean;
  className?: string;
}

export function PhotoAlbum({
  images,
  autoRotate = true,
  rotationInterval = 4000,
  showCounter = true,
  className = "",
}: PhotoAlbumProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [isHovered, setIsHovered] = useState(false);
  const [validImages, setValidImages] = useState<string[]>([]);

  // Validate images and filter out invalid ones
  useEffect(() => {
    const validateImages = async () => {
      const valid: string[] = [];
      
      for (const imageUrl of images) {
        if (!imageUrl || imageUrl.trim() === '') continue;
        
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
          });
          valid.push(imageUrl);
        } catch (error) {
          console.warn('Failed to load image:', imageUrl);
        }
      }
      
      setValidImages(valid);
      if (currentIndex >= valid.length && valid.length > 0) {
        setCurrentIndex(0);
      }
    };

    validateImages();
  }, [images, currentIndex]);

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating || validImages.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [isAutoRotating, validImages.length, isHovered, rotationInterval]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const toggleAutoRotation = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
        No images available
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Main Image Display */}
      <div 
        className="relative mb-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[4/3] md:aspect-[16/9] lg:aspect-[3/2] overflow-hidden rounded-2xl shadow-2xl bg-white/5 relative group">
          <ImageLightbox
            image={validImages[currentIndex]}
            alt={`Gallery image ${currentIndex + 1}`}
          />
          
          {/* Navigation Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Navigation Arrows */}
            {validImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Enlarge Button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              onClick={() => {
                // This will be handled by ImageLightbox component
              }}
            >
              <ZoomIn className="w-5 h-5" />
            </Button>

            {/* Auto-rotation Toggle */}
            {validImages.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                onClick={toggleAutoRotation}
              >
                <RotateCcw className={`w-4 h-4 mr-2 ${isAutoRotating ? 'animate-spin' : ''}`} />
                {isAutoRotating ? 'Auto' : 'Manual'}
              </Button>
            )}
          </div>

          {/* Image Counter */}
          {showCounter && validImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {currentIndex + 1} / {validImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${
                currentIndex === index
                  ? "border-white shadow-lg scale-105"
                  : "border-white/30 hover:border-white/60"
              }`}
            >
              <SafeImage
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                fallbackIcon={<ImageIcon className="h-6 w-6 text-gray-400" />}
                showRetry={false}
              />
            </button>
          ))}
        </div>
      )}

      {/* Navigation Dots */}
      {images.length > 1 && images.length <= 8 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "bg-white scale-125"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}