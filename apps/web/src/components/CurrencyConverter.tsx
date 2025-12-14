import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { getCurrencyData, getTimeSinceUpdate } from '../lib/currency-utils';

interface CurrencyConverterProps {
    onCurrencyChange: (currency: string, rates: Record<string, number>) => void;
    currentCurrency: string;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onCurrencyChange, currentCurrency }) => {
    const [currencies, setCurrencies] = useState<Record<string, string>>({});
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<number>(0);

    const loadCurrencyData = async (forceRefresh = false) => {
        try {
            if (forceRefresh) setRefreshing(true);
            else setLoading(true);

            setError(null);
            const data = await getCurrencyData(forceRefresh);

            setCurrencies(data.currencies);
            setRates(data.rates);
            setLastUpdated(data.lastUpdated);
        } catch (err) {
            console.error('Error fetching currency data:', err);
            setError('Failed to load exchange rates');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadCurrencyData();
    }, []);

    const handleCurrencySelect = (currency: string) => {
        onCurrencyChange(currency, rates);
    };

    const handleRefresh = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await loadCurrencyData(true);
    };

    if (loading) return <div className="text-text-secondary"><RefreshCw size={16} className="animate-spin" /></div>;

    if (error) {
        return (
            <button
                onClick={() => loadCurrencyData(true)}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-lg"
                title="Click to retry"
            >
                <AlertCircle size={14} />
                Retry
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <CustomDropdown
                options={currencies}
                value={currentCurrency}
                onChange={handleCurrencySelect}
                buttonClassName="flex items-center gap-2 text-sm font-bold text-accent-primary hover:text-accent-primary/80 transition-colors bg-white border border-border-color px-4 py-2 rounded-lg shadow-sm min-w-[140px] [&>span]:text-accent-primary"
                className="w-auto"
            />
            <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 hover:bg-white border border-transparent hover:border-border-color rounded-lg transition-all disabled:opacity-50"
                title={`Last updated: ${getTimeSinceUpdate(lastUpdated)}`}
            >
                <RefreshCw size={14} className={`text-text-secondary ${refreshing ? 'animate-spin' : ''}`} />
            </button>
        </div>
    );
};

export default CurrencyConverter;
