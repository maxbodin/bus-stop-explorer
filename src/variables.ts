import {Icon, LatLng, LatLngBounds} from "leaflet";

export const LA_ROCHELLE = {
    coords: new LatLng(46.1591, -1.1514)
}

export const MAX_BOUNDS: LatLngBounds = new LatLngBounds(
    new LatLng(45.9, -1.5), // Southwest
    new LatLng(46.5, -0.5)  // Northeast
)


export const ZOOM = {
    MAX: 18,
    MIN: 12,
    DEFAULT: 13
}

export const RED_PIN = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});