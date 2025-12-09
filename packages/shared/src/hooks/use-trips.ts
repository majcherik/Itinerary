import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../lib/database.types';
import { QUERY_KEYS } from '../lib/constants';

const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useTrips() {
    return useQuery({
        queryKey: QUERY_KEYS.trips,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('trips')
                .select(`
                    *,
                    itinerary:itinerary_items(*),
                    packingList:packing_items(*),
                    documents(*),
                    wallet:tickets(*),
                    accommodation(*),
                    transport(*),
                    expenses(*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });
}

export function useAddTrip() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newTrip: Database['public']['Tables']['trips']['Insert']) => {
            const { data, error } = await supabase
                .from('trips')
                .insert(newTrip)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trips });
        },
    });
}
