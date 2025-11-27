import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw, X } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { useDebounceValue } from '../hooks/use-debounce-value';

const CurrencyCalculator = ({ onClose }) => {
    const [currencies, setCurrencies] = useState({});
    const [amount, setAmount] = useState(1);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const res = await fetch('https://api.frankfurter.dev/v1/currencies');
                const data = await res.json();
                setCurrencies(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching currencies:', error);
                setLoading(false);
            }
        };
        fetchCurrencies();
    }, []);

    const debouncedAmount = useDebounceValue(amount, 500);

    useEffect(() => {
        const convert = async () => {
            if (!debouncedAmount || !fromCurrency || !toCurrency) return;
            setConverting(true);
            try {
                const res = await fetch(`https://api.frankfurter.dev/v1/latest?amount=${debouncedAmount}&from=${fromCurrency}&to=${toCurrency}`);
                const data = await res.json();
                setResult(data.rates[toCurrency]);
            } catch (error) {
                console.error('Error converting currency:', error);
            } finally {
                setConverting(false);
            }
        };

        convert();
    }, [debouncedAmount, fromCurrency, toCurrency]);

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    if (loading) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-bg-card border border-border-color rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent-primary"></div>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors p-1 hover:bg-bg-secondary rounded-full"
                >
                    <X size={24} />
                </button>

                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-text-primary">
                    <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary">
                        <RefreshCw size={24} />
                    </div>
                    Currency Calculator
                </h3>

                <div className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-white border border-border-color focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-4 text-2xl font-bold outline-none transition-all placeholder:text-text-secondary/50 shadow-sm"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">From</label>
                            <CustomDropdown
                                options={currencies}
                                value={fromCurrency}
                                onChange={setFromCurrency}
                            />
                        </div>

                        <button
                            onClick={handleSwap}
                            className="p-3 bg-bg-secondary rounded-full hover:bg-accent-primary hover:text-white transition-all hover:scale-110 active:scale-95 mb-1 shadow-sm"
                            title="Swap Currencies"
                        >
                            <ArrowRightLeft size={20} />
                        </button>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">To</label>
                            <CustomDropdown
                                options={currencies}
                                value={toCurrency}
                                onChange={setToCurrency}
                            />
                        </div>
                    </div>

                    <div className="bg-accent-primary/5 rounded-2xl p-6 text-center border border-accent-primary/10 mt-2">
                        <p className="text-text-secondary text-sm mb-2 font-medium">
                            {amount} {fromCurrency} =
                        </p>
                        <p className="text-4xl font-bold text-accent-primary tracking-tight">
                            {converting ? (
                                <span className="animate-pulse opacity-50">...</span>
                            ) : (
                                <>
                                    {result?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xl opacity-80">{toCurrency}</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrencyCalculator;
