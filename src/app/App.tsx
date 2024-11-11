import {useState} from "react";
import BusStopMap from "../components/BusStopMap";

import {Feature} from "../types";

export default function App() {
    const [busData, setBusData] = useState<{ features: Feature[] }>();

    fetch("/data/la-rochelle-bus.geojson")
        .then(response => response.json())
        .then(data => setBusData(data));

    return (
        busData ? <BusStopMap json={busData}/> : <p>Map is loading</p>
    );
}