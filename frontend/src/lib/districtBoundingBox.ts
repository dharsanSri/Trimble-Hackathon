import { districtCoordinates } from './geoData';
import L from 'leaflet';

// Define district boundaries with bounding boxes
// Format: [south, west, north, east] - [minLat, minLng, maxLat, maxLng]
export const districtBoundingBoxes: Record<string, [number, number, number, number]> = {
  // Major districts with expanded boundaries for better visualization
  // Updated Chennai boundaries to cover the entire district
  Chennai: [12.8, 80.1, 13.3, 80.4], // Expanded to cover entire Chennai metropolitan area
  Cuddalore: [11.5, 79.5, 12.0, 80.0],
  Nagapattinam: [10.5, 79.6, 11.0, 80.0],
  Thanjavur: [10.5, 78.9, 11.1, 79.5],
  Tiruvarur: [10.5, 79.3, 11.0, 79.8],
  Nilgiris: [11.2, 76.4, 11.6, 77.0],
  Coimbatore: [10.8, 76.7, 11.2, 77.1],
  Madurai: [9.7, 77.9, 10.1, 78.3],
  Salem: [11.4, 77.9, 11.9, 78.3],
  Kanyakumari: [8.0, 77.2, 8.3, 77.7],
  
  // For other districts, generate approximate bounding boxes based on center coordinates
  // with a default radius of approximately 15km
};

// Generate bounding boxes for districts not explicitly defined
Object.entries(districtCoordinates).forEach(([district, coords]) => {
  if (!districtBoundingBoxes[district]) {
    // Create a default bounding box extending ~15km in each direction
    // Approximately 0.15 degrees in each direction
    districtBoundingBoxes[district] = [
      coords.lat - 0.15, 
      coords.lon - 0.15, 
      coords.lat + 0.15, 
      coords.lon + 0.15
    ];
  }
});

// User role to district mapping
export interface UserRole {
  role: string;
  district: string;
}

export const userRoleDistricts: Record<string, string[]> = {
  admin: Object.keys(districtCoordinates), // Admin can access all districts
  districtOfficer: [], // Will be populated based on assigned district
  fieldWorker: [], // Will be populated based on assigned district
  publicUser: ['Chennai', 'Coimbatore', 'Madurai'] // Default districts for public users
};

/**
 * Get the bounding box for a district based on user role
 * @param role User role (admin, districtOfficer, fieldWorker, publicUser)
 * @param assignedDistrict Optional assigned district for district-specific roles
 * @returns Leaflet LatLngBounds object for the district or null if not found
 */
export function getDistrictBoundingBox(role: string, assignedDistrict?: string): L.LatLngBounds | null {
  let district = '';
  
  // Determine which district to use based on role
  if (role === 'admin') {
    // For admin, return a bounding box that covers all of Tamil Nadu
    return L.latLngBounds(
      L.latLng(8.0, 76.0), // Southwest corner
      L.latLng(13.5, 80.5)  // Northeast corner
    );
  } else if (role === 'districtOfficer' || role === 'fieldWorker') {
    // For district officers and field workers, use their assigned district
    if (!assignedDistrict) {
      console.error('No district assigned for role:', role);
      return null;
    }
    district = assignedDistrict;
  } else if (role === 'publicUser') {
    // For public users, default to Chennai if no specific district is requested
    district = assignedDistrict || 'Chennai';
  } else {
    console.error('Unknown role:', role);
    return null;
  }
  
  // Get the bounding box for the district
  const bbox = districtBoundingBoxes[district];
  if (!bbox) {
    console.error('No bounding box found for district:', district);
    return null;
  }
  
  // Create and return a Leaflet LatLngBounds object
  return L.latLngBounds(
    L.latLng(bbox[0], bbox[1]), // Southwest corner
    L.latLng(bbox[2], bbox[3])  // Northeast corner
  );
}

/**
 * Get all accessible districts for a user based on their role
 * @param role User role
 * @param assignedDistrict Optional assigned district for district-specific roles
 * @returns Array of accessible district names
 */
export function getAccessibleDistricts(role: string, assignedDistrict?: string): string[] {
  if (role === 'admin') {
    return Object.keys(districtCoordinates);
  } else if (role === 'districtOfficer' || role === 'fieldWorker') {
    return assignedDistrict ? [assignedDistrict] : [];
  } else if (role === 'publicUser') {
    return userRoleDistricts.publicUser;
  }
  return [];
}

/**
 * Zoom the map to a district's bounding box
 * @param map Leaflet map instance
 * @param role User role
 * @param assignedDistrict Optional assigned district
 * @returns Boolean indicating success
 */
export function zoomToDistrictByRole(map: L.Map, role: string, assignedDistrict?: string): boolean {
  try {
    const bounds = getDistrictBoundingBox(role, assignedDistrict);
    
    if (bounds && map) {
      // Check if map is properly initialized
      if (!map.getContainer() || !map.getContainer().isConnected) {
        console.warn('Map container not connected to DOM, skipping zoom');
        return false;
      }
      
      // Use a safer approach to zoom
      try {
        map.fitBounds(bounds, {
          padding: [20, 20], // Add some padding
          maxZoom: 12, // Limit the zoom level to prevent zooming too far in
          animate: true,
          duration: 1 // Slower animation for more stability
        });
        return true;
      } catch (error) {
        console.error('Error fitting bounds:', error);
        // Fallback to setView if fitBounds fails
        try {
          const center = bounds.getCenter();
          map.setView(center, 10);
          return true;
        } catch (innerError) {
          console.error('Error setting view:', innerError);
          return false;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in zoomToDistrictByRole:', error);
    return false;
  }
} 