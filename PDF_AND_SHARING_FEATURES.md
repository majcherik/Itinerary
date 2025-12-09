# PDF Generation & Social Sharing Features

## Overview

This document outlines the new PDF generation and social sharing features that have been implemented for the Itinerary Planner application.

## Features Implemented

### 1. PDF Generation

Three types of PDFs can now be generated from any trip:

#### A. Trip Itinerary PDF
- **File**: `packages/shared/src/lib/pdf-generators/itinerary-pdf.ts`
- **Features**:
  - Cover page with trip title, destination, and dates
  - Day-by-day itinerary schedule with times and locations
  - Accommodation details with check-in/out information
  - Transportation bookings with departure/arrival details
  - Optional emergency contacts section
  - Professional styling with brand colors

#### B. Packing List PDF
- **File**: `packages/shared/src/lib/pdf-generators/packing-list-pdf.ts`
- **Features**:
  - Items grouped by category
  - Interactive checkboxes for each item
  - Pre-checked boxes for already packed items
  - Packing tips section
  - Printable format

#### C. Ticket Wallet PDF
- **File**: `packages/shared/src/lib/pdf-generators/ticket-wallet-pdf.ts`
- **Features**:
  - One page per ticket (wallet-style layout)
  - QR codes for booking references
  - Includes both wallet tickets and transport bookings
  - Departure and arrival information
  - Provider and booking reference details

### 2. Export Formats

#### A. Google Calendar Export (.ics)
- **File**: `packages/shared/src/lib/exporters/calendar-export.ts`
- **Features**:
  - Itinerary items as calendar events
  - Accommodation check-ins/check-outs as all-day events
  - Transport as timed events
  - Compatible with Google Calendar, Apple Calendar, Outlook, etc.

#### B. Google Maps Export (KML)
- **File**: `packages/shared/src/lib/exporters/maps-export.ts`
- **Features**:
  - All locations organized in folders
  - Separate markers for itinerary, accommodations, and transport
  - Custom icons for different location types
  - Import directly into Google Maps

#### C. Expenses CSV Export
- **File**: `packages/shared/src/lib/exporters/expenses-csv.ts`
- **Features**:
  - All expenses in spreadsheet format
  - Columns: Date, Description, Category, Payer, Amount, Split With
  - Total expenses calculation
  - Compatible with Excel, Google Sheets, etc.

#### D. Full JSON Backup
- **File**: `packages/shared/src/lib/exporters/json-export.ts`
- **Features**:
  - Complete trip data with all relations
  - Metadata with counts and totals
  - Pretty-printed for readability
  - Version stamped
  - Can be used for backup/restore

### 3. Social Sharing

#### A. Shareable Trip Links
- **API Routes**:
  - `apps/web/app/api/share/create/route.ts` - Create share link
  - `apps/web/app/api/share/[token]/route.ts` - Get shared trip
  - `apps/web/app/api/share/[token]/verify/route.ts` - Verify password

- **Features**:
  - Generate unique shareable links
  - Optional password protection
  - Optional expiration dates
  - QR code for easy sharing
  - Public read-only view

#### B. Public Shared Trip View
- **File**: `apps/web/app/shared/[token]/page.tsx`
- **Features**:
  - Read-only trip view
  - Password prompt for protected links
  - Expiry check
  - Call-to-action to create own trip
  - Clean, simplified UI

#### C. Open Graph Meta Tags
- **Location**: `apps/web/app/shared/[token]/page.tsx`
- **Features**:
  - Dynamic meta tags for social media sharing
  - Trip title and description
  - Hero image preview
  - Facebook and Twitter card support

### 4. UI Components

#### A. ShareTripModal
- **File**: `apps/web/src/components/ShareTripModal.tsx`
- **Features**:
  - Password protection toggle
  - Expiration date picker
  - Copy link button
  - QR code display
  - Share options summary

#### B. ExportMenu
- **File**: `apps/web/src/components/ExportMenu.tsx`
- **Features**:
  - Dropdown menu with all export options
  - Loading states during export
  - Automatic file downloads
  - Descriptive labels and icons

## Usage

### For Users

1. **Export PDF**:
   - Open any trip
   - Click "Export" button in the header
   - Select the desired PDF format
   - File will download automatically

2. **Share Trip**:
   - Open any trip
   - Click "Share Trip" button in the header
   - Configure password and expiry (optional)
   - Click "Create Share Link"
   - Copy link or show QR code

3. **Export Data**:
   - Click "Export" button
   - Select desired format (Calendar, Maps, CSV, JSON)
   - Import into respective applications

### For Developers

#### Database Setup

**IMPORTANT**: Run the migration to create the `shared_trips` table:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/001_create_shared_trips_table.sql
```

The migration file is located at: `supabase/migrations/001_create_shared_trips_table.sql`

#### Using PDF Generators

```typescript
import { generateItineraryPDF, generatePackingListPDF, generateTicketWalletPDF } from '@itinerary/shared';

// Generate PDF
const pdfBytes = await generateItineraryPDF(trip);

// Create blob and download
const blob = new Blob([pdfBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);
// ... download logic
```

#### Using Exporters

```typescript
import {
    generateCalendarExport,
    generateMapsExport,
    generateExpensesCSV,
    generateJSONExport
} from '@itinerary/shared';

// Generate exports
const icsContent = await generateCalendarExport(trip);
const kmlContent = generateMapsExport(trip);
const csvContent = generateExpensesCSV(trip);
const jsonContent = generateJSONExport(trip);
```

#### Creating Share Links

```typescript
// POST /api/share/create
const response = await fetch('/api/share/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        tripId: 123,
        password: 'optional-password',
        expiresAt: '2025-12-31T23:59:59Z' // optional
    })
});

const { shareLink } = await response.json();
console.log(shareLink.url); // https://yourdomain.com/shared/abc123
```

## Dependencies

### New Packages Added

- `pdf-lib` (^1.17.1) - PDF creation and manipulation
- `qrcode` (^1.5.4) - QR code generation
- `ics` (^3.8.1) - Calendar file generation
- `@types/qrcode` (^1.5.6) - TypeScript types for qrcode

### Existing Packages Used

- `react-qr-code` - QR code display in UI

## File Structure

```
packages/shared/src/
├── lib/
│   ├── pdf-generators/
│   │   ├── itinerary-pdf.ts
│   │   ├── packing-list-pdf.ts
│   │   └── ticket-wallet-pdf.ts
│   └── exporters/
│       ├── calendar-export.ts
│       ├── maps-export.ts
│       ├── expenses-csv.ts
│       └── json-export.ts

apps/web/
├── app/
│   ├── api/
│   │   └── share/
│   │       ├── create/route.ts
│   │       └── [token]/
│   │           ├── route.ts
│   │           └── verify/route.ts
│   └── shared/
│       └── [token]/
│           ├── page.tsx
│           └── SharedTripView.tsx
└── src/
    └── components/
        ├── ShareTripModal.tsx
        └── ExportMenu.tsx
```

## Known Limitations

1. **Google Maps KML**: Uses placeholder coordinates (0,0,0) - Google Maps will attempt to geocode addresses when importing
2. **Password Hashing**: Currently uses simple comparison - should implement bcrypt for production
3. **PDF Maps**: Static map images not included (optional feature for future enhancement)

## Testing Checklist

- [ ] Run database migration
- [ ] Test Itinerary PDF export
- [ ] Test Packing List PDF export
- [ ] Test Ticket Wallet PDF export
- [ ] Test Calendar (.ics) export
- [ ] Test Google Maps (KML) export
- [ ] Test Expenses CSV export
- [ ] Test JSON backup export
- [ ] Test creating public share link
- [ ] Test creating password-protected share link
- [ ] Test creating share link with expiration
- [ ] Test viewing shared trip
- [ ] Test password verification
- [ ] Test Open Graph preview on social media

## Next Steps

1. **Run the database migration** in Supabase SQL Editor
2. **Test the export features** with real trip data
3. **Test share functionality** with different configurations
4. **Implement bcrypt** for password hashing (production)
5. **Add geocoding service** for better Google Maps KML (optional)
6. **Add static map images** to PDFs (optional)

## Support

For issues or questions, please check:
- PDF-lib documentation: https://pdf-lib.js.org/
- ICS library documentation: https://github.com/adamgibbons/ics
- Supabase documentation: https://supabase.com/docs

---

**Generated**: December 2025
**Version**: 1.0
