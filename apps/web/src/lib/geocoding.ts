/**
 * Geocoding utility using Nominatim (OpenStreetMap)
 * Free geocoding service with no API key required
 * https://nominatim.org/release-docs/develop/api/Search/
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  display_name: string;
  address?: {
    city?: string;
    country?: string;
    country_code?: string;
  };
}

const NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'TripPlannerApp/1.0'; // Required by Nominatim usage policy

/**
 * Geocode an address or place name to coordinates
 * @param query - Address or place name to geocode
 * @returns Coordinates and place information
 */
export async function geocodeAddress(query: string): Promise<GeocodingResult | null> {
  if (!query || query.trim() === '') {
    return null;
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '1',
    });

    const response = await fetch(`${NOMINATIM_API}/search?${params}`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      display_name: result.display_name,
      address: result.address
        ? {
            city: result.address.city || result.address.town || result.address.village,
            country: result.address.country,
            country_code: result.address.country_code,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Geocode a city name to coordinates
 * @param city - City name
 * @param country - Optional country to narrow results
 * @returns Coordinates and place information
 */
export async function geocodeCity(city: string, country?: string): Promise<GeocodingResult | null> {
  const query = country ? `${city}, ${country}` : city;
  return geocodeAddress(query);
}

/**
 * Reverse geocode coordinates to an address
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Address information
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult | null> {
  try {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: 'json',
      addressdetails: '1',
    });

    const response = await fetch(`${NOMINATIM_API}/reverse?${params}`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result) {
      return null;
    }

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      display_name: result.display_name,
      address: result.address
        ? {
            city: result.address.city || result.address.town || result.address.village,
            country: result.address.country,
            country_code: result.address.country_code,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - First point latitude
 * @param lon1 - First point longitude
 * @param lat2 - Second point latitude
 * @param lon2 - Second point longitude
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param km - Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
