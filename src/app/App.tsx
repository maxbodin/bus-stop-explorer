import { useMemo, useState } from "react";
import BusStopMap from "../components/BusStopMap";
import LoadingScreen from "@/components/LoadingScreen";
import { useBusData } from "@/hooks/useBusData";

export default function App() {
    const { progress, busData, error } = useBusData();
    const [loadingDone, setLoadingDone] = useState<boolean>( false );

    const shouldShowMap = useMemo( () => Boolean( busData ) && loadingDone, [busData, loadingDone] );
    const showLoadingScreen = !shouldShowMap;

    if (error) {
        return <div className="p-5 text-red-600">{ error }</div>;
    }

    return (
        <div className="relative h-screen w-full bg-white">
            { showLoadingScreen && (
                <LoadingScreen
                    progress={ progress }
                    onDone={ () => setLoadingDone( true ) }
                />
            ) }
            { shouldShowMap && busData && <BusStopMap json={ busData }/> }
        </div>
    );
}