interface FeatureProperties {
    name?: string;
    route_long_name?: string;
    route_short_name?: string;
    route_color?: string;
}

interface FeatureGeometry {
    type: string;
}

interface Feature {
    geometry: FeatureGeometry;
    properties: FeatureProperties;
}