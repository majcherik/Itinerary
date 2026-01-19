import React from 'react';
import { useUserRole } from '@itinerary/shared';

interface PermissionGateProps {
  tripId: number | string;
  requiredRoles: Array<'owner' | 'editor' | 'viewer'>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionGate - Conditionally renders children based on user's role
 *
 * Usage:
 * <PermissionGate tripId={trip.id} requiredRoles={['owner', 'editor']}>
 *   <Button onClick={handleEdit}>Edit Trip</Button>
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  tripId,
  requiredRoles,
  children,
  fallback = null,
}) => {
  const { data: userRole, isLoading } = useUserRole(tripId);

  // While loading, don't render anything
  if (isLoading) {
    return null;
  }

  // If user has no role or their role is not in requiredRoles, show fallback
  if (!userRole || !requiredRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // User has required role, render children
  return <>{children}</>;
};

export default PermissionGate;
