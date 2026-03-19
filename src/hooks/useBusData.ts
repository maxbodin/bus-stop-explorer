import { useEffect, useMemo, useState } from "react";
import { Feature } from "@/types";

export enum LoadingStage {
    Idle,
    Initializing,
    Downloading,
    Processing,
    Ready,
    Error,
}

const stageToProgress = {
    [LoadingStage.Idle]: 0,
    [LoadingStage.Initializing]: 10,
    [LoadingStage.Downloading]: 25,
    [LoadingStage.Processing]: 75,
    [LoadingStage.Ready]: 100,
    [LoadingStage.Error]: 100,
};

export const useBusData = () => {
    const [stage, setStage] = useState<LoadingStage>( LoadingStage.Idle );
    const [error, setError] = useState<string | undefined>();
    const [busData, setBusData] = useState<{ features: Feature[] } | null>( null );

    useEffect( () => {
        const fetchBusData = async () => {
            const startTime = Date.now();
            setStage( LoadingStage.Initializing );
            try {
                const dataUrl = `${ import.meta.env.BASE_URL }data/la-rochelle-bus.geojson`;
                setStage( LoadingStage.Downloading );
                const response = await fetch( dataUrl, { mode: "cors" } );

                if (!response.ok) {
                    throw new Error( `HTTP error! status: ${ response.status }` );
                }

                const data = await response.json();
                setStage( LoadingStage.Processing );
                setBusData( data );
                setError( undefined );

                const elapsedTime = Date.now() - startTime;
                const minLoadingTime = 1000;

                if (elapsedTime < minLoadingTime) {
                    setTimeout( () => {
                        setStage( LoadingStage.Ready );
                    }, minLoadingTime - elapsedTime );
                } else {
                    setStage( LoadingStage.Ready );
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : String( err );
                console.error( "Failed to load GeoJSON:", message );
                setError( `Erreur lors du chargement des données: ${ message }` );
                setStage( LoadingStage.Error );
            }
        };

        fetchBusData();
    }, [] );

    const progress = useMemo( () => stageToProgress[stage], [stage] );

    return { stage, progress, busData, error };
};
