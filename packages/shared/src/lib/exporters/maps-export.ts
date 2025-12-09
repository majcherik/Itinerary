import type { Trip } from '../../context/TripContext';

/**
 * Generates a KML file for Google Maps import
 * KML (Keyhole Markup Language) is an XML-based format for geographic data
 */
export function generateMapsExport(trip: Trip): string {
    const escapeXml = (str: string): string => {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };

    const formatDate = (dateStr: string | null): string => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(trip.title || 'Trip Itinerary')}</name>
    <description>${escapeXml(`${trip.city || 'Trip'} | ${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`)}</description>

    <!-- Styles -->
    <Style id="itineraryIcon">
      <IconStyle>
        <color>ff5e52e0</color>
        <scale>1.1</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
        </Icon>
      </IconStyle>
      <LabelStyle>
        <color>ff5e52e0</color>
      </LabelStyle>
    </Style>

    <Style id="accommodationIcon">
      <IconStyle>
        <color>ff0090ff</color>
        <scale>1.1</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/homegardenbusiness.png</href>
        </Icon>
      </IconStyle>
      <LabelStyle>
        <color>ff0090ff</color>
      </LabelStyle>
    </Style>

    <Style id="transportIcon">
      <IconStyle>
        <color>ff00ff00</color>
        <scale>1.0</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/airports.png</href>
        </Icon>
      </IconStyle>
      <LabelStyle>
        <color>ff00ff00</color>
      </LabelStyle>
    </Style>
`;

    // Add itinerary items as placemarks
    if (trip.itinerary && trip.itinerary.length > 0) {
        kml += `    <Folder>
      <name>Itinerary</name>
      <description>Places to visit during the trip</description>
`;

        trip.itinerary.forEach((item, index) => {
            const dayText = item.date || `Day ${item.day}`;
            const description = `
${item.description || ''}
${item.time ? `Time: ${item.time}` : ''}
${item.cost ? `Cost: $${item.cost}` : ''}
`.trim();

            // Note: We can't geocode addresses without an API, so we'll just include the location name
            // Users will need to have Google Maps geocode these when importing
            kml += `      <Placemark>
        <name>${escapeXml(`${dayText}: ${item.title}`)}</name>
        <description>${escapeXml(description)}</description>
        <styleUrl>#itineraryIcon</styleUrl>
        <Point>
          <coordinates>0,0,0</coordinates>
        </Point>
        <address>${escapeXml(trip.city || '')}</address>
      </Placemark>
`;
        });

        kml += `    </Folder>
`;
    }

    // Add accommodations
    if (trip.accommodation && trip.accommodation.length > 0) {
        kml += `    <Folder>
      <name>Accommodations</name>
      <description>Where you'll be staying</description>
`;

        trip.accommodation.forEach((accom) => {
            const description = `
${accom.address || ''}
Check-in: ${formatDate(accom.checkIn)}
Check-out: ${formatDate(accom.checkOut)}
Type: ${accom.type || 'N/A'}
${accom.notes ? `Notes: ${accom.notes}` : ''}
${accom.cost ? `Cost: $${accom.cost}` : ''}
`.trim();

            kml += `      <Placemark>
        <name>${escapeXml(accom.name)}</name>
        <description>${escapeXml(description)}</description>
        <styleUrl>#accommodationIcon</styleUrl>
        <Point>
          <coordinates>0,0,0</coordinates>
        </Point>
        <address>${escapeXml(accom.address || '')}</address>
      </Placemark>
`;
        });

        kml += `    </Folder>
`;
    }

    // Add transport departure and arrival points
    if (trip.transport && trip.transport.length > 0) {
        kml += `    <Folder>
      <name>Transport</name>
      <description>Departure and arrival locations</description>
`;

        trip.transport.forEach((transport) => {
            const description = `
${transport.type} - ${transport.number || 'N/A'}
Departure: ${formatDate(transport.depart)}
Arrival: ${formatDate(transport.arrive)}
${transport.cost ? `Cost: $${transport.cost}` : ''}
`.trim();

            // Departure point
            kml += `      <Placemark>
        <name>${escapeXml(`Departure: ${transport.from}`)}</name>
        <description>${escapeXml(description)}</description>
        <styleUrl>#transportIcon</styleUrl>
        <Point>
          <coordinates>0,0,0</coordinates>
        </Point>
        <address>${escapeXml(transport.from || '')}</address>
      </Placemark>
`;

            // Arrival point
            kml += `      <Placemark>
        <name>${escapeXml(`Arrival: ${transport.to}`)}</name>
        <description>${escapeXml(description)}</description>
        <styleUrl>#transportIcon</styleUrl>
        <Point>
          <coordinates>0,0,0</coordinates>
        </Point>
        <address>${escapeXml(transport.to || '')}</address>
      </Placemark>
`;
        });

        kml += `    </Folder>
`;
    }

    kml += `  </Document>
</kml>`;

    return kml;
}

/**
 * Note: The generated KML file uses placeholder coordinates (0,0,0) for all points.
 * When imported into Google Maps, it will attempt to geocode the addresses automatically.
 * For better results, you would need to use a geocoding service to convert addresses
 * to actual latitude/longitude coordinates before generating the KML.
 */
