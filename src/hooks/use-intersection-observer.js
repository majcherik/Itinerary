import { useEffect, useState } from 'react';

export function useIntersectionObserver(elementRef, { threshold = 0.1, root = null, rootMargin = '0%' } = {}) {
    const [entry, setEntry] = useState(null);

    useEffect(() => {
        const node = elementRef?.current;

        if (!node || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setEntry(entry);
            },
            { threshold, root, rootMargin }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [elementRef, threshold, root, rootMargin]);

    return entry;
}
