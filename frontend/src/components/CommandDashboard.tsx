import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc, addDoc, collection, serverTimestamp, onSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, LogOut, Plus, AlertCircle, Info, Home, Briefcase, CheckCircle, Clock } from "lucide-react";
import { db } from "@/firebase";
import FloodRiskMap from "./FloodRiskMap";
import { getAndStoreWeatherForecast } from "@/services/weatherService";

interface WorkItem {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  assignedTo: string;
  comment?: string;
  timestamp?: any;
  district: string;
}

const CommandDashboard = () => {
  const navigate = useNavigate();

  const [newWork, setNewWork] = useState<Omit<WorkItem, "status" | "assignedTo" | "timestamp" | "id" | "district">>({
    title: "",
    description: "",
    priority: "medium",
  });

  const [workList, setWorkList] = useState<WorkItem[]>([]);
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

  // Calculate work statistics
  const workStats = {
    total: workList.length,
    completed: workList.filter(work => work.status === "completed").length,
    pending: workList.filter(work => work.status === "pending").length,
    inProgress: workList.filter(work => work.status === "in-progress").length
  };

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

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      const furtherDetailsDocRef = doc(db, "furtherdetails", user.uid);
      const furtherDetailsDoc = await getDoc(furtherDetailsDocRef);

      if (!userDoc.exists() || !furtherDetailsDoc.exists()) {
        setError("User or user details not found");
        setLoading(false);
        return;
      }

      const combinedUserData = {
        ...userDoc.data(),
        ...furtherDetailsDoc.data(),
      };

      console.log("Loaded user data with district:", combinedUserData.district);
      setUserData(combinedUserData);
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

  const handleAddWork = async () => {
    if (!userData || !userData.district) {
      alert("User data or district not loaded. Please wait.");
      return;
    }

    if (newWork.title && newWork.description) {
      const work = {
        ...newWork,
        status: "pending",
        assignedTo: "Unassigned",
        timestamp: serverTimestamp(),
        district: userData.district,
      };

      try {
        await addDoc(collection(db, "newcollection"), work);
        setNewWork({ title: "", description: "", priority: "medium" });
        alert("Work assignment posted!");
      } catch (error) {
        console.error("Error posting work:", error);
        alert("Failed to post work. Please try again.");
      }
    } else {
      alert("Please enter both a title and description.");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "in-progress":
        return "text-blue-600 bg-blue-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTransitionClasses = () =>
    "transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg";

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

  useEffect(() => {
    if (!userData?.district) return;

    const unsubscribe = onSnapshot(collection(db, "newcollection"), (snapshot) => {
      const workItems: WorkItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.district === userData.district) {
          workItems.push({
            id: doc.id,
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
      setWorkList(workItems);
    });

    return () => unsubscribe();
  }, [userData?.district]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Command Officer Control Center
              </h1>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Command Operations Dashboard</h2>
          <p className="text-gray-600">Coordinate emergency response operations and manage field teams</p>
        </div>

        {/* Work Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`bg-white shadow-sm ${getTransitionClasses()}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Works</p>
                  <p className="text-3xl font-bold text-gray-900">{workStats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">
                  {workStats.inProgress > 0 && `${workStats.inProgress} in progress`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-white shadow-sm ${getTransitionClasses()}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Works</p>
                  <p className="text-3xl font-bold text-green-600">{workStats.completed}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">
                  {workStats.total > 0 
                    ? `${Math.round((workStats.completed / workStats.total) * 100)}% completion rate`
                    : "No works assigned yet"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-white shadow-sm ${getTransitionClasses()}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Works</p>
                  <p className="text-3xl font-bold text-yellow-600">{workStats.pending}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">
                  {workStats.pending > 0 
                    ? "Awaiting assignment"
                    : "All works assigned"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className={`col-span-2 bg-white shadow-sm ${getTransitionClasses()}`}>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="text-lg text-gray-900">District Flood Risk Map</CardTitle>
                <CardDescription>
                  Real-time flood risk assessment for {userData?.district}
                </CardDescription>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full mt-2 sm:mt-0 ${getRiskDetails(districtWeatherData.riskLevel).bgColor} ${getRiskDetails(districtWeatherData.riskLevel).color}`}
              >
                {districtWeatherData.riskLevel.toUpperCase()} RISK
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] border rounded overflow-hidden">
              <FloodRiskMap userRole={userData?.role || "unknown"} assignedDistrict={userData?.district} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Post New Work Assignment
              </CardTitle>
              <CardDescription>Create and assign new tasks to field teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="work-title">Work Title</Label>
                  <Input
                    id="work-title"
                    value={newWork.title}
                    onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                    placeholder="Enter work title"
                  />
                </div>
                <div>
                  <Label htmlFor="work-description">Description</Label>
                  <Textarea
                    id="work-description"
                    value={newWork.description}
                    onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                    placeholder="Describe the work assignment in detail"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <select
                    id="priority"
                    value={newWork.priority}
                    onChange={(e) =>
                      setNewWork({ ...newWork, priority: e.target.value as "low" | "medium" | "high" })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <Button onClick={handleAddWork} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Work Assignment
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Assignment Status</CardTitle>
              <CardDescription>Track completion status of assigned tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {workList.length === 0 ? (
                <p className="text-gray-500 text-sm">No work assignments yet. Add one using the form.</p>
              ) : (
                <div className="space-y-3">
                  {workList.map((work) => (
                    <div
                      key={work.id}
                      className={`p-4 rounded-lg border ${getPriorityColor(work.priority)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{work.title}</h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(work.status)}`}
                        >
                          {work.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{work.description}</p>
                      {work.comment && (
                        <div className="mt-2">
                          <Label htmlFor={`comment-${work.id}`}>Field Worker Comments</Label>
                          <Textarea
                            id={`comment-${work.id}`}
                            readOnly
                            value={work.comment}
                            className="bg-gray-100 border-gray-300"
                          />
                        </div>
                      )}
                      <div className="flex justify-end text-xs mt-2">
                        <span className="font-medium">{work.priority.toUpperCase()} PRIORITY</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CommandDashboard;