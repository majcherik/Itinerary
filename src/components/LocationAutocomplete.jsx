import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { useOnClickOutside } from '../hooks/use-on-click-outside';
import { getCountries } from '@yusifaliyevpro/countries';

const LocationAutocomplete = ({ value, onChange, placeholder = "Where to?" }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [countries, setCountries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef(null);

    useOnClickOutside(wrapperRef, () => setShowSuggestions(false));

    useEffect(() => {
        const fetchCountriesData = async () => {
            setIsLoading(true);
            try {
                const data = await getCountries({
                    fields: ['name', 'flags', 'cca2']
                });
                if (data) {
                    setCountries(data);
                }
            } catch (error) {
                console.error("Failed to fetch countries:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCountriesData();
    }, []);

    useEffect(() => {
        if (value.length > 1 && showSuggestions && countries.length > 0) {
            const filtered = countries.filter(country =>
                country.name.common.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [value, showSuggestions, countries]);

    const handleChange = (e) => {
        onChange(e.target.value);
        setShowSuggestions(true);
    };

    const handleSelect = (countryName) => {
        onChange(countryName);
        setShowSuggestions(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    onFocus={() => value.length > 1 && setShowSuggestions(true)}
                    className="pl-10"
                />
                {isLoading ? (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4 animate-spin" />
                ) : (
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-bg-card border border-border-color rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((country) => (
                        <li
                            key={country.cca2 || country.name.common}
                            className="px-4 py-2 hover:bg-bg-secondary cursor-pointer flex items-center gap-2 text-sm"
                            onClick={() => handleSelect(country.name.common)}
                        >
                            <span className="text-lg">{country.flags && country.flags.svg ? <img src={country.flags.svg} alt={country.name.common} className="w-6 h-4 object-cover rounded-sm" /> : null}</span>
                            <span className="text-text-primary">{country.name.common}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationAutocomplete;
