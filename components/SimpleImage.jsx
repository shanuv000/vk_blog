import Image from 'next/image';

/**
 * Production-ready Image Component
 * Lightweight wrapper around Next.js Image with optimized defaults
 */
export default function SimpleImage({ 
  src, 
  alt = '',
  fill,
  width,
  height,
  priority = false,
  sizes,
  quality = 75,
  className = '',
  onError,
  ...props 
}) {
  const handleError = (e) => {
    // Fallback to default image on error
    if (onError) {
      onError(e);
    } else {
      console.warn('Image failed to load:', src);
    }
  };

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : (width || 800)}
      height={fill ? undefined : (height || 600)}
      sizes={sizes || "100vw"}
      priority={priority}
      quality={quality}
      className={className}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
    />
  );
}
