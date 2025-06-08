import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Shield, ArrowLeft, Lock, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const correctAdminId = '75400';
    const correctPassword = 'admin@123';

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (adminId === correctAdminId && password === correctPassword) {
      toast({
        title: 'Admin Login Successful',
        description: 'Welcome to the Emergency Management Admin Panel',
      });
      navigate('/admin-dashboard');
    } else {
      toast({
        title: 'Admin Login Failed',
        description: 'Invalid Admin ID or password',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-red-900 p-4 relative overflow-hidden">
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 10px), 
                            repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 10px)` 
        }}></div>
      </div>
      
      {/* Emergency alert animation */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 animate-pulse"></div>
      
      <div className="relative z-10 w-full max-w-md pt-10">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-gray-800 rounded-full p-3 shadow-lg shadow-gray-800/50">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <Card className="w-full border-2 border-red-900/20 bg-white/95 backdrop-blur-sm shadow-2xl mt-6">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Admin Access
            </CardTitle>
            <CardDescription className="text-gray-700 font-medium">
              Emergency Management System
            </CardDescription>
            <div className="w-16 h-1 bg-gray-600 mx-auto mt-2 rounded-full"></div>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-800">
              <p className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-600" />
                Administrative access requires authentication
              </p>
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                <Info className="h-3 w-3 text-blue-500" />
                Default Admin ID: 75400 | Password: admin@123
              </p>
            </div>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminId" className="text-gray-700">Admin ID</Label>
                <Input
                  id="adminId"
                  type="text"
                  placeholder="Enter your Admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="text-gray-700">Admin Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Enter your admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-6 flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Admin Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-gray-100 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="text-red-600 hover:text-red-800 hover:bg-red-50 flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to User Login
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-4 text-center text-white/80 text-xs">
          <p>Emergency Management System • Administrative Portal</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
