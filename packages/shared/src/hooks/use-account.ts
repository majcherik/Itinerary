import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import { ChangePasswordInput, RequestAccountDeletionInput, ExportDataInput } from '../schemas/profile';
import { QUERY_KEYS } from '../lib/constants';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
) as SupabaseClient<Database>;

// ============================================================================
// ACCOUNT MANAGEMENT HOOKS
// ============================================================================

/**
 * Change user password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ newPassword }: ChangePasswordInput) => {
      // Note: Supabase doesn't require current password for password change
      // if user is already authenticated. For additional security, you could
      // verify current password by attempting to sign in with it first.

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    },
  });
}

/**
 * Request email verification resend
 */
export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.email) throw new Error('No email found');

      // Supabase will send a verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;
    },
  });
}

/**
 * Request account deletion (30-day grace period)
 */
export function useRequestAccountDeletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reason }: RequestAccountDeletionInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Schedule deletion 30 days from now
      const scheduledDeletion = new Date();
      scheduledDeletion.setDate(scheduledDeletion.getDate() + 30);

      const { data, error } = await supabase
        .from('account_deletions')
        .insert({
          user_id: user.id,
          scheduled_deletion_at: scheduledDeletion.toISOString(),
          reason: reason || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile() });
    },
  });
}

/**
 * Cancel account deletion request
 */
export function useCancelAccountDeletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deletionRequestId: string) => {
      const { error } = await supabase
        .from('account_deletions')
        .update({ status: 'cancelled' })
        .eq('id', deletionRequestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile() });
    },
  });
}

/**
 * Export user data (GDPR compliance)
 */
export function useExportUserData() {
  return useMutation({
    mutationFn: async (options: ExportDataInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const exportData: any = {};

      // Fetch profile
      if (options.includeProfile) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        exportData.profile = profile;
        exportData.preferences = preferences;
      }

      // Fetch trips
      if (options.includeTrips) {
        const { data: trips } = await supabase
          .from('trips')
          .select(`
            *,
            itinerary:itinerary_items(*),
            packingList:packing_items(*),
            documents(*),
            wallet:tickets(*),
            accommodation(*),
            transport(*)
          `)
          .eq('user_id', user.id);

        exportData.trips = trips;
      }

      // Fetch expenses
      if (options.includeExpenses) {
        const { data: expenses } = await supabase
          .from('expenses')
          .select('*, trip:trips!inner(user_id)')
          .eq('trip.user_id', user.id);

        exportData.expenses = expenses;
      }

      // Create JSON blob and trigger download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `itinerary-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return exportData;
    },
  });
}
