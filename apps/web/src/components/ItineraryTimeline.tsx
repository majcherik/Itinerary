'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ItineraryItem } from '@itinerary/shared';

const Chrono = dynamic(() => import('react-chrono').then((mod) => mod.Chrono), {
    ssr: false,
});

interface ItineraryTimelineProps {
    items: ItineraryItem[];
}

const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ items }) => {
    // Sort items by day/date
    const sortedItems = [...items].sort((a, b) => a.day - b.day);

    // Map itinerary items to React Chrono format with enhanced content
    const timelineItems = sortedItems.map(item => {
        // Build detailed text with all available information
        const details: string[] = [];

        if (item.description) {
            details.push(item.description);
        }

        if (item.time) {
            details.push(`🕐 Time: ${item.time}`);
        }

        if (item.cost) {
            details.push(`💰 Cost: $${typeof item.cost === 'number' ? item.cost.toFixed(2) : item.cost}`);
        }

        return {
            title: item.date || `Day ${item.day}`,
            cardTitle: item.title,
            cardSubtitle: item.time || undefined,
            cardDetailedText: details.join('\n\n'),
        };
    });

    if (timelineItems.length === 0) {
        return (
            <div className="text-center text-text-secondary italic p-8">
                No itinerary items to display. Add some items to see the timeline!
            </div>
        );
    }

    return (
        <div
            id="itinerary-timeline-container"
            className="w-full flex justify-center items-start px-4 py-8"
        >
            <div className="w-full max-w-6xl">
                <Chrono
                    items={timelineItems}
                    mode="VERTICAL_ALTERNATING"
                    disableToolbar={true}
                    theme={{
                        primary: '#e0525e',
                        secondary: '#fff0e6',
                        cardBgColor: '#ffffff',
                        cardSubtitleColor: '#6b5b71',
                        detailsColor: '#2d2438',
                        titleColor: '#2d2438',
                        titleColorActive: '#e0525e',
                    }}
                    fontSizes={{
                        cardSubtitle: '0.875rem',
                        cardText: '0.875rem',
                        cardTitle: '1.125rem',
                        title: '0.875rem',
                    }}
                    cardHeight={200}
                    useReadMore={false}
                />
            </div>
        </div>
    );
};

export default ItineraryTimeline;
