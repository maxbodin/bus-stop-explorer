"use client";

import {useEffect, useState} from "react";
import {GeoJSON, MapContainer, TileLayer} from 'react-leaflet';
import {GeoJSON as LeafletGeoJSON, Icon, LatLngExpression, marker, StyleFunction} from 'leaflet';
import {LA_ROCHELLE, MAX_BOUNDS, RED_PIN, ZOOM} from "@/variables";
import {Feature} from "@/types";
import {GeoJsonObject} from "geojson";

import "leaflet/dist/leaflet.css";


const nameToImagePath: { [key: string]: string } = {
    'Dames Blanches (St-Nicolas)': '/img/DAMES-BLANCHES.webp',
    'Lycée Vieljeux': '/img/LYCEE VIELJEUX.webp',
    'Place de Verdun': '/img/PLACE DE VERDUN.webp',
};


export default function BusStopMap(props: {
                                       json: { features: Feature[] };
                                   }
) {

    const [data, setData] = useState<GeoJsonObject | null>(null);

    useEffect(() => {
        const uniqueFeatures: Feature[] = [];
        const stopNames = new Set();

        props.json.features.forEach(feature => {
            if (feature.geometry.type === "Point") {
                const stopName = feature.properties.name;
                if (stopName && !stopNames.has(stopName)) {
                    stopNames.add(stopName);
                    uniqueFeatures.push(feature);
                }
            } else {
                uniqueFeatures.push(feature);
            }
        });

        setData({
            type: "FeatureCollection",
            features: uniqueFeatures
        } as GeoJsonObject);

    }, [props.json.features]);


    const pointToLayer = (feature: Feature, latlng: LatLngExpression) => {
        const stopName = feature.properties.name;
        const icon = stopName && nameToImagePath[stopName]
            ? new Icon({
                iconUrl: nameToImagePath[stopName],
                iconSize: [100, 100],
                iconAnchor: [50, 70],
                popupAnchor: [1, -34]
            })
            : RED_PIN;

        return marker(latlng, {icon});
    };

    const onEachFeature = (feature: Feature, layer: LeafletGeoJSON) => {
        let popupContent = '';
        if (feature.geometry.type === "Point" && feature.properties.name) {
            popupContent = `<strong>${feature.properties.name}</strong><br>`;
        } else if (feature.geometry.type === "LineString" && feature.properties.route_long_name) {
            popupContent = `
        <strong>${feature.properties.route_long_name}</strong><br>
        Ligne: ${feature.properties.route_short_name}<br>
      `;
        }
        layer.bindPopup(popupContent);
    };

    const style: StyleFunction = (feature) => {
        if (feature?.geometry.type === "LineString") {
            return {
                color: feature.properties?.route_color || "#007bff",
                weight: 7,
                opacity: 0.35
            };
        }
        return {}
    };

    return (
        <MapContainer
            style={{
                width: "100%",
                height: "100vh",
            }}
            center={LA_ROCHELLE.coords}
            maxBounds={MAX_BOUNDS}
            zoom={ZOOM.DEFAULT}
            maxZoom={ZOOM.MAX}
            minZoom={ZOOM.MIN}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
            />

            {data && (
                <GeoJSON
                    data={data}
                    pointToLayer={pointToLayer}
                    onEachFeature={onEachFeature}
                    style={style}
                />
            )}

        </MapContainer>
    );
}