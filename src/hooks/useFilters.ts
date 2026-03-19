import { useCallback, useMemo, useState } from "react";
import { createInitialFilterState, FilterState } from "@/types/filters";
import { Feature } from "@/types";
import { applyFilters, buildStopRouteIndex, extractRoutesFromFeatures } from "./useFilterLogic";

export interface UseFiltersReturn {
    filterState: FilterState;
    availableRoutes: string[];
    filteredFeatures: Feature[];
    toggleRoute: ( routeShortName: string ) => void;
    toggleAllRoutes: ( enable: boolean ) => void;
    toggleRouteGeometry: () => void;
    toggleStops: () => void;
    resetFilters: () => void;
    isRouteVisible: ( routeShortName: string ) => boolean;
}

/**
 * Custom hook for managing filter state.
 * Handles filter logic and state updates.
 */
export const useFilters = ( features: Feature[] ): UseFiltersReturn => {
    const [filterState, setFilterState] = useState<FilterState>( createInitialFilterState() );

    // Extract available routes from features.
    const availableRoutes = useMemo(
        () => extractRoutesFromFeatures( features ),
        [features]
    );

    const stopRouteIndex = useMemo(
        () => buildStopRouteIndex( features ),
        [features]
    );

    // Apply filters to features.
    const filteredFeatures = useMemo(
        () => applyFilters( features, filterState, stopRouteIndex ),
        [features, filterState, stopRouteIndex]
    );

    // Toggle single route visibility.
    const toggleRoute = useCallback( ( routeShortName: string ) => {
        setFilterState( prev => {
            const newRoutes = new Set( prev.visibleRoutes );
            if (newRoutes.has( routeShortName )) {
                newRoutes.delete( routeShortName );
            } else {
                newRoutes.add( routeShortName );
            }
            return { ...prev, visibleRoutes: newRoutes };
        } );
    }, [] );

    // Toggle all routes at once.
    const toggleAllRoutes = useCallback( ( enable: boolean ) => {
        setFilterState( prev => ( {
            ...prev,
            visibleRoutes: enable ? new Set( availableRoutes ) : new Set()
        } ) );
    }, [availableRoutes] );

    // Toggle route geometry visibility.
    const toggleRouteGeometry = useCallback( () => {
        setFilterState( prev => ( { ...prev, showRouteGeometry: !prev.showRouteGeometry } ) );
    }, [] );

    const toggleStops = useCallback( () => {
        setFilterState( prev => ( { ...prev, showStops: !prev.showStops } ) );
    }, [] );

    // Reset all filters to initial state.
    const resetFilters = useCallback( () => {
        setFilterState( createInitialFilterState() );
    }, [] );

    // Check if a route is currently visible.
    // When no routes are selected (size === 0), all routes are visible.
    const isRouteVisible = useCallback( ( routeShortName: string ) => {
        if (filterState.visibleRoutes.size === 0) {
            // All routes visible when no filter applied.
            return true;
        }
        // Otherwise only visible if explicitly selected.
        return filterState.visibleRoutes.has( routeShortName );
    }, [filterState.visibleRoutes] );

    return {
        filterState,
        availableRoutes,
        filteredFeatures,
        toggleRoute,
        toggleAllRoutes,
        toggleRouteGeometry,
        toggleStops,
        resetFilters,
        isRouteVisible
    };
};