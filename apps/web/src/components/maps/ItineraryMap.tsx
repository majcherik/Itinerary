import React, { useMemo } from 'react';
import { Map, MapMarker, MarkerContent, MarkerPopup, MapRoute, MapControls } from '../ui/map';
import { MapPin, DollarSign, Clock } from 'lucide-react';
import { Card } from '../ui/card';
import type { ItineraryItem } from '@itinerary/shared';

interface ItineraryMapProps {
  items: ItineraryItem[];
  className?: string;
  showRoutes?: boolean;
}

/**
 * ItineraryMap - Shows all itinerary items on a map with markers and optional routes
 * Used in the Trip Details itinerary tab
 */
const ItineraryMap: React.FC<ItineraryMapProps> = ({
  items,
  className = '',
  showRoutes = true,
}) => {
  // Filter items that have coordinates
  const itemsWithCoords = useMemo(() => {
    return items.filter((item) => item.latitude != null && item.longitude != null);
  }, [items]);

  // Calculate center and zoom based on items
  const { center, zoom } = useMemo(() => {
    if (itemsWithCoords.length === 0) {
      return { center: [0, 0] as [number, number], zoom: 2 };
    }

    if (itemsWithCoords.length === 1) {
      const item = itemsWithCoords[0];
      return { center: [item.longitude!, item.latitude!] as [number, number], zoom: 13 };
    }

    // Calculate bounds
    const lats = itemsWithCoords.map((i) => i.latitude!);
    const lons = itemsWithCoords.map((i) => i.longitude!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;

    // Calculate appropriate zoom level based on bounds
    const latDiff = maxLat - minLat;
    const lonDiff = maxLon - minLon;
    const maxDiff = Math.max(latDiff, lonDiff);

    let zoomLevel = 12;
    if (maxDiff > 1) zoomLevel = 8;
    else if (maxDiff > 0.5) zoomLevel = 10;
    else if (maxDiff > 0.1) zoomLevel = 11;

    return { center: [centerLon, centerLat] as [number, number], zoom: zoomLevel };
  }, [itemsWithCoords]);

  // Create route coordinates
  const routeCoordinates = useMemo(() => {
    if (!showRoutes || itemsWithCoords.length < 2) {
      return [];
    }
    return itemsWithCoords.map((item) => [item.longitude!, item.latitude!] as [number, number]);
  }, [itemsWithCoords, showRoutes]);

  if (itemsWithCoords.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <p className="text-text-secondary">
          No locations added yet. Add coordinates to your itinerary items to see them on the map.
        </p>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden p-0 ${className}`}>
      <div className="h-[500px] w-full">
        <Map center={center} zoom={zoom}>
          <MapControls position="bottom-right" showZoom showCompass showFullscreen />

          {/* Draw route if enabled */}
          {showRoutes && routeCoordinates.length > 1 && (
            <MapRoute
              coordinates={routeCoordinates}
              color="var(--accent-primary)"
              width={3}
              opacity={0.7}
            />
          )}

          {/* Render markers for each itinerary item */}
          {itemsWithCoords.map((item, index) => (
            <MapMarker key={item.id} longitude={item.longitude!} latitude={item.latitude!}>
              <MarkerContent>
                <div className="flex items-center justify-center w-10 h-10 bg-accent-primary rounded-full shadow-lg border-2 border-white">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
              </MarkerContent>
              <MarkerPopup>
                <div className="p-2 min-w-[200px]">
                  <h4 className="font-bold text-base mb-2">{item.title || item.activity}</h4>

                  {item.location_name && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <MapPin size={14} />
                      <span>{item.location_name}</span>
                    </div>
                  )}

                  {item.time && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <Clock size={14} />
                      <span>{item.time}</span>
                    </div>
                  )}

                  {item.cost && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <DollarSign size={14} />
                      <span>${item.cost}</span>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-sm text-text-secondary mt-2 border-t border-border-color pt-2">
                      {item.description}
                    </p>
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

export default ItineraryMap;
