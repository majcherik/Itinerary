'use client';

import Dashboard from '../src/views/Dashboard';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { SidebarLayout } from '../src/components/SidebarLayout';

export default function Page() {
    return (
        <ProtectedRoute>
            <SidebarLayout>
                <Dashboard />
            </SidebarLayout>
        </ProtectedRoute>
    );
}
