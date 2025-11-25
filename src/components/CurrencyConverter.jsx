import React, { useState, useEffect } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';

const CurrencyConverter = ({ onCurrencyChange, currentCurrency }) => {
    const [currencies, setCurrencies] = useState({});
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [currenciesRes, ratesRes] = await Promise.all([
                    fetch('https://api.frankfurter.dev/v1/currencies'),
                    fetch('https://api.frankfurter.dev/v1/latest?base=USD')
                ]);

                const currenciesData = await currenciesRes.json();
                const ratesData = await ratesRes.json();

                setCurrencies(currenciesData);
                setRates(ratesData.rates);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching currency data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCurrencySelect = (currency) => {
        const rate = currency === 'USD' ? 1 : rates[currency];
        onCurrencyChange(currency, rate);
        setIsOpen(false);
    };

    if (loading) return <div className="text-text-secondary"><RefreshCw size={16} className="animate-spin" /></div>;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-sm font-bold text-accent-primary hover:text-accent-primary/80 transition-colors bg-bg-secondary px-3 py-1.5 rounded-lg"
                title="Change Currency"
            >
                {currentCurrency} <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-bg-card border border-border-color rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto animate-fade-in custom-scrollbar">
                        <div className="p-3 sticky top-0 bg-bg-card border-b border-border-color z-10 shadow-sm">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select Currency</span>
                        </div>
                        <button
                            onClick={() => handleCurrencySelect('USD')}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-bg-secondary transition-colors border-b border-border-color/50 last:border-0 ${currentCurrency === 'USD' ? 'bg-accent-primary/10 text-accent-primary font-bold' : 'text-text-primary'}`}
                        >
                            <span className="font-bold w-12 inline-block">USD</span> United States Dollar
                        </button>
                        {Object.entries(currencies).map(([code, name]) => (
                            <button
                                key={code}
                                onClick={() => handleCurrencySelect(code)}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-bg-secondary transition-colors border-b border-border-color/50 last:border-0 ${currentCurrency === code ? 'bg-accent-primary/10 text-accent-primary font-bold' : 'text-text-primary'}`}
                            >
                                <span className="font-bold w-12 inline-block">{code}</span> {name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CurrencyConverter;
