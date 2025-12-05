'use client';

import TripDetails from '../../../src/views/TripDetails';
import Layout from '../../../src/components/Layout';
import ProtectedRoute from '../../../src/components/ProtectedRoute';
import MenuDockResponsive from '../../../src/components/MenuDockResponsive';

export default function Page({ params }) {
    return (
        <ProtectedRoute>
            <Layout>
                <TripDetails tripId={params.id} />
                {/* <div>Trip Details Placeholder</div> */}
            </Layout>
            <MenuDockResponsive />
        </ProtectedRoute>
    );
}
