import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

const CurrencyConverter = ({ onCurrencyChange, currentCurrency }) => {
    const [currencies, setCurrencies] = useState({});
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(true);

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
    };

    if (loading) return <div className="text-text-secondary"><RefreshCw size={16} className="animate-spin" /></div>;

    return (
        <CustomDropdown
            options={currencies}
            value={currentCurrency}
            onChange={handleCurrencySelect}
            buttonClassName="flex items-center gap-1 text-sm font-bold text-accent-primary hover:text-accent-primary/80 transition-colors bg-bg-secondary px-3 py-1.5 rounded-lg [&>span]:text-accent-primary"
            className="w-auto"
        />
    );
};

export default CurrencyConverter;
