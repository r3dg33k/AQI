const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

const cities = [
  { name: "Delhi", lat: 28.7041, lon: 77.1025 },
  { name: "Riyadh", lat: 24.7136, lon: 46.6753 },
  { name: "Beijing", lat: 39.9042, lon: 116.4074 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "New York", lat: 40.7128, lon: -74.0060 },
  { name: "Dhaka", lat: 23.8103, lon: 90.4125 }
];

fetch("data/aqi.json")
  .then(res => res.json())
  .then(data => {
    cities.forEach(city => {
      const cityData = data.cities[city.name.toLowerCase()];
      const aqi = cityData?.data?.aqi || 'N/A';
      const rating = getAQIRating(aqi);
      const marker = L.marker([city.lat, city.lon]).addTo(map);
      marker.bindPopup(`<b>${city.name}</b><br>AQI: ${aqi} (${rating})`);
      marker.on('click', () => showCityInfo(city.name, aqi, rating, cityData));
    });
  });

function getAQIRating(aqi){
  if(aqi==='N/A') return 'Unknown';
  aqi=Number(aqi);
  if(aqi<=50) return 'Good';
  if(aqi<=100) return 'Moderate';
  if(aqi<=150) return 'Unhealthy for Sensitive';
  if(aqi<=200) return 'Unhealthy';
  if(aqi<=300) return 'Very Unhealthy';
  return 'Hazardous';
}

function showCityInfo(name, aqi, rating, data){
  const infoDiv=document.getElementById('info-content');
  infoDiv.innerHTML=`<p>Loading AI summary...</p>`;
  fetch(`data/analysis/${name.toLowerCase()}.json`)
    .then(res=>res.json())
    .then(aiData=>{
      const aiSummary=aiData.choices?.[0]?.message?.content||"No AI summary.";
      infoDiv.innerHTML=`
        <div class="city-card">
          <h3>${name}</h3>
          <p><strong>AQI:</strong> ${aqi}</p>
          <p><strong>Rating:</strong> ${rating}</p>
          <p><strong>Pollutants:</strong> ${JSON.stringify(data?.data?.iaqi||{})}</p>
          <p><strong>AI Summary:</strong> ${aiSummary}</p>
        </div>`;
    }).catch(err=>{
      infoDiv.innerHTML=`
        <div class="city-card">
          <h3>${name}</h3>
          <p><strong>AQI:</strong> ${aqi}</p>
          <p><strong>Rating:</strong> ${rating}</p>
          <p><strong>Pollutants:</strong> ${JSON.stringify(data?.data?.iaqi||{})}</p>
          <p><strong>AI Summary:</strong> Failed to load.</p>
        </div>`;
    });
}

document.getElementById('theme-toggle').addEventListener('click',()=>{document.body.classList.toggle('dark-theme');});
