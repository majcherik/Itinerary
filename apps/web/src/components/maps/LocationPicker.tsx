import React, { useState, useEffect } from 'react';
import { Map, MapMarker, MarkerContent, MapControls } from '../ui/map';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { Card } from '../ui/card';
import { reverseGeocode } from '../../lib/geocoding';

interface LocationPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationChange?: (lat: number, lng: number, address?: string) => void;
  className?: string;
}

/**
 * LocationPicker - Interactive map for selecting locations
 * Allows clicking map to set location, dragging marker, and using current location
 */
const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLatitude = 40.7128,
  initialLongitude = -74.006,
  onLocationChange,
  className = '',
}) => {
  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] = useState(initialLongitude);
  const [address, setAddress] = useState<string>('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Fetch address when coordinates change
  useEffect(() => {
    const fetchAddress = async () => {
      setIsLoadingAddress(true);
      const result = await reverseGeocode(latitude, longitude);
      if (result) {
        setAddress(result.display_name);
      }
      setIsLoadingAddress(false);
    };

    // Debounce address fetch
    const timer = setTimeout(() => {
      fetchAddress();
    }, 500);

    return () => clearTimeout(timer);
  }, [latitude, longitude]);

  // Notify parent of location changes
  useEffect(() => {
    if (onLocationChange) {
      onLocationChange(latitude, longitude, address);
    }
  }, [latitude, longitude, address, onLocationChange]);

  const handleMapClick = (event: any) => {
    if (event.lngLat) {
      setLongitude(event.lngLat.lng);
      setLatitude(event.lngLat.lat);
    }
  };

  const handleMarkerDrag = (event: any) => {
    if (event.lngLat) {
      setLongitude(event.lngLat.lng);
      setLatitude(event.lngLat.lat);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location');
        setIsGettingLocation(false);
      }
    );
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Map */}
      <Card className="overflow-hidden p-0">
        <div className="h-[400px] w-full relative">
          <Map center={[longitude, latitude]} zoom={13} onClick={handleMapClick}>
            <MapControls position="bottom-right" showZoom showCompass showLocate />

            <MapMarker
              longitude={longitude}
              latitude={latitude}
              draggable
              onDragEnd={handleMarkerDrag}
            >
              <MarkerContent>
                <div className="flex items-center justify-center w-12 h-12 bg-accent-primary rounded-full shadow-lg border-4 border-white cursor-move">
                  <MapPin size={24} className="text-white" />
                </div>
              </MarkerContent>
            </MapMarker>
          </Map>

          {/* Instruction overlay */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 text-sm text-text-primary max-w-xs">
            <p className="font-semibold mb-1">📍 Select Location</p>
            <p className="text-xs text-text-secondary">
              Click anywhere on the map or drag the marker to set the location
            </p>
          </div>
        </div>
      </Card>

      {/* Coordinates and Address Display */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-text-secondary mb-1 block">
              Coordinates
            </label>
            <div className="text-sm font-mono bg-bg-secondary px-3 py-2 rounded border border-border-color">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </div>
          </div>

          <button
            onClick={handleUseCurrentLocation}
            className="btn btn-sm btn-outline flex items-center gap-2"
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Navigation size={14} />
            )}
            Use My Location
          </button>
        </div>

        {/* Address display */}
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1 block">Address</label>
          {isLoadingAddress ? (
            <div className="flex items-center gap-2 text-sm text-text-secondary px-3 py-2 bg-bg-secondary rounded border border-border-color">
              <Loader2 size={14} className="animate-spin" />
              Loading address...
            </div>
          ) : (
            <div className="text-sm px-3 py-2 bg-bg-secondary rounded border border-border-color">
              {address || 'Address not available'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
