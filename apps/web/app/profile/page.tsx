'use client';

import React from 'react';
import Layout from '../../src/components/Layout';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import { GlassProfileSettingsCard } from '../../src/components/profile/GlassProfileSettingsCard';
import Breadcrumbs from '../../src/components/Breadcrumbs';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-bg-primary py-8 px-4 flex justify-center">
          <GlassProfileSettingsCard />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
