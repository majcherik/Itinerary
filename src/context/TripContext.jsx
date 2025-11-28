import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const TripContext = createContext();

export const useTrip = () => {
    const context = useContext(TripContext);
    if (!context) {
        throw new Error('useTrip must be used within a TripProvider');
    }
    return context;
};

export const TripProvider = ({ children }) => {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch trips on mount or when user changes
    useEffect(() => {
        if (user) {
            fetchTrips();
        } else {
            setTrips([]);
            setLoading(false);
        }
    }, [user]);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            // Fetch trips with all related data
            const { data, error } = await supabase
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
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTrips(data || []);
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTrip = async (tripData) => {
        try {
            const { data, error } = await supabase
                .from('trips')
                .insert([{
                    user_id: user.id,
                    title: tripData.title,
                    start_date: tripData.startDate,
                    end_date: tripData.endDate,
                    city: tripData.city,
                    hero_image: tripData.heroImage
                }])
                .select()
                .single();

            if (error) throw error;
            // Add empty arrays for related tables to local state to avoid refetching immediately
            setTrips(prev => [{ ...data, itinerary: [], packingList: [], documents: [], wallet: [], accommodation: [], transport: [] }, ...prev]);
            return data;
        } catch (error) {
            console.error('Error adding trip:', error);
            throw error;
        }
    };

    const deleteTrip = async (id) => {
        try {
            const { error } = await supabase
                .from('trips')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setTrips(prev => prev.filter(t => t.id !== Number(id)));
        } catch (error) {
            console.error('Error deleting trip:', error);
        }
    };

    const updateTrip = async (id, updates) => {
        try {
            // Map frontend keys to DB keys if necessary (e.g. startDate -> start_date)
            // For now assuming updates object keys match DB columns or are handled before calling
            // But typically we might need mapping. Let's assume the caller handles mapping for now or we map common ones.
            const dbUpdates = {};
            if (updates.title) dbUpdates.title = updates.title;
            if (updates.startDate) dbUpdates.start_date = updates.startDate;
            if (updates.endDate) dbUpdates.end_date = updates.endDate;
            if (updates.city) dbUpdates.city = updates.city;
            if (updates.heroImage) dbUpdates.hero_image = updates.heroImage;
            if (updates.visa_status) dbUpdates.visa_status = updates.visa_status;
            if (updates.visa_info) dbUpdates.visa_info = updates.visa_info;

            const { data, error } = await supabase
                .from('trips')
                .update(dbUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setTrips(prev => prev.map(t => t.id === Number(id) ? { ...t, ...data } : t));
        } catch (error) {
            console.error('Error updating trip:', error);
        }
    };

    const getTrip = (id) => {
        return trips.find((t) => t.id === Number(id));
    };

    // --- Sub-items Helpers ---

    const addItineraryItem = async (tripId, item) => {
        try {
            const { data, error } = await supabase
                .from('itinerary_items')
                .insert([{
                    trip_id: tripId,
                    // Schema: day date, time time.
                    // Frontend sends: day (number), date (string), description, title, cost.
                    // We map frontend 'date' -> DB 'day'.
                    day: item.date,
                    activity: item.title,
                    notes: item.description,
                    cost: item.cost,
                    time: item.time || null
                }])
                .select()
                .single();

            if (error) throw error;

            // Update local state
            // We need to map back DB fields to frontend fields for consistency
            const newItem = {
                id: data.id,
                day: item.day, // Keep the day number from frontend for UI sorting if needed, or recalculate
                date: data.day,
                title: data.activity,
                description: data.notes,
                cost: data.cost,
                time: data.time
            };

            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                itinerary: [...(t.itinerary || []), newItem]
            } : t));
        } catch (error) {
            console.error('Error adding itinerary item:', error);
        }
    };

    const deleteItineraryItem = async (tripId, itemId) => {
        try {
            const { error } = await supabase
                .from('itinerary_items')
                .delete()
                .eq('id', itemId);

            if (error) throw error;
            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                itinerary: t.itinerary.filter(i => i.id !== itemId)
            } : t));
        } catch (error) {
            console.error('Error deleting itinerary item:', error);
        }
    };

    const addAccommodation = async (tripId, item) => {
        try {
            const { data, error } = await supabase
                .from('accommodation')
                .insert([{
                    trip_id: tripId,
                    name: item.name,
                    address: item.address,
                    check_in: item.checkIn,
                    check_out: item.checkOut,
                    // Mapping type to notes since schema lacks type column
                    notes: `Type: ${item.type}. ${item.notes || ''}`,
                    cost: item.cost
                }])
                .select()
                .single();

            if (error) throw error;

            const newItem = {
                id: data.id,
                name: data.name,
                address: data.address,
                checkIn: data.check_in,
                checkOut: data.check_out,
                type: item.type, // Optimistic
                cost: data.cost
            };

            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                accommodation: [...(t.accommodation || []), newItem]
            } : t));
        } catch (error) {
            console.error('Error adding accommodation:', error);
        }
    };

    const deleteAccommodation = async (tripId, itemId) => {
        try {
            const { error } = await supabase
                .from('accommodation')
                .delete()
                .eq('id', itemId);

            if (error) throw error;
            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                accommodation: t.accommodation.filter(i => i.id !== itemId)
            } : t));
        } catch (error) {
            console.error('Error deleting accommodation:', error);
        }
    };

    const addTransport = async (tripId, item) => {
        try {
            const { data, error } = await supabase
                .from('transport')
                .insert([{
                    trip_id: tripId,
                    type: item.type,
                    provider: item.number, // Mapping number to provider or notes? Schema: type, provider, departure_location...
                    // Frontend: type, number, from, to, depart, arrive, cost.
                    // Mapping: 
                    // type -> type
                    // number -> booking_reference (or provider?) Let's use booking_reference for number (flight number etc)
                    booking_reference: item.number,
                    departure_location: item.from,
                    arrival_location: item.to,
                    departure_time: item.depart,
                    arrival_time: item.arrive,
                    cost: item.cost
                }])
                .select()
                .single();

            if (error) throw error;

            const newItem = {
                id: data.id,
                type: data.type,
                number: data.booking_reference,
                from: data.departure_location,
                to: data.arrival_location,
                depart: data.departure_time,
                arrive: data.arrival_time,
                cost: data.cost
            };

            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                transport: [...(t.transport || []), newItem]
            } : t));
        } catch (error) {
            console.error('Error adding transport:', error);
        }
    };

    const deleteTransport = async (tripId, itemId) => {
        try {
            const { error } = await supabase
                .from('transport')
                .delete()
                .eq('id', itemId);

            if (error) throw error;
            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                transport: t.transport.filter(i => i.id !== itemId)
            } : t));
        } catch (error) {
            console.error('Error deleting transport:', error);
        }
    };

    const addTicket = async (tripId, ticket) => {
        try {
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
                    file_url: ticket.file // Assuming file upload logic is handled elsewhere and we just get URL
                }])
                .select()
                .single();

            if (error) throw error;

            const newItem = {
                id: data.id,
                type: data.type,
                provider: data.provider,
                refNumber: data.reference_number,
                departs: data.departure_time,
                arrives: data.arrival_time,
                notes: data.notes,
                file: data.file_url
            };

            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                wallet: [...(t.wallet || []), newItem]
            } : t));
        } catch (error) {
            console.error('Error adding ticket:', error);
        }
    };

    const deleteTicket = async (tripId, ticketId) => {
        try {
            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                wallet: (t.wallet || []).filter(item => item.id !== ticketId)
            } : t));

            const { error } = await supabase
                .from('tickets')
                .delete()
                .eq('id', ticketId);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting ticket:', error);
        }
    };

    const addPackingItem = async (tripId, item) => {
        try {
            const { data, error } = await supabase
                .from('packing_items')
                .insert([{
                    trip_id: tripId,
                    item: item.text,
                    category: item.category,
                    is_packed: item.checked
                }])
                .select()
                .single();

            if (error) throw error;

            const newItem = {
                id: data.id,
                item: data.item,
                category: data.category,
                is_packed: data.is_packed
            };

            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                packingList: [...(t.packingList || []), newItem]
            } : t));
        } catch (error) {
            console.error('Error adding packing item:', error);
        }
    };

    const updatePackingItem = async (tripId, itemId, updates) => {
        try {
            const dbUpdates = {};
            if (updates.is_packed !== undefined) dbUpdates.is_packed = updates.is_packed;
            // Add other fields if editable

            const { data, error } = await supabase
                .from('packing_items')
                .update(dbUpdates)
                .eq('id', itemId)
                .select()
                .single();

            if (error) throw error;

            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                packingList: t.packingList.map(item => item.id === itemId ? { ...item, is_packed: data.is_packed } : item)
            } : t));
        } catch (error) {
            console.error('Error updating packing item:', error);
        }
    };

    const deletePackingItem = async (tripId, itemId) => {
        try {
            const { error } = await supabase
                .from('packing_items')
                .delete()
                .eq('id', itemId);

            if (error) throw error;
            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                packingList: t.packingList.filter(item => item.id !== itemId)
            } : t));
        } catch (error) {
            console.error('Error deleting packing item:', error);
        }
    };

    const addNote = async (tripId, note) => {
        try {
            const { data, error } = await supabase
                .from('documents')
                .insert([{
                    trip_id: tripId,
                    title: note.title,
                    content: note.content,
                    type: 'note'
                }])
                .select()
                .single();

            if (error) throw error;

            const newItem = {
                id: data.id,
                title: data.title,
                content: data.content,
                date: new Date(data.created_at).toLocaleDateString()
            };

            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                documents: [...(t.documents || []), newItem]
            } : t));
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const deleteNote = async (tripId, noteId) => {
        try {
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', noteId);

            if (error) throw error;
            setTrips(prev => prev.map(t => t.id === Number(tripId) ? {
                ...t,
                documents: t.documents.filter(n => n.id !== noteId)
            } : t));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const resetPackingList = async (tripId) => {
        try {
            // Optimistic update
            setTrips(prevTrips => prevTrips.map(trip => {
                if (trip.id === tripId) {
                    return {
                        ...trip,
                        packingList: trip.packingList.map(item => ({ ...item, is_packed: false }))
                    };
                }
                return trip;
            }));

            const { error } = await supabase
                .from('packing_items')
                .update({ is_packed: false })
                .eq('trip_id', tripId);

            if (error) throw error;
        } catch (error) {
            console.error('Error resetting packing list:', error);
            // Revert on error would go here
        }
    };

    return (
        <TripContext.Provider value={{
            trips,
            loading,
            addTrip,
            updateTrip,
            deleteTrip,
            getTrip,
            addItineraryItem,
            deleteItineraryItem,
            addAccommodation,
            deleteAccommodation,
            addTransport,
            deleteTransport,
            addTicket,
            deleteTicket,
            addPackingItem,
            updatePackingItem,
            deletePackingItem,
            resetPackingList,
            addNote,
            deleteNote,
            refreshTrips: fetchTrips
        }}>
            {children}
        </TripContext.Provider>
    );
};
