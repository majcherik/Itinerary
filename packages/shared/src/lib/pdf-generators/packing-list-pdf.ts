import { PDFDocument, rgb, StandardFonts, PDFCheckBox, PDFForm } from 'pdf-lib';
import type { Trip } from '../../context/TripContext';

const PRIMARY_COLOR = rgb(0.88, 0.32, 0.37); // #e0525e
const SECONDARY_COLOR = rgb(0.94, 0.94, 0.90); // #fff0e6
const TEXT_COLOR = rgb(0.18, 0.14, 0.22); // #2d2438
const SUBTITLE_COLOR = rgb(0.42, 0.36, 0.44); // #6b5b71

export async function generatePackingListPDF(trip: Trip): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const addPage = () => {
        return pdfDoc.addPage([595, 842]); // A4 size
    };

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

    // Create form for checkboxes
    const form: PDFForm = pdfDoc.getForm();

    let page = addPage();
    const { width, height } = page.getSize();
    let yPosition = height - 50;

    // Title
    page.drawText('Packing List', {
        x: 50,
        y: yPosition,
        size: 28,
        font: boldFont,
        color: PRIMARY_COLOR,
    });

    yPosition -= 30;

    // Trip info
    page.drawText(`${trip.title || 'Trip'}`, {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: TEXT_COLOR,
    });

    yPosition -= 20;

    if (trip.city) {
        page.drawText(trip.city, {
            x: 50,
            y: yPosition,
            size: 12,
            font: font,
            color: SUBTITLE_COLOR,
        });

        yPosition -= 16;
    }

    const startDate = formatDate(trip.start_date);
    const endDate = formatDate(trip.end_date);
    page.drawText(`${startDate} - ${endDate}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
        color: SUBTITLE_COLOR,
    });

    yPosition -= 30;

    // Divider
    page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: width - 50, y: yPosition },
        thickness: 2,
        color: PRIMARY_COLOR,
    });

    yPosition -= 30;

    // Group items by category
    const packingItems = trip.packingList || [];
    const categories = new Map<string, typeof packingItems>();

    packingItems.forEach((item) => {
        const category = item.category || 'Other';
        if (!categories.has(category)) {
            categories.set(category, []);
        }
        categories.get(category)!.push(item);
    });

    // Sort categories alphabetically
    const sortedCategories = Array.from(categories.keys()).sort();

    sortedCategories.forEach((category, catIndex) => {
        const items = categories.get(category)!;

        // Check if we need a new page
        if (yPosition < 150) {
            page = addPage();
            yPosition = height - 50;

            page.drawText('Packing List (continued)', {
                x: 50,
                y: yPosition,
                size: 18,
                font: boldFont,
                color: PRIMARY_COLOR,
            });

            yPosition -= 40;
        }

        // Category header
        page.drawText(category, {
            x: 50,
            y: yPosition,
            size: 14,
            font: boldFont,
            color: TEXT_COLOR,
        });

        yPosition -= 25;

        // Items in category
        items.forEach((item, itemIndex) => {
            // Check if we need a new page
            if (yPosition < 100) {
                page = addPage();
                yPosition = height - 50;

                page.drawText('Packing List (continued)', {
                    x: 50,
                    y: yPosition,
                    size: 18,
                    font: boldFont,
                    color: PRIMARY_COLOR,
                });

                yPosition -= 40;
            }

            // Draw checkbox
            const checkboxSize = 12;
            const checkboxName = `checkbox_${catIndex}_${itemIndex}`;

            // Create checkbox field
            const checkbox = form.createCheckBox(checkboxName);
            checkbox.addToPage(page, {
                x: 70,
                y: yPosition - checkboxSize + 2,
                width: checkboxSize,
                height: checkboxSize,
                borderColor: rgb(0.5, 0.5, 0.5),
                backgroundColor: rgb(1, 1, 1),
            });

            // If item is already packed, check the box
            if (item.is_packed) {
                checkbox.check();
            }

            // Draw item text
            page.drawText(item.item, {
                x: 90,
                y: yPosition,
                size: 11,
                font: font,
                color: TEXT_COLOR,
            });

            yPosition -= 20;
        });

        yPosition -= 10; // Extra space after category
    });

    // If no packing items, show empty state
    if (packingItems.length === 0) {
        page.drawText('No packing items added yet.', {
            x: 50,
            y: yPosition,
            size: 12,
            font: font,
            color: SUBTITLE_COLOR,
        });

        yPosition -= 30;

        page.drawText('Add items to your packing list in the app to see them here!', {
            x: 50,
            y: yPosition,
            size: 11,
            font: font,
            color: SUBTITLE_COLOR,
        });
    }

    // Add packing tips at the end
    const tipsPage = addPage();
    yPosition = height - 50;

    tipsPage.drawText('Packing Tips', {
        x: 50,
        y: yPosition,
        size: 20,
        font: boldFont,
        color: PRIMARY_COLOR,
    });

    yPosition -= 35;

    const tips = [
        'Roll clothes instead of folding to save space',
        'Pack heavier items at the bottom of your luggage',
        'Use packing cubes to organize items by category',
        'Keep essential items and valuables in your carry-on',
        'Check airline baggage restrictions before packing',
        'Pack a change of clothes in your carry-on',
        'Leave some space for souvenirs and purchases',
        'Keep medications in original containers',
        'Pack chargers and adapters in an easy-to-access pocket',
        'Make copies of important documents',
    ];

    tips.forEach((tip) => {
        tipsPage.drawText(`• ${tip}`, {
            x: 70,
            y: yPosition,
            size: 11,
            font: font,
            color: TEXT_COLOR,
        });

        yPosition -= 20;
    });

    // Footer
    const pages = pdfDoc.getPages();
    pages.forEach((p, index) => {
        p.drawText(`Page ${index + 1} of ${pages.length}`, {
            x: width - 100,
            y: 30,
            size: 9,
            font: font,
            color: SUBTITLE_COLOR,
        });

        p.drawText('Generated with Itinerary Planner', {
            x: 50,
            y: 30,
            size: 9,
            font: font,
            color: SUBTITLE_COLOR,
        });
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
