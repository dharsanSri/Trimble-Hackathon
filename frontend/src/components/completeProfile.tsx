import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { auth, db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

const tamilNaduDistricts = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal',
  'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet',
  'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi',
  'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
  'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
];

const CompleteProfile = () => {
  const [role, setRole] = useState('');
  const [district, setDistrict] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    if (!role) {
      toast({
        title: 'Role Required',
        description: 'Please select your role.',
        variant: 'destructive',
      });
      return;
    }

    if (role === 'government-official' && !district) {
      toast({
        title: 'District Required',
        description: 'Government officials must select a district.',
        variant: 'destructive',
      });
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role,
      district: role === 'government-official' ? district : '',
      approved: false,
      createdAt: new Date(),
    });

    toast({
      title: 'Profile Submitted',
      description: 'Your profile has been submitted for admin approval.',
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Please choose your role to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="government-official">Government Official</SelectItem>
                  <SelectItem value="command-officer">Command Officer</SelectItem>
                  <SelectItem value="field-worker">Field Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === 'government-official' && (
              <div className="space-y-2">
                <Label>District</Label>
                <Select onValueChange={setDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {tamilNaduDistricts.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full">
              Submit Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
