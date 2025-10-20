// San Francisco Narcan Overdose Mapping App (Fixed CSV Rendering + EMT Data + Netlify Deploy)

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
  { name: "Station 11", lat: 37.748946, lon: -122.423997, address: "3880 26th Street at Church Street" },
  { name: "Station 12", lat: 37.765842, lon: -122.448068, address: "1145 Stanyan Street at Grattan Street" },
  { name: "Station 13", lat: 37.796866, lon: -122.402876, address: "530 Sansome Street at Washington Street" },
  { name: "Station 14", lat: 37.780917, lon: -122.489178, address: "551 26th Avenue at Geary Boulevard" },
  { name: "Station 15", lat: 37.723300, lon: -122.451862, address: "1000 Ocean Avenue at Phelan Avenue" },
  { name: "Station 16", lat: 37.798152, lon: -122.436696, address: "2251 Greenwich Street at Fillmore Street" },
  { name: "Station 17", lat: 37.730323, lon: -122.382393, address: "1295 Shafter Avenue at Ingalls Street" },
  { name: "Station 18", lat: 37.753340, lon: -122.494293, address: "1935 32nd Avenue at Ortega Street" },
  { name: "Station 19", lat: 37.731812, lon: -122.474348, address: "390 Buckingham Way at Winston Street" },
  { name: "Station 20", lat: 37.751413, lon: -122.456604, address: "285 Olympia Way at Clarendon Avenue" },
  { name: "Station 21", lat: 37.775887, lon: -122.438924, address: "1443 Grove Street at Broderick Street" },
  { name: "Station 22", lat: 37.763796, lon: -122.473696, address: "1290 16th Avenue at Irving Street" },
  { name: "Station 23", lat: 37.761470, lon: -122.504970, address: "1348 45th Avenue at Judah Street" },
  { name: "Station 24", lat: 37.746963, lon: -122.436534, address: "100 Hoffman Avenue at Alvarado Street" },
  { name: "Station 25", lat: 37.749877, lon: -122.387622, address: "3305 3rd Street at Cargo Way" },
  { name: "Station 26", lat: 37.734090, lon: -122.442605, address: "80 Digby Street at Addison Street" },
  { name: "Station 28", lat: 37.802678, lon: -122.410359, address: "1814 Stockton Street at Greenwich Street" },
  { name: "Station 29", lat: 37.765041, lon: -122.403687, address: "299 Vermont Street at 16th Street" },
  { name: "Station 31", lat: 37.781694, lon: -122.469178, address: "441 12th Avenue at Geary Boulevard" },
  { name: "Station 32", lat: 37.734744, lon: -122.422515, address: "194 Park Street at Holly Park Circle" },
  { name: "Station 33", lat: 37.714552, lon: -122.451993, address: "8 Capitol Avenue at Sagamore Street" },
  { name: "Station 34", lat: 37.780296, lon: -122.507229, address: "499 41st Avenue at Geary Boulevard" },
  { name: "Station 35", lat: 37.789312, lon: -122.387927, address: "Pier 22½, The Embarcadero at Harrison Street" },
  { name: "Station 36", lat: 37.775307, lon: -122.423585, address: "109 Oak Street at Franklin Street" },
  { name: "Station 37", lat: 37.757580, lon: -122.398423, address: "798 Wisconsin Street at 22nd Street" },
  { name: "Station 38", lat: 37.789734, lon: -122.432019, address: "2150 California Street at Laguna Street" },
  { name: "Station 39", lat: 37.739379, lon: -122.453181, address: "1091 Portola Drive at Miraloma Drive" },
  { name: "Station 40", lat: 37.743360, lon: -122.476137, address: "2155 18th Avenue at Rivera Street" },
  { name: "Station 41", lat: 37.794691, lon: -122.416425, address: "1325 Leavenworth Street at Jackson Street" },
  { name: "Station 42", lat: 37.726138, lon: -122.402685, address: "2430 San Bruno Avenue at Silver Avenue" },
  { name: "Station 43", lat: 37.714555, lon: -122.431245, address: "720 Moscow Street at France Avenue" },
  { name: "Station 44", lat: 37.719332, lon: -122.427393, address: "1298 Girard Street at Wilde Avenue" },
  { name: "Station 48", lat: 37.823103, lon: -122.370754, address: "800 Avenue I at 10th Street, Treasure Island" },
  { name: "Station 49", lat: 37.742800, lon: -122.397300, address: "2241 Jerrold Avenue at Upton Street" },
  { name: "Station 51", lat: 37.802897, lon: -122.459859, address: "218 Lincoln Blvd at Keyes Avenue" }
];

export default function NarcanMapApp() {
  const [heatData, setHeatData] = useState([]);
  const [markerData, setMarkerData] = useState([]);

  useEffect(() => {
    fetch('/data/od_deaths_detailed_2020_2021.csv')
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
          <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=7d6ea8a9-fb05-4e9f-a921-ceae0eb4264d" attribution="&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>, &copy; <a href='https://openmaptiles.org/'>OpenMapTiles</a> &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors" />
        </BaseLayer>

        <BaseLayer name="GPS Map">
          <TileLayer url="https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png?api_key=7d6ea8a9-fb05-4e9f-a921-ceae0eb4264d" attribution="&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>, &copy; <a href='https://openmaptiles.org/'>OpenMapTiles</a> &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors" />
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
