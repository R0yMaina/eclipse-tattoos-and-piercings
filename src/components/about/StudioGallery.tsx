import { useState } from 'react';
import { X } from 'lucide-react';

// 1. Total number of images in your public/gallery folder
const TOTAL_IMAGES = 106;

// 2. Generate the gallery array
const galleryImages = Array.from({ length: TOTAL_IMAGES }, (_, i) => {
  const imageNumber = i + 1;
  return {
    src: `/gallery/tattoo-${imageNumber}.jpg`, 
    alt: `Tattoo design #${imageNumber}`,
    id: imageNumber
  };
});

export const StudioGallery = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Our Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {galleryImages.map((image) => (
          <div key={image.id} className="relative group overflow-hidden rounded-lg bg-gray-100">
            <img 
              src={image.src} 
              alt={image.alt} 
              className="rounded-lg object-cover w-full h-64 hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                // If an image doesn't exist yet, it won't break the site
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudioGallery;