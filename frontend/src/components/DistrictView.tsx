import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { 
  MapPin, 
  AlertTriangle, 
  Droplets, 
  Wind, 
  Info, 
  LogOut, 
  RefreshCw, 
  Users, 
  Home,
  ChevronRight
} from 'lucide-react';
import FloodRiskMap from '@/components/FloodRiskMap';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { districtCoordinates } from '@/lib/geoData';

interface DistrictViewProps {
  userId: string;
}

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
  district: string;
  approved: boolean;
}

const DistrictView: React.FC<DistrictViewProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState<any>({
    rainfall: Math.random() * 50 + 10,
    windSpeed: Math.random() * 30 + 5,
    alerts: Math.random() > 0.7,
    riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
  });

  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user document from Firestore
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setError('User not found');
          setLoading(false);
          return;
        }

        // Get further details document
        const furtherDetailsDocRef = doc(db, 'furtherdetails', userId);
        const furtherDetailsDoc = await getDoc(furtherDetailsDocRef);

        if (!furtherDetailsDoc.exists()) {
          setError('User details not found');
          setLoading(false);
          return;
        }

        // Combine user data
        const userData = {
          ...userDoc.data(),
          ...furtherDetailsDoc.data()
        } as UserData;

        setUserData(userData);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    
    // Simulate data refresh with random values
    setTimeout(() => {
      setWeatherData({
        rainfall: Math.random() * 50 + 10,
        windSpeed: Math.random() * 30 + 5,
        alerts: Math.random() > 0.7,
        riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      });
      setRefreshing(false);
      
      toast({
        title: 'Data Refreshed',
        description: 'Latest district data has been loaded',
      });
    }, 1500);
  };

  const handleLogout = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your district data...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-red-600">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error || 'Failed to load user data'}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/')}>Return to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100';
      case 'medium': return 'bg-yellow-100';
      case 'low': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Alert bar at the top */}
      <div className="bg-red-600 text-white py-1 px-4 text-center text-sm font-medium">
        Emergency Management System - District View
      </div>
      
      <header className="bg-white shadow-md border-b z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gray-800 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.district} District
                </h1>
                <p className="text-sm text-gray-500 flex items-center">
                  <span className="capitalize">{userData.role?.replace(/-/g, ' ')}</span>
                  <span className="mx-2">•</span>
                  <span>{userData.displayName || userData.email}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-gray-300"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="overflow-y-auto h-full pb-4">
          {/* District Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="col-span-2 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-900">District Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] border rounded overflow-hidden">
                  <FloodRiskMap 
                    userRole={userData.role} 
                    assignedDistrict={userData.district}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <Card className={`bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 ${
                weatherData.riskLevel === 'high' ? 'border-l-red-500' : 
                weatherData.riskLevel === 'medium' ? 'border-l-yellow-500' : 
                'border-l-green-500'
              }`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-900 flex items-center justify-between">
                    <span>Risk Assessment</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${getRiskBgColor(weatherData.riskLevel)} ${getRiskColor(weatherData.riskLevel)}`}>
                      {weatherData.riskLevel.toUpperCase()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <span className="text-gray-700">Rainfall (24h)</span>
                      </div>
                      <span className="font-medium">{weatherData.rainfall.toFixed(1)} mm</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wind className="h-5 w-5 text-blue-500" />
                        <span className="text-gray-700">Wind Speed</span>
                      </div>
                      <span className="font-medium">{weatherData.windSpeed.toFixed(1)} km/h</span>
                    </div>
                    {weatherData.alerts && (
                      <div className="flex items-center gap-2 bg-red-50 p-2 rounded border border-red-100 text-red-700 animate-pulse">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Weather alerts active!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-900">District Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Population</span>
                      <span className="font-medium">{Math.floor(Math.random() * 1000000 + 500000).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Area</span>
                      <span className="font-medium">{Math.floor(Math.random() * 5000 + 1000).toLocaleString()} km²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Emergency Shelters</span>
                      <span className="font-medium">{Math.floor(Math.random() * 50 + 10)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Emergency Resources */}
          <Card className="mb-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-900">Emergency Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Hospitals', count: Math.floor(Math.random() * 20 + 5), icon: <Home className="h-5 w-5 text-red-500" /> },
                  { name: 'Relief Centers', count: Math.floor(Math.random() * 15 + 3), icon: <Users className="h-5 w-5 text-blue-500" /> },
                  { name: 'Emergency Teams', count: Math.floor(Math.random() * 10 + 2), icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
                  { name: 'Evacuation Routes', count: Math.floor(Math.random() * 8 + 2), icon: <MapPin className="h-5 w-5 text-green-500" /> }
                ].map((resource, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-300 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {resource.icon}
                        <span className="font-medium text-gray-800">{resource.name}</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{resource.count}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full justify-between mt-2 text-xs">
                      View Details <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Updates */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-900">Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    title: 'Weather Alert Issued', 
                    time: '2 hours ago',
                    description: `Heavy rainfall expected in ${userData.district} over the next 24 hours. Residents advised to stay indoors.`,
                    type: 'alert'
                  },
                  { 
                    title: 'Relief Center Update', 
                    time: '5 hours ago',
                    description: `3 new relief centers have been established in ${userData.district} district to accommodate affected residents.`,
                    type: 'info'
                  },
                  { 
                    title: 'Infrastructure Status', 
                    time: '1 day ago',
                    description: 'All major roads are currently operational. Minor flooding reported in low-lying areas.',
                    type: 'status'
                  }
                ].map((update, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    update.type === 'alert' ? 'bg-red-50 border-red-100' :
                    update.type === 'info' ? 'bg-blue-50 border-blue-100' :
                    'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium ${
                        update.type === 'alert' ? 'text-red-700' :
                        update.type === 'info' ? 'text-blue-700' :
                        'text-gray-700'
                      }`}>{update.title}</h3>
                      <span className="text-xs text-gray-500">{update.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">{update.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="bg-white border-t py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Emergency Management System &copy; {new Date().getFullYear()}
            </p>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DistrictView; 