import type { Trip } from '../../context/TripContext';

/**
 * Generates a CSV file with all expenses from a trip
 */
export function generateExpensesCSV(trip: Trip): string {
    // CSV header
    const headers = ['Date', 'Description', 'Category', 'Payer', 'Amount', 'Split With'];

    // Escape CSV field (handle commas and quotes)
    const escapeCsvField = (field: string | number | null | undefined): string => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        // If field contains comma, newline, or quote, wrap in quotes and escape quotes
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // Format date
    const formatDate = (dateStr: string | null): string => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    // Build CSV rows
    const rows = [headers.join(',')];

    if (trip.expenses && trip.expenses.length > 0) {
        trip.expenses.forEach((expense) => {
            const splitWithStr = Array.isArray(expense.splitWith)
                ? expense.splitWith.join(', ')
                : expense.splitWith || '';

            const row = [
                escapeCsvField(formatDate(expense.date)),
                escapeCsvField(expense.description),
                escapeCsvField(expense.category),
                escapeCsvField(expense.payer),
                escapeCsvField(expense.amount.toFixed(2)),
                escapeCsvField(splitWithStr),
            ];

            rows.push(row.join(','));
        });
    }

    // Add summary row
    if (trip.expenses && trip.expenses.length > 0) {
        const totalExpenses = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        rows.push(''); // Empty row for spacing
        rows.push(`Total,,,,$${totalExpenses.toFixed(2)},`);
    }

    return rows.join('\n');
}
