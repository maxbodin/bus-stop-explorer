import {Feature} from "@/types";
import {FilterState} from "@/types/filters";

/**
 * Extract all unique bus routes from features.
 */
export const extractRoutesFromFeatures = (features: Feature[]): string[] => {
    const routes = new Set<string>();

    features.forEach(feature => {
        if (feature.geometry.type === "LineString" && feature.properties.route_short_name) {
            routes.add(feature.properties.route_short_name);
        }
    });

    return Array.from(routes).sort();
};

/**
 * Utility distance helpers.
 */
const EARTH_RADIUS_M = 6371000;
const DEG_TO_RAD = Math.PI / 180;

const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLat = (lat2 - lat1) * DEG_TO_RAD;
    const dLon = (lon2 - lon1) * DEG_TO_RAD;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
};

const pointSegmentDistanceMeters = (px: number, py: number, ax: number, ay: number, bx: number, by: number): number => {
    // Equirectangular projection around segment latitude for speed.
    const latRad = (ay + by) * 0.5 * DEG_TO_RAD;
    const cosLat = Math.cos(latRad);
    const scaleX = 111320 * cosLat; // meters per degree lon.
    const scaleY = 111320;          // meters per degree lat.

    const pax = (px - ax) * scaleX;
    const pay = (py - ay) * scaleY;
    const bax = (bx - ax) * scaleX;
    const bay = (by - ay) * scaleY;

    const segLen2 = bax * bax + bay * bay;
    if (segLen2 === 0) return Math.sqrt(pax * pax + pay * pay);
    const t = Math.max(0, Math.min(1, (pax * bax + pay * bay) / segLen2));
    const projx = bax * t;
    const projy = bay * t;
    const dx = pax - projx;
    const dy = pay - projy;
    return Math.sqrt(dx * dx + dy * dy);
};

const stopKeyFromFeature = (feature: Feature): string => {
    const coords = (feature.geometry as any).coordinates as [number, number];
    return feature.properties.id ?? feature.properties.name ?? `${coords?.[0] ?? 0},${coords?.[1] ?? 0}`;
};

// Pre-compute stop → routes index using spatial proximity to polylines.
export const buildStopRouteIndex = (features: Feature[], maxDistanceMeters = 200): Map<string, Set<string>> => {
    type LineEntry = {
        route: string;
        bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
        segments: Array<[[number, number], [number, number]]>;
    };

    const lines: LineEntry[] = [];

    features.forEach(feature => {
        if (feature.geometry.type !== "LineString") return;
        const route = feature.properties.route_short_name;
        const coords = (feature.geometry as any).coordinates as [number, number][];
        if (!route || !coords || coords.length < 2) return;
        let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
        const segments: Array<[[number, number], [number, number]]> = [];
        for (let i = 0; i < coords.length - 1; i++) {
            const [lng1, lat1] = coords[i];
            const [lng2, lat2] = coords[i + 1];
            minLat = Math.min(minLat, lat1, lat2);
            maxLat = Math.max(maxLat, lat1, lat2);
            minLng = Math.min(minLng, lng1, lng2);
            maxLng = Math.max(maxLng, lng1, lng2);
            segments.push([[lng1, lat1], [lng2, lat2]]);
        }
        lines.push({ route, bbox: { minLat, maxLat, minLng, maxLng }, segments });
    });

    // Grid index (spatial acceleration).
    // Cell size ~= maxDistance to stay precise with minimal candidate count.
    const cellSizeDeg = Math.max(0.001, maxDistanceMeters / 111320); // ~ degrees latitude.
    const grid = new Map<string, number[]>(); // cell -> line indices.

    const addToCell = (key: string, lineIndex: number) => {
        const arr = grid.get(key);
        if (arr) arr.push(lineIndex);
        else grid.set(key, [lineIndex]);
    };

    for (let i = 0; i < lines.length; i++) {
        const b = lines[i].bbox;
        const minY = Math.floor(b.minLat / cellSizeDeg);
        const maxY = Math.floor(b.maxLat / cellSizeDeg);
        const minX = Math.floor(b.minLng / cellSizeDeg);
        const maxX = Math.floor(b.maxLng / cellSizeDeg);
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                addToCell(`${y}:${x}`, i);
            }
        }
    }

    const index = new Map<string, Set<string>>();

    features.forEach(feature => {
        if (feature.geometry.type !== "Point") return;
        const coords = (feature.geometry as any).coordinates as [number, number];
        if (!coords) return;
        const [lng, lat] = coords;
        const key = stopKeyFromFeature(feature);

        // Evaluate only candidate lines from neighbor cells.
        const cy = Math.floor(lat / cellSizeDeg);
        const cx = Math.floor(lng / cellSizeDeg);
        const candidates = new Set<number>();
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const arr = grid.get(`${cy + dy}:${cx + dx}`);
                if (!arr) continue;
                for (const idx of arr) candidates.add(idx);
            }
        }
        if (candidates.size === 0) return;

        for (const idx of candidates) {
            const line = lines[idx];
            const { minLat, maxLat, minLng, maxLng } = line.bbox;
            // quick bbox distance filter.
            const dLat = Math.max(0, Math.max(minLat - lat, lat - maxLat));
            const dLng = Math.max(0, Math.max(minLng - lng, lng - maxLng));
            if (dLat !== 0 || dLng !== 0) {
                const bboxDist = haversineMeters(lat, lng, lat + dLat, lng + dLng);
                if (bboxDist > maxDistanceMeters) continue;
            }
            // precise distance to segments.
            let minDist = Infinity;
            for (const seg of line.segments) {
                const [[lng1, lat1], [lng2, lat2]] = seg;
                const dist = pointSegmentDistanceMeters(lng, lat, lng1, lat1, lng2, lat2);
                if (dist < minDist) minDist = dist;
                if (minDist <= maxDistanceMeters) break;
            }
            if (minDist <= maxDistanceMeters) {
                let set = index.get(key);
                if (!set) {
                    set = new Set<string>();
                    index.set(key, set);
                }
                set.add(line.route);
            }
        }
    });

    return index;
};

/**
 * Filter features based on current filter state.
 * Returns filtered features and maintains original structure.
 */
export const applyFilters = (features: Feature[], filterState: FilterState, stopRouteIndex: Map<string, Set<string>>): Feature[] => {
    return features.filter(feature => {
        const isPoint = feature.geometry.type === "Point";
        const isLineString = feature.geometry.type === "LineString";
        const routeShortName = feature.properties.route_short_name;

        if (isPoint) {
            if (!filterState.showStops) return false;
            if (filterState.visibleRoutes.size === 0) return true;
            const routes = stopRouteIndex.get(stopKeyFromFeature(feature));
            if (!routes) return false;
            for (const r of routes) {
                if (filterState.visibleRoutes.has(r)) return true;
            }
            return false;
        }

        if (isLineString) {
            if (!filterState.showRouteGeometry) return false;
            if (filterState.visibleRoutes.size === 0) return true;
            return routeShortName ? filterState.visibleRoutes.has(routeShortName) : false;
        }

        return true;
    });
};

