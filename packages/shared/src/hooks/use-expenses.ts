import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import { QUERY_KEYS } from '../lib/constants';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
) as SupabaseClient<Database>;

export function useAddExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ tripId, expense }: { tripId: number | string, expense: Database['public']['Tables']['expenses']['Insert'] }) => {
            const { data, error } = await supabase
                .from('expenses')
                .insert({
                    ...expense,
                    trip_id: Number(tripId)
                } as any)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trip(variables.tripId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trips });
        },
    });
}

export function useDeleteExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ tripId, expenseId }: { tripId: number | string, expenseId: number | string }) => {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', expenseId);

            if (error) throw error;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trip(variables.tripId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trips });
        },
    });
}
