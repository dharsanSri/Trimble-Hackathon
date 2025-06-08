import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Building2,
  LogOut,
  FileText,
  Users,
  MapPin,
  AlertCircle,
  HardHat,
  CloudSunRain,
  CheckCircle,
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

import { collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import FloodRiskMap from "./FloodRiskMap";
import FloodPredictionStats from "./FloodPredictionStats";
import { getAndStoreWeatherForecast } from "@/services/weatherService";
import { districtCoordinates } from "@/lib/geoData";

const FieldDashboard = () => {
  const navigate = useNavigate();
  const [availableWork, setAvailableWork] = useState([]);
  const [selectedWork, setSelectedWork] = useState([]);
  const [loadingWork, setLoadingWork] = useState(true);
  const [updatingWorkIds, setUpdatingWorkIds] = useState(new Set());
  const [taskComments, setTaskComments] = useState({}); // comment per task
  const [weatherForecast, setWeatherForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [districtWeatherData, setDistrictWeatherData] = useState<any>({
    rainfall: Math.random() * 50 + 10,
    windSpeed: Math.random() * 30 + 5,
    alerts: Math.random() > 0.7,
    riskLevel:
      Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
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
        riskLevel:
          Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWorkAssignments = async () => {
    try {
      setLoadingWork(true);
      const querySnapshot = await getDocs(collection(db, "newcollection"));
      const works = [];
      querySnapshot.forEach((doc) => {
        works.push({ id: doc.id, ...doc.data() });
      });
      setAvailableWork(
        works.filter(
          (work) => work.status !== "completed" && work.status !== "in-progress"
        )
      );
      setSelectedWork(works.filter((work) => work.status === "in-progress"));
    } catch (error) {
      console.error("Error fetching work assignments:", error);
    } finally {
      setLoadingWork(false);
    }
  };

  useEffect(() => {
    fetchWorkAssignments();
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  const handleSelectWork = async (workId) => {
    if (updatingWorkIds.has(workId)) return;
    setUpdatingWorkIds(new Set(updatingWorkIds).add(workId));

    const work = availableWork.find((w) => w.id === workId);
    if (work) {
      try {
        await updateDoc(doc(db, "newcollection", workId), {
          status: "in-progress",
        });
        await fetchWorkAssignments();
      } catch (err) {
        console.error("Failed to update work status:", err);
        alert("Failed to select work. Please try again.");
      }
    }
    setUpdatingWorkIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(workId);
      return newSet;
    });
  };

  const handleCommentChange = (workId, value) => {
    setTaskComments((prev) => ({
      ...prev,
      [workId]: value,
    }));
  };

  const handleCompleteWork = async (workId) => {
    if (updatingWorkIds.has(workId)) return;
    setUpdatingWorkIds(new Set(updatingWorkIds).add(workId));

    const comment = taskComments[workId] || "";

    try {
      await updateDoc(doc(db, "newcollection", workId), {
        status: "completed",
        comment: comment,
      });
      await fetchWorkAssignments();
    } catch (error) {
      console.error("Error updating work status:", error);
      alert("Failed to mark work as completed. Please try again.");
    }

    setUpdatingWorkIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(workId);
      return newSet;
    });

    setTaskComments((prev) => {
      const updated = { ...prev };
      delete updated[workId];
      return updated;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-50";
      case "medium":
        return "border-yellow-500 bg-yellow-50";
      case "low":
        return "border-green-500 bg-green-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };
    // New utility function for smooth transitions
    const getTransitionClasses = () => {
      return "transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg";
    };
  
    // Enhanced color palette and risk assessment
    const getRiskDetails = (risk: string) => {
      switch (risk) {
        case "high":
          return {
            color: "text-red-700",
            bgColor: "bg-red-50",
            borderColor: "border-red-300",
            icon: AlertCircle,
            message: "Critical Risk - Immediate Action Required",
          };
        case "medium":
          return {
            color: "text-yellow-700",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-300",
            icon: Info,
            message: "Moderate Risk - Stay Vigilant",
          };
        case "low":
          return {
            color: "text-green-700",
            bgColor: "bg-green-50",
            borderColor: "border-green-300",
            icon: Home,
            message: "Low Risk - Normal Operations",
          };
        default:
          return {
            color: "text-gray-700",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-300",
            icon: Info,
            message: "Status Unknown",
          };
      }
    };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <HardHat className="h-8 w-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Field Worker Portal
              </h1>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Field Operations Dashboard
          </h2>
          <p className="text-gray-600">
            Manage field assignments and report emergency situations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Current Assignment
              </CardTitle>
              <CardDescription>Your active field location</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-blue-600">Sector 7-A</p>
              <p className="text-sm text-gray-600">Downtown patrol zone</p>
            </CardContent>
          </Card>
        </div>
        <Card
          className={`col-span-2 bg-white shadow-sm ${getTransitionClasses()}`}
        >
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="text-lg text-gray-900">
                  District Flood Risk Map
                </CardTitle>
                <CardDescription>
                  Real-time flood risk assessment for {userData?.district}
                </CardDescription>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full mt-2 sm:mt-0 ${
                  getRiskDetails(districtWeatherData.riskLevel).bgColor
                } ${getRiskDetails(districtWeatherData.riskLevel).color}`}
              >
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Available Work Assignments
              </CardTitle>
              <CardDescription>
                Select work assignments to begin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingWork ? (
                <p className="text-gray-500 text-center">
                  Loading work assignments...
                </p>
              ) : availableWork.length === 0 ? (
                <p className="text-gray-500 text-center">
                  No work assignments available at the moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {availableWork.map((work) => (
                    <div
                      key={work.id}
                      className={`p-4 rounded-lg border-l-4 ${getPriorityColor(
                        work.priority
                      )}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{work.title}</h4>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {work.priority ? work.priority.toUpperCase() : "N/A"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {work.description}
                      </p>
                      <Button
                        onClick={() => handleSelectWork(work.id)}
                        size="sm"
                        className="w-full"
                        disabled={updatingWorkIds.has(work.id)}
                      >
                        {updatingWorkIds.has(work.id)
                          ? "Updating..."
                          : "Select This Work"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                My Current Work
              </CardTitle>
              <CardDescription>
                Track and complete assigned tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedWork.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    No current work in progress.
                  </p>
                ) : (
                  selectedWork.map((work) => (
                    <div
                      key={work.id}
                      className={`p-4 rounded-lg border-l-4 ${getPriorityColor(
                        work.priority
                      )}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{work.title}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            work.status === "completed"
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {work.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {work.description}
                      </p>

                      {work.status !== "completed" && (
                        <>
                          <Label
                            htmlFor={`comment-${work.id}`}
                            className="text-sm"
                          >
                            Comment for this task
                          </Label>
                          <Textarea
                            id={`comment-${work.id}`}
                            placeholder="Write your observations here..."
                            value={taskComments[work.id] || ""}
                            onChange={(e) =>
                              handleCommentChange(work.id, e.target.value)
                            }
                            rows={3}
                            className="mb-3"
                          />
                          <Button
                            onClick={() => handleCompleteWork(work.id)}
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={updatingWorkIds.has(work.id)}
                          >
                            {updatingWorkIds.has(work.id)
                              ? "Updating..."
                              : "Mark as Completed"}
                          </Button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FieldDashboard;
