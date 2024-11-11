export interface FeatureProperties {
    name?: string;
    route_long_name?: string;
    route_short_name?: string;
    route_color?: string;
}

export interface FeatureGeometry {
    type: string;
}

export interface Feature {
    geometry: FeatureGeometry;
    properties: FeatureProperties;
}