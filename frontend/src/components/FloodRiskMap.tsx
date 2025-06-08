import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  tamilNaduFloodData, 
  getRiskColor, 
  getRiskLevelCounts, 
  FloodRiskProperties, 
  FloodRiskFeature,
  FloodRiskGeoData
} from '@/lib/geoData';
import { updateFloodRiskData } from '@/services/weatherService';
import { 
  getDistrictBoundingBox, 
  zoomToDistrictByRole, 
  getAccessibleDistricts 
} from '@/lib/districtBoundingBox';

// Needed for leaflet markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface FloodRiskMapProps {
  userRole?: string;
  assignedDistrict?: string;
}

const FloodRiskMap: React.FC<FloodRiskMapProps> = ({ 
  userRole = 'publicUser', 
  assignedDistrict 
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [geoData, setGeoData] = useState<FloodRiskGeoData>(tamilNaduFloodData);
  const [riskCounts, setRiskCounts] = useState(getRiskLevelCounts(tamilNaduFloodData));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [districtRiskData, setDistrictRiskData] = useState<{name: string, riskLevel: string}[]>([]);
  const [accessibleDistricts, setAccessibleDistricts] = useState<string[]>([]);

  // Function to update the map with real-time data
  const updateMap = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real-time data from weather API
      const updatedData = await updateFloodRiskData(tamilNaduFloodData);
      setGeoData(updatedData);
      setRiskCounts(getRiskLevelCounts(updatedData));
      
      // Extract district risk data for visualization
      const districtData = updatedData.features.map(feature => ({
        name: feature.properties.name,
        riskLevel: feature.properties.riskLevel
      }));
      setDistrictRiskData(districtData);
      
      setLastUpdated(new Date());
      
      // Update the map if it exists
      if (mapInstanceRef.current && geoJsonLayerRef.current) {
        try {
          mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
          addGeoJsonToMap(updatedData);
        } catch (mapError) {
          console.error('Error updating map layers:', mapError);
        }
      }
      
      return updatedData;
    } catch (error: any) {
      console.error('Error updating map:', error);
      setError(error.message || 'Failed to update flood risk data');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to add GeoJSON to the map
  const addGeoJsonToMap = (data: FloodRiskGeoData) => {
    if (!mapInstanceRef.current) return;
    
    // Define style based on risk level
    const getStyle = (feature: FloodRiskFeature) => {
      const color = getRiskColor(feature.properties.riskLevel);
      return { 
        color, 
        weight: 2, 
        fillOpacity: feature.geometry.type === 'Polygon' ? 0.4 : 0.7,
        fillColor: getRiskColor(feature.properties.riskLevel)
      };
    };

    // Filter features based on user role and accessible districts
    const filteredData = {
      ...data,
      features: data.features.filter(feature => {
        // If it's not a named district or is a general area, always include it
        if (!feature.properties.name || 
            feature.properties.name.includes('Zone') || 
            feature.properties.name.includes('Region')) {
          return true;
        }
        
        // Otherwise, check if the district is accessible to the user
        return accessibleDistricts.includes(feature.properties.name);
      })
    };

    // Create and add the GeoJSON layer
    geoJsonLayerRef.current = L.geoJSON(filteredData as any, {
      style: getStyle,
      pointToLayer: (feature: GeoJSON.Feature<GeoJSON.Point, FloodRiskProperties>, latlng: L.LatLng) => {
        return L.circleMarker(latlng, {
          radius: 8,
          fillColor: getRiskColor(feature.properties.riskLevel),
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: (feature: FloodRiskFeature, layer: L.Layer) => {
        // Create popup content with real-time data if available
        let popupContent = `
          <div class="p-3 min-w-[250px] leaflet-popup-custom">
            <h3 class="font-bold text-base mb-1 text-blue-800">${feature.properties.name}</h3>
            <div class="flex items-center mb-2">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium ${
                feature.properties.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                feature.properties.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }">
                Risk Level: ${feature.properties.riskLevel.toUpperCase()}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-2">${feature.properties.description}</p>
        `;
        
        // Add real-time data if available
        if (feature.properties.realTimeData) {
          popupContent += `
            <div class="mt-2 p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
              <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">Rainfall (3-day)</span>
                  <span class="font-medium text-sm">${feature.properties.realTimeData.rainfall.toFixed(1)} mm</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-500">Max Wind</span>
                  <span class="font-medium text-sm">${feature.properties.realTimeData.windSpeed.toFixed(1)} km/h</span>
                </div>
              </div>
              ${feature.properties.realTimeData.hasAlerts ? 
                '<p class="mt-2 text-red-600 font-bold text-xs bg-red-50 p-1 rounded border border-red-100 animate-pulse">⚠️ Weather alerts active!</p>' : 
                ''}
            </div>
          `;
        }
        
        popupContent += `
          <div class="mt-2 text-right">
            <button class="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">View Details</button>
          </div>
        </div>`;
        
        // Add custom popup options
        const customOptions = {
          className: 'custom-popup-class',
          closeButton: true,
          autoClose: false,
          closeOnEscapeKey: true,
        };
        
        layer.bindPopup(popupContent, customOptions);
        
        // Add hover effect to layer
        layer.on({
          mouseover: function(e) {
            const target = e.target;
            target.setStyle({
              weight: 3,
              opacity: 1,
              fillOpacity: feature.geometry.type === 'Polygon' ? 0.6 : 0.9
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
              target.bringToFront();
            }
          },
          mouseout: function(e) {
            geoJsonLayerRef.current?.resetStyle(e.target);
          },
          click: function(e) {
            mapInstanceRef.current?.fitBounds(e.target.getBounds ? e.target.getBounds() : e.target._bounds);
          }
        });
      }
    }).addTo(mapInstanceRef.current);
    
    // Add custom CSS for popups
    const style = document.createElement('style');
    style.innerHTML = `
      .leaflet-popup-content-wrapper {
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }
      .leaflet-popup-content-wrapper:hover {
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      }
      .leaflet-popup-content {
        margin: 0;
        padding: 0;
      }
      .leaflet-popup-tip {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
    `;
    document.head.appendChild(style);
  };

  // Initialize the map
  useEffect(() => {
    // Get accessible districts based on user role
    const districts = getAccessibleDistricts(userRole, assignedDistrict);
    setAccessibleDistricts(districts);

    if (mapRef.current && !mapInstanceRef.current) {
      // Fix Leaflet default icon issue
      let DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      // Initialize map centered on Tamil Nadu
      mapInstanceRef.current = L.map(mapRef.current, {
        minZoom: 7,
        maxZoom: 14
      }).setView([11.1271, 78.6569], 7);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Add initial GeoJSON data
      addGeoJsonToMap(geoData);
      
      // Extract initial district risk data for visualization
      const initialDistrictData = geoData.features.map(feature => ({
        name: feature.properties.name,
        riskLevel: feature.properties.riskLevel
      }));
      setDistrictRiskData(initialDistrictData);
      
      // Fetch real-time data first, then zoom to the district
      updateMap().then(() => {
        // Zoom to the appropriate district based on user role after the map is fully loaded
        if (mapInstanceRef.current) {
          // Wait for the map to be fully initialized
          setTimeout(() => {
            try {
              if (mapInstanceRef.current) {
                zoomToDistrictByRole(mapInstanceRef.current, userRole, assignedDistrict);
                console.log(`Zooming to district: ${assignedDistrict || 'default for ' + userRole}`);
              }
            } catch (error) {
              console.error('Error zooming to district:', error);
            }
          }, 1000);
        }
      }).catch(error => {
        console.error('Error updating map:', error);
        // Still try to zoom even if update fails
        setTimeout(() => {
          if (mapInstanceRef.current) {
            try {
              zoomToDistrictByRole(mapInstanceRef.current, userRole, assignedDistrict);
            } catch (error) {
              console.error('Error zooming to district:', error);
            }
          }
        }, 1000);
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userRole, assignedDistrict]);

  // Function to render the risk zone bar chart
  const renderRiskZoneGraph = () => {
    // Filter district data to only include accessible districts
    const filteredDistrictData = districtRiskData.filter(d => 
      accessibleDistricts.includes(d.name) || 
      d.name.includes('Zone') || 
      d.name.includes('Region')
    );
    
    // Group districts by risk level
    const highRiskDistricts = filteredDistrictData.filter(d => d.riskLevel === 'high');
    const mediumRiskDistricts = filteredDistrictData.filter(d => d.riskLevel === 'medium');
    const lowRiskDistricts = filteredDistrictData.filter(d => d.riskLevel === 'low');
    
    // Calculate percentages for bar widths
    const total = filteredDistrictData.length;
    const highPercent = total > 0 ? (highRiskDistricts.length / total) * 100 : 0;
    const mediumPercent = total > 0 ? (mediumRiskDistricts.length / total) * 100 : 0;
    const lowPercent = total > 0 ? (lowRiskDistricts.length / total) * 100 : 0;
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Risk Zone Distribution</h4>
        <div className="flex w-full h-6 rounded-md overflow-hidden">
          <div 
            className="bg-red-500 h-full flex items-center justify-center text-xs text-white font-medium transition-all duration-300 hover:bg-red-600 hover:shadow-md"
            style={{ width: `${highPercent}%` }}
          >
            {highRiskDistricts.length > 0 ? `${highRiskDistricts.length}` : ''}
          </div>
          <div 
            className="bg-yellow-500 h-full flex items-center justify-center text-xs text-white font-medium transition-all duration-300 hover:bg-yellow-600 hover:shadow-md"
            style={{ width: `${mediumPercent}%` }}
          >
            {mediumRiskDistricts.length > 0 ? `${mediumRiskDistricts.length}` : ''}
          </div>
          <div 
            className="bg-green-500 h-full flex items-center justify-center text-xs text-white font-medium transition-all duration-300 hover:bg-green-600 hover:shadow-md"
            style={{ width: `${lowPercent}%` }}
          >
            {lowRiskDistricts.length > 0 ? `${lowRiskDistricts.length}` : ''}
          </div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <div className="flex items-center group cursor-pointer">
            <div className="w-3 h-3 bg-red-500 rounded-sm mr-1 group-hover:bg-red-600 transition-colors duration-200"></div>
            <span className="group-hover:font-medium transition-all duration-200">High Risk</span>
          </div>
          <div className="flex items-center group cursor-pointer">
            <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-1 group-hover:bg-yellow-600 transition-colors duration-200"></div>
            <span className="group-hover:font-medium transition-all duration-200">Medium Risk</span>
          </div>
          <div className="flex items-center group cursor-pointer">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-1 group-hover:bg-green-600 transition-colors duration-200"></div>
            <span className="group-hover:font-medium transition-all duration-200">Low Risk</span>
          </div>
        </div>
      </div>
    );
  };

  // Function to render the district risk table
  const renderDistrictRiskTable = () => {
    // Filter district data to only include accessible districts
    const filteredDistrictData = districtRiskData.filter(d => 
      accessibleDistricts.includes(d.name) || 
      d.name.includes('Zone') || 
      d.name.includes('Region')
    );
    
    // Sort districts by risk level (high to low)
    const sortedDistricts = [...filteredDistrictData].sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      return riskOrder[a.riskLevel as keyof typeof riskOrder] - riskOrder[b.riskLevel as keyof typeof riskOrder];
    });
    
    return (
      <div className="mt-4 max-h-40 overflow-y-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="py-1 px-2 text-left">District</th>
              <th className="py-1 px-2 text-left">Risk Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedDistricts.map((district, index) => (
              <tr 
                key={index} 
                className={`
                  ${district.riskLevel === 'high' ? 'bg-red-50 hover:bg-red-100' :
                  district.riskLevel === 'medium' ? 'bg-yellow-50 hover:bg-yellow-100' : 
                  'bg-green-50 hover:bg-green-100'}
                  transition-colors duration-200 cursor-pointer
                `}
                onClick={() => zoomToDistrict(district.name)}
              >
                <td className="py-1 px-2">{district.name}</td>
                <td className="py-1 px-2">
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    district.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                    district.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {district.riskLevel.charAt(0).toUpperCase() + district.riskLevel.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Function to get the district bounding box and zoom to it
  const zoomToDistrict = (districtName: string) => {
    if (!mapInstanceRef.current) return;
    
    const bounds = getDistrictBoundingBox(userRole, districtName);
    if (bounds) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  return (
    <div>
      <div className="mb-2 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Real-time Flood Risk Assessment</h3>
          {lastUpdated && (
            <p className="text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {userRole === 'admin' && (
            <select 
              className="px-2 py-1 text-sm border rounded transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              onChange={(e) => zoomToDistrict(e.target.value)}
              disabled={loading}
            >
              <option value="">Select District</option>
              {accessibleDistricts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          )}
          <button
            onClick={updateMap}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? 'Updating...' : 'Update Now'}
          </button>
        </div>
      </div>
      <div ref={mapRef} style={{ height: '400px', width: '100%', borderRadius: '8px' }} className="shadow-md hover:shadow-lg transition-shadow duration-300"></div>
      
      <div className="mt-3 flex gap-2">
        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded transition-all duration-200 hover:bg-red-200 hover:shadow-sm cursor-default">
          High Risk: {riskCounts.high} Areas
        </span>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded transition-all duration-200 hover:bg-yellow-200 hover:shadow-sm cursor-default">
          Medium Risk: {riskCounts.medium} Areas
        </span>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded transition-all duration-200 hover:bg-green-200 hover:shadow-sm cursor-default">
          Low Risk: {riskCounts.low} Areas
        </span>
      </div>
      
      {/* Risk Zone Visualization Graph */}
      {renderRiskZoneGraph()}
      
      {/* District Risk Table */}
      {renderDistrictRiskTable()}
      
      <div className="mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200">
        <p>Based on weather forecast data and historical flood patterns. Click on districts for detailed information.</p>
      </div>
    </div>
  );
};

export default FloodRiskMap; 