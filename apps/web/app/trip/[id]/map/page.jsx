'use client';

import { useEffect, useState } from 'react';
import { useTrip } from '@itinerary/shared';
import ProtectedRoute from '../../../../src/components/ProtectedRoute';
import { SidebarLayout } from '../../../../src/components/SidebarLayout';
import TripMapView from '../../../../src/views/TripMapView';
import { Loader2 } from 'lucide-react';

export default function MapPage({ params }) {
    const { trips, loading } = useTrip();
    const [trip, setTrip] = useState(null);

    useEffect(() => {
        if (!loading && trips.length > 0) {
            const foundTrip = trips.find(t => t.id === params.id || t.id === parseInt(params.id));
            setTrip(foundTrip);
        }
    }, [trips, loading, params.id]);

    return (
        <ProtectedRoute>
            <SidebarLayout>
                {loading ? (
                    <div className="flex items-center justify-center h-[600px]">
                        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
                    </div>
                ) : trip ? (
                    <TripMapView trip={trip} />
                ) : (
                    <div className="flex items-center justify-center h-[600px]">
                        <p className="text-text-secondary">Trip not found</p>
                    </div>
                )}
            </SidebarLayout>
        </ProtectedRoute>
    );
}
