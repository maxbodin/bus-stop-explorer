"use client";

import {useMemo, useState} from "react";
import {GeoJSON, MapContainer, TileLayer} from 'react-leaflet';
import {GeoJSON as LeafletGeoJSON, Icon, LatLngExpression, marker, StyleFunction} from 'leaflet';
import {LA_ROCHELLE, MAX_BOUNDS, RED_PIN, ZOOM} from "@/variables";
import {Feature} from "@/types";
import {useFilters} from "@/hooks/useFilters";
import {GeoJsonObject} from "geojson";
import FilterPanel from "./FilterPanel";

import "leaflet/dist/leaflet.css";


const nameToImagePath: { [key: string]: string } = {
    'Dames Blanches (St-Nicolas)': '/img/DAMES-BLANCHES.webp',
    'Lycée Vieljeux': '/img/LYCEE VIELJEUX.webp',
    'Place de Verdun': '/img/PLACE DE VERDUN.webp',
};

/**
 * Deduplicates bus stops by name
 * Returns unique features maintaining original structure
 */
const deduplicateFeatures = (features: Feature[]): Feature[] => {
    const uniqueFeatures: Feature[] = [];
    const stopNames = new Set<string>();

    features.forEach(feature => {
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

    return uniqueFeatures;
};

export default function BusStopMap(props: {
                                       json: { features: Feature[] };
                                   }
) {

    const uniqueFeatures = useMemo(
        () => deduplicateFeatures(props.json.features),
        [props.json.features]
    );

    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);
    const filters = useFilters(uniqueFeatures);

    const data = useMemo(() => ({
        type: "FeatureCollection",
        features: filters.filteredFeatures
    } as GeoJsonObject), [filters.filteredFeatures]);

    const geoJsonKey = useMemo(() => {
        const routeKey = Array.from(filters.filterState.visibleRoutes).sort().join(",");
        return `${filters.filterState.showStops}-${filters.filterState.showRouteGeometry}-${routeKey}-${filters.filteredFeatures.length}`;
    }, [filters.filterState.showStops, filters.filterState.showRouteGeometry, filters.filterState.visibleRoutes, filters.filteredFeatures.length]);


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
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
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
                        key={geoJsonKey}
                        data={data}
                        pointToLayer={pointToLayer}
                        onEachFeature={onEachFeature}
                        style={style}
                    />
                )}
            </MapContainer>
            {isFilterOpen && (
                <FilterPanel filters={filters} isOpen={isFilterOpen} onToggle={() => setIsFilterOpen(false)} />
            )}
            {!isFilterOpen && (
                <button
                    className="absolute right-2.5 top-2.5 z-[1100] rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-md transition hover:border-neutral-400 hover:bg-neutral-100"
                    style={{ position: "absolute", right: "10px", top: "10px", zIndex: 1500, background: "white", border: "1px solid #d4d4d4", borderRadius: "6px", padding: "8px 12px", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
                    onClick={() => setIsFilterOpen(true)}
                    title="Afficher les filtres"
                >
                    Filtres
                </button>
            )}
        </div>
    );
};
