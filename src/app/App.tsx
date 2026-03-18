import {useState, useEffect} from "react";
import BusStopMap from "../components/BusStopMap";

import {Feature} from "../types";

export default function App() {
    const [busData, setBusData] = useState<{ features: Feature[] }>();
    const [error, setError] = useState<string>();

    useEffect(() => {
        const fetchBusData = async () => {
            try {
                const dataUrl = `${import.meta.env.BASE_URL}data/la-rochelle-bus.geojson`;
                const response = await fetch(dataUrl, { mode: "cors" });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setBusData(data);
                setError(undefined);
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error("Failed to load GeoJSON:", message);
                setError(`Erreur lors du chargement des données: ${message}`);
            }
        };

        fetchBusData();
    }, []);

    if (error) {
        return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
    }

    return (
        busData ? <BusStopMap json={busData}/> : <p>Chargement de la carte...</p>
    );
}