// Initialize Leaflet map
const map = L.map("map").setView([20, 0], 2);

// OSM free map layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

async function loadAQI() {
    const aqiData = await fetch("data/aqi.json").then(r => r.json());

    Object.entries(aqiData.cities).forEach(([city, info]) => {
        const lat = info.data.city.geo[0];
        const lng = info.data.city.geo[1];
        const aqi = info.data.aqi;

        const marker = L.circleMarker([lat, lng], {
            radius: 10,
            color: getColor(aqi),
            fillColor: getColor(aqi),
            fillOpacity: 0.7
        }).addTo(map);

        marker.bindPopup(`<strong>${city}</strong><br>AQI: ${aqi}`);

        marker.on("click", () => showCity(city, info));
    });
}

async function showCity(city, info) {
    document.getElementById("city-name").innerText = city.toUpperCase();
    document.getElementById("aqi-box").innerHTML = `<h3>AQI: ${info.data.aqi}</h3>`;
    document.getElementById("pollutants").innerText = JSON.stringify(info.data.iaqi, null, 2);

    const ai = await fetch(`data/analysis/${city}.json`).then(r => r.json());
    document.getElementById("ai-summary").innerHTML =
        ai.choices?.[0]?.message?.content ?? "AI summary not available.";
}

function getColor(aqi) {
    if (aqi <= 50) return "green";
    if (aqi <= 100) return "yellow";
    if (aqi <= 150) return "orange";
    if (aqi <= 200) return "red";
    return "purple";
}

loadAQI();
