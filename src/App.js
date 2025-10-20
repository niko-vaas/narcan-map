// San Francisco Narcan Overdose Mapping App (Fixed CSV Rendering + EMT Data)

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, LayersControl, Marker, Popup, LayerGroup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';
import L from 'leaflet';
import 'leaflet.heat';
import MarkerClusterGroup from 'react-leaflet-cluster';

import customMarkerIconUrl from './marker-icon.png';
import emsMarkerIconUrl from './emt.png';

const customIcon = new L.Icon({
  iconUrl: customMarkerIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const emsIcon = new L.Icon({
  iconUrl: emsMarkerIconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const { BaseLayer, Overlay } = LayersControl;
const position = [37.7749, -122.4194];

function HeatmapLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const heat = L.heatLayer(points, { radius: 15, blur: 15, maxZoom: 17 }).addTo(map);
    return () => map.removeLayer(heat);
  }, [map, points]);
  return null;
}

const emsStations = [
  { name: "Station 1", lat: 37.778474, lon: -122.404469, address: "935 Folsom at 5th Street" },
  { name: "Station 2", lat: 37.796765, lon: -122.409203, address: "1340 Powell Street at Broadway" },
  { name: "Station 3", lat: 37.786482, lon: -122.418036, address: "1067 Post Street at Polk Street" },
  { name: "Station 4", lat: 37.770982, lon: -122.387476, address: "449 Mission Rock at 3rd Street" },
  { name: "Station 5", lat: 37.781207, lon: -122.432071, address: "1301 Turk Street at Webster Street" },
  { name: "Station 6", lat: 37.764245, lon: -122.431157, address: "135 Sanchez Street at Henry Street" },
  { name: "Station 7", lat: 37.758521, lon: -122.413358, address: "2300 Folsom Street at 19th Street" },
  { name: "Station 8", lat: 37.776320, lon: -122.399187, address: "36 Bluxome Street at 4th Street" },
  { name: "Station 9", lat: 37.743020, lon: -122.397716, address: "2245 Jerrold Avenue at Upton Street" },
  { name: "Station 10", lat: 37.784805, lon: -122.442943, address: "655 Presidio Avenue at Bush Street" },
  // ... include all other stations exactly as before
];

export default function NarcanMapApp() {
  const [heatData, setHeatData] = useState([]);
  const [markerData, setMarkerData] = useState([]);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/data/od_deaths_detailed_2020_2021.csv')
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: ({ data }) => {
            const heatPoints = [];
            const markers = [];
            data.forEach(row => {
              const lat = parseFloat(row.LAT);
              const lng = parseFloat(row.LON);
              if (!isNaN(lat) && !isNaN(lng)) {
                if (row.Involves_fentanyl?.toUpperCase() === 'TRUE') heatPoints.push([lat, lng]);
                markers.push({
                  position: [lat, lng],
                  cod: row['COD Variant'],
                  race: row.Race,
                  age: row.Age,
                  gender: row.Gender,
                  date: row.Date
                });
              }
            });
            setHeatData(heatPoints);
            setMarkerData(markers);
          }
        });
      })
      .catch(err => console.error('CSV load error:', err));
  }, []);

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <LayersControl position="topright">
        <BaseLayer checked name="Minimalist Light View">
          <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png" attribution="&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>, &copy; <a href='https://openmaptiles.org/'>OpenMapTiles</a> &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors" />
        </BaseLayer>

        <BaseLayer name="GPS Map">
          <TileLayer url="https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png" attribution="&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>, &copy; <a href='https://openmaptiles.org/'>OpenMapTiles</a> &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors" />
        </BaseLayer>

        <Overlay checked name="Overdose Heatmap">
          <LayerGroup>
            <HeatmapLayer points={heatData} />
          </LayerGroup>
        </Overlay>

        <Overlay name="Overdose Case Markers">
          <LayerGroup>
            <MarkerClusterGroup chunkedLoading>
              {markerData.map((marker, idx) => (
                <Marker key={idx} position={marker.position} icon={customIcon}>
                  <Popup>
                    <strong>Cause of Death:</strong> {marker.cod}<br />
                    <strong>Race:</strong> {marker.race}<br />
                    <strong>Age:</strong> {marker.age}<br />
                    <strong>Gender:</strong> {marker.gender}<br />
                    <strong>Date:</strong> {marker.date}
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </LayerGroup>
        </Overlay>

        <Overlay name="EMT Resources">
          <LayerGroup>
            {emsStations.map((st, idx) => (
              <Marker key={idx} position={[st.lat, st.lon]} icon={emsIcon}>
                <Popup>
                  <strong>{st.name}</strong><br />
                  {st.address}
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </Overlay>
      </LayersControl>
    </MapContainer>
  );
}
