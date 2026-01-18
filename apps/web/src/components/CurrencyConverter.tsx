import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, AlertCircle, ChevronDown } from 'lucide-react';
import Modal from './Modal';
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const selectedCurrencyRef = useRef<HTMLButtonElement>(null);

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
            setError('Failed to load exchange rates');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadCurrencyData();
    }, []);

    useEffect(() => {
        if (isModalOpen && selectedCurrencyRef.current) {
            setTimeout(() => {
                selectedCurrencyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [isModalOpen]);

    const handleCurrencySelect = (currency: string) => {
        onCurrencyChange(currency, rates);
        setIsModalOpen(false);
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
        <>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 text-sm font-bold text-accent-primary hover:text-accent-primary/80 transition-colors bg-white border border-border-color px-4 py-2 rounded-lg shadow-sm min-w-[140px]"
                >
                    <span>{currentCurrency} - {currencies[currentCurrency]}</span>
                    <ChevronDown size={16} />
                </button>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-1.5 hover:bg-white border border-transparent hover:border-border-color rounded-lg transition-all disabled:opacity-50"
                    title={`Last updated: ${getTimeSinceUpdate(lastUpdated)}`}
                >
                    <RefreshCw size={14} className={`text-text-secondary ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Select Currency"
            >
                <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                    {Object.entries(currencies).map(([code, name]) => (
                        <button
                            key={code}
                            ref={currentCurrency === code ? selectedCurrencyRef : null}
                            onClick={() => handleCurrencySelect(code)}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                                currentCurrency === code
                                    ? 'bg-accent-primary text-white'
                                    : 'hover:bg-bg-secondary'
                            }`}
                        >
                            <div className="flex flex-col">
                                <span className="font-bold">{code}</span>
                                <span className={`text-sm ${currentCurrency === code ? 'text-white/80' : 'text-text-secondary'}`}>
                                    {name}
                                </span>
                            </div>
                            {currentCurrency === code && (
                                <span className="text-lg">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            </Modal>
        </>
    );
};

export default CurrencyConverter;
