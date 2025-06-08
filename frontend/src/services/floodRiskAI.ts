import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import OpenRouter from "@/lib/openrouter"; // Or use fetch directly if not using a wrapper
import { getDistrictBoundingBox } from "./districtBoundingBox"; // Custom util (see below)

export async function generateFloodGeoJSON() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const uid = user.uid;
  const userDoc = await getDoc(doc(db, "furtherdetails", uid));
  if (!userDoc.exists()) throw new Error("District not found");

  const district = userDoc.data().district;

  const weatherDoc = await getDoc(doc(db, "weather_forecast", uid));
  if (!weatherDoc.exists()) throw new Error("Weather data not found");

  const historical_weather = weatherDoc.data().rawForecast;
  const district_bbox = getDistrictBoundingBox(district); // Defined below

  const flood_prompt = `
You are an expert flood risk analyst with knowledge of hydrology, topography, soil types, drainage infrastructure, land use, and historical flood data.

Given the last 3 days of weather data for the ${district} district in Tamil Nadu, along with your knowledge of other relevant flood risk factors (topography, soil permeability, drainage capacity, land cover, historical flood events), predict the flood risk zones in GeoJSON format.

Risk levels: High, Moderate, Low. Each feature must have:
- geometry (Polygon strictly within the bounding box coordinates ${JSON.stringify(district_bbox)})
- properties: risk_level

Weather data:
${JSON.stringify(historical_weather, null, 2)}

Return ONLY valid GeoJSON (FeatureCollection) representing flood risk zones.
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3-70b-instruct",
      messages: [
        {
          role: "user",
          content: flood_prompt,
        },
      ],
    }),
  });

  const result = await response.json();
  const geojson = JSON.parse(result.choices[0].message.content);

  await setDoc(doc(db, "flood_risk_zones", uid), {
    district,
    geojson,
    generatedAt: new Date().toISOString(),
  });

  return geojson;
}
