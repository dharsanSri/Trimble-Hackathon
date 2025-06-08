// src/lib/generateFloodRisk.ts
import { collection, addDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';

export const generateFloodRisk = async (district: string) => {
  try {
    // 1. Get bounding box from Nominatim API
    const bboxRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${district}, Tamil Nadu`);
    const bboxData = await bboxRes.json();
    if (!bboxData.length) throw new Error("No bounding box found");

    const [minLon, minLat, maxLon, maxLat] = bboxData[0].boundingbox.map(parseFloat);
    const boundingBox = { minLat, maxLat, minLon, maxLon };
    const lat = parseFloat(bboxData[0].lat);
    const lon = parseFloat(bboxData[0].lon);

    // 2. Get historical weather data (3 days)
    const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY || '';
    const now = Math.floor(Date.now() / 1000);
    const historicalData: any[] = [];

    for (let i = 1; i <= 3; i++) {
      const dt = now - i * 86400;
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&appid=${apiKey}`
      );
      const data = await res.json();
      historicalData.push(data);
    }

    // 3. Call Cloud Function
    const generateGeoJSON = httpsCallable(functions, 'generateGeoJSON');
    const result = await generateGeoJSON({
      district,
      boundingBox,
      weatherData: historicalData,
    });

    const geojson = result.data;

    // 4. Store GeoJSON in Firestore
    await addDoc(collection(db, 'flood_risk_zones'), {
      district,
      geojson,
      generatedAt: new Date(),
    });

    console.log('Flood risk zones generated successfully.');
  } catch (error) {
    console.error('Error generating flood risk:', error);
  }
};
