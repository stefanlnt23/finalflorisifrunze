
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { SafeImage } from "./safe-image";
import { Image as ImageIcon } from "lucide-react";

interface ImageLightboxProps {
  image: string;
  alt: string;
}

export function ImageLightbox({ image, alt }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div 
        className="cursor-pointer transition-all hover:opacity-90 relative group w-full h-full" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        style={{ zIndex: 1 }}
      >
        <SafeImage 
          src={image} 
          alt={alt} 
          className="w-full h-full object-cover rounded-lg"
          fallbackIcon={<ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <div className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0 overflow-hidden">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-50 rounded-full bg-black bg-opacity-50 text-white p-2 hover:bg-opacity-70 transition-all"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="w-full h-auto">
            <SafeImage
              src={image}
              alt={alt}
              className="w-full h-auto max-h-[85vh] object-contain"
              fallbackIcon={<ImageIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
