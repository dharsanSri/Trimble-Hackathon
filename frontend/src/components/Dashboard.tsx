
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, LogOut, Users, Settings, Bell } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Emergency Management System</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Emergency Management</h2>
          <p className="text-gray-600">Monitor and manage emergency situations efficiently</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                Active Alerts
              </CardTitle>
              <CardDescription>Current emergency notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">3</p>
              <p className="text-sm text-gray-600">Active emergency alerts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Response Teams
              </CardTitle>
              <CardDescription>Available emergency response teams</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-600">Teams ready for deployment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                System Status
              </CardTitle>
              <CardDescription>Overall system health</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">Operational</p>
              <p className="text-sm text-gray-600">All systems functioning</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest emergency management activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">Weather Alert Issued</p>
                    <p className="text-sm text-gray-600">Severe thunderstorm warning for downtown area</p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Response Team Deployed</p>
                    <p className="text-sm text-gray-600">Team Alpha dispatched to incident location</p>
                  </div>
                  <span className="text-sm text-gray-500">4 hours ago</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Incident Resolved</p>
                    <p className="text-sm text-gray-600">Traffic accident cleared on Highway 101</p>
                  </div>
                  <span className="text-sm text-gray-500">6 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
