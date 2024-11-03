// Initialize map centered on La Rochelle.
const map = L.map('map').setView([46.1591, -1.1514], 13);

// Define the bounds for La Rochelle.
const bounds = L.latLngBounds([
  [45.9, -1.5], // Southwest corner.
  [46.5, -0.5]  // Northeast corner.
]);

// Set max bounds to restrict panning.
map.setMaxBounds(bounds);

// Add a base layer (OpenStreetMap) and settings.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  minZoom: 12,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Dictionary of visited bus stop names to image paths.
const nameToImagePath = {
  'Dames Blanches (St-Nicolas)': 'img/DAMES-BLANCHES.webp',
  'Lycée Vieljeux': 'img/LYCEE VIELJEUX.webp',
  'Place de Verdun': 'img/PLACE DE VERDUN.webp',
};

// Define a function to create a popup based on feature type.
function onEachFeature(feature, layer) {
  // For point features (stops), show name and other details.
  if (feature.geometry.type === "Point" && feature.properties) {
    const popupContent = `
                    <strong>${feature.properties.name}</strong><br>
                `;
    layer.bindPopup(popupContent);
  }
  // For line features (routes), show route details.
  else if (feature.geometry.type === "LineString" && feature.properties) {
    const popupContent = `
                    <strong>${feature.properties.route_long_name}</strong><br>
                    Ligne: ${feature.properties.route_short_name}<br>
                `;
    layer.bindPopup(popupContent);
  }
}

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Load the bus stops and routes data from the local GeoJSON file.
fetch('/data/la-rochelle-bus.geojson')
  .then(response => response.json())
  .then(data => {
    // Filter out duplicate stops based on the 'name' property.
    const uniqueStopsAndRoutes = [];
    const stopNames = new Set();

    data.features.forEach(feature => {
      if (feature.geometry.type === "Point") {
        const stopName = feature.properties.name;
        // Only add the stop if it's unique by name.
        if (!stopNames.has(stopName)) {
          stopNames.add(stopName);
          uniqueStopsAndRoutes.push(feature);
        }
      } else {
        // Add routes.
        uniqueStopsAndRoutes.push(feature);
      }
    });

    // Add bus routes and stops to the map.
    L.geoJSON(uniqueStopsAndRoutes, {
      pointToLayer: function (feature, latlng) {
        // Only create markers for unique Point features (bus stops).
        if (feature.geometry.type === "Point") {
          const stopName = feature.properties.name;

          // Determine icon based on whether the code is in the dictionary.
          let selectedIcon;
          if (nameToImagePath[stopName]) {
            // Use custom image icon for visited bus stop (names in the dictionary).
            selectedIcon = new L.Icon({
              iconUrl: nameToImagePath[stopName],
              iconSize: [100, 100],
              iconAnchor: [50, 70],
              popupAnchor: [1, -34]
            });
          } else {
            // Use a red marker for other stops.
            selectedIcon = redIcon
          }

          return L.marker(latlng, {icon: selectedIcon});
        }
      },
      style: function (feature) {
        // Apply a style for LineString features (bus routes).
        if (feature.geometry.type === "LineString") {
          return {
            color: feature.properties.route_color || "#007bff",
            weight: 7,
            opacity: 0.35
          };
        }
      },
      onEachFeature: onEachFeature  // Bind popups to each feature.
    }).addTo(map);
  })
  .catch(error => console.error('Error loading the GeoJSON data:', error));
