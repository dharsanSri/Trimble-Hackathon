import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, updateDoc, onSnapshot } from "firebase/firestore";
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

import { db } from "@/firebase";
import FloodRiskMap from "./FloodRiskMap";
import FloodPredictionStats from "./FloodPredictionStats";
import { getAndStoreWeatherForecast } from "@/services/weatherService";

interface WorkAssignment {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  assignedTo: string;
  comment?: string;
  timestamp?: any;
  district?: string;
}

const FieldDashboard = () => {
  const navigate = useNavigate();
  const [availableWork, setAvailableWork] = useState<WorkAssignment[]>([]);
  const [selectedWork, setSelectedWork] = useState<WorkAssignment[]>([]);
  const [loadingWork, setLoadingWork] = useState(true);
  const [updatingWorkIds, setUpdatingWorkIds] = useState<Set<string>>(new Set());
  const [taskComments, setTaskComments] = useState<{ [key: string]: string }>({});
  const [weatherForecast, setWeatherForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [districtWeatherData, setDistrictWeatherData] = useState<any>({
    rainfall: Math.random() * 50 + 10,
    windSpeed: Math.random() * 30 + 5,
    alerts: Math.random() > 0.7,
    riskLevel:
      Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
  });

  // Authentication state listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData();
      } else {
        navigate("/");
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch weather data on component mount
  useEffect(() => {
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

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setError("User not found");
        setLoading(false);
        return;
      }

      const furtherDetailsDocRef = doc(db, "furtherdetails", user.uid);
      const furtherDetailsDoc = await getDoc(furtherDetailsDocRef);

      if (!furtherDetailsDoc.exists()) {
        setError("User details not found");
        setLoading(false);
        return;
      }

      const combinedUserData = {
        ...userDoc.data(),
        ...furtherDetailsDoc.data(),
      };

      console.log("Loaded user data with district:", combinedUserData.district);
      setUserData(combinedUserData);
      setError(null);
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
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const temp = Math.round(day.day.avgtemp_c) + "°C";
        const rain = Math.round(day.day.daily_chance_of_rain) + "%";
        const condition = day.day.condition.text;
        const icon = day.day.condition.icon;

        return { day: dayName, temp, condition, rain, icon };
      });

      setWeatherForecast(dailyForecast);

      setDistrictWeatherData({
        rainfall: Math.random() * 50 + 10,
        windSpeed: Math.random() * 30 + 5,
        alerts: Math.random() > 0.7,
        riskLevel:
          Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
      });
    } catch (err: any) {
      console.error("Error fetching weather data:", err);
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Real-time work assignments listener
  useEffect(() => {
    if (!userData?.district) {
      setLoadingWork(false);
      return;
    }

    console.log("Setting up real-time listener for district:", userData.district);
    setLoadingWork(true);

    const unsubscribe = onSnapshot(
      collection(db, "newcollection"),
      (snapshot) => {
        const works: WorkAssignment[] = [];
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.district === userData.district) {
            works.push({
              id: docSnap.id,
              title: data.title ?? "Untitled",
              description: data.description ?? "No description provided",
              priority: data.priority ?? "low",
              status: data.status ?? "pending",
              assignedTo: data.assignedTo ?? "Unassigned",
              comment: data.comment ?? "",
              timestamp: data.timestamp,
              district: data.district,
            });
          }
        });

        console.log("Loaded works from real-time listener:", works.length);

        // Separate available and selected work
        const available = works.filter(
          (work) => work.status === "pending"
        );
        const selected = works.filter(
          (work) => work.status === "in-progress"
        );

        setAvailableWork(available);
        setSelectedWork(selected);
        setLoadingWork(false);
      },
      (error) => {
        console.error("Error in real-time listener:", error);
        setError("Failed to load work assignments");
        setLoadingWork(false);
      }
    );

    return () => {
      console.log("Cleaning up real-time listener");
      unsubscribe();
    };
  }, [userData?.district]);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSelectWork = async (workId: string) => {
    if (updatingWorkIds.has(workId)) return;
    
    setUpdatingWorkIds(prev => new Set(prev).add(workId));

    try {
      await updateDoc(doc(db, "newcollection", workId), {
        status: "in-progress",
        assignedTo: userData?.name || "Field Worker"
      });
      console.log("Work selected successfully:", workId);
    } catch (err) {
      console.error("Failed to update work status:", err);
      alert("Failed to select work. Please try again.");
    } finally {
      setUpdatingWorkIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(workId);
        return newSet;
      });
    }
  };

  const handleCommentChange = (workId: string, value: string) => {
    setTaskComments((prev) => ({
      ...prev,
      [workId]: value,
    }));
  };

  const handleCompleteWork = async (workId: string) => {
    if (updatingWorkIds.has(workId)) return;
    
    setUpdatingWorkIds(prev => new Set(prev).add(workId));

    const comment = taskComments[workId] || "";

    try {
      await updateDoc(doc(db, "newcollection", workId), {
        status: "completed",
        comment: comment,
      });

      // Clear the comment from state
      setTaskComments((prev) => {
        const updated = { ...prev };
        delete updated[workId];
        return updated;
      });

      console.log("Work completed successfully:", workId);
    } catch (error) {
      console.error("Error updating work status:", error);
      alert("Failed to mark work as completed. Please try again.");
    } finally {
      setUpdatingWorkIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(workId);
        return newSet;
      });
    }
  };

  const getPriorityColor = (priority: string) => {
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

  const getTransitionClasses = () => {
    return "transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg";
  };

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

  // Show loading while checking authentication
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {userData?.name} - {userData?.district}
              </span>
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
              <p className="text-lg font-bold text-blue-600">{userData?.district}</p>
              <p className="text-sm text-gray-600">Active monitoring zone</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Available Tasks
              </CardTitle>
              <CardDescription>Pending assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-green-600">{availableWork.length}</p>
              <p className="text-sm text-gray-600">Ready to assign</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                In Progress
              </CardTitle>
              <CardDescription>Active assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-blue-600">{selectedWork.length}</p>
              <p className="text-sm text-gray-600">Currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Risk Level
              </CardTitle>
              <CardDescription>Current district status</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-lg font-bold ${getRiskDetails(districtWeatherData.riskLevel).color}`}>
                {districtWeatherData.riskLevel.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600">Flood risk level</p>
            </CardContent>
          </Card>
        </div>

        <Card className={`col-span-2 bg-white shadow-sm mb-8 ${getTransitionClasses()}`}>
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
                className={`text-xs px-2 py-1 rounded-full mt-2 sm:mt-0 ${getRiskDetails(
                  districtWeatherData.riskLevel
                ).bgColor} ${getRiskDetails(districtWeatherData.riskLevel).color}`}
              >
                {districtWeatherData.riskLevel.toUpperCase()} RISK
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] border rounded overflow-hidden">
              <FloodRiskMap
                userRole={userData?.role || "unknown"}
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
              <CardDescription>Select work assignments to begin</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingWork ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-gray-500">Loading work assignments...</p>
                </div>
              ) : availableWork.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No work assignments available at the moment.</p>
                </div>
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
                          {work.priority.toUpperCase()}
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
                          ? "Selecting..."
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
                <RefreshCw className="h-5 w-5 text-green-600" />
                My Current Work
              </CardTitle>
              <CardDescription>Track and complete assigned tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedWork.length === 0 ? (
                  <div className="text-center py-8">
                    <HardHat className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No current work in progress.</p>
                    <p className="text-sm text-gray-400">Select an assignment to get started.</p>
                  </div>
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
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600">
                          IN PROGRESS
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {work.description}
                      </p>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`comment-${work.id}`} className="text-sm">
                            Work Progress Comments
                          </Label>
                          <Textarea
                            id={`comment-${work.id}`}
                            placeholder="Document your work progress, findings, or any issues encountered..."
                            value={taskComments[work.id] || ""}
                            onChange={(e) =>
                              handleCommentChange(work.id, e.target.value)
                            }
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          onClick={() => handleCompleteWork(work.id)}
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={updatingWorkIds.has(work.id)}
                        >
                          {updatingWorkIds.has(work.id)
                            ? "Completing..."
                            : "Mark as Completed"}
                        </Button>
                      </div>
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