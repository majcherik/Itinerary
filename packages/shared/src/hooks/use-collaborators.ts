import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// TYPES
// ============================================================================

export interface Collaborator {
  id: string;
  trip_id: number;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'active' | 'former_member';
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  left_at: string | null;
  removed_at: string | null;
  removed_by: string | null;
  user: {
    id: string;
    email: string;
    display_name: string | null;
  };
}

export interface Invitation {
  id: string;
  trip_id: number;
  email: string;
  role: 'editor' | 'viewer';
  invited_by: string;
  invited_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  responded_at: string | null;
  trip?: {
    id: number;
    title: string;
    city: string | null;
  };
  inviter?: {
    id: string;
    email: string;
    display_name: string | null;
  };
}

// ============================================================================
// HOOK: useCollaborators
// Returns list of active collaborators for a trip
// ============================================================================

export function useCollaborators(tripId: number | string | undefined) {
  return useQuery({
    queryKey: ['trip-collaborators', tripId],
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from('trip_collaborators')
        .select(`
          id,
          trip_id,
          user_id,
          role,
          status,
          invited_by,
          invited_at,
          joined_at,
          left_at,
          removed_at,
          removed_by,
          user:profiles!trip_collaborators_user_id_fkey (
            id,
            email,
            display_name
          )
        `)
        .eq('trip_id', tripId)
        .eq('status', 'active')
        .order('role', { ascending: true }); // Owner first

      if (error) throw error;

      // Map the response to ensure proper typing
      return (data || []).map((item: any) => ({
        ...item,
        user: Array.isArray(item.user) ? item.user[0] : item.user
      })) as Collaborator[];
    },
    enabled: !!tripId,
  });
}

// ============================================================================
// HOOK: useUserRole
// Returns current user's role on a specific trip
// ============================================================================

export function useUserRole(tripId: number | string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', tripId, user?.id],
    queryFn: async () => {
      if (!tripId || !user?.id) return null;

      const { data, error } = await supabase
        .from('trip_collaborators')
        .select('role')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data?.role as 'owner' | 'editor' | 'viewer' | null;
    },
    enabled: !!tripId && !!user?.id,
  });
}

// ============================================================================
// HOOK: usePendingInvitations
// Returns pending invitations for a trip OR for current user
// ============================================================================

export function usePendingInvitations(tripId?: number | string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending-invitations', tripId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('trip_invitations')
        .select(`
          id,
          trip_id,
          email,
          role,
          invited_by,
          invited_at,
          expires_at,
          status,
          responded_at,
          trip:trips!trip_invitations_trip_id_fkey (
            id,
            title,
            city
          ),
          inviter:profiles!trip_invitations_invited_by_fkey (
            id,
            email,
            display_name
          )
        `)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      // If tripId provided, filter by trip (for trip owners)
      if (tripId) {
        query = query.eq('trip_id', tripId);
      } else {
        // Otherwise, filter by user's email (for invitees)
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (profile?.email) {
          query = query.eq('email', profile.email);
        }
      }

      const { data, error } = await query.order('invited_at', { ascending: false });

      if (error) throw error;

      // Map the response to ensure proper typing
      return (data || []).map((item: any) => ({
        ...item,
        trip: Array.isArray(item.trip) ? item.trip[0] : item.trip,
        inviter: Array.isArray(item.inviter) ? item.inviter[0] : item.inviter
      })) as Invitation[];
    },
    enabled: !!user?.id,
  });
}

// ============================================================================
// HOOK: useCanEdit
// Returns boolean indicating if user can edit the trip (owner or editor)
// ============================================================================

export function useCanEdit(tripId: number | string | undefined) {
  const { data: role, isLoading } = useUserRole(tripId);

  return {
    canEdit: role === 'owner' || role === 'editor',
    isLoading,
  };
}

// ============================================================================
// HOOK: useIsOwner
// Returns boolean indicating if user is owner of the trip
// ============================================================================

export function useIsOwner(tripId: number | string | undefined) {
  const { data: role, isLoading } = useUserRole(tripId);

  return {
    isOwner: role === 'owner',
    isLoading,
  };
}

// ============================================================================
// HOOK: useAllCollaborators (including former members)
// Useful for expense history that shows former members
// ============================================================================

export function useAllCollaborators(tripId: number | string | undefined) {
  return useQuery({
    queryKey: ['all-trip-collaborators', tripId],
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from('trip_collaborators')
        .select(`
          id,
          trip_id,
          user_id,
          role,
          status,
          invited_by,
          invited_at,
          joined_at,
          left_at,
          removed_at,
          removed_by,
          user:profiles!trip_collaborators_user_id_fkey (
            id,
            email,
            display_name
          )
        `)
        .eq('trip_id', tripId)
        .order('status', { ascending: true }) // Active first
        .order('role', { ascending: true }); // Owner first within active

      if (error) throw error;

      // Map the response to ensure proper typing
      return (data || []).map((item: any) => ({
        ...item,
        user: Array.isArray(item.user) ? item.user[0] : item.user
      })) as Collaborator[];
    },
    enabled: !!tripId,
  });
}
