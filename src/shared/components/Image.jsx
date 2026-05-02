/**
 * src/shared/components/Image.jsx
 */
import { useState, useEffect } from 'react';

export default function Image({
    src,
    alt,
    fallback = '/src/assets/images/workers.png',
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
        <img
            src={imgSrc || fallback}
            alt={alt}
            loading="lazy"
            onError={handleError}
            className={className}
            style={style}
            {...props}
        />
    );
}
