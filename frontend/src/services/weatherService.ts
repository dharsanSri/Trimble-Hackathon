import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { districtCoordinates } from '@/lib/geoData';
import { FloodRiskGeoData } from '@/lib/geoData';

// Weather API key should be configured in the environment variables
// For development, you can add it to .env.local file as VITE_APP_WEATHER_API_KEY=your_api_key
const WEATHER_API_KEY = import.meta.env.VITE_APP_WEATHER_API_KEY || import.meta.env.VITE_APP_OPEN_WEATHER_API_KEY;

// Special zone coordinates for zones that aren't actual districts
const specialZoneCoordinates: Record<string, { lat: number; lon: number }> = {
  "Coastal Flood Zone": { lat: 13.05, lon: 80.25 }, // Near Chennai coast
  "Cauvery Delta Region": { lat: 10.7, lon: 79.2 }, // Center of Cauvery delta
  "Chennai Coastal Zone": { lat: 13.1, lon: 80.3 } // Chennai coastal area
};

export async function getAndStoreWeatherForecast() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const uid = user.uid;
  const userDoc = await getDoc(doc(db, "furtherdetails", uid));
  if (!userDoc.exists()) throw new Error("District not found");

  const district = userDoc.data().district;
  const coords = districtCoordinates[district];
  if (!coords) throw new Error(`Coordinates missing for ${district}`);

  const res = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${coords.lat},${coords.lon}&days=3&aqi=no&alerts=yes`
  );

  if (!res.ok) throw new Error("Failed to fetch weather data");

  const data = await res.json();

  // Save raw JSON to Firestore for AI input
  await setDoc(doc(db, "weather_forecast", uid), {
    district,
    rawForecast: data,
    timestamp: new Date().toISOString(),
  });

  return data;
}

// Generate mock weather data for special zones
const generateMockWeatherData = (zoneName: string, coords: { lat: number; lon: number }) => {
  // Higher rainfall for high risk zones
  const isHighRisk = zoneName.toLowerCase().includes('coastal') || zoneName.toLowerCase().includes('flood');
  
  return {
    location: {
      name: zoneName,
      region: "Tamil Nadu",
      country: "India",
      lat: coords.lat,
      lon: coords.lon,
      localtime: new Date().toISOString()
    },
    current: {
      temp_c: 28 + Math.random() * 4,
      condition: {
        text: isHighRisk ? "Heavy rain" : "Moderate rain",
        icon: "//cdn.weatherapi.com/weather/64x64/day/308.png"
      },
      wind_kph: isHighRisk ? 45 + Math.random() * 15 : 25 + Math.random() * 15,
      precip_mm: isHighRisk ? 15 + Math.random() * 10 : 5 + Math.random() * 5
    },
    forecast: {
      forecastday: [
        {
          date: new Date().toISOString().split('T')[0],
          day: {
            maxtemp_c: 30 + Math.random() * 3,
            mintemp_c: 24 + Math.random() * 3,
            totalprecip_mm: isHighRisk ? 35 + Math.random() * 20 : 15 + Math.random() * 10,
            maxwind_kph: isHighRisk ? 50 + Math.random() * 20 : 30 + Math.random() * 15
          }
        },
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          day: {
            maxtemp_c: 29 + Math.random() * 3,
            mintemp_c: 23 + Math.random() * 3,
            totalprecip_mm: isHighRisk ? 40 + Math.random() * 25 : 20 + Math.random() * 15,
            maxwind_kph: isHighRisk ? 55 + Math.random() * 20 : 35 + Math.random() * 15
          }
        },
        {
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          day: {
            maxtemp_c: 28 + Math.random() * 3,
            mintemp_c: 22 + Math.random() * 3,
            totalprecip_mm: isHighRisk ? 30 + Math.random() * 20 : 10 + Math.random() * 10,
            maxwind_kph: isHighRisk ? 45 + Math.random() * 15 : 25 + Math.random() * 15
          }
        }
      ]
    },
    alerts: {
      alert: isHighRisk ? [
        {
          headline: `Flood Warning for ${zoneName}`,
          desc: `Heavy rainfall expected in ${zoneName} with potential for flooding in low-lying areas.`,
          severity: "Moderate"
        }
      ] : []
    }
  };
};

// Fetch weather data for a specific district
export const fetchWeatherData = async (district: string) => {
  try {
    // Check if it's a special zone that needs mock data
    if (specialZoneCoordinates[district]) {
      console.log(`Using mock data for special zone: ${district}`);
      return generateMockWeatherData(district, specialZoneCoordinates[district]);
    }
    
    const coords = districtCoordinates[district];
    if (!coords) {
      throw new Error(`Coordinates not found for district: ${district}`);
    }

    if (!WEATHER_API_KEY) {
      throw new Error('Weather API key not configured');
    }

    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${coords.lat},${coords.lon}&days=3&aqi=no&alerts=yes`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Calculate flood risk based on weather data
export const calculateFloodRisk = (weatherData: any) => {
  // Extract relevant data from the weather API response
  const totalRainfall = weatherData.forecast.forecastday.reduce(
    (sum: number, day: any) => sum + day.day.totalprecip_mm,
    0
  );
  
  const maxWindKph = Math.max(
    ...weatherData.forecast.forecastday.map((day: any) => day.day.maxwind_kph)
  );
  
  const hasAlerts = weatherData.alerts && weatherData.alerts.alert && weatherData.alerts.alert.length > 0;
  
  // Check for flood related alerts
  const hasFloodAlerts = hasAlerts && weatherData.alerts.alert.some(
    (alert: any) => 
      alert.headline.toLowerCase().includes('flood') || 
      alert.desc.toLowerCase().includes('flood')
  );
  
  // Calculate risk level based on rainfall, wind, and alerts
  let riskLevel: 'high' | 'medium' | 'low' = 'low';
  
  if (hasFloodAlerts || totalRainfall > 100 || (totalRainfall > 75 && maxWindKph > 60)) {
    riskLevel = 'high';
  } else if (totalRainfall > 50 || (totalRainfall > 25 && maxWindKph > 40)) {
    riskLevel = 'medium';
  }
  
  return {
    riskLevel,
    rainfallPrediction: totalRainfall,
    maxWindSpeed: maxWindKph,
    hasAlerts,
    floodAlerts: hasFloodAlerts
  };
};

// Fetch real-time flood risk for multiple districts
export const fetchDistrictFloodRisks = async () => {
  try {
    if (!WEATHER_API_KEY && Object.keys(specialZoneCoordinates).length === 0) {
      throw new Error('Weather API key not configured and no special zones defined');
    }
    
    // Get list of districts to check
    const districtsToCheck = [
      'Chennai', 'Cuddalore', 'Nagapattinam', 'Thanjavur', 
      'Tiruvarur', 'Nilgiris', 'Kanyakumari', 'Thoothukudi',
      'Coastal Flood Zone', 'Cauvery Delta Region', 'Chennai Coastal Zone'
    ];
    
    // Fetch weather data for each district
    const weatherPromises = districtsToCheck.map(district => 
      fetchWeatherData(district)
        .then(data => ({
          district,
          weather: data,
          floodRisk: calculateFloodRisk(data)
        }))
        .catch(error => ({
          district,
          error: error.message,
          floodRisk: { 
            riskLevel: 'low',
            rainfallPrediction: 0,
            maxWindSpeed: 0,
            hasAlerts: false,
            floodAlerts: false
          }
        }))
    );
    
    return await Promise.all(weatherPromises);
  } catch (error) {
    console.error('Error fetching district flood risks:', error);
    throw error;
  }
};

// Update GeoJSON data with real-time flood risk
export const updateFloodRiskData = async (geoData: FloodRiskGeoData): Promise<FloodRiskGeoData> => {
  try {
    // Create a copy of the GeoJSON data
    const updatedData = JSON.parse(JSON.stringify(geoData));
    
    try {
      const districtRisks = await fetchDistrictFloodRisks();
      
      // Update risk levels based on real-time data
      updatedData.features.forEach((feature: any) => {
        const districtName = feature.properties.name;
        const districtRisk = districtRisks.find(risk => risk.district === districtName);
        
        if (districtRisk && !districtRisk.error) {
          // Update risk level and description with real-time data
          feature.properties.riskLevel = districtRisk.floodRisk.riskLevel;
          feature.properties.realTimeData = {
            rainfall: districtRisk.floodRisk.rainfallPrediction,
            windSpeed: districtRisk.floodRisk.maxWindSpeed,
            hasAlerts: districtRisk.floodRisk.hasAlerts
          };
          feature.properties.description = `${feature.properties.description}. 
            Expected rainfall: ${districtRisk.floodRisk.rainfallPrediction.toFixed(1)}mm over next 3 days. 
            ${districtRisk.floodRisk.floodAlerts ? 'FLOOD ALERT ACTIVE!' : ''}`;
        }
      });
    } catch (error) {
      console.error('Error fetching real-time data, using static data instead:', error);
    }
    
    return updatedData;
  } catch (error) {
    console.error('Error updating flood risk data:', error);
    throw error;
  }
};
