import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Use direct unpkg CDN links to avoid any Vite image resolution or packaging issues at runtime
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

// Override default marker options
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to fit map view bounds to markers/polyline safely
const FitBounds = ({ markers, polyline }) => {
  const map = useMap();

  useEffect(() => {
    try {
      if (polyline && polyline.length > 0) {
        map.fitBounds(polyline, { padding: [50, 50] });
      } else if (markers && markers.length > 0) {
        const validCoords = markers
          .filter(m => m && typeof m.lat === 'number' && typeof m.lng === 'number')
          .map(m => [m.lat, m.lng]);
        
        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    } catch (e) {
      console.warn('Leaflet fitBounds warning:', e);
    }
  }, [map, markers, polyline]);

  return null;
};

const MapView = ({ center, zoom, markers, polyline, height = '350px' }) => {
  const defaultCenter = center || [18.5204, 73.8567]; // Pune
  const defaultZoom = zoom || 12;

  // Filter out any markers with invalid coordinates to prevent leaflet crash
  const validMarkers = (markers || []).filter(
    m => m && typeof m.lat === 'number' && typeof m.lng === 'number'
  );

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: height, width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validMarkers.map((marker, idx) => (
        <Marker key={idx} position={[marker.lat, marker.lng]}>
          {marker.label && <Popup>{marker.label}</Popup>}
        </Marker>
      ))}
      {polyline && polyline.length > 0 && (
        <Polyline positions={polyline} color="#00BFA6" weight={5} opacity={0.8} />
      )}
      <FitBounds markers={validMarkers} polyline={polyline} />
    </MapContainer>
  );
};

export default MapView;
