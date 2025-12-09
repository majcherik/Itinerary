import type { Trip } from '../../context/TripContext';

/**
 * Generates a JSON backup of the entire trip with all related data
 */
export function generateJSONExport(trip: Trip): string {
    // Create a clean copy of the trip object with all data
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        trip: {
            id: trip.id,
            title: trip.title,
            city: trip.city,
            start_date: trip.start_date,
            end_date: trip.end_date,
            hero_image: trip.hero_image,
            visa_status: trip.visa_status,
            visa_info: trip.visa_info,
            members: trip.members,
            itinerary: trip.itinerary || [],
            accommodation: trip.accommodation || [],
            transport: trip.transport || [],
            wallet: trip.wallet || [],
            packingList: trip.packingList || [],
            documents: trip.documents || [],
            expenses: trip.expenses || [],
        },
        metadata: {
            itinerary_count: trip.itinerary?.length || 0,
            accommodation_count: trip.accommodation?.length || 0,
            transport_count: trip.transport?.length || 0,
            ticket_count: trip.wallet?.length || 0,
            packing_items_count: trip.packingList?.length || 0,
            document_count: trip.documents?.length || 0,
            expense_count: trip.expenses?.length || 0,
            total_expenses: trip.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0,
        },
    };

    // Return pretty-printed JSON
    return JSON.stringify(exportData, null, 2);
}
