import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import type { Trip } from '../../context/TripContext';
import { formatDate, formatDateTime } from '../utils';

const PRIMARY_COLOR = rgb(0.88, 0.32, 0.37); // #e0525e
const SECONDARY_COLOR = rgb(0.94, 0.94, 0.90); // #fff0e6
const TEXT_COLOR = rgb(0.18, 0.14, 0.22); // #2d2438
const SUBTITLE_COLOR = rgb(0.42, 0.36, 0.44); // #6b5b71

export async function generateTicketWalletPDF(trip: Trip): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const formatTime = (dateTimeStr: string | null) => {
        if (!dateTimeStr) return '';
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    // Generate QR code as PNG buffer
    const generateQRCode = async (data: string): Promise<Uint8Array> => {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(data, {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                width: 200,
                margin: 1,
            });

            // Convert data URL to buffer
            const base64Data = qrCodeDataUrl.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        } catch (error) {
            console.error('Error generating QR code:', error);
            // Return empty array if QR code generation fails
            return new Uint8Array();
        }
    };

    // Collect all tickets from both wallet and transport
    const allTickets: Array<{
        type: string;
        provider: string;
        refNumber: string;
        departure: string;
        arrival: string;
        from?: string;
        to?: string;
        notes?: string;
    }> = [];

    // Add tickets from wallet
    if (trip.wallet) {
        trip.wallet.forEach((ticket) => {
            allTickets.push({
                type: ticket.type,
                provider: ticket.provider || 'N/A',
                refNumber: ticket.refNumber || '',
                departure: ticket.departs || '',
                arrival: ticket.arrives || '',
                notes: ticket.notes,
            });
        });
    }

    // Add transport bookings as tickets
    if (trip.transport) {
        trip.transport.forEach((transport) => {
            allTickets.push({
                type: transport.type,
                provider: 'Transport',
                refNumber: transport.number || '',
                departure: transport.depart || '',
                arrival: transport.arrive || '',
                from: transport.from,
                to: transport.to,
            });
        });
    }

    // If no tickets, create a single page with message
    if (allTickets.length === 0) {
        const page = pdfDoc.addPage([595, 842]);
        const { width, height } = page.getSize();

        page.drawText('No Tickets Available', {
            x: 50,
            y: height - 100,
            size: 24,
            font: boldFont,
            color: PRIMARY_COLOR,
        });

        page.drawText('Add tickets or transport bookings to generate your ticket wallet.', {
            x: 50,
            y: height - 140,
            size: 12,
            font: font,
            color: SUBTITLE_COLOR,
        });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    }

    // Create one page per ticket (wallet-style)
    for (const ticket of allTickets) {
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const { width, height } = page.getSize();

        // Draw ticket background with border
        page.drawRectangle({
            x: 40,
            y: height - 650,
            width: width - 80,
            height: 600,
            borderColor: PRIMARY_COLOR,
            borderWidth: 3,
            color: rgb(1, 1, 1),
        });

        // Header section
        let yPos = height - 80;

        // Ticket type (large)
        page.drawText(ticket.type.toUpperCase(), {
            x: 60,
            y: yPos,
            size: 28,
            font: boldFont,
            color: PRIMARY_COLOR,
        });

        yPos -= 40;

        // Divider
        page.drawLine({
            start: { x: 60, y: yPos },
            end: { x: width - 60, y: yPos },
            thickness: 2,
            color: SECONDARY_COLOR,
        });

        yPos -= 40;

        // Provider
        page.drawText('Provider:', {
            x: 60,
            y: yPos,
            size: 11,
            font: font,
            color: SUBTITLE_COLOR,
        });

        page.drawText(ticket.provider, {
            x: 180,
            y: yPos,
            size: 14,
            font: boldFont,
            color: TEXT_COLOR,
        });

        yPos -= 35;

        // Booking Reference (prominent)
        page.drawText('Booking Reference:', {
            x: 60,
            y: yPos,
            size: 11,
            font: font,
            color: SUBTITLE_COLOR,
        });

        yPos -= 25;

        page.drawText(ticket.refNumber || 'N/A', {
            x: 60,
            y: yPos,
            size: 22,
            font: boldFont,
            color: TEXT_COLOR,
        });

        yPos -= 50;

        // Divider
        page.drawLine({
            start: { x: 60, y: yPos },
            end: { x: width - 60, y: yPos },
            thickness: 1,
            color: SECONDARY_COLOR,
        });

        yPos -= 30;

        // Departure info
        page.drawText('DEPARTURE', {
            x: 60,
            y: yPos,
            size: 10,
            font: boldFont,
            color: SUBTITLE_COLOR,
        });

        yPos -= 20;

        if (ticket.from) {
            page.drawText(ticket.from, {
                x: 60,
                y: yPos,
                size: 16,
                font: boldFont,
                color: TEXT_COLOR,
            });

            yPos -= 22;
        }

        page.drawText(`${formatDate(ticket.departure)} ${formatTime(ticket.departure)}`, {
            x: 60,
            y: yPos,
            size: 12,
            font: font,
            color: TEXT_COLOR,
        });

        yPos -= 40;

        // Arrival info
        page.drawText('ARRIVAL', {
            x: 60,
            y: yPos,
            size: 10,
            font: boldFont,
            color: SUBTITLE_COLOR,
        });

        yPos -= 20;

        if (ticket.to) {
            page.drawText(ticket.to, {
                x: 60,
                y: yPos,
                size: 16,
                font: boldFont,
                color: TEXT_COLOR,
            });

            yPos -= 22;
        }

        page.drawText(`${formatDate(ticket.arrival)} ${formatTime(ticket.arrival)}`, {
            x: 60,
            y: yPos,
            size: 12,
            font: font,
            color: TEXT_COLOR,
        });

        yPos -= 50;

        // Notes if available
        if (ticket.notes) {
            page.drawText('Notes:', {
                x: 60,
                y: yPos,
                size: 10,
                font: boldFont,
                color: SUBTITLE_COLOR,
            });

            yPos -= 18;

            const notesLines = wrapText(ticket.notes, 60, font, 10);
            notesLines.forEach((line) => {
                page.drawText(line, {
                    x: 60,
                    y: yPos,
                    size: 10,
                    font: font,
                    color: TEXT_COLOR,
                });
                yPos -= 14;
            });

            yPos -= 20;
        }

        // QR Code section
        if (ticket.refNumber) {
            try {
                const qrCodeBytes = await generateQRCode(ticket.refNumber);

                if (qrCodeBytes.length > 0) {
                    const qrImage = await pdfDoc.embedPng(qrCodeBytes);
                    const qrDims = qrImage.scale(0.7);

                    // Center QR code
                    const qrX = width / 2 - qrDims.width / 2;

                    page.drawImage(qrImage, {
                        x: qrX,
                        y: height - 600,
                        width: qrDims.width,
                        height: qrDims.height,
                    });

                    // QR code label
                    page.drawText('Scan for booking reference', {
                        x: width / 2 - 80,
                        y: height - 620,
                        size: 9,
                        font: font,
                        color: SUBTITLE_COLOR,
                    });
                }
            } catch (error) {
                console.error('Failed to embed QR code:', error);
            }
        }

        // Footer
        page.drawText('Keep this ticket accessible during your journey', {
            x: 60,
            y: 60,
            size: 9,
            font: font,
            color: SUBTITLE_COLOR,
        });

        page.drawText(`${trip.title || 'Trip'} | Generated with Itinerary Planner`, {
            x: 60,
            y: 45,
            size: 9,
            font: font,
            color: SUBTITLE_COLOR,
        });
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
