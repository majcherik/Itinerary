'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ItineraryItem } from '@itinerary/shared';

// @ts-ignore
const Chrono = dynamic(() => import('react-chrono').then((mod) => mod.Chrono), {
    ssr: false,
});

interface ItineraryTimelineProps {
    items: ItineraryItem[];
}

const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ items }) => {
    // Sort items by day/date
    const sortedItems = [...items].sort((a, b) => a.day - b.day);

    const timelineItems = sortedItems.map(item => ({
        title: item.date || `Day ${item.day}`,
        cardTitle: item.title,
        cardSubtitle: item.description,
        cardDetailedText: item.cost ? `Estimated Cost: $${item.cost}` : '',
    }));

    if (timelineItems.length === 0) {
        return <div className="text-center text-text-secondary italic p-8">No itinerary items to display. Add some items to see the timeline!</div>;
    }

    return (
        <div className="w-full h-[600px] flex justify-center items-start isolate z-0 px-4">
            <div className="w-full max-w-4xl h-full">
                {/* @ts-ignore */}
                <Chrono
                    items={timelineItems}
                    mode="VERTICAL"
                    theme={{
                        primary: '#e0525e', // accent-primary
                        secondary: '#fff0e6', // bg-secondary
                        cardBgColor: '#ffffff', // bg-card
                        cardDetailsColor: '#2d2438', // text-primary
                        titleColor: '#2d2438', // text-primary
                        titleColorActive: '#e0525e', // accent-primary
                    }}
                    cardHeight={100}
                    buttonTexts={{
                        first: 'Jump to First',
                        last: 'Jump to Last',
                        next: 'Next',
                        previous: 'Previous',
                    }}
                />
            </div>
        </div>
    );
};

export default ItineraryTimeline;
