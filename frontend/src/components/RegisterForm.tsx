import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

const districtsOfTamilNadu = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi",
  "Thanjavur", "Dindigul", "Cuddalore", "Kanchipuram", "Nagapattinam", "Theni", "Villupuram", "Krishnagiri", "Namakkal"
];

const RegisterForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uid, email } = location.state || {};

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
    district: ""
  });

  useEffect(() => {
    console.log("Rendering RegisterForm with:", formData);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uid || !email) {
      toast({
        title: "Authentication Missing",
        description: "Login again — UID or email missing.",
        variant: "destructive",
      });
      return;
    }

    const userDetails = {
      uid,
      email,
      ...formData,
      approved: false,
      createdAt: new Date()
    };

    try {
      console.log("Writing to Firestore with:", userDetails);

      // Create user in the main users collection
      await setDoc(doc(db, "users", uid), {
        uid,
        email,
        displayName: `${formData.firstName} ${formData.lastName}`,
        role: formData.role,
        district: formData.district,
        approved: false,
        createdAt: new Date()
      });

      // Save further details in 'furtherdetails' collection
      await setDoc(doc(db, "furtherdetails", uid), userDetails);

      toast({
        title: "Registration Complete",
        description: "Your profile has been submitted for admin approval. You'll be able to login once approved.",
      });

      navigate("/"); // go back to login
    } catch (error: any) {
      console.error("Firestore Error:", error);
      toast({
        title: "Firestore Write Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Complete Your Profile
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Register for the Emergency Management System
          </p>
          <div className="w-16 h-1 bg-blue-600 mx-auto mt-2 rounded-full"></div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input name="phone" value={formData.phone} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="role">Select Role</Label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="">-- Select Role --</option>
                <option value="government-official">Government Official</option>
                <option value="command-officer">Command Officer</option>
                <option value="field-worker">Field Worker</option>
              </select>
            </div>

            <div>
              <Label htmlFor="district">Select District</Label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="">-- Select District --</option>
                {districtsOfTamilNadu.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate("/")}
              className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Register Account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterForm;
