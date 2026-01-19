'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ItineraryItem } from '@itinerary/shared';

const Chrono = dynamic(() => import('react-chrono').then((mod) => mod.Chrono), {
    ssr: false,
}) as any;

interface ItineraryTimelineProps {
    items: ItineraryItem[];
}

/**
 * Format date string for timeline display
 * Converts date to readable format like "Jan 15, 2024"
 */
const formatDateForTimeline = (dateString: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch {
        return dateString;
    }
};

const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ items }) => {
    // Sort items by day/date (memoized to avoid re-sorting on every render)
    const sortedItems = React.useMemo(() => {
        return items.toSorted((a, b) => a.day - b.day);
    }, [items]);

    // Map itinerary items to React Chrono format
    const timelineItems = sortedItems.map((item, index) => {
        // Format date for timeline marker (readable format like "Jan 15, 2024")
        const formattedDate = formatDateForTimeline(item.date);

        // Build subtitle: Day number + time if available
        const dayNumber = item.day || (index + 1);
        const subtitle = item.time
            ? `Day ${dayNumber} • ${item.time}`
            : `Day ${dayNumber}`;

        // Build detailed text as array (paragraphs)
        const detailedText: string[] = [];
        if (item.description) {
            detailedText.push(item.description);
        }
        if (item.cost) {
            const costValue = typeof item.cost === 'number'
                ? item.cost.toFixed(2)
                : item.cost;
            detailedText.push(`💰 Cost: $${costValue}`);
        }

        return {
            title: formattedDate,           // "Jan 15, 2024" - on timeline
            cardTitle: item.title,          // "Visit Eiffel Tower" - prominent
            cardSubtitle: subtitle,         // "Day 1 • 2:00 PM" - metadata
            cardDetailedText: detailedText.length > 0
                ? detailedText
                : ["No additional details"],
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
        <div id="itinerary-timeline-container" style={{ width: "100%", height: "600px", overflow: "auto" }}>
            <Chrono
                items={timelineItems}
                mode="VERTICAL"
                cardHeight={200}
                cardWidth={320}
                disableToolbar={true}
                enableLayoutSwitch={false}
                enableQuickJump={false}
                enableDarkToggle={false}
                highlightCardsOnHover={true}
                useReadMore={true}
                scrollable={{ scrollbar: false }}
                borderLessCards={false}
                theme={{
                    // Brand colors
                    primary: '#e0525e',
                    secondary: '#6b5b71',

                    // Card styling
                    cardBgColor: '#ffffff',
                    cardTitleColor: '#2d2438',
                    cardSubtitleColor: '#6b5b71',
                    cardDetailsColor: '#4a5568',
                    cardDetailsBackGround: '#f9fafb',

                    // Timeline elements
                    titleColor: '#2d2438',
                    titleColorActive: '#e0525e',

                    // Interactive states
                    buttonHoverBgColor: '#fff9f5',
                    buttonActiveBgColor: '#e0525e',
                    buttonActiveIconColor: '#ffffff',

                    // Visual effects
                    shadowColor: 'rgba(224, 82, 94, 0.15)',
                    glowColor: 'rgba(224, 82, 94, 0.3)',

                    // Card borders and radius
                    cardBorderRadius: '12px',

                    // Toolbar styling
                    toolbarBtnBgColor: '#f3f4f6',
                    toolbarBgColor: '#ffffff',
                    toolbarTextColor: '#2d2438',
                }}
                fontSizes={{
                    cardTitle: '1.25rem',
                    cardSubtitle: '0.95rem',
                    cardText: '1rem',
                    title: '0.9rem',
                }}
            />
        </div>
    );
};

export default ItineraryTimeline;
