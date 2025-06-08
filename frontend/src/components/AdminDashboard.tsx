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
  Shield, 
  LogOut, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  User, 
  Mail, 
  UserCheck,
  Clock,
  Users,
  CheckCircle
} from 'lucide-react';
import { db } from '@/firebase'; // Your Firestore instance
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
  approved: boolean | 'rejected'; // approved can be boolean or string 'rejected'
  createdAt?: any;
}

type ViewMode = 'pending' | 'approved';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('pending');

  // Fetch users where approved is false (pending) or rejected
  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const usersCol = collection(db, 'users');
      const q = query(usersCol, orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(q);
      const filteredUsers: User[] = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        // Show users who are pending (approved === false) or rejected (approved === 'rejected')
        if (userData.approved === false || userData.approved === 'rejected') {
          filteredUsers.push({ uid: doc.id, ...userData });
        }
      });
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pending users.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  // Fetch approved users
  const fetchApprovedUsers = async () => {
    setLoading(true);
    try {
      const usersCol = collection(db, 'users');
      const q = query(usersCol, orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(q);
      const filteredUsers: User[] = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        // Show users who are approved (approved === true)
        if (userData.approved === true) {
          filteredUsers.push({ uid: doc.id, ...userData });
        }
      });
      setApprovedUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching approved users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch approved users.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingUsers();
    fetchApprovedUsers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (viewMode === 'pending') {
      await fetchPendingUsers();
    } else {
      await fetchApprovedUsers();
    }
    setTimeout(() => setRefreshing(false), 600); // Show animation for at least 600ms
  };

  // Approve user
  const handleApprove = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, { 
        approved: true,
        approvedAt: new Date(),
        notification: {
          message: 'Your account has been approved! You can now log in to the system.',
          read: false,
          createdAt: new Date()
        }
      });
      toast({
        title: 'User Approved',
        description: 'User has been approved and can now log in.',
      });
      fetchPendingUsers();
      fetchApprovedUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve user.',
        variant: 'destructive',
      });
    }
  };

  // Reject user - sets approved to 'rejected'
  const handleReject = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, { approved: 'rejected' });
      toast({
        title: 'User Rejected',
        description: 'User has been rejected and cannot log in.',
      });
      fetchPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject user.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Alert bar at the top */}
      <div className="bg-red-600 text-white py-1 px-4 text-center text-sm font-medium">
        Emergency Management System - Administrative Portal
      </div>
      
      <header className="bg-white shadow-md border-b z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gray-800 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">User Management Portal</p>
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
                Refresh
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
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setViewMode('pending')}
            className={`py-3 px-6 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              viewMode === 'pending'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="h-4 w-4" />
            Pending Approvals
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {users.filter(u => u.approved === false).length}
            </span>
          </button>
          <button
            onClick={() => setViewMode('approved')}
            className={`py-3 px-6 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              viewMode === 'approved'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            Approved Users
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {approvedUsers.length}
            </span>
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-50px)] pb-4">
          {viewMode === 'pending' ? (
            <>
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-gradient-to-br from-gray-50 to-gray-100 py-2 z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Pending User Approvals</h2>
                  <p className="text-gray-500">Review and manage user registration requests</p>
                </div>
                <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-gray-200">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <UserCheck className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pending Users</p>
                      <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.approved === false).length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
                </div>
              ) : users.length === 0 ? (
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">No Pending Users</h3>
                    <p className="text-gray-500 mt-1">All user requests have been processed</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  {user.displayName ? (
                                    <span className="text-gray-700 font-medium">
                                      {user.displayName.charAt(0).toUpperCase()}
                                    </span>
                                  ) : (
                                    <User className="h-5 w-5 text-gray-500" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.displayName || 'No Name'}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Mail className="mr-1 h-3 w-3" />
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.approved === false && (
                                <div className="flex items-center text-yellow-600">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span className="font-medium">Pending</span>
                                </div>
                              )}
                              {user.approved === 'rejected' && (
                                <div className="flex items-center text-red-600">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  <span className="font-medium">Rejected</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {user.approved === false ? (
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApprove(user.uid)}
                                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReject(user.uid)}
                                    className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="secondary" size="sm" disabled className="opacity-50">
                                  {user.approved === 'rejected' ? 'Rejected' : 'Approved'}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-gradient-to-br from-gray-50 to-gray-100 py-2 z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Approved Users</h2>
                  <p className="text-gray-500">View all active system users</p>
                </div>
                <Card className="bg-white/80 backdrop-blur-sm shadow-sm border-gray-200">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-full">
                      <Users className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">{approvedUsers.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
                </div>
              ) : approvedUsers.length === 0 ? (
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">No Approved Users</h3>
                    <p className="text-gray-500 mt-1">There are no active users in the system</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {approvedUsers.map((user) => (
                          <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                  {user.displayName ? (
                                    <span className="text-green-700 font-medium">
                                      {user.displayName.charAt(0).toUpperCase()}
                                    </span>
                                  ) : (
                                    <User className="h-5 w-5 text-green-500" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.displayName || 'No Name'}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Mail className="mr-1 h-3 w-3" />
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="font-medium">Active</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Emergency Management System &copy; {new Date().getFullYear()}
            </p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Admin Portal v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
