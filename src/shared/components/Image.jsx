/**
 * src/shared/components/Image.jsx
 */
import { useState, useEffect } from 'react';

export default function Image({
    src,
    alt,
    fallback = '/src/assets/images/workers.png', // Replace with your actual fallback image path
    className = '',
    style = {},
    ...props
}) {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoaded, setIsLoaded] = useState(false);

    // Update image source if the 'src' prop changes dynamically
    useEffect(() => {
        setImgSrc(src);
        setIsLoaded(false);
    }, [src]);

    return (
        <img
            src={imgSrc ? imgSrc : fallback}
            alt={alt}
            loading="lazy" // Native lazy loading for performance
            onLoad={() => setIsLoaded(true)}
            onError={() => {
                // If the image fails to load, swap to the fallback
                setImgSrc(fallback);
            }}
            className={className}
            style={{
                // Smooth fade-in effect once the image is fully loaded
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
                // Optional: you can add a default background color here to act as a skeleton 
                backgroundColor: isLoaded ? 'transparent' : '#F3F4F6',
                ...style,
            }}
            {...props}
        />
    );
}