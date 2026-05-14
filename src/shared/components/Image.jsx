/**
 * src/shared/components/Image.jsx
 */
import { useState, useEffect } from 'react';

export default function Image({
    size,
    src,
    alt,
    fallback = '/images/workers.png',
    className = '',
    style = {},
    onError,
    ...props
}) {
    const [imgSrc, setImgSrc] = useState(src);

    // Update image source if the 'src' prop changes dynamically
    useEffect(() => {
        setImgSrc(src);
    }, [src]);

    const handleError = (e) => {
        setImgSrc(fallback);
        // Also call any external onError handler if provided
        onError?.(e);
    };

    return (
        <div className="w-full h-full" style={size ? { width: `${size}px` } : {}}>
            <img
                src={imgSrc || fallback}
                alt={alt}
                loading="lazy"
                onError={handleError}
                className={`w-full ${className}`}
                style={style}
                {...props}
            />
        </div>
    );
}
