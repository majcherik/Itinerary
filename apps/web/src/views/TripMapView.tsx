import React, { useMemo, useState } from 'react';
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapRoute, MapControls } from '../components/ui/map';
import { MapPin, Home, Plane, Train, Layers } from 'lucide-react';
import { Card } from '../components/ui/card';
import type { Trip } from '@itinerary/shared';

interface TripMapViewProps {
  trip: Trip;
}

type MapLayer = 'itinerary' | 'accommodation' | 'transport' | 'destination';

/**
 * TripMapView - Full-screen map view showing all trip data
 * Shows trip destination, itinerary items, accommodations, and transport routes
 */
const TripMapView: React.FC<TripMapViewProps> = ({ trip }) => {
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(
    new Set(['itinerary', 'accommodation', 'transport', 'destination'])
  );

  // Calculate map center and zoom based on all visible points
  const { center, zoom } = useMemo(() => {
    const points: { lat: number; lng: number }[] = [];

    // Add trip destination
    if (trip.latitude && trip.longitude && activeLayers.has('destination')) {
      points.push({ lat: trip.latitude, lng: trip.longitude });
    }

    // Add itinerary items
    if (activeLayers.has('itinerary')) {
      (trip.itinerary || []).forEach((item) => {
        if (item.latitude && item.longitude) {
          points.push({ lat: item.latitude, lng: item.longitude });
        }
      });
    }

    // Add accommodations
    if (activeLayers.has('accommodation')) {
      (trip.accommodation || []).forEach((acc) => {
        if (acc.latitude && acc.longitude) {
          points.push({ lat: acc.latitude, lng: acc.longitude });
        }
      });
    }

    // Add transport endpoints
    if (activeLayers.has('transport')) {
      (trip.transport || []).forEach((trans) => {
        if (trans.departure_latitude && trans.departure_longitude) {
          points.push({ lat: trans.departure_latitude, lng: trans.departure_longitude });
        }
        if (trans.arrival_latitude && trans.arrival_longitude) {
          points.push({ lat: trans.arrival_latitude, lng: trans.arrival_longitude });
        }
      });
    }

    if (points.length === 0) {
      return { center: [0, 0] as [number, number], zoom: 2 };
    }

    if (points.length === 1) {
      return { center: [points[0].lng, points[0].lat] as [number, number], zoom: 12 };
    }

    // Calculate bounds
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calculate zoom
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoomLevel = 10;
    if (maxDiff > 10) zoomLevel = 5;
    else if (maxDiff > 5) zoomLevel = 6;
    else if (maxDiff > 2) zoomLevel = 7;
    else if (maxDiff > 1) zoomLevel = 8;
    else if (maxDiff > 0.5) zoomLevel = 9;

    return { center: [centerLng, centerLat] as [number, number], zoom: zoomLevel };
  }, [trip, activeLayers]);

  // Get itinerary route coordinates
  const itineraryRoute = useMemo(() => {
    if (!activeLayers.has('itinerary')) return [];
    return (trip.itinerary || [])
      .filter((item) => item.latitude != null && item.longitude != null)
      .sort((a, b) => (a.day || 0) - (b.day || 0))
      .map((item) => [item.longitude!, item.latitude!] as [number, number]);
  }, [trip, activeLayers]);

  const toggleLayer = (layer: MapLayer) => {
    const newLayers = new Set(activeLayers);
    if (newLayers.has(layer)) {
      newLayers.delete(layer);
    } else {
      newLayers.add(layer);
    }
    setActiveLayers(newLayers);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Map View</h2>

        {/* Layer toggles */}
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-text-secondary" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleLayer('destination')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  activeLayers.has('destination')
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-secondary text-text-secondary hover:bg-border-color'
                }`}
              >
                Destination
              </button>
              <button
                onClick={() => toggleLayer('itinerary')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  activeLayers.has('itinerary')
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-secondary text-text-secondary hover:bg-border-color'
                }`}
              >
                Itinerary
              </button>
              <button
                onClick={() => toggleLayer('accommodation')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  activeLayers.has('accommodation')
                    ? 'bg-accent-secondary text-white'
                    : 'bg-bg-secondary text-text-secondary hover:bg-border-color'
                }`}
              >
                Stays
              </button>
              <button
                onClick={() => toggleLayer('transport')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  activeLayers.has('transport')
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-secondary text-text-secondary hover:bg-border-color'
                }`}
              >
                Transport
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Full-screen map */}
      <Card className="overflow-hidden p-0 flex-1">
        <div className="h-full w-full min-h-[600px]">
          <Map center={center} zoom={zoom}>
            <MapControls position="bottom-right" showZoom showCompass showFullscreen showLocate />

            {/* Itinerary route */}
            {activeLayers.has('itinerary') && itineraryRoute.length > 1 && (
              <MapRoute coordinates={itineraryRoute} color="var(--accent-primary)" width={3} opacity={0.7} />
            )}

            {/* Trip destination marker */}
            {activeLayers.has('destination') && trip.latitude && trip.longitude && (
              <MapMarker longitude={trip.longitude} latitude={trip.latitude}>
                <MarkerContent>
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-full shadow-lg border-4 border-white">
                    <MapPin size={24} className="text-white" />
                  </div>
                </MarkerContent>
                <MarkerTooltip>{trip.city || trip.title} (Destination)</MarkerTooltip>
              </MapMarker>
            )}

            {/* Itinerary markers */}
            {activeLayers.has('itinerary') &&
              (trip.itinerary || []).map((item, index) => {
                if (!item.latitude || !item.longitude) return null;
                return (
                  <MapMarker key={item.id} longitude={item.longitude} latitude={item.latitude}>
                    <MarkerContent>
                      <div className="flex items-center justify-center w-10 h-10 bg-accent-primary rounded-full shadow-lg border-2 border-white">
                        <span className="text-white font-bold text-sm">{item.day || index + 1}</span>
                      </div>
                    </MarkerContent>
                    <MarkerTooltip>{item.title || item.activity}</MarkerTooltip>
                  </MapMarker>
                );
              })}

            {/* Accommodation markers */}
            {activeLayers.has('accommodation') &&
              (trip.accommodation || []).map((acc) => {
                if (!acc.latitude || !acc.longitude) return null;
                return (
                  <MapMarker key={acc.id} longitude={acc.longitude} latitude={acc.latitude}>
                    <MarkerContent>
                      <div className="flex items-center justify-center w-10 h-10 bg-accent-secondary rounded-full shadow-lg border-2 border-white">
                        <Home size={20} className="text-white" />
                      </div>
                    </MarkerContent>
                    <MarkerTooltip>{acc.name}</MarkerTooltip>
                  </MapMarker>
                );
              })}

            {/* Transport routes and markers */}
            {activeLayers.has('transport') &&
              (trip.transport || []).map((trans) => {
                if (
                  !trans.departure_latitude ||
                  !trans.departure_longitude ||
                  !trans.arrival_latitude ||
                  !trans.arrival_longitude
                )
                  return null;

                const Icon = trans.type === 'Flight' ? Plane : Train;
                const routeCoords: [number, number][] = [
                  [trans.departure_longitude, trans.departure_latitude],
                  [trans.arrival_longitude, trans.arrival_latitude],
                ];

                return (
                  <React.Fragment key={trans.id}>
                    {/* Transport route */}
                    <MapRoute coordinates={routeCoords} color="#3b82f6" width={2} opacity={0.6} />

                    {/* Departure marker */}
                    <MapMarker longitude={trans.departure_longitude} latitude={trans.departure_latitude}>
                      <MarkerContent>
                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full shadow-lg border-2 border-white">
                          <Icon size={16} className="text-white" />
                        </div>
                      </MarkerContent>
                      <MarkerTooltip>{trans.departure_location || trans.from}</MarkerTooltip>
                    </MapMarker>

                    {/* Arrival marker */}
                    <MapMarker longitude={trans.arrival_longitude} latitude={trans.arrival_latitude}>
                      <MarkerContent>
                        <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-full shadow-lg border-2 border-white">
                          <Icon size={16} className="text-white" />
                        </div>
                      </MarkerContent>
                      <MarkerTooltip>{trans.arrival_location || trans.to}</MarkerTooltip>
                    </MapMarker>
                  </React.Fragment>
                );
              })}
          </Map>
        </div>
      </Card>
    </div>
  );
};

export default TripMapView;
