import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Building2,
  LogOut,
  FileText,
  Users,
  MapPin,
  AlertCircle,
  CloudSunRain,
  ArrowRight,
  Bell,
  Settings,
  ChevronRight,
  RefreshCw,
  Droplets,
  Wind,
  Info,
  Home,
  BarChart3,
} from "lucide-react";
import FloodRiskMap from "./FloodRiskMap";
import FloodPredictionStats from "./FloodPredictionStats";
import { getAndStoreWeatherForecast } from "@/services/weatherService";
import { districtCoordinates } from "@/lib/geoData";


const GovernmentDashboard = () => {
  const navigate = useNavigate();
  const [weatherForecast, setWeatherForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [districtWeatherData, setDistrictWeatherData] = useState<any>({
    rainfall: Math.random() * 50 + 10,
    windSpeed: Math.random() * 30 + 5,
    alerts: Math.random() > 0.7,
    riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
  });

  useEffect(() => {
    fetchUserData();
    fetchWeatherData();
  }, []);

  const fetchUserData = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      // Get user document from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setError("User not found");
        setLoading(false);
        return;
      }

      // Get further details document
      const furtherDetailsDocRef = doc(db, "furtherdetails", user.uid);
      const furtherDetailsDoc = await getDoc(furtherDetailsDocRef);

      if (!furtherDetailsDoc.exists()) {
        setError("User details not found");
        setLoading(false);
        return;
      }

      // Combine user data
      const userData = {
        ...userDoc.data(),
        ...furtherDetailsDoc.data(),
      };

      setUserData(userData);
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError(err.message || "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };



  const fetchWeatherData = async () => {
    try {
      setRefreshing(true);
      const data = await getAndStoreWeatherForecast();

      const dailyForecast = data.forecast.forecastday.map((day: any) => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString("en-US", {
          weekday: "short",
        });
        const temp = Math.round(day.day.avgtemp_c) + "°C";
        const rain = Math.round(day.day.daily_chance_of_rain) + "%";
        const condition = day.day.condition.text;
        const icon = day.day.condition.icon;

        return { day: dayName, temp, condition, rain, icon };
      });

      setWeatherForecast(dailyForecast);
      
      // Update district weather data
      setDistrictWeatherData({
        rainfall: Math.random() * 50 + 10,
        windSpeed: Math.random() * 30 + 5,
        alerts: Math.random() > 0.7,
        riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  // New utility function for smooth transitions
  const getTransitionClasses = () => {
    return "transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg";
  };

  // Enhanced color palette and risk assessment
  const getRiskDetails = (risk: string) => {
    switch (risk) {
      case 'high': 
        return { 
          color: 'text-red-700', 
          bgColor: 'bg-red-50', 
          borderColor: 'border-red-300', 
          icon: AlertCircle,
          message: 'Critical Risk - Immediate Action Required'
        };
      case 'medium': 
        return { 
          color: 'text-yellow-700', 
          bgColor: 'bg-yellow-50', 
          borderColor: 'border-yellow-300', 
          icon: Info,
          message: 'Moderate Risk - Stay Vigilant'
        };
      case 'low': 
        return { 
          color: 'text-green-700', 
          bgColor: 'bg-green-50', 
          borderColor: 'border-green-300', 
          icon: Home,
          message: 'Low Risk - Normal Operations'
        };
      default: 
        return { 
          color: 'text-gray-700', 
          bgColor: 'bg-gray-50', 
          borderColor: 'border-gray-300', 
          icon: Info,
          message: 'Status Unknown'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-9 w-9 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Government Official Portal
                </h1>
                {userData && userData.district && (
                  <p className="text-sm text-gray-500">
                    {userData.firstName} {userData.lastName} • {userData.district} District
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {userData?.district} District Dashboard
            </h2>
            <p className="text-gray-600">
              District-level emergency management and weather monitoring
            </p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            onClick={fetchWeatherData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={`border-t-2 border-t-green-500 ${getTransitionClasses()} group`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 group-hover:text-green-600 transition-colors duration-200 text-sm">
                <MapPin className="h-5 w-5 text-green-600" />
                District Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">Normal</p>
                  <p className="text-sm text-gray-600">All systems operational</p>
                </div>
                <div className="bg-green-50 p-2 rounded-full">
                  <Home className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-t-2 border-t-blue-500 ${getTransitionClasses()} group`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 group-hover:text-blue-600 transition-colors duration-200 text-sm">
                <FileText className="h-5 w-5 text-blue-600" />
                Policy Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">15</p>
                  <p className="text-sm text-gray-600">Reports pending</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-full">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-t-2 border-t-purple-500 ${getTransitionClasses()} group`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 group-hover:text-purple-600 transition-colors duration-200 text-sm">
                <Users className="h-5 w-5 text-purple-600" />
                Resource Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-purple-600">85%</p>
                  <p className="text-sm text-gray-600">Allocated</p>
                </div>
                <div className="bg-purple-50 p-2 rounded-full">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-t-2 border-t-orange-500 ${getTransitionClasses()} group`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 group-hover:text-orange-600 transition-colors duration-200 text-sm">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-orange-600">2</p>
                  <p className="text-sm text-gray-600">Requiring action</p>
                </div>
                <div className="bg-orange-50 p-2 rounded-full">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Banner for District */}
        {districtWeatherData.alerts && (
          <div className={`mb-8 border-l-4 p-4 rounded-md shadow-sm ${
            getRiskDetails(districtWeatherData.riskLevel).borderColor
          } ${
            getRiskDetails(districtWeatherData.riskLevel).bgColor
          } hover:shadow-md transition-all duration-300`}>
            <div className="flex items-start">
              {React.createElement(getRiskDetails(districtWeatherData.riskLevel).icon, {
                className: `h-6 w-6 mr-2 mt-0.5 ${
                  getRiskDetails(districtWeatherData.riskLevel).color
                } animate-pulse`
              })}
              <div>
                <h3 className={`font-medium ${
                  getRiskDetails(districtWeatherData.riskLevel).color
                }`}>
                  Weather Alert for {userData?.district}
                </h3>
                <p className={`text-sm ${
                  getRiskDetails(districtWeatherData.riskLevel).color
                } opacity-80`}>
                  Heavy rainfall predicted for next 48 hours. River levels rising in the region. 
                  Emergency response teams on standby.
                </p>
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`text-xs ${
                      getRiskDetails(districtWeatherData.riskLevel).color
                    } border-current hover:bg-opacity-10 transition-all duration-200 hover:shadow transform hover:-translate-y-0.5 active:translate-y-0`}
                  >
                    <span>View Emergency Protocol</span>
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* District Map and Weather Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`col-span-2 bg-white shadow-sm ${getTransitionClasses()}`}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle className="text-lg text-gray-900">District Flood Risk Map</CardTitle>
                  <CardDescription>
                    Real-time flood risk assessment for {userData?.district}
                  </CardDescription>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full mt-2 sm:mt-0 ${
                  getRiskDetails(districtWeatherData.riskLevel).bgColor
                } ${
                  getRiskDetails(districtWeatherData.riskLevel).color
                }`}>
                  {districtWeatherData.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] border rounded overflow-hidden">
                <FloodRiskMap 
                  userRole="districtOfficer" 
                  assignedDistrict={userData?.district}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card className={`bg-white shadow-sm ${getTransitionClasses()} border-l-4 ${
              getRiskDetails(districtWeatherData.riskLevel).borderColor
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-900">
                  <span>Risk Assessment</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    getRiskDetails(districtWeatherData.riskLevel).bgColor
                  } ${
                    getRiskDetails(districtWeatherData.riskLevel).color
                  }`}>
                    {districtWeatherData.riskLevel.toUpperCase()} RISK
                  </span>
                  <span className="text-gray-500">- {getRiskDetails(districtWeatherData.riskLevel).message}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-700">Rainfall (24h)</span>
                    </div>
                    <span className="font-medium">{districtWeatherData.rainfall.toFixed(1)} mm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-700">Wind Speed</span>
                    </div>
                    <span className="font-medium">{districtWeatherData.windSpeed.toFixed(1)} km/h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-white shadow-sm ${getTransitionClasses()}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-900 flex items-center justify-between">
                  <span>Emergency Resources</span>
                  <span className="text-sm text-gray-500 font-normal">
                    {new Date().toLocaleDateString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 flex items-center gap-2">
                      <Home className="h-4 w-4 text-blue-500" />
                      Relief Centers
                    </span>
                    <span className="font-medium">{Math.floor(Math.random() * 15 + 3)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      Emergency Teams
                    </span>
                    <span className="font-medium">{Math.floor(Math.random() * 10 + 2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      Evacuation Routes
                    </span>
                    <span className="font-medium">{Math.floor(Math.random() * 8 + 2)}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-between mt-2 text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    Manage Resources <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weather Forecast and Flood Prediction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <Card className={`bg-white shadow-sm ${getTransitionClasses()}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200">
                <CloudSunRain className="h-5 w-5 text-blue-600" />
                Weather Forecast for {userData?.district}
              </CardTitle>
              <CardDescription>
                3-day weather conditions and rainfall predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {weatherForecast.map((day, index) => (
                  <div
                    key={index}
                    className={`bg-blue-50 rounded-lg p-5 text-center ${getTransitionClasses()} hover:bg-blue-100`}
                  >
                    <p className="font-semibold text-blue-800 mb-2">{day.day}</p>
                    <div className="flex justify-center my-3">
                      <img
                        src={day.icon}
                        alt={day.condition}
                        className="h-14 w-14 transform transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <p className="text-xl font-bold text-gray-900 mb-1">{day.temp}</p>
                    <p className="text-sm text-gray-600 mb-2">{day.condition}</p>
                    <p className="text-xs mt-2 text-blue-700 font-medium">
                      Rain: {day.rain}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-white shadow-sm ${getTransitionClasses()}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 hover:text-green-600 transition-colors duration-200">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Flood Prediction Statistics
              </CardTitle>
              <CardDescription>
                Historical and predicted flood data for {userData?.district}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[140px]">
              <FloodPredictionStats />
            </CardContent>
          </Card>
        </div>

        {/* Section Separator */}
        <div className="relative my-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-4 text-sm text-gray-500">Recent Updates & Alerts</span>
          </div>
        </div>

        {/* Recent Updates for District */}
        <Card className={`mb-8 bg-white shadow-sm ${getTransitionClasses()}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-900">Recent Updates for {userData?.district}</CardTitle>
            <CardDescription>Latest emergency information and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5 mt-2">
              {[
                { 
                  title: 'Weather Alert Issued', 
                  time: '2 hours ago',
                  description: `Heavy rainfall expected in ${userData?.district} over the next 24 hours. Residents advised to stay indoors.`,
                  type: 'alert'
                },
                { 
                  title: 'Relief Center Update', 
                  time: '5 hours ago',
                  description: `3 new relief centers have been established in ${userData?.district} district to accommodate affected residents.`,
                  type: 'info'
                },
                { 
                  title: 'Policy Update: Resource Management', 
                  time: '1 day ago',
                  description: 'New guidelines for emergency resource distribution approved by district administration.',
                  type: 'status'
                },
                { 
                  title: 'Infrastructure Status', 
                  time: '1 day ago',
                  description: 'All major roads are currently operational. Minor flooding reported in low-lying areas.',
                  type: 'status'
                }
              ].map((update, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  update.type === 'alert' ? 'bg-red-50 border-red-100' :
                  update.type === 'info' ? 'bg-blue-50 border-blue-100' :
                  'bg-gray-50 border-gray-100'
                }`}>
                  <div className="flex items-center justify-between mb-2">
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
          <CardFooter className="pt-2">
            <Button variant="outline" size="sm" className="w-full hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
              View All Updates
            </Button>
          </CardFooter>
        </Card>
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

export default GovernmentDashboard;
