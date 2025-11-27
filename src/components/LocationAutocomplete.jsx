import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from './ui/input';
import { useOnClickOutside } from '../hooks/use-on-click-outside';
import countriesData from '../data/countries.json';

const LocationAutocomplete = ({ value, onChange, placeholder = "Where to?" }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    useOnClickOutside(wrapperRef, () => setShowSuggestions(false));

    useEffect(() => {
        if (value.length > 1 && showSuggestions) {
            const filtered = countriesData.filter(country =>
                country.name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5); // Limit to 5 suggestions
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [value, showSuggestions]);

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
                    className="pl-10" // Make room for the icon
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-bg-card border border-border-color rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((country) => (
                        <li
                            key={country.cca2}
                            className="px-4 py-2 hover:bg-bg-secondary cursor-pointer flex items-center gap-2 text-sm"
                            onClick={() => handleSelect(country.name)}
                        >
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-text-primary">{country.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationAutocomplete;
