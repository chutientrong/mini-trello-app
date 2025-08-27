import React, { useState, forwardRef } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError' | 'onLoad'> {
  /** Fallback image source if the main image fails to load */
  fallbackSrc?: string;
  /** Custom error component to show when image fails to load */
  errorComponent?: React.ReactNode;
  /** Whether to show an error state */
  showError?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Container CSS classes */
  containerClassName?: string;
  /** Custom onError handler */
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  /** Custom onLoad handler */
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      fallbackSrc,
      errorComponent,
      showError = false,
      className,
      containerClassName,
      onError,
      onLoad,
      ...props
    },
    ref
  ) => {
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setHasError(false);
      onLoad?.(e);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      // Try fallback image if available and not already using it
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setHasError(false);
        return;
      }
      
      setHasError(true);
      onError?.(e);
    };

    // Reset state when src changes
    React.useEffect(() => {
      setCurrentSrc(src);
      setHasError(false);
    }, [src]);

    // Show error state
    if (hasError && (showError || errorComponent)) {
      return (
        <div className={cn('flex items-center justify-center', containerClassName)}>
          {errorComponent || (
            <div className="flex flex-col items-center justify-center p-4 text-gray-500">
              <svg
                className="w-8 h-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">Image not available</span>
            </div>
          )}
        </div>
      );
    }



    return (
      <div className={containerClassName}>
        <img
          ref={ref}
          src={currentSrc}
          alt={alt}
          className={cn('max-w-full h-auto', className)}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </div>
    );
  }
);

Image.displayName = 'Image';
