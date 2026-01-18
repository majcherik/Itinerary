import React, { useMemo } from 'react';
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapRoute, MapControls } from '../ui/map';
import { Plane, Train } from 'lucide-react';
import { Card } from '../ui/card';
import { calculateDistance, formatDistance } from '../../lib/geocoding';
import type { TransportItem } from '@itinerary/shared';

interface TransportRouteMapProps {
  transport: TransportItem;
  className?: string;
}

/**
 * TransportRouteMap - Shows a single transport route (flight, train, etc.)
 * Used in the Trip Details transport section
 */
const TransportRouteMap: React.FC<TransportRouteMapProps> = ({ transport, className = '' }) => {
  const hasCoordinates =
    transport.departure_latitude != null &&
    transport.departure_longitude != null &&
    transport.arrival_latitude != null &&
    transport.arrival_longitude != null;

  // Calculate center and zoom
  const { center, zoom, distance } = useMemo(() => {
    if (!hasCoordinates) {
      return { center: [0, 0] as [number, number], zoom: 2, distance: 0 };
    }

    const depLat = transport.departure_latitude!;
    const depLon = transport.departure_longitude!;
    const arrLat = transport.arrival_latitude!;
    const arrLon = transport.arrival_longitude!;

    // Calculate center point
    const centerLat = (depLat + arrLat) / 2;
    const centerLon = (depLon + arrLon) / 2;

    // Calculate distance
    const dist = calculateDistance(depLat, depLon, arrLat, arrLon);

    // Calculate appropriate zoom level based on distance
    let zoomLevel = 12;
    if (dist > 2000) zoomLevel = 4;
    else if (dist > 1000) zoomLevel = 5;
    else if (dist > 500) zoomLevel = 6;
    else if (dist > 100) zoomLevel = 7;
    else if (dist > 50) zoomLevel = 9;
    else if (dist > 10) zoomLevel = 10;

    return { center: [centerLon, centerLat] as [number, number], zoom: zoomLevel, distance: dist };
  }, [transport, hasCoordinates]);

  if (!hasCoordinates) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <p className="text-text-secondary">
          No route coordinates available. Add departure and arrival coordinates to see the route on
          the map.
        </p>
      </Card>
    );
  }

  const routeCoordinates: [number, number][] = [
    [transport.departure_longitude!, transport.departure_latitude!],
    [transport.arrival_longitude!, transport.arrival_latitude!],
  ];

  const getTransportIcon = () => {
    if (transport.type === 'Flight') return Plane;
    if (transport.type === 'Train') return Train;
    return Plane;
  };

  const Icon = getTransportIcon();
  const routeColor = transport.type === 'Flight' ? 'var(--accent-primary)' : 'var(--accent-secondary)';

  return (
    <Card className={`overflow-hidden p-0 ${className}`}>
      <div className="h-[350px] w-full">
        <Map center={center} zoom={zoom}>
          <MapControls position="bottom-right" showZoom showCompass showFullscreen />

          {/* Draw route */}
          <MapRoute coordinates={routeCoordinates} color={routeColor} width={3} opacity={0.8} />

          {/* Departure marker */}
          <MapMarker
            longitude={transport.departure_longitude!}
            latitude={transport.departure_latitude!}
          >
            <MarkerContent>
              <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full shadow-lg border-2 border-white">
                <Icon size={18} className="text-white" />
              </div>
            </MarkerContent>
            <MarkerTooltip>
              {transport.departure_location || 'Departure'}
            </MarkerTooltip>
          </MapMarker>

          {/* Arrival marker */}
          <MapMarker
            longitude={transport.arrival_longitude!}
            latitude={transport.arrival_latitude!}
          >
            <MarkerContent>
              <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-full shadow-lg border-2 border-white">
                <Icon size={18} className="text-white" />
              </div>
            </MarkerContent>
            <MarkerTooltip>
              {transport.arrival_location || 'Arrival'}
            </MarkerTooltip>
          </MapMarker>
        </Map>
      </div>

      {/* Route info footer */}
      <div className="p-3 bg-bg-secondary border-t border-border-color flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-text-secondary" />
          <span className="font-medium">{transport.type}</span>
          {transport.provider && (
            <span className="text-text-secondary">• {transport.provider}</span>
          )}
        </div>
        <div className="text-text-secondary">
          Distance: <span className="font-medium text-text-primary">{formatDistance(distance)}</span>
        </div>
      </div>
    </Card>
  );
};

export default TransportRouteMap;
