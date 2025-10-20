// San Francisco Narcan Overdose Mapping App (Full Reset)
// Tech stack: React, Leaflet, CSV, Layered visualization, Custom markers and toggles

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, LayersControl, Marker, Popup, LayerGroup, useMap } from 'react-leaflet';
import { GeoJSON } from 'react-leaflet';
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

const zoneColors = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

function HeatmapLayer({ points, visible }) {
  const map = useMap();
  useEffect(() => {
    let heat;
    if (visible && points.length) {
      heat = L.heatLayer(points, { radius: 15, blur: 15, maxZoom: 17 });
      heat.addTo(map);
    }
    return () => {
      if (heat) map.removeLayer(heat);
    };
  }, [map, points, visible]);
  return null;
}

export default function NarcanMapApp() {
  const [heatData, setHeatData] = useState([]);
  const [markerData, setMarkerData] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    fetch('/data/od_deaths_detailed_2020_2021.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: ({ data }) => {
            const heatPoints = [];
            const markers = [];
            data.forEach(row => {
              if (row.Involves_fentanyl?.toUpperCase() === 'TRUE') {
                const lat = parseFloat(row.LAT);
                const lng = parseFloat(row.LON);
                if (!isNaN(lat) && !isNaN(lng)) {
                  heatPoints.push([lat, lng]);
                  markers.push({
                    position: [lat, lng],
                    cod: row['COD Variant'],
                    race: row.Race,
                    age: row.Age,
                    gender: row.Gender,
                    date: row.Date
                  });
                }
              }
            });
            setHeatData(heatPoints);
            setMarkerData(markers);
          }
        });
      });
  }, []);

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <LayersControl position="topright">
        <BaseLayer checked name="Minimalist Light View">
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
            attribution="&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>, &copy; <a href='https://openmaptiles.org/'>OpenMapTiles</a> &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors"
          />
        </BaseLayer>

        <BaseLayer name="GPS Map">
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png"
            attribution="&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>, &copy; <a href='https://openmaptiles.org/'>OpenMapTiles</a> &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors"
          />
        </BaseLayer>

        <BaseLayer name="Hybrid View">
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
            attribution="&copy; Google"
          />
        </BaseLayer>

        <Overlay checked={showHeatmap} name="Overdose Heatmap">
          <LayerGroup eventHandlers={{ add: () => setShowHeatmap(true), remove: () => setShowHeatmap(false) }}>
            <HeatmapLayer points={heatData} visible={showHeatmap} />
          </LayerGroup>
        </Overlay>

        <Overlay name="Overdose Case Markers">
          <LayerGroup>
            <MarkerClusterGroup chunkedLoading>
              {markerData.map((marker, idx) => (
                <Marker
                  key={idx}
                  position={marker.position}
                  icon={customIcon}
                >
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
            {/* Station markers will be added here */}
          </LayerGroup>
        </Overlay>

        {/* <Overlay name="EMS Coverage Zones"> -- Uncomment once stationZones.json is available */}
        {/*   <LayerGroup> */}
        {/*     <GeoJSON ... /> */}
        {/*   </LayerGroup> */}
        {/* </Overlay> */}
      </LayersControl>
    </MapContainer>
  );
}
