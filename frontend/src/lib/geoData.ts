import { Feature, FeatureCollection, Geometry } from 'geojson';

export interface FloodRiskProperties {
  name: string;
  riskLevel: 'high' | 'medium' | 'low';
  description: string;
  realTimeData?: {
    rainfall: number;
    windSpeed: number;
    hasAlerts: boolean;
  };
}

export type FloodRiskFeature = Feature<Geometry, FloodRiskProperties>;
export type FloodRiskGeoData = FeatureCollection<Geometry, FloodRiskProperties>;

// District coordinates for Tamil Nadu
export const districtCoordinates: Record<string, { lat: number; lon: number }> = {
  Ariyalur: { lat: 11.139, lon: 79.075 },
  Chengalpattu: { lat: 12.692, lon: 79.983 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  Coimbatore: { lat: 11.0168, lon: 76.9558 },
  Cuddalore: { lat: 11.748, lon: 79.767 },
  Dharmapuri: { lat: 12.1277, lon: 78.1576 },
  Dindigul: { lat: 10.365, lon: 77.9695 },
  Erode: { lat: 11.341, lon: 77.7172 },
  Kallakurichi: { lat: 11.738, lon: 78.962 },
  Kancheepuram: { lat: 12.835, lon: 79.703 },
  Karur: { lat: 10.957, lon: 78.076 },
  Krishnagiri: { lat: 12.526, lon: 78.213 },
  Madurai: { lat: 9.9252, lon: 78.1198 },
  Mayiladuthurai: { lat: 11.1, lon: 79.652 },
  Nagapattinam: { lat: 10.763, lon: 79.844 },
  Namakkal: { lat: 11.219, lon: 78.167 },
  Nilgiris: { lat: 11.41, lon: 76.693 },
  Perambalur: { lat: 11.233, lon: 78.883 },
  Pudukkottai: { lat: 10.383, lon: 78.817 },
  Ramanathapuram: { lat: 9.3716, lon: 78.8309 },
  Ranipet: { lat: 12.931, lon: 79.332 },
  Salem: { lat: 11.6643, lon: 78.146 },
  Sivagangai: { lat: 9.847, lon: 78.483 },
  Tenkasi: { lat: 8.959, lon: 77.315 },
  Thanjavur: { lat: 10.7867, lon: 79.1378 },
  Theni: { lat: 10.0104, lon: 77.4777 },
  Thoothukudi: { lat: 8.7642, lon: 78.1348 },
  Tiruchirappalli: { lat: 10.7905, lon: 78.7047 },
  Tirunelveli: { lat: 8.7139, lon: 77.7567 },
  Tirupathur: { lat: 12.496, lon: 78.565 },
  Tiruppur: { lat: 11.1075, lon: 77.3411 },
  Tiruvallur: { lat: 13.1439, lon: 79.908 },
  Tiruvannamalai: { lat: 12.225, lon: 79.074 },
  Tiruvarur: { lat: 10.7728, lon: 79.6365 },
  Vellore: { lat: 12.9165, lon: 79.1325 },
  Viluppuram: { lat: 11.9416, lon: 79.5005 },
  Virudhunagar: { lat: 9.584, lon: 77.957 },
  Kanyakumari: { lat: 8.0883, lon: 77.5385 },
};

// GeoJSON data for Tamil Nadu districts with flood risk levels
export const tamilNaduFloodData: FloodRiskGeoData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Chennai",
        "riskLevel": "high",
        "description": "Urban flooding risk due to coastal location and dense infrastructure"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [80.15, 12.85], // Southwest
          [80.35, 12.85], // Southeast
          [80.35, 13.25], // Northeast
          [80.15, 13.25], // Northwest
          [80.15, 12.85]  // Close the polygon
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Chennai North",
        "riskLevel": "high",
        "description": "Northern Chennai area with high flood risk"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.28, 13.15]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Chennai Central",
        "riskLevel": "high",
        "description": "Central Chennai with critical infrastructure"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.27, 13.08]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Chennai South",
        "riskLevel": "medium",
        "description": "Southern Chennai with moderate flood risk"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [80.25, 13.00]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Cuddalore",
        "riskLevel": "high",
        "description": "Coastal district with history of severe flooding during monsoons"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [79.767, 11.748]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Nagapattinam",
        "riskLevel": "high",
        "description": "Low-lying coastal area vulnerable to cyclones and flooding"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [79.844, 10.763]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Thanjavur",
        "riskLevel": "medium",
        "description": "Part of Cauvery delta, susceptible to riverine flooding"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [79.1378, 10.7867]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Tiruvarur",
        "riskLevel": "medium",
        "description": "Low elevation and part of Cauvery delta region"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [79.6365, 10.7728]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Nilgiris",
        "riskLevel": "low",
        "description": "Hilly terrain with localized landslide risk during heavy rains"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [76.693, 11.41]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Coimbatore",
        "riskLevel": "low",
        "description": "Urban area with moderate rainfall and good drainage"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [76.9558, 11.0168]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Madurai",
        "riskLevel": "low",
        "description": "Inland city with moderate flood risk"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [78.1198, 9.9252]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Coastal Flood Zone",
        "riskLevel": "high",
        "description": "High risk coastal flooding area"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [80.3, 13.2],
          [80.4, 13.1], 
          [80.2, 12.9],
          [80.1, 13.0],
          [80.3, 13.2]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Cauvery Delta Region",
        "riskLevel": "medium",
        "description": "River delta prone to seasonal flooding"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [79.0, 10.7],
          [79.3, 10.8],
          [79.4, 10.6],
          [79.2, 10.5],
          [79.0, 10.7]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Chennai Coastal Zone",
        "riskLevel": "high",
        "description": "Chennai's coastal areas with high vulnerability to storm surges and flooding"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [80.25, 13.05],
          [80.35, 13.05],
          [80.35, 13.15],
          [80.25, 13.15],
          [80.25, 13.05]
        ]]
      }
    }
  ]
};

// Risk level count helper function
export interface RiskCounts {
  high: number;
  medium: number;
  low: number;
}

export const getRiskLevelCounts = (data: FloodRiskGeoData): RiskCounts => {
  const counts: RiskCounts = {
    high: 0,
    medium: 0,
    low: 0
  };
  
  data.features.forEach((feature) => {
    const riskLevel = feature.properties.riskLevel;
    counts[riskLevel]++;
  });
  
  return counts;
};

// Get color based on risk level
export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'high':
      return '#ff3b30';
    case 'medium':
      return '#ffcc00';
    case 'low':
      return '#34c759';
    default:
      return '#8e8e93';
  }
}; 