import React, { useState, useEffect, useMemo } from 'react';
import { motion } from "framer-motion";
import { ArrowLeftRight, TrendingUp, AlertCircle, X, Loader2 } from "lucide-react";
import { useDebounceValue } from '@itinerary/shared';
import { getCurrencyData } from '../lib/currency-utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CurrencyCalculatorProps {
    onClose: () => void;
}

const CurrencyCalculator: React.FC<CurrencyCalculatorProps> = ({ onClose }) => {
    const [currencies, setCurrencies] = useState<Record<string, string>>({});
    const [rates, setRates] = useState<Record<string, number>>({});
    const [amount, setAmount] = useState<string>("100");
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("EUR");
    const [result, setResult] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [converting, setConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    // Initial Data Load
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getCurrencyData();
                setCurrencies(data.currencies);
                setRates(data.rates);
                setLoading(false);
            } catch (err) {
                setError('Failed to load currencies');
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const debouncedAmount = useDebounceValue(amount, 500);

    // Conversion Logic
    useEffect(() => {
        const convert = () => {
            if (!debouncedAmount || !fromCurrency || !toCurrency || Object.keys(rates).length === 0) {
                setResult(null);
                setConverting(false);
                return;
            }

            setConverting(true);
            try {
                const numAmount = typeof debouncedAmount === 'string' ? parseFloat(debouncedAmount) : debouncedAmount;

                if (isNaN(numAmount)) {
                    setError("Enter a valid amount");
                    setResult(null);
                    setConverting(false);
                    return;
                } else {
                    setError(null);
                }

                // Convert from base currency (USD) to target
                const fromRate = rates[fromCurrency] || 1;
                const toRate = rates[toCurrency] || 1;

                const usdAmount = fromCurrency === 'USD' ? numAmount : numAmount / fromRate;
                const converted = usdAmount * toRate;

                setResult(converted);
            } catch (error) {
                setError('Conversion failed');
            } finally {
                setConverting(false);
            }
        };

        convert();
    }, [debouncedAmount, fromCurrency, toCurrency, rates]);

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
        setIsFlipped(!isFlipped);
    };

    const formattedResult = useMemo(() => {
        if (result === null) return "0.00";
        return result.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [result]);

    // Helper to get currency symbol (fallback to code if not available in map, or just hardcode common ones if needed later)
    // For now, using currency code as logic for finding symbol can be complex without a symbol map. 
    // The provided code used currency.symbol, but our 'currencies' is a code->name map.
    // We'll stick to displaying the Code in the select for simplicity unless we add a symbol map.
    // Or we can try to guess/use a simple map for major ones.
    const getSymbol = (code: string) => {
        const symbols: Record<string, string> = {
            USD: "$", EUR: "€", GBP: "£", JPY: "¥", AUD: "A$", CAD: "C$", CHF: "CHF", CNY: "¥", INR: "₹", MXN: "$"
        };
        return symbols[code] || "$";
    }

    const amountSymbol = getSymbol(fromCurrency);
    const resultSymbol = getSymbol(toCurrency);

    if (loading) return null; // Or a loading spinner modal

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="group mx-auto w-full max-w-md relative"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10 rounded-2xl" />

                {/* Close Button Integration */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors p-2"
                >
                    <X size={24} />
                </button>

                <div className="relative overflow-hidden border border-border/60 bg-card/95 backdrop-blur rounded-2xl shadow-2xl">
                    <div className="space-y-1 px-6 pt-6 pb-4">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                            <TrendingUp className="h-6 w-6 text-primary" />
                            Currency Converter
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Real-time exchange rates
                        </p>
                    </div>

                    <div className="space-y-6 px-6 pb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                From
                            </label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                        {amountSymbol}
                                    </span>
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        value={amount}
                                        onChange={(event) => setAmount(event.target.value)}
                                        placeholder="Amount"
                                        className="w-full rounded-lg border border-border bg-background/50 px-8 py-3 text-lg font-semibold text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40"
                                    />
                                </div>
                                <div className="w-[140px]">
                                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                                        <SelectTrigger className="h-[50px] font-semibold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(currencies).sort().map((code) => (
                                                <SelectItem key={code} value={code}>
                                                    {code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={handleSwap}
                                className="flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background/50 text-foreground transition hover:bg-background/70"
                            >
                                <ArrowLeftRight className="h-5 w-5" />
                            </motion.button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                To
                            </label>
                            <div className="flex gap-3">
                                <motion.div
                                    key={isFlipped ? "flipped" : "stationary"}
                                    initial={{ rotateX: 90, opacity: 0 }}
                                    animate={{ rotateX: 0, opacity: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="relative flex-1"
                                >
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                        {resultSymbol}
                                    </span>
                                    <input
                                        type="text"
                                        value={formattedResult}
                                        readOnly
                                        className="w-full rounded-lg border border-border bg-background/30 px-8 py-3 text-lg font-semibold text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40"
                                    />
                                </motion.div>
                                <div className="w-[140px]">
                                    <Select value={toCurrency} onValueChange={setToCurrency}>
                                        <SelectTrigger className="h-[50px] font-semibold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(currencies).sort().map((code) => (
                                                <SelectItem key={code} value={code}>
                                                    {code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {converting && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground"
                            >
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Calculating...
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive flex items-center justify-center gap-2"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CurrencyCalculator;
