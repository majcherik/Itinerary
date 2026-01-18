import React, { useMemo } from 'react';
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from '../ui/map';
import { Home, Calendar, DollarSign, Copy } from 'lucide-react';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { useCopyToClipboard, formatDate } from '@itinerary/shared';
import type { AccommodationItem } from '@itinerary/shared';

interface AccommodationMapProps {
  accommodations: AccommodationItem[];
  className?: string;
}

/**
 * AccommodationMap - Shows all accommodation locations on a map
 * Used in the Trip Details accommodation section
 */
const AccommodationMap: React.FC<AccommodationMapProps> = ({ accommodations, className = '' }) => {
  const [copiedText, copy] = useCopyToClipboard();

  // Filter accommodations that have coordinates
  const accommodationsWithCoords = useMemo(() => {
    return accommodations.filter((acc) => acc.latitude != null && acc.longitude != null);
  }, [accommodations]);

  // Calculate center and zoom based on accommodations
  const { center, zoom } = useMemo(() => {
    if (accommodationsWithCoords.length === 0) {
      return { center: [0, 0] as [number, number], zoom: 2 };
    }

    if (accommodationsWithCoords.length === 1) {
      const acc = accommodationsWithCoords[0];
      return { center: [acc.longitude!, acc.latitude!] as [number, number], zoom: 13 };
    }

    // Calculate bounds
    const lats = accommodationsWithCoords.map((a) => a.latitude!);
    const lons = accommodationsWithCoords.map((a) => a.longitude!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;

    // Calculate appropriate zoom level
    const latDiff = maxLat - minLat;
    const lonDiff = maxLon - minLon;
    const maxDiff = Math.max(latDiff, lonDiff);

    let zoomLevel = 12;
    if (maxDiff > 1) zoomLevel = 8;
    else if (maxDiff > 0.5) zoomLevel = 10;
    else if (maxDiff > 0.1) zoomLevel = 11;

    return { center: [centerLon, centerLat] as [number, number], zoom: zoomLevel };
  }, [accommodationsWithCoords]);

  const handleCopyAddress = (address: string) => {
    copy(address);
    toast.success('Address copied to clipboard');
  };

  if (accommodationsWithCoords.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <p className="text-text-secondary">
          No accommodation locations available. Add coordinates to see them on the map.
        </p>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden p-0 ${className}`}>
      <div className="h-[400px] w-full">
        <Map center={center} zoom={zoom}>
          <MapControls position="bottom-right" showZoom showCompass showFullscreen />

          {/* Render markers for each accommodation */}
          {accommodationsWithCoords.map((acc, index) => (
            <MapMarker key={acc.id} longitude={acc.longitude!} latitude={acc.latitude!}>
              <MarkerContent>
                <div className="flex items-center justify-center w-10 h-10 bg-accent-secondary rounded-full shadow-lg border-2 border-white">
                  <Home size={20} className="text-white" />
                </div>
              </MarkerContent>
              <MarkerPopup>
                <div className="p-2 min-w-[250px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-accent-secondary uppercase tracking-wider">
                      {acc.type || 'Hotel'}
                    </span>
                  </div>

                  <h4 className="font-bold text-base mb-2">{acc.name}</h4>

                  {acc.address && (
                    <div className="flex items-start gap-2 text-sm text-text-secondary mb-2">
                      <span className="flex-1">{acc.address}</span>
                      <button
                        onClick={() => handleCopyAddress(acc.address!)}
                        className="p-1 hover:bg-bg-secondary rounded transition-colors"
                        title="Copy Address"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  )}

                  {(acc.checkIn || acc.checkOut) && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <Calendar size={14} />
                      <span>
                        {acc.checkIn && formatDate(acc.checkIn)}
                        {acc.checkIn && acc.checkOut && ' - '}
                        {acc.checkOut && formatDate(acc.checkOut)}
                      </span>
                    </div>
                  )}

                  {acc.cost && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <DollarSign size={14} />
                      <span>${acc.cost}</span>
                    </div>
                  )}

                  {acc.address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        acc.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent-primary hover:underline mt-2 inline-block"
                    >
                      Open in Google Maps →
                    </a>
                  )}
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}
        </Map>
      </div>
    </Card>
  );
};

export default AccommodationMap;
