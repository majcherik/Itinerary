import React, { createContext, useContext, useState, useEffect } from 'react';

const TripContext = createContext();

export const useTrip = () => {
    const context = useContext(TripContext);
    if (!context) {
        throw new Error('useTrip must be used within a TripProvider');
    }
    return context;
};

export const TripProvider = ({ children }) => {
    const [trips, setTrips] = useState(() => {
        const savedTrips = localStorage.getItem('trips');
        return savedTrips ? JSON.parse(savedTrips) : [];
    });

    useEffect(() => {
        localStorage.setItem('trips', JSON.stringify(trips));
    }, [trips]);

    const addTrip = (trip) => {
        setTrips((prevTrips) => [...prevTrips, { ...trip, wallet: [], packingList: [], documents: [] }]);
    };

    const getTrip = (id) => {
        return trips.find((t) => t.id === Number(id));
    };

    const deleteTrip = (id) => {
        setTrips((prevTrips) => prevTrips.filter((t) => t.id !== Number(id)));
    };

    const updateTrip = (id, updates) => {
        setTrips((prevTrips) => prevTrips.map((t) => t.id === Number(id) ? { ...t, ...updates } : t));
    };

    const addTicket = (tripId, ticket) => {
        setTrips(trips.map(t => t.id === Number(tripId) ? { ...t, wallet: [...(t.wallet || []), ticket] } : t));
    };

    const addPackingItem = (tripId, item) => {
        setTrips(trips.map(t => t.id === Number(tripId) ? { ...t, packingList: [...(t.packingList || []), item] } : t));
    };

    const updatePackingItem = (tripId, itemId, updates) => {
        setTrips(trips.map(t => t.id === Number(tripId) ? {
            ...t,
            packingList: t.packingList.map(item => item.id === itemId ? { ...item, ...updates } : item)
        } : t));
    };

    const deletePackingItem = (tripId, itemId) => {
        setTrips(trips.map(t => t.id === Number(tripId) ? {
            ...t,
            packingList: t.packingList.filter(item => item.id !== itemId)
        } : t));
    };

    const addNote = (tripId, note) => {
        setTrips(trips.map(t => t.id === Number(tripId) ? { ...t, documents: [...(t.documents || []), note] } : t));
    };

    // New methods for Trip Details
    const addItineraryItem = (tripId, item) => {
        setTrips(trips.map(t => t.id === Number(tripId) ? { ...t, itinerary: [...(t.itinerary || []), item] } : t));
    };

    const deleteItineraryItem = (tripId, itemId) => {
        // Assuming items might not have IDs initially, we might need to rely on index or add IDs. 
        // For now, let's assume we'll add IDs to new items and existing mock data needs IDs if not present.
        // The mock data has 'day' but not unique ID for the item itself. Let's use day/date combination or just filter by object ref if possible, 
        // but for React state, ID is best. Let's assume we pass the item object or index. 
        // Better: Let's add IDs to the mock data or generate them.
        // For simplicity in this refactor, let's filter by a unique property or just index if we must, but ID is safer.
        // Let's assume the caller provides a way to identify. 
        // Actually, let's just use the item itself for removal if we don't have IDs, or add IDs to everything.
        // Let's go with adding IDs to everything in the UI when creating.
        setTrips(trips.map(t => t.id === Number(tripId) ? {
            ...t,
            itinerary: t.itinerary.filter(i => i !== itemId) // If itemId is the object itself or an ID. Let's assume ID.
        } : t));
    };

    // Actually, let's make sure we can delete by index or ID. 
    // To be safe and consistent, let's assume we will pass the *item object* to delete, or add IDs.
    // Let's update the mock data to have IDs for itinerary, accommodation, transport to make this easier.
    // For now, I will implement a generic delete that takes a filter function or ID.
    // Let's stick to ID. I will update the mock data in the state initialization to ensure they have IDs? 
    // Or just generate IDs on the fly? 
    // Let's just use a simple filter: if the item has an ID, use it. If not, maybe use index?
    // Let's try to use ID.

    const deleteItineraryItemById = (tripId, itemId) => {
        setTrips(trips.map(t => t.id === Number(tripId) ? {
            ...t,
            itinerary: t.itinerary.filter(i => i.id !== itemId)
        } : t));
    };

    const addAccommodation = (tripId, item) => {
        setTrips(trips.map(t => t.id === Number(tripId) ? { ...t, accommodation: [...(t.accommodation || []), item] } : t));
    };

    const deleteAccommodation = (tripId, itemId) => {
        setTrips(trips.map(t => t.id === Number(tripId) ? {
            ...t,
            accommodation: t.accommodation.filter(i => i.id !== itemId)
        } : t));
    };

    const addTransport = (tripId, item) => {
        setTrips(trips.map(t => t.id === Number(tripId) ? { ...t, transport: [...(t.transport || []), item] } : t));
    };

    const deleteTransport = (tripId, itemId) => {
        setTrips(trips.map(t => t.id === Number(tripId) ? {
            ...t,
            transport: t.transport.filter(i => i.id !== itemId)
        } : t));
    };

    return (
        <TripContext.Provider value={{
            trips,
            addTrip,
            deleteTrip,
            updateTrip,
            getTrip,
            addTicket,
            addPackingItem,
            updatePackingItem,
            deletePackingItem,
            addNote,
            addItineraryItem,
            deleteItineraryItem: deleteItineraryItemById,
            addAccommodation,
            deleteAccommodation,
            addTransport,
            deleteTransport
        }}>
            {children}
        </TripContext.Provider>
    );
};
