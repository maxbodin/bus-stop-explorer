import { useEffect, useMemo, useRef } from "react";

interface LoadingScreenProps {
    progress: number;
    onDone?: () => void;
    doneDelayMs?: number;
}

export default function LoadingScreen( {
                                           progress,
                                           onDone,
                                       }: LoadingScreenProps ) {
    const stages = useMemo( () => [
        { label: "Initialisation", icon: "⚙️", threshold: 10 },
        { label: "Téléchargement", icon: "📥", threshold: 25 },
        { label: "Traitement", icon: "⚡", threshold: 75 },
        { label: "Rendu", icon: "🎨", threshold: 100 }
    ], [] );

    const currentStageIndex = useMemo( () => {
        const index = stages.findIndex( s => progress < s.threshold );
        return index === -1 ? stages.length - 1 : index;
    }, [progress, stages] );

    const clampedProgress = progress <= 0 ? 0 : progress >= 100 ? 100 : progress;

    const loadingMessage = useMemo( () => {
        const label = stages[currentStageIndex]?.label ?? "Chargement";
        if (clampedProgress < 100) return `${ label }... ${ clampedProgress }%`;
        return "Chargement terminé... 100%";
    }, [clampedProgress, currentStageIndex, stages] );

    const doneCalledRef = useRef( false );
    const doneDelayMs = 650;
    useEffect( () => {
        if (!onDone) return;
        if (doneCalledRef.current) return;
        if (clampedProgress < 100) return;

        doneCalledRef.current = true;
        const t = window.setTimeout( () => onDone(), doneDelayMs );
        return () => window.clearTimeout( t );
    }, [clampedProgress, doneDelayMs, onDone] );

    return (
        <main className="flex h-screen w-full items-center justify-center bg-white px-6 absolute z-2000">
            <section
                className="w-full max-w-sm space-y-8"
                aria-label="Chargement"
            >
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-neutral-900">
                        Bus Stop Explorer
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Préparation de la carte
                    </p>
                </div>
                <div className="space-y-4">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
                        <div
                            className="h-full bg-blue-500 transition-[width] duration-300 ease-out"
                            style={ { width: `${ clampedProgress }%` } }
                        />
                    </div>

                    <div className="flex justify-between">
                        { stages.map( ( s, idx ) => (
                            <div
                                key={ idx }
                                className="flex flex-col items-center gap-1 text-xs"
                            >
                                <div
                                    className={ `rounded-full p-2 transition-all ${
                                        progress >= s.threshold
                                            ? "bg-blue-500 text-white"
                                            : idx === currentStageIndex
                                                ? "bg-blue-100 text-blue-700 animate-pulse"
                                                : "bg-neutral-100 text-neutral-400"
                                    }` }
                                >
                                    { s.icon }
                                </div>
                                <span
                                    className={ `font-medium ${
                                        progress >= s.threshold || idx === currentStageIndex
                                            ? "text-neutral-900"
                                            : "text-neutral-400"
                                    }` }
                                >
                                    { s.label }
                                </span>
                            </div>
                        ) ) }
                    </div>
                </div>
                <p className="text-center text-xs text-neutral-500">
                    { loadingMessage }
                </p>
            </section>
        </main>
    );
}
