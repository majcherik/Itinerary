'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import {
    FileDown,
    Calendar,
    Map,
    Receipt,
    Archive,
    FileText,
    Package,
    Ticket,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Trip } from '@itinerary/shared';
import {
    generateItineraryPDF,
    generatePackingListPDF,
    generateTicketWalletPDF,
    generateCalendarExport,
    generateMapsExport,
    generateExpensesCSV,
    generateJSONExport,
} from '@itinerary/shared';

interface ExportMenuProps {
    trip: Trip;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ trip }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [exporting, setExporting] = useState<string | null>(null);

    const downloadFile = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExport = async (type: string) => {
        setExporting(type);

        try {
            const tripTitle = trip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

            switch (type) {
                case 'itinerary-pdf': {
                    const pdfBytes = await generateItineraryPDF(trip);
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    downloadFile(blob, `${tripTitle}_itinerary.pdf`);
                    toast.success('Itinerary PDF downloaded!');
                    break;
                }

                case 'packing-pdf': {
                    const pdfBytes = await generatePackingListPDF(trip);
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    downloadFile(blob, `${tripTitle}_packing_list.pdf`);
                    toast.success('Packing List PDF downloaded!');
                    break;
                }

                case 'tickets-pdf': {
                    const pdfBytes = await generateTicketWalletPDF(trip);
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    downloadFile(blob, `${tripTitle}_tickets.pdf`);
                    toast.success('Ticket Wallet PDF downloaded!');
                    break;
                }

                case 'calendar': {
                    const icsContent = await generateCalendarExport(trip);
                    const blob = new Blob([icsContent], { type: 'text/calendar' });
                    downloadFile(blob, `${tripTitle}_calendar.ics`);
                    toast.success('Calendar file downloaded!');
                    break;
                }

                case 'maps': {
                    const kmlContent = generateMapsExport(trip);
                    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
                    downloadFile(blob, `${tripTitle}_locations.kml`);
                    toast.success('Google Maps file downloaded!');
                    break;
                }

                case 'expenses-csv': {
                    const csvContent = generateExpensesCSV(trip);
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    downloadFile(blob, `${tripTitle}_expenses.csv`);
                    toast.success('Expenses CSV downloaded!');
                    break;
                }

                case 'json': {
                    const jsonContent = generateJSONExport(trip);
                    const blob = new Blob([jsonContent], { type: 'application/json' });
                    downloadFile(blob, `${tripTitle}_backup.json`);
                    toast.success('JSON backup downloaded!');
                    break;
                }

                default:
                    toast.error('Unknown export type');
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export. Please try again.');
        } finally {
            setExporting(null);
        }
    };

    const exportOptions = [
        {
            type: 'itinerary-pdf',
            label: 'Trip Itinerary PDF',
            icon: FileText,
            description: 'Complete itinerary with accommodation and transport',
        },
        {
            type: 'packing-pdf',
            label: 'Packing List PDF',
            icon: Package,
            description: 'Printable checklist for packing',
        },
        {
            type: 'tickets-pdf',
            label: 'Ticket Wallet PDF',
            icon: Ticket,
            description: 'All tickets with QR codes',
        },
        {
            type: 'calendar',
            label: 'Google Calendar (.ics)',
            icon: Calendar,
            description: 'Import to your calendar app',
        },
        {
            type: 'maps',
            label: 'Google Maps (KML)',
            icon: Map,
            description: 'Import locations to Google Maps',
        },
        {
            type: 'expenses-csv',
            label: 'Expenses (CSV)',
            icon: Receipt,
            description: 'Export expenses spreadsheet',
        },
        {
            type: 'json',
            label: 'Full Backup (JSON)',
            icon: Archive,
            description: 'Complete trip data backup',
        },
    ];

    return (
        <div className="relative">
            <Button
                onClick={() => setIsOpen(!isOpen)}
                variant="outline"
                className="flex items-center gap-2"
            >
                <FileDown className="w-4 h-4" />
                Export
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                        <div className="p-3 border-b border-gray-200">
                            <h3 className="font-semibold text-text-primary">Export Trip</h3>
                            <p className="text-xs text-text-secondary mt-1">
                                Choose a format to download
                            </p>
                        </div>

                        <div className="p-2">
                            {exportOptions.map((option) => {
                                const Icon = option.icon;
                                const isExporting = exporting === option.type;

                                return (
                                    <button
                                        key={option.type}
                                        onClick={() => {
                                            handleExport(option.type);
                                            setIsOpen(false);
                                        }}
                                        disabled={isExporting}
                                        className="w-full text-left p-3 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-text-primary">
                                                    {option.label}
                                                </p>
                                                <p className="text-xs text-text-secondary mt-0.5">
                                                    {isExporting
                                                        ? 'Exporting...'
                                                        : option.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ExportMenu;
