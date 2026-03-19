export interface FilterState {
    visibleRoutes: Set<string>;  // route_short_name (e.g., "1", "N1", "6").
    showRouteGeometry: boolean;  // Show/hide route lines.
    showStops: boolean;          // Show/hide stops.
}

/**
 * Initial state factory.
 */
export const createInitialFilterState = (): FilterState => ( {
    visibleRoutes: new Set(),
    showRouteGeometry: true,
    showStops: true
} );