import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to DD/MM/YYYY
 * @param date - Date string (YYYY-MM-DD or ISO format)
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatDate(date: string | Date | null | undefined): string {
    if (!date) return '';

    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return String(date);
    }
}

/**
 * Format datetime to DD/MM/YYYY HH:MM
 * @param date - Date string (datetime-local or ISO format)
 * @returns Formatted datetime string (DD/MM/YYYY HH:MM)
 */
export function formatDateTime(date: string | Date | null | undefined): string {
    if (!date) return '';

    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
        return String(date);
    }
}
