import { Metadata } from 'next';
import SharedTripView from './SharedTripView';

interface PageProps {
    params: Promise<{ token: string }>;
}

// Generate metadata for Open Graph sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { token } = await params;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/share/${token}`,
            {
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            return {
                title: 'Shared Trip',
                description: 'View a shared trip itinerary',
            };
        }

        const data = await response.json();
        const trip = data.trip;

        return {
            title: `${trip.title} - Shared Trip`,
            description: `${trip.city} • ${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`,
            openGraph: {
                title: trip.title,
                description: `Join me on this trip to ${trip.city}!`,
                images: trip.hero_image ? [trip.hero_image] : [],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: trip.title,
                description: `Join me on this trip to ${trip.city}!`,
                images: trip.hero_image ? [trip.hero_image] : [],
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Shared Trip',
            description: 'View a shared trip itinerary',
        };
    }
}

export default async function SharedTripPage({ params }: PageProps) {
    const { token } = await params;

    return <SharedTripView token={token} />;
}
