'use client';

import TripDetails from '../../../src/views/TripDetails';
import ProtectedRoute from '../../../src/components/ProtectedRoute';
import { SidebarLayout } from '../../../src/components/SidebarLayout';

export default function Page({ params }) {
    return (
        <ProtectedRoute>
            <SidebarLayout>
                <TripDetails tripId={params.id} />
            </SidebarLayout>
        </ProtectedRoute>
    );
}
