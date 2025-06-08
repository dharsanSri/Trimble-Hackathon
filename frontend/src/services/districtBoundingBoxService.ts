import axios from 'axios';

// Define the API base URL - adjust this to match your backend URL
const API_BASE_URL = 'http://localhost:8000'; // Default FastAPI port

// Define the bounding box type
export interface DistrictBoundingBox {
  [district: string]: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
}

/**
 * Fetch bounding box for a specific district
 * @param district The district name
 * @returns Promise with the district bounding box data
 */
export const getDistrictBoundingBox = async (district: string): Promise<[number, number, number, number]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/district-bbox`, {
      params: { district }
    });
    return response.data.bbox;
  } catch (error) {
    console.error(`Error fetching bounding box for district ${district}:`, error);
    // Return a default bounding box for Tamil Nadu as fallback
    return [76.0, 8.0, 80.5, 13.5];
  }
};

/**
 * Fetch bounding boxes for all districts
 * @returns Promise with all district bounding boxes
 */
export const getAllDistrictBoundingBoxes = async (): Promise<DistrictBoundingBox> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/district-bbox`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all district bounding boxes:', error);
    return {};
  }
}; 