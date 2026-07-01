import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad'> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  placeholderColor?: string;
  aspectRatio?: 'square' | '4/3' | '16/9' | '3/4' | 'auto';
  priority?: boolean;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  containerClassName,
  placeholderColor = 'bg-muted/30',
  aspectRatio = 'auto',
  priority = false,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '500px', // Start loading 500px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const aspectRatioClass = {
    square: 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '3/4': 'aspect-[3/4]',
    auto: '',
  }[aspectRatio];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        aspectRatioClass,
        containerClassName
      )}
    >
      {/* Placeholder */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-500',
          placeholderColor,
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
      >
        {/* Skeleton animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>

      {/* Actual image - only render when in view */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}
    </div>
  );
};

// Hook for preloading critical images
export const useImagePreload = (src: string) => {
  useEffect(() => {
    const img = new Image();
    img.src = src;
  }, [src]);
};
