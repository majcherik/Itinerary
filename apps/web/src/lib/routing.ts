/**
 * Routing utility using OSRM (Open Source Routing Machine)
 * Free routing service with no API key required
 * https://project-osrm.org/docs/v5.5.1/api/
 */

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface RouteStep {
  distance: number; // meters
  duration: number; // seconds
  instruction: string;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number]; // [lng, lat]
  };
}

export interface RouteLeg {
  distance: number; // meters
  duration: number; // seconds
  steps: RouteStep[];
}

export interface RouteResult {
  distance: number; // meters
  duration: number; // seconds
  geometry: [number, number][]; // array of [lng, lat]
  legs: RouteLeg[];
}

export interface RouteOptions {
  profile?: 'driving' | 'cycling' | 'walking';
  alternatives?: boolean;
  steps?: boolean;
  overview?: 'full' | 'simplified' | 'false';
}

const OSRM_API = 'https://router.project-osrm.org';

/**
 * Calculate route between coordinates
 * @param coordinates - Array of coordinates to route through
 * @param options - Routing options
 * @returns Route information including distance, duration, and geometry
 */
export async function calculateRoute(
  coordinates: RouteCoordinate[],
  options: RouteOptions = {}
): Promise<RouteResult | null> {
  if (coordinates.length < 2) {
    throw new Error('At least 2 coordinates are required');
  }

  const {
    profile = 'driving',
    alternatives = false,
    steps = false,
    overview = 'full',
  } = options;

  try {
    // Format coordinates as lon,lat;lon,lat;...
    const coordString = coordinates
      .map((c) => `${c.longitude},${c.latitude}`)
      .join(';');

    const params = new URLSearchParams({
      overview,
      geometries: 'geojson',
      alternatives: alternatives ? 'true' : 'false',
      steps: steps ? 'true' : 'false',
    });

    const url = `${OSRM_API}/route/v1/${profile}/${coordString}?${params}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('OSRM routing failed:', data);
      return null;
    }

    const route = data.routes[0];

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry.coordinates, // GeoJSON format: [[lng, lat], ...]
      legs: route.legs || [],
    };
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
}

/**
 * Calculate route with turn-by-turn directions
 * @param coordinates - Array of coordinates to route through
 * @param profile - Transportation profile
 * @returns Route with detailed steps
 */
export async function calculateRouteWithSteps(
  coordinates: RouteCoordinate[],
  profile: 'driving' | 'cycling' | 'walking' = 'driving'
): Promise<RouteResult | null> {
  return calculateRoute(coordinates, { profile, steps: true, overview: 'full' });
}

/**
 * Calculate distance matrix between multiple points
 * Returns travel times between all coordinate pairs
 * @param coordinates - Array of coordinates
 * @param profile - Transportation profile
 * @returns Matrix of durations in seconds
 */
export async function calculateDistanceMatrix(
  coordinates: RouteCoordinate[],
  profile: 'driving' | 'cycling' | 'walking' = 'driving'
): Promise<number[][] | null> {
  if (coordinates.length < 2) {
    throw new Error('At least 2 coordinates are required');
  }

  try {
    // Format coordinates as lon,lat;lon,lat;...
    const coordString = coordinates
      .map((c) => `${c.longitude},${c.latitude}`)
      .join(';');

    const url = `${OSRM_API}/table/v1/${profile}/${coordString}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.durations) {
      console.error('OSRM table service failed:', data);
      return null;
    }

    return data.durations;
  } catch (error) {
    console.error('Distance matrix error:', error);
    return null;
  }
}

/**
 * Format duration in seconds to human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format distance in meters to human-readable string
 * @param meters - Distance in meters
 * @returns Formatted distance string
 */
export function formatRouteDistance(meters: number): string {
  const km = meters / 1000;
  if (km < 1) {
    return `${Math.round(meters)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Calculate optimal route through multiple points (Traveling Salesman Problem)
 * @param coordinates - Array of coordinates to visit
 * @param profile - Transportation profile
 * @returns Optimized route
 */
export async function calculateOptimalRoute(
  coordinates: RouteCoordinate[],
  profile: 'driving' | 'cycling' | 'walking' = 'driving'
): Promise<RouteResult | null> {
  if (coordinates.length < 3) {
    // For 2 points, just calculate regular route
    return calculateRoute(coordinates, { profile });
  }

  try {
    // Format coordinates as lon,lat;lon,lat;...
    const coordString = coordinates
      .map((c) => `${c.longitude},${c.latitude}`)
      .join(';');

    const params = new URLSearchParams({
      overview: 'full',
      geometries: 'geojson',
      steps: 'false',
    });

    const url = `${OSRM_API}/trip/v1/${profile}/${coordString}?${params}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.trips || data.trips.length === 0) {
      console.error('OSRM trip service failed:', data);
      return null;
    }

    const trip = data.trips[0];

    return {
      distance: trip.distance,
      duration: trip.duration,
      geometry: trip.geometry.coordinates,
      legs: trip.legs || [],
    };
  } catch (error) {
    console.error('Optimal route error:', error);
    return null;
  }
}
