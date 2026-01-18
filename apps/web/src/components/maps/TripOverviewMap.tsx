import React from 'react';
import { Map, MapMarker, MarkerContent, MarkerTooltip } from '../ui/map';
import { MapPin } from 'lucide-react';
import { Card } from '../ui/card';

interface TripOverviewMapProps {
  latitude: number;
  longitude: number;
  city: string;
  className?: string;
}

/**
 * TripOverviewMap - Shows a simple map with the trip destination
 * Used in the Trip Details page header
 */
const TripOverviewMap: React.FC<TripOverviewMapProps> = ({
  latitude,
  longitude,
  city,
  className = '',
}) => {
  return (
    <Card className={`overflow-hidden p-0 ${className}`}>
      <div className="h-[200px] w-full">
        <Map center={[longitude, latitude]} zoom={10}>
          <MapMarker longitude={longitude} latitude={latitude}>
            <MarkerContent>
              <div className="flex items-center justify-center w-10 h-10 bg-accent-primary rounded-full shadow-lg">
                <MapPin size={20} className="text-white" />
              </div>
            </MarkerContent>
            <MarkerTooltip>{city}</MarkerTooltip>
          </MapMarker>
        </Map>
      </div>
    </Card>
  );
};

export default TripOverviewMap;
