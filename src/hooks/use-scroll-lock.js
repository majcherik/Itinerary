import { useLayoutEffect } from 'react';

export function useScrollLock(lock = false) {
    useLayoutEffect(() => {
        if (!lock) return;

        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [lock]);
}
