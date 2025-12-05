'use client';

import React from 'react';
import Layout from '../../src/components/Layout';
import Footer from '../../src/components/Footer';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import MenuDockResponsive from '../../src/components/MenuDockResponsive';

export default function GDPRPage() {
    return (
        <ProtectedRoute>
            <Layout>
                <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
                    <h1 className="text-3xl font-bold mb-4">GDPR Compliance</h1>
                    <p className="text-text-secondary">
                        This page is currently under construction. We are committed to protecting your data and privacy.
                        Detailed GDPR compliance information will be available here soon.
                    </p>
                </div>
                <Footer />
            </Layout>
            <MenuDockResponsive />
        </ProtectedRoute>
    );
}
