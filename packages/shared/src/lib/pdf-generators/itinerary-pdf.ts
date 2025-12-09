import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Trip } from '../../context/TripContext';

const PRIMARY_COLOR = rgb(0.88, 0.32, 0.37); // #e0525e
const SECONDARY_COLOR = rgb(0.94, 0.94, 0.90); // #fff0e6
const TEXT_COLOR = rgb(0.18, 0.14, 0.22); // #2d2438
const SUBTITLE_COLOR = rgb(0.42, 0.36, 0.44); // #6b5b71

interface PDFGenerationOptions {
    includeEmergencyContacts?: boolean;
    includeNotes?: boolean;
}

export async function generateItineraryPDF(
    trip: Trip,
    options: PDFGenerationOptions = {}
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Helper function to add a new page
    const addPage = () => {
        return pdfDoc.addPage([595, 842]); // A4 size
    };

    // Helper function to format date
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    // Helper function to format time
    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return '';
        return timeStr;
    };

    // Cover Page
    const coverPage = addPage();
    const { width, height } = coverPage.getSize();

    // Title
    coverPage.drawText(trip.title || 'Trip Itinerary', {
        x: 50,
        y: height - 100,
        size: 32,
        font: boldFont,
        color: PRIMARY_COLOR,
    });

    // Destination
    if (trip.city) {
        coverPage.drawText(trip.city, {
            x: 50,
            y: height - 140,
            size: 20,
            font: font,
            color: SUBTITLE_COLOR,
        });
    }

    // Dates
    const startDate = formatDate(trip.start_date);
    const endDate = formatDate(trip.end_date);
    coverPage.drawText(`${startDate} - ${endDate}`, {
        x: 50,
        y: height - 170,
        size: 14,
        font: font,
        color: TEXT_COLOR,
    });

    // Divider line
    coverPage.drawLine({
        start: { x: 50, y: height - 190 },
        end: { x: width - 50, y: height - 190 },
        thickness: 2,
        color: PRIMARY_COLOR,
    });

    // Trip Summary
    let yPosition = height - 230;
    coverPage.drawText('Trip Summary', {
        x: 50,
        y: yPosition,
        size: 18,
        font: boldFont,
        color: TEXT_COLOR,
    });

    yPosition -= 30;

    // Count items
    const itineraryCount = trip.itinerary?.length || 0;
    const accommodationCount = trip.accommodation?.length || 0;
    const transportCount = trip.transport?.length || 0;

    const summaryItems = [
        `${itineraryCount} Itinerary Item${itineraryCount !== 1 ? 's' : ''}`,
        `${accommodationCount} Accommodation${accommodationCount !== 1 ? 's' : ''}`,
        `${transportCount} Transport Booking${transportCount !== 1 ? 's' : ''}`,
    ];

    summaryItems.forEach((item) => {
        coverPage.drawText(`• ${item}`, {
            x: 70,
            y: yPosition,
            size: 12,
            font: font,
            color: TEXT_COLOR,
        });
        yPosition -= 20;
    });

    // Footer
    coverPage.drawText('Generated with Itinerary Planner', {
        x: 50,
        y: 50,
        size: 10,
        font: font,
        color: SUBTITLE_COLOR,
    });

    // Itinerary Pages
    if (trip.itinerary && trip.itinerary.length > 0) {
        let itineraryPage = addPage();
        let yPos = height - 50;

        // Title
        itineraryPage.drawText('Day-by-Day Itinerary', {
            x: 50,
            y: yPos,
            size: 24,
            font: boldFont,
            color: PRIMARY_COLOR,
        });

        yPos -= 40;

        const sortedItinerary = [...trip.itinerary].sort((a, b) => {
            const dayA = typeof a.day === 'number' ? a.day : parseInt(String(a.day));
            const dayB = typeof b.day === 'number' ? b.day : parseInt(String(b.day));
            return dayA - dayB;
        });

        sortedItinerary.forEach((item, index) => {
            // Check if we need a new page
            if (yPos < 150) {
                itineraryPage = addPage();
                yPos = height - 50;
                itineraryPage.drawText('Day-by-Day Itinerary (continued)', {
                    x: 50,
                    y: yPos,
                    size: 18,
                    font: boldFont,
                    color: PRIMARY_COLOR,
                });
                yPos -= 40;
            }

            // Day header
            const dayText = item.date || `Day ${item.day}`;
            itineraryPage.drawText(dayText, {
                x: 50,
                y: yPos,
                size: 14,
                font: boldFont,
                color: TEXT_COLOR,
            });

            yPos -= 20;

            // Title
            itineraryPage.drawText(item.title, {
                x: 70,
                y: yPos,
                size: 12,
                font: boldFont,
                color: TEXT_COLOR,
            });

            yPos -= 18;

            // Time if available
            if (item.time) {
                itineraryPage.drawText(`Time: ${formatTime(item.time)}`, {
                    x: 70,
                    y: yPos,
                    size: 10,
                    font: font,
                    color: SUBTITLE_COLOR,
                });
                yPos -= 16;
            }

            // Description
            if (item.description) {
                const descLines = wrapText(item.description, 70, font, 10);
                descLines.forEach((line) => {
                    itineraryPage.drawText(line, {
                        x: 70,
                        y: yPos,
                        size: 10,
                        font: font,
                        color: TEXT_COLOR,
                    });
                    yPos -= 14;
                });
            }

            // Cost
            if (item.cost) {
                itineraryPage.drawText(`Cost: $${Number(item.cost).toFixed(2)}`, {
                    x: 70,
                    y: yPos,
                    size: 10,
                    font: font,
                    color: SUBTITLE_COLOR,
                });
                yPos -= 16;
            }

            yPos -= 10; // Space between items
        });
    }

    // Accommodation Pages
    if (trip.accommodation && trip.accommodation.length > 0) {
        let accomPage = addPage();
        let yPos = height - 50;

        accomPage.drawText('Accommodations', {
            x: 50,
            y: yPos,
            size: 24,
            font: boldFont,
            color: PRIMARY_COLOR,
        });

        yPos -= 40;

        trip.accommodation.forEach((accom) => {
            if (yPos < 150) {
                accomPage = addPage();
                yPos = height - 50;
                accomPage.drawText('Accommodations (continued)', {
                    x: 50,
                    y: yPos,
                    size: 18,
                    font: boldFont,
                    color: PRIMARY_COLOR,
                });
                yPos -= 40;
            }

            // Name
            accomPage.drawText(accom.name, {
                x: 50,
                y: yPos,
                size: 14,
                font: boldFont,
                color: TEXT_COLOR,
            });

            yPos -= 20;

            // Address
            if (accom.address) {
                const addressLines = wrapText(accom.address, 65, font, 10);
                addressLines.forEach((line) => {
                    accomPage.drawText(line, {
                        x: 70,
                        y: yPos,
                        size: 10,
                        font: font,
                        color: TEXT_COLOR,
                    });
                    yPos -= 14;
                });
            }

            // Check-in / Check-out
            if (accom.checkIn || accom.checkOut) {
                accomPage.drawText(
                    `Check-in: ${formatDate(accom.checkIn)} | Check-out: ${formatDate(accom.checkOut)}`,
                    {
                        x: 70,
                        y: yPos,
                        size: 10,
                        font: font,
                        color: SUBTITLE_COLOR,
                    }
                );
                yPos -= 16;
            }

            // Type
            if (accom.type) {
                accomPage.drawText(`Type: ${accom.type}`, {
                    x: 70,
                    y: yPos,
                    size: 10,
                    font: font,
                    color: TEXT_COLOR,
                });
                yPos -= 16;
            }

            // Notes
            if (accom.notes) {
                const notesLines = wrapText(accom.notes, 65, font, 10);
                notesLines.forEach((line) => {
                    accomPage.drawText(line, {
                        x: 70,
                        y: yPos,
                        size: 10,
                        font: font,
                        color: TEXT_COLOR,
                    });
                    yPos -= 14;
                });
            }

            // Cost
            if (accom.cost) {
                accomPage.drawText(`Cost: $${Number(accom.cost).toFixed(2)}`, {
                    x: 70,
                    y: yPos,
                    size: 10,
                    font: font,
                    color: SUBTITLE_COLOR,
                });
                yPos -= 16;
            }

            yPos -= 15; // Space between accommodations
        });
    }

    // Transportation Pages
    if (trip.transport && trip.transport.length > 0) {
        let transportPage = addPage();
        let yPos = height - 50;

        transportPage.drawText('Transportation', {
            x: 50,
            y: yPos,
            size: 24,
            font: boldFont,
            color: PRIMARY_COLOR,
        });

        yPos -= 40;

        trip.transport.forEach((trans) => {
            if (yPos < 150) {
                transportPage = addPage();
                yPos = height - 50;
                transportPage.drawText('Transportation (continued)', {
                    x: 50,
                    y: yPos,
                    size: 18,
                    font: boldFont,
                    color: PRIMARY_COLOR,
                });
                yPos -= 40;
            }

            // Type and number
            transportPage.drawText(`${trans.type} - ${trans.number}`, {
                x: 50,
                y: yPos,
                size: 14,
                font: boldFont,
                color: TEXT_COLOR,
            });

            yPos -= 20;

            // Route
            transportPage.drawText(`From: ${trans.from}`, {
                x: 70,
                y: yPos,
                size: 10,
                font: font,
                color: TEXT_COLOR,
            });

            yPos -= 14;

            transportPage.drawText(`To: ${trans.to}`, {
                x: 70,
                y: yPos,
                size: 10,
                font: font,
                color: TEXT_COLOR,
            });

            yPos -= 16;

            // Times
            transportPage.drawText(
                `Departure: ${formatDate(trans.depart)} ${formatTime(trans.depart)}`,
                {
                    x: 70,
                    y: yPos,
                    size: 10,
                    font: font,
                    color: SUBTITLE_COLOR,
                }
            );

            yPos -= 14;

            transportPage.drawText(
                `Arrival: ${formatDate(trans.arrive)} ${formatTime(trans.arrive)}`,
                {
                    x: 70,
                    y: yPos,
                    size: 10,
                    font: font,
                    color: SUBTITLE_COLOR,
                }
            );

            yPos -= 16;

            // Cost
            if (trans.cost) {
                transportPage.drawText(`Cost: $${Number(trans.cost).toFixed(2)}`, {
                    x: 70,
                    y: yPos,
                    size: 10,
                    font: font,
                    color: SUBTITLE_COLOR,
                });
                yPos -= 16;
            }

            yPos -= 15; // Space between transport items
        });
    }

    // Emergency Contacts (if option enabled)
    if (options.includeEmergencyContacts && trip.documents) {
        const emergencyDocs = trip.documents.filter((doc) => doc.type === 'emergency');
        if (emergencyDocs.length > 0) {
            const emergencyPage = addPage();
            let yPos = height - 50;

            emergencyPage.drawText('Emergency Contacts', {
                x: 50,
                y: yPos,
                size: 24,
                font: boldFont,
                color: PRIMARY_COLOR,
            });

            yPos -= 40;

            emergencyDocs.forEach((doc) => {
                emergencyPage.drawText(doc.title, {
                    x: 50,
                    y: yPos,
                    size: 12,
                    font: boldFont,
                    color: TEXT_COLOR,
                });

                yPos -= 18;

                const content = Array.isArray(doc.content) ? doc.content.join('\n') : doc.content;
                const contentLines = wrapText(content, 70, font, 10);

                contentLines.forEach((line) => {
                    emergencyPage.drawText(line, {
                        x: 70,
                        y: yPos,
                        size: 10,
                        font: font,
                        color: TEXT_COLOR,
                    });
                    yPos -= 14;
                });

                yPos -= 10;
            });
        }
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

// Helper function to wrap text
function wrapText(text: string, maxChars: number, font: any, size: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length > maxChars) {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}
