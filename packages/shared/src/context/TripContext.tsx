'use client';

import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from './AuthContext';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define Types
export interface ItineraryItem {
    id?: number | string;
    day: number;
    date: string;
    title: string;
    description?: string;
    cost?: number | string;
    time?: string | null;
}

export interface AccommodationItem {
    id?: number | string;
    name: string;
    address: string;
    checkIn: string;
    checkOut: string;
    type: string;
    notes?: string;
    cost?: number | string;
}

export interface TransportItem {
    id?: number | string;
    type: string;
    number: string;
    from: string;
    to: string;
    depart: string;
    arrive: string;
    cost?: number | string;
}

export interface TicketItem {
    id?: number | string;
    type: string;
    provider: string;
    refNumber: string;
    departs: string;
    arrives: string;
    notes?: string;
    file?: string;
}

export interface PackingItem {
    id?: number | string;
    item: string;
    category: string;
    is_packed: boolean;
}

export interface DocumentItem {
    id?: number | string;
    title: string;
    content: string | string[];
    isWarning?: boolean;
    type: string;
    date?: string;
}

export interface ExpenseItem {
    id?: number | string;
    payer: string;
    amount: number;
    description: string;
    date: string;
    category: string;
    splitWith: string[];
}

export interface Trip {
    id: number;
    user_id: string;
    title: string;
    start_date: string;
    end_date: string;
    city: string;
    hero_image: string;
    itinerary?: ItineraryItem[];
    packingList?: PackingItem[];
    documents?: DocumentItem[];
    wallet?: TicketItem[];
    accommodation?: AccommodationItem[];
    transport?: TransportItem[];
    expenses?: ExpenseItem[];
    members?: string[];
    [key: string]: any;
}

interface TripContextType {
    trips: Trip[];
    loading: boolean;
    getTrip: (id: number | string) => Trip | undefined;
    refreshTrips: () => void;
    addTrip: (tripData: any) => Promise<any>;
    updateTrip: (id: number | string, updates: any) => Promise<any>;
    deleteTrip: (id: number | string) => Promise<void>;
    addItineraryItem: (tripId: number | string, item: any) => Promise<any>;
    deleteItineraryItem: (tripId: number | string, itemId: number | string) => Promise<void>;
    addAccommodation: (tripId: number | string, item: any) => Promise<any>;
    deleteAccommodation: (tripId: number | string, itemId: number | string) => Promise<void>;
    addTransport: (tripId: number | string, item: any) => Promise<any>;
    deleteTransport: (tripId: number | string, itemId: number | string) => Promise<void>;
    addTicket: (tripId: number | string, ticket: any) => Promise<any>;
    deleteTicket: (tripId: number | string, ticketId: number | string) => Promise<void>;
    addPackingItem: (tripId: number | string, item: any) => Promise<any>;
    updatePackingItem: (tripId: number | string, itemId: number | string, updates: any) => Promise<any>;
    deletePackingItem: (tripId: number | string, itemId: number | string) => Promise<void>;
    resetPackingList: (tripId: number | string) => Promise<void>;
    addNote: (tripId: number | string, note: any) => Promise<any>;
    deleteNote: (tripId: number | string, noteId: number | string) => Promise<void>;
    addExpense: (tripId: number | string, expense: any) => Promise<any>;
    deleteExpense: (tripId: number | string, expenseId: number | string) => Promise<void>;
    updateTripMembers: (tripId: number | string, members: string[]) => Promise<any>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const useTrip = () => {
    const context = useContext(TripContext);
    if (context === undefined) {
        throw new Error('useTrip must be used within a TripProvider');
    }
    return context;
};

export const TripProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const fetchTrips = async () => {
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

        // Transform documents content from string to array if needed
        return (data || []).map((trip: any) => ({
            ...trip,
            itinerary: (trip.itinerary || []).map((item: any) => ({
                ...item,
                title: item.activity,
                description: item.notes
            })),
            documents: (trip.documents || []).map((doc: any) => ({
                ...doc,
                content: typeof doc.content === 'string' ? doc.content.split('\n') : doc.content
            })),
            expenses: (trip.expenses || []).map((exp: any) => ({
                ...exp,
                splitWith: exp.split_with // Map snake_case to camelCase
            })),
            members: trip.members || ['Me'] // Default to ['Me'] if null
        }));
    };

    const { data: trips = [], isLoading: loading } = useQuery({
        queryKey: ['trips', user?.id],
        queryFn: fetchTrips,
        enabled: !!user,
    });

    const invalidateTrips = () => {
        queryClient.invalidateQueries({ queryKey: ['trips', user?.id] });
    };

    // --- Mutations ---

    const addTripMutation = useMutation({
        mutationFn: async (tripData: any) => {
            const { data, error} = await supabase
                .from('trips')
                .insert([{
                    user_id: user?.id,
                    title: tripData.title,
                    start_date: tripData.startDate,
                    end_date: tripData.endDate,
                    city: tripData.city,
                    hero_image: tripData.heroImage
                }] as any)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: invalidateTrips,
    });

    const deleteTripMutation = useMutation({
        mutationFn: async (id: number | string) => {
            const { error } = await supabase.from('trips').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: invalidateTrips,
    });

    const updateTripMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: number | string, updates: any }) => {
            const dbUpdates: any = {};
            if (updates.title) dbUpdates.title = updates.title;
            if (updates.startDate) dbUpdates.start_date = updates.startDate;
            if (updates.endDate) dbUpdates.end_date = updates.endDate;
            if (updates.city) dbUpdates.city = updates.city;
            if (updates.heroImage) dbUpdates.hero_image = updates.heroImage;
            if (updates.visa_status !== undefined) dbUpdates.visa_status = updates.visa_status;
            if (updates.visa_info !== undefined) dbUpdates.visa_info = updates.visa_info;

            const { data, error } = await supabase
                .from('trips')
                .update(dbUpdates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: invalidateTrips,
    });

    // --- Sub-items Mutations ---

    const addItineraryItemMutation = useMutation({
        mutationFn: async ({ tripId, item }: { tripId: number | string, item: any }) => {
            const { data, error } = await supabase
                .from('itinerary_items')
                .insert([{
                    trip_id: tripId,
                    day: item.date, // Note: mapping date to day column based on previous logic
                    activity: item.title,
                    notes: item.description,
                    cost: item.cost,
                    time: item.time || null
                }]) as any
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: invalidateTrips,
    });

    const deleteItineraryItemMutation = useMutation({
        mutationFn: async ({ tripId, itemId }: { tripId: number | string, itemId: number | string }) => {
            const { error } = await supabase.from('itinerary_items').delete().eq('id', itemId);
            if (error) throw error;
        },
        onSuccess: invalidateTrips,
    });

    const addAccommodationMutation = useMutation({
        mutationFn: async ({ tripId, item }: { tripId: number | string, item: any }) => {
            const { data, error } = await supabase
                .from('accommodation')
                .insert([{
                    trip_id: tripId,
                    name: item.name,
                    address: item.address,
                    check_in: item.checkIn,
                    check_out: item.checkOut,
                    notes: `Type: ${item.type}. ${item.notes || ''}`,
                    cost: item.cost
                }]) as any
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: invalidateTrips,
    });

    const deleteAccommodationMutation = useMutation({
        mutationFn: async ({ tripId, itemId }: { tripId: number | string, itemId: number | string }) => {
            const { error } = await supabase.from('accommodation').delete().eq('id', itemId);
            if (error) throw error;
        },
        onSuccess: invalidateTrips,
    });

    const addTransportMutation = useMutation({
        mutationFn: async ({ tripId, item }: { tripId: number | string, item: any }) => {
            const { data, error } = await supabase
                .from('transport')
                .insert([{
                    trip_id: tripId,
                    type: item.type,
                    booking_reference: item.number,
                    departure_location: item.from,
                    arrival_location: item.to,
                    departure_time: item.depart,
                    arrival_time: item.arrive,
                    cost: item.cost
                }]) as any
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: invalidateTrips,
    });

    const deleteTransportMutation = useMutation({
        mutationFn: async ({ tripId, itemId }: { tripId: number | string, itemId: number | string }) => {
            const { error } = await supabase.from('transport').delete().eq('id', itemId);
            if (error) throw error;
        },
        onSuccess: invalidateTrips,
    });

    const addTicketMutation = useMutation({
        mutationFn: async ({ tripId, ticket }: { tripId: number | string, ticket: any }) => {
            const { data, error } = await supabase
                .from('tickets')
                .insert([{
                    trip_id: tripId,
                    type: ticket.type,
                    provider: ticket.provider,
                    reference_number: ticket.refNumber,
                    departure_time: ticket.departs,
                    arrival_time: ticket.arrives,
                    notes: ticket.notes,
                    file_url: ticket.file
                }]) as any
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: invalidateTrips,
    });

    const deleteTicketMutation = useMutation({
        mutationFn: async ({ tripId, ticketId }: { tripId: number | string, ticketId: number | string }) => {
            const { error } = await supabase.from('tickets').delete().eq('id', ticketId);
            if (error) throw error;
        },
        onSuccess: invalidateTrips,
    });

    const addPackingItemMutation = useMutation({
        mutationFn: async ({ tripId, item }: { tripId: number | string, item: any }) => {
            const { data, error } = await supabase
                .from('packing_items')
                .insert([{
                    trip_id: tripId,
                    item: item.text,
                    category: item.category,
                    is_packed: item.checked
                }]) as any
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: invalidateTrips,
    });

    const updatePackingItemMutation = useMutation({
        mutationFn: async ({ tripId, itemId, updates }: { tripId: number | string, itemId: number | string, updates: any }) => {
            const dbUpdates: any = {};
            if (updates.is_packed !== undefined) dbUpdates.is_packed = updates.is_packed;
            const { data, error } = await supabase
                .from('packing_items')
                .update(dbUpdates)
                .eq('id', itemId)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: invalidateTrips,
    });

    const deletePackingItemMutation = useMutation({
        mutationFn: async ({ tripId, itemId }: { tripId: number | string, itemId: number | string }) => {
            const { error } = await supabase.from('packing_items').delete().eq('id', itemId);
            if (error) throw error;
        },
        onSuccess: invalidateTrips,
    });

    const resetPackingListMutation = useMutation({
        mutationFn: async (tripId: number | string) => {
            const { error } = await supabase
                .from('packing_items')
                .update({ is_packed: false })
                .eq('trip_id', tripId);
            if (error) throw error;
        },
        onSuccess: invalidateTrips,
    });

    const addNoteMutation = useMutation({
        mutationFn: async ({ tripId, note }: { tripId: number | string, note: any }) => {
            const { data, error } = await supabase
                .from('documents')
                .insert([{
                    trip_id: tripId,
                    title: note.title,
                    content: note.content,
                    type: 'note'
                }]) as any
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: invalidateTrips,
    });

    const deleteNoteMutation = useMutation({
        mutationFn: async ({ tripId, noteId }: { tripId: number | string, noteId: number | string }) => {
            const { error } = await supabase.from('documents').delete().eq('id', noteId);
            if (error) throw error;
        },
        onSuccess: invalidateTrips,
    });

    const addExpenseMutation = useMutation({
        mutationFn: async ({ tripId, expense }: { tripId: number | string, expense: any }) => {
            const { data, error } = await supabase
                .from('expenses')
                .insert([{
                    trip_id: tripId,
                    payer: expense.payer,
                    amount: expense.amount,
                    description: expense.description,
                    date: expense.date,
                    category: expense.category,
                    split_with: expense.splitWith
                }]) as any
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: invalidateTrips,
    });

    const deleteExpenseMutation = useMutation({
        mutationFn: async ({ tripId, expenseId }: { tripId: number | string, expenseId: number | string }) => {
            const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
            if (error) throw error;
        },
        onSuccess: invalidateTrips,
    });

    const updateTripMembersMutation = useMutation({
        mutationFn: async ({ tripId, members }: { tripId: number | string, members: string[] }) => {
            const { data, error } = await supabase
                .from('trips')
                .update({ members: members })
                .eq('id', tripId)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: invalidateTrips,
    });

    const getTrip = (id: number | string) => {
        return trips.find((t: Trip) => t.id === Number(id));
    };

    return (
        <TripContext.Provider value={{
            trips,
            loading,
            getTrip,
            refreshTrips: invalidateTrips,
            addTrip: addTripMutation.mutateAsync,
            updateTrip: (id, updates) => updateTripMutation.mutateAsync({ id, updates }),
            deleteTrip: deleteTripMutation.mutateAsync,
            addItineraryItem: (tripId, item) => addItineraryItemMutation.mutateAsync({ tripId, item }),
            deleteItineraryItem: (tripId, itemId) => deleteItineraryItemMutation.mutateAsync({ tripId, itemId }),
            addAccommodation: (tripId, item) => addAccommodationMutation.mutateAsync({ tripId, item }),
            deleteAccommodation: (tripId, itemId) => deleteAccommodationMutation.mutateAsync({ tripId, itemId }),
            addTransport: (tripId, item) => addTransportMutation.mutateAsync({ tripId, item }),
            deleteTransport: (tripId, itemId) => deleteTransportMutation.mutateAsync({ tripId, itemId }),
            addTicket: (tripId, ticket) => addTicketMutation.mutateAsync({ tripId, ticket }),
            deleteTicket: (tripId, ticketId) => deleteTicketMutation.mutateAsync({ tripId, ticketId }),
            addPackingItem: (tripId, item) => addPackingItemMutation.mutateAsync({ tripId, item }),
            updatePackingItem: (tripId, itemId, updates) => updatePackingItemMutation.mutateAsync({ tripId, itemId, updates }),
            deletePackingItem: (tripId, itemId) => deletePackingItemMutation.mutateAsync({ tripId, itemId }),
            resetPackingList: resetPackingListMutation.mutateAsync,
            addNote: (tripId, note) => addNoteMutation.mutateAsync({ tripId, note }),
            deleteNote: (tripId, noteId) => deleteNoteMutation.mutateAsync({ tripId, noteId }),
            addExpense: (tripId, expense) => addExpenseMutation.mutateAsync({ tripId, expense }),
            deleteExpense: (tripId, expenseId) => deleteExpenseMutation.mutateAsync({ tripId, expenseId }),
            updateTripMembers: (tripId, members) => updateTripMembersMutation.mutateAsync({ tripId, members }),
        }}>
            {children}
        </TripContext.Provider>
    );
};
