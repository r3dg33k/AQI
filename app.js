// 1. INIT MAP
const map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18
}).addTo(map);

// 2. LOAD AQI DATA
async function loadAQI() {
    const data = await fetch("data/aqi.json").then(r => r.json());

    Object.entries(data.cities).forEach(([city, info]) => {
        const [lat, lng] = info.data.city.geo;
        const aqi = info.data.aqi;

        const marker = L.circleMarker([lat, lng], {
            radius: 10,
            color: getColor(aqi),
            fillColor: getColor(aqi),
            fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`<b>${city}</b><br>AQI: ${aqi}`);
        marker.on("click", () => showCity(city, info));
    });
}

// 3. DISPLAY CITY
async function showCity(city, info) {
    const aqi = info.data.aqi;

    document.getElementById("city-name").textContent = city.toUpperCase();
    document.getElementById("aqi-value").textContent = aqi;
    document.getElementById("aqi-rating").textContent = getRating(aqi);
    document.getElementById("aqi-rating").style.background = getColor(aqi);

    loadPollutants(info.data.iaqi);
    loadChart(aqi);
    loadAISummary(city);
}

// 4. POLLUTANTS
function loadPollutants(iaqi) {
    const container = document.getElementById("pollutants-grid");
    container.innerHTML = "";

    Object.entries(iaqi).forEach(([key, val]) => {
        container.innerHTML += `
            <div class="pollutant-card">
                <img src="assets/icons/${key}.svg" class="pollutant-icon">
                <h4>${key.toUpperCase()}</h4>
                <p>${val.v}</p>
            </div>
        `;
    });
}

// 5. Chart.js AQI Trend (Mock – replaced later)
let chart;
function loadChart(currentAQI) {
    if (chart) chart.destroy();

    const ctx = document.getElementById("aqi-chart");
    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["-5h", "-4h", "-3h", "-2h", "-1h", "Now"],
            datasets: [{
                label: "AQI Trend",
                data: [
                    currentAQI - 10,
                    currentAQI - 5,
                    currentAQI - 8,
                    currentAQI - 4,
                    currentAQI - 2,
                    currentAQI
                ],
                borderColor: "#0077ff",
                fill: false
            }]
        }
    });
}

// 6. AI Summary
async function loadAISummary(city) {
    const file = `data/analysis/${city}.json`;
    const ai = await fetch(file).then(r => r.json());
    document.getElementById("ai-summary").innerHTML =
        ai.choices[0].message.content;
}

// Helpers
function getColor(aqi) {
    if (aqi <= 50) return "green";
    if (aqi <= 100) return "yellow";
    if (aqi <= 150) return "orange";
    if (aqi <= 200) return "red";
    return "purple";
}

function getRating(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    return "Very Unhealthy";
}

loadAQI();
