import { createEvents, EventAttributes, DateArray } from 'ics';
import type { Trip } from '../../context/TripContext';

export async function generateCalendarExport(trip: Trip): Promise<string> {
    const events: EventAttributes[] = [];

    // Helper to parse date string to DateArray [year, month, day, hour, minute]
    const parseDateToArray = (dateStr: string | null): DateArray | undefined => {
        if (!dateStr) return undefined;
        try {
            const date = new Date(dateStr);
            return [
                date.getFullYear(),
                date.getMonth() + 1, // months are 1-indexed in ics
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
            ];
        } catch {
            return undefined;
        }
    };

    // Helper to parse date string for all-day events
    const parseDateToArrayAllDay = (dateStr: string | null): DateArray | undefined => {
        if (!dateStr) return undefined;
        try {
            const date = new Date(dateStr);
            return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
        } catch {
            return undefined;
        }
    };

    // Add itinerary items as events
    if (trip.itinerary) {
        trip.itinerary.forEach((item) => {
            let startDate: DateArray | undefined;
            let endDate: DateArray | undefined;

            // Try to parse the date field
            if (item.date) {
                startDate = parseDateToArray(item.date);
            } else if (item.day && trip.start_date) {
                // Calculate date from day number
                const tripStart = new Date(trip.start_date);
                const dayNum = typeof item.day === 'number' ? item.day : parseInt(String(item.day));
                const itemDate = new Date(tripStart);
                itemDate.setDate(tripStart.getDate() + dayNum - 1);

                // If time is specified, parse it
                if (item.time) {
                    try {
                        const [hours, minutes] = item.time.toString().split(':');
                        itemDate.setHours(parseInt(hours), parseInt(minutes));
                        startDate = parseDateToArray(itemDate.toISOString());
                        // Default duration: 2 hours
                        const endTime = new Date(itemDate);
                        endTime.setHours(endTime.getHours() + 2);
                        endDate = parseDateToArray(endTime.toISOString());
                    } catch {
                        startDate = parseDateToArrayAllDay(itemDate.toISOString());
                    }
                } else {
                    startDate = parseDateToArrayAllDay(itemDate.toISOString());
                }
            }

            if (startDate) {
                events.push({
                    title: item.title,
                    description: item.description || '',
                    start: startDate,
                    end: endDate,
                    location: trip.city || '',
                    categories: ['Trip', trip.title || 'Travel'],
                    status: 'CONFIRMED',
                    busyStatus: 'BUSY',
                });
            }
        });
    }

    // Add accommodation check-ins and check-outs
    if (trip.accommodation) {
        trip.accommodation.forEach((accom) => {
            const checkInDate = parseDateToArrayAllDay(accom.checkIn);
            const checkOutDate = parseDateToArrayAllDay(accom.checkOut);

            if (checkInDate) {
                events.push({
                    title: `Check-in: ${accom.name}`,
                    description: `Check-in at ${accom.name}${accom.address ? `\nAddress: ${accom.address}` : ''}${accom.notes ? `\nNotes: ${accom.notes}` : ''}`,
                    start: checkInDate,
                    location: accom.address || accom.name,
                    categories: ['Accommodation', trip.title || 'Travel'],
                    status: 'CONFIRMED',
                    busyStatus: 'BUSY',
                });
            }

            if (checkOutDate) {
                events.push({
                    title: `Check-out: ${accom.name}`,
                    description: `Check-out from ${accom.name}`,
                    start: checkOutDate,
                    location: accom.address || accom.name,
                    categories: ['Accommodation', trip.title || 'Travel'],
                    status: 'CONFIRMED',
                    busyStatus: 'BUSY',
                });
            }
        });
    }

    // Add transport as timed events
    if (trip.transport) {
        trip.transport.forEach((transport) => {
            const departDate = parseDateToArray(transport.depart);
            const arriveDate = parseDateToArray(transport.arrive);

            if (departDate && arriveDate) {
                events.push({
                    title: `${transport.type}: ${transport.from} → ${transport.to}`,
                    description: `${transport.type} - ${transport.number || 'N/A'}\nFrom: ${transport.from}\nTo: ${transport.to}${transport.cost ? `\nCost: $${transport.cost}` : ''}`,
                    start: departDate,
                    end: arriveDate,
                    location: transport.from,
                    categories: ['Transport', trip.title || 'Travel'],
                    status: 'CONFIRMED',
                    busyStatus: 'BUSY',
                });
            }
        });
    }

    // Create ICS file
    const { error, value } = createEvents(events);

    if (error) {
        console.error('Error creating calendar events:', error);
        throw new Error('Failed to generate calendar file');
    }

    return value || '';
}
