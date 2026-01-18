import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';
import { geocodeAddress, GeocodingResult } from '../../lib/geocoding';

interface AddressSearchInputProps {
  onSelectLocation?: (result: GeocodingResult) => void;
  placeholder?: string;
  className?: string;
}

/**
 * AddressSearchInput - Search input with autocomplete for addresses
 * Uses Nominatim geocoding with debounced search
 */
const AddressSearchInput: React.FC<AddressSearchInputProps> = ({
  onSelectLocation,
  placeholder = 'Search for an address or place...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        // For simplicity, we'll just do a single geocode
        // In a real app, you'd want to use Nominatim's search endpoint for multiple results
        const result = await geocodeAddress(query);
        if (result) {
          setResults([result]);
          setShowResults(true);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (result: GeocodingResult) => {
    setQuery(result.display_name);
    setShowResults(false);
    if (onSelectLocation) {
      onSelectLocation(result);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="input pl-10 pr-10 w-full"
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
        />
        {isSearching && (
          <Loader2
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary animate-spin"
            size={18}
          />
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border-color rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectResult(result)}
              className="w-full text-left px-4 py-3 hover:bg-bg-secondary transition-colors flex items-start gap-3 border-b border-border-color last:border-b-0"
            >
              <MapPin size={16} className="text-accent-primary mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{result.display_name}</p>
                {result.address && (
                  <p className="text-xs text-text-secondary mt-1">
                    {result.address.city && `${result.address.city}, `}
                    {result.address.country}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showResults && query.length >= 3 && results.length === 0 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border-color rounded-lg shadow-lg z-50 px-4 py-3">
          <p className="text-sm text-text-secondary text-center">No results found</p>
        </div>
      )}
    </div>
  );
};

export default AddressSearchInput;
