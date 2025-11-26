import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomDropdown = ({ options, value, onChange, placeholder = "Select...", className = "", buttonClassName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    // Normalize options to array of { value, label }
    const normalizedOptions = Array.isArray(options)
        ? options.map(opt => (typeof opt === 'string' ? { value: opt, label: opt } : opt))
        : Object.entries(options).map(([key, val]) => ({ value: key, label: `${key} - ${val}` }));

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    const defaultButtonClasses = "w-full bg-bg-secondary border-2 border-transparent focus:border-accent-primary rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all flex items-center justify-between group hover:bg-bg-secondary/80";

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={buttonClassName || defaultButtonClasses}
            >
                <span className={selectedOption ? "text-text-primary" : "text-text-secondary"}>
                    {selectedOption ? (selectedOption.label.split(' - ')[0]) : placeholder}
                </span>
                <ChevronDown
                    size={20}
                    className={`text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} group-hover:text-accent-primary`}
                />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-bg-card border border-border-color rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar animate-fade-in p-1 space-y-1">
                    {normalizedOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all flex items-center justify-between group ${value === option.value
                                ? 'bg-accent-primary/10 text-accent-primary font-bold shadow-sm ring-1 ring-accent-primary/20'
                                : 'bg-bg-secondary/30 text-text-primary hover:bg-bg-secondary hover:pl-5'
                                }`}
                        >
                            <span className="truncate">{option.label}</span>
                            {value === option.value && <Check size={16} className="shrink-0 ml-2" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
