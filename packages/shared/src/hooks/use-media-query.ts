import React from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = React.useState(false);

    React.useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);

        // Initial check
        setMatches(media.matches);

        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);

    return matches;
}
