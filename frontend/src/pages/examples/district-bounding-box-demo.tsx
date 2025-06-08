import React, { useState, useEffect } from 'react';
import FloodRiskMap from '@/components/FloodRiskMap';
import { districtCoordinates } from '@/lib/geoData';

const DistrictBoundingBoxDemo = () => {
  const [userRole, setUserRole] = useState<string>('publicUser');
  const [assignedDistrict, setAssignedDistrict] = useState<string>('Chennai');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get all district names
  const districtNames = Object.keys(districtCoordinates);
  
  // Set loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserRole(e.target.value);
    // Reset district selection for admin
    if (e.target.value === 'admin') {
      setAssignedDistrict('');
    } else if (e.target.value === 'publicUser') {
      setAssignedDistrict('Chennai');
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-800 hover:text-blue-900 transition-colors duration-300">
        District Bounding Box Demo
      </h1>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">User Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="transition-transform duration-300 hover:scale-[1.01]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Role
            </label>
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-3 transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              value={userRole}
              onChange={handleRoleChange}
            >
              <option value="admin">Admin (All Districts)</option>
              <option value="districtOfficer">District Officer (Single District)</option>
              <option value="fieldWorker">Field Worker (Single District)</option>
              <option value="publicUser">Public User (Limited Districts)</option>
            </select>
          </div>
          
          <div className="transition-transform duration-300 hover:scale-[1.01]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned District
            </label>
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-3 transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:bg-gray-100 disabled:opacity-70"
              value={assignedDistrict}
              onChange={(e) => setAssignedDistrict(e.target.value)}
              disabled={userRole === 'admin'}
            >
              <option value="">Select a district</option>
              {districtNames.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {userRole === 'admin' && (
              <p className="text-xs text-gray-500 mt-1">
                Admin role can access all districts
              </p>
            )}
            {(userRole === 'districtOfficer' || userRole === 'fieldWorker') && !assignedDistrict && (
              <p className="text-xs text-red-500 mt-1 animate-pulse">
                Please select an assigned district
              </p>
            )}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="border rounded-lg p-4 bg-white shadow-sm h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300">
          <FloodRiskMap 
            userRole={userRole} 
            assignedDistrict={userRole !== 'admin' ? assignedDistrict : undefined} 
          />
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100">
        <h3 className="text-md font-semibold mb-2 text-blue-800">How It Works</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li className="hover:text-blue-700 transition-colors duration-200">
            <strong className="text-blue-700">Admin:</strong> Can view all districts and has a dropdown to select specific districts
          </li>
          <li className="hover:text-blue-700 transition-colors duration-200">
            <strong className="text-blue-700">District Officer/Field Worker:</strong> Can only view their assigned district
          </li>
          <li className="hover:text-blue-700 transition-colors duration-200">
            <strong className="text-blue-700">Public User:</strong> Can view limited districts (Chennai, Coimbatore, Madurai by default)
          </li>
        </ul>
      </div>
      
      <div className="mt-4 text-center">
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
        >
          Refresh Map
        </button>
      </div>
    </div>
  );
};

export default DistrictBoundingBoxDemo; 