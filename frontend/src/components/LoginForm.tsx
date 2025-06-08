import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, AlertTriangle, ArrowRight, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { auth, provider, db } from "@/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const LoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // New user - redirect to registration
        navigate('/register', {
          state: {
            uid: user.uid,
            email: user.email
          }
        });
        setIsLoading(false);
        return;
      }

      // Check if approved by admin in main user doc
      if (!userDoc.data()?.approved) {
        toast({
          title: "Account Pending Approval",
          description: "Your account is awaiting administrator approval. You'll be notified when approved.",
          variant: "default",
        });
        setIsLoading(false);
        return;
      }

      // Now check furtherdetails doc
      const furtherDetailsDocRef = doc(db, "furtherdetails", user.uid);
      const furtherDetailsDoc = await getDoc(furtherDetailsDocRef);

      if (!furtherDetailsDoc.exists()) {
        toast({
          title: "Profile Incomplete",
          description: "Your profile information is missing. Please contact an administrator.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const furtherDetailsData = furtherDetailsDoc.data();
      const role = furtherDetailsData?.role;

      if (!role) {
        toast({
          title: "Role Missing",
          description: "Your role information is missing, please contact admin.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Login Successful",
        description: `Welcome, ${user.displayName || user.email}`,
      });

      // Redirect based on role
      switch (role) {
        case "government-official":
          navigate("/government-dashboard");
          break;
        case "command-officer":
          navigate("/command-dashboard");
          break;
        case "field-worker":
          navigate("/field-dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
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
          <div className="bg-red-600 rounded-full p-3 shadow-lg shadow-red-600/50 animate-pulse">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <Card className="w-full border-2 border-red-900/20 bg-white/95 backdrop-blur-sm shadow-2xl mt-6">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Emergency Response
            </CardTitle>
            <CardDescription className="text-gray-700 font-medium">
              Authorized Personnel Access Only
            </CardDescription>
            <div className="w-16 h-1 bg-red-600 mx-auto mt-2 rounded-full"></div>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-gray-800">
              <p className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-red-600" />
                This system is restricted to verified emergency response personnel
              </p>
              <p className="text-xs text-gray-600 pl-6">
                New users: Sign in with Google to register for access (requires admin approval)
              </p>
            </div>
            
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6 flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  Sign in with Google
                </>
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-gray-100 pt-4">
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-800 hover:bg-red-50 flex items-center gap-2"
              onClick={() => navigate("/admin-login")}
            >
              <Shield className="h-4 w-4" />
              Administrator Access
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-4 text-center text-white/80 text-xs">
          <p>Emergency Management System • Secure Access Portal</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
