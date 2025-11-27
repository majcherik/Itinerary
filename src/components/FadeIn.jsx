import React, { useRef } from 'react';
import { useIntersectionObserver } from '../hooks/use-intersection-observer';

const FadeIn = ({ children, className = '', delay = 0 }) => {
    const ref = useRef(null);
    const entry = useIntersectionObserver(ref, { threshold: 0.1, rootMargin: '50px' });
    const isVisible = !!entry?.isIntersecting;

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default FadeIn;
