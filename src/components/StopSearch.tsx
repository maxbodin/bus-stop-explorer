import { useMemo, useRef, useState } from "react";
import type { Feature } from "@/types";

export type StopSearchOption = {
    id: string;
    name: string;
    lat: number;
    lng: number;
};

export interface StopSearchProps {
    features: Feature[];
    onSelect: ( stop: StopSearchOption ) => void;
    placeholder?: string;
    maxResults?: number;
}

const normalize = ( value: string ): string =>
    value
        .toLowerCase()
        .normalize( "NFD" )
        .replace( /\p{Diacritic}/gu, "" )
        .trim();

const getStopOption = ( feature: Feature ): StopSearchOption | null => {
    if (feature.geometry.type !== "Point") return null;
    const name = feature.properties.name;
    const id = feature.properties.id ?? name;
    const coords = ( feature.geometry as any ).coordinates as [number, number] | undefined;
    if (!name || !id || !coords) return null;
    const [lng, lat] = coords;
    return { id, name, lat, lng };
};

export default function StopSearch( {
                                        features,
                                        onSelect,
                                        placeholder = "Rechercher un arrêt…",
                                        maxResults = 8
                                    }: StopSearchProps ) {
    const inputRef = useRef<HTMLInputElement | null>( null );
    const options = useMemo( () => {
        const out: Array<StopSearchOption & { n: string }> = [];
        for (const f of features) {
            const opt = getStopOption( f );
            if (!opt) continue;
            out.push( { ...opt, n: normalize( opt.name ) } );
        }
        out.sort( ( a, b ) => a.n.localeCompare( b.n ) );
        return out;
    }, [features] );

    const [query, setQuery] = useState<string>( "" );
    const [isOpen, setIsOpen] = useState<boolean>( false );
    const q = useMemo( () => normalize( query ), [query] );

    const results = useMemo( () => {
        if (!isOpen || !q) return [] as StopSearchOption[];
        const res: StopSearchOption[] = [];
        for (const opt of options) {
            if (opt.n.includes( q )) {
                res.push( opt );
                if (res.length >= maxResults) break;
            }
        }
        return res;
    }, [options, q, maxResults] );

    const handlePick = ( opt: StopSearchOption ) => {
        setQuery( opt.name );
        onSelect( opt );
        setIsOpen( false );
        inputRef.current?.blur();
    };

    return (
        <div className="pointer-events-none absolute inset-x-0 top-2.5 z-1200 flex justify-center" role="search"
             aria-label="Recherche d'arrêt">
            <div className="pointer-events-auto w-[min(520px,calc(100vw-20px))]">
                <label className="sr-only" htmlFor="stop-search-input">Rechercher un arrêt</label>
                <input
                    id="stop-search-input"
                    type="search"
                    inputMode="search"
                    autoComplete="off"
                    ref={ inputRef }
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-md outline-none focus:border-neutral-400"
                    placeholder={ placeholder }
                    value={ query }
                    onChange={ ( e ) => {
                        setQuery( e.target.value );
                        setIsOpen( true );
                    } }
                    onFocus={ () => setIsOpen( true ) }
                    aria-autocomplete="list"
                    aria-controls="stop-search-results"
                    aria-expanded={ results.length > 0 }
                />

                { results.length > 0 && (
                    <div
                        id="stop-search-results"
                        role="listbox"
                        className="mt-1 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg"
                    >
                        { results.map( ( opt ) => (
                            <button
                                key={ opt.id }
                                type="button"
                                role="option"
                                className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50"
                                onClick={ () => handlePick( opt ) }
                                title={ `Aller à l'arrêt ${ opt.name }` }
                            >
                                { opt.name }
                            </button>
                        ) ) }
                    </div>
                ) }
            </div>
        </div>
    );
}