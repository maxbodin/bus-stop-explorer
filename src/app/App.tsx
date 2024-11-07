import { useEffect, useState } from "react";
import BusStopMap from "../components/BusStopMap";

import { Feature } from "../types";

function App() {

    const [busData, setBusData] = useState<{ features: Feature[] }>();

    useEffect(() => {
        fetch("/data/la-rochelle-bus.geojson")
            .then(response => response.json())
            .then(data => setBusData(data));
    }, []);

    return (
      busData ? (<BusStopMap json={busData}/>) :
      (
        <p>Map is loading</p>
      )
    );
}

export default App
