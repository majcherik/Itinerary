'use client';

import Dashboard from '../src/views/Dashboard';
import Layout from '../src/components/Layout';
import ProtectedRoute from '../src/components/ProtectedRoute';
import MenuDockResponsive from '../src/components/MenuDockResponsive';

export default function Page() {
    return (
        <ProtectedRoute>
            <Layout>
                <Dashboard />
                {/* <div>Dashboard Placeholder</div> */}
            </Layout>
            <MenuDockResponsive />
        </ProtectedRoute>
    );
}
