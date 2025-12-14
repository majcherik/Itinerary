// Currency exchange utilities with caching

const CACHE_KEY = 'currency_exchange_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const API_BASE = 'https://api.frankfurter.dev/v1';

export interface CurrencyCache {
    currencies: Record<string, string>;
    rates: Record<string, number>;
    timestamp: number;
}

/**
 * Get cached currency data if valid (less than 1 hour old)
 */
export function getCachedCurrencyData(): CurrencyCache | null {
    if (typeof window === 'undefined') return null;

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const data: CurrencyCache = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid
        if (now - data.timestamp < CACHE_DURATION) {
            return data;
        }

        // Cache expired, remove it
        localStorage.removeItem(CACHE_KEY);
        return null;
    } catch (error) {
        console.error('Error reading currency cache:', error);
        return null;
    }
}

/**
 * Save currency data to cache
 */
export function saveCurrencyCache(currencies: Record<string, string>, rates: Record<string, number>): void {
    if (typeof window === 'undefined') return;

    try {
        const cache: CurrencyCache = {
            currencies,
            rates,
            timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.error('Error saving currency cache:', error);
    }
}

/**
 * Fetch fresh currency data from API
 */
export async function fetchCurrencyData(): Promise<{ currencies: Record<string, string>; rates: Record<string, number> }> {
    const [currenciesRes, ratesRes] = await Promise.all([
        fetch(`${API_BASE}/currencies`),
        fetch(`${API_BASE}/latest?base=USD`),
    ]);

    if (!currenciesRes.ok || !ratesRes.ok) {
        throw new Error('Failed to fetch currency data');
    }

    const currencies = await currenciesRes.json();
    const ratesData = await ratesRes.json();

    return {
        currencies,
        rates: { USD: 1, ...ratesData.rates }, // Add USD as 1:1
    };
}

/**
 * Get currency data (from cache if available, otherwise fetch)
 */
export async function getCurrencyData(forceRefresh = false): Promise<{
    currencies: Record<string, string>;
    rates: Record<string, number>;
    lastUpdated: number;
}> {
    // Try cache first unless force refresh
    if (!forceRefresh) {
        const cached = getCachedCurrencyData();
        if (cached) {
            return {
                currencies: cached.currencies,
                rates: cached.rates,
                lastUpdated: cached.timestamp,
            };
        }
    }

    // Fetch fresh data
    const { currencies, rates } = await fetchCurrencyData();
    const timestamp = Date.now();

    // Save to cache
    saveCurrencyCache(currencies, rates);

    return {
        currencies,
        rates,
        lastUpdated: timestamp,
    };
}

/**
 * Convert amount from USD to target currency
 * Always converts from USD base to ensure accuracy across multiple conversions
 */
export function convertFromUSD(amountInUSD: number, targetCurrency: string, rates: Record<string, number>): number {
    if (targetCurrency === 'USD') return amountInUSD;

    const rate = rates[targetCurrency];
    if (!rate) {
        console.warn(`Exchange rate not found for ${targetCurrency}, returning USD amount`);
        return amountInUSD;
    }

    return amountInUSD * rate;
}

/**
 * Format time difference for "last updated" display
 */
export function getTimeSinceUpdate(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    return 'Over 24 hours ago';
}
