import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/admin');
      setAnalytics(response.data.data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-2xl font-bold">{analytics?.totalUsers || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Active Stalls</h3>
          <p className="text-2xl font-bold">{analytics?.activeStalls || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Revenue</h3>
          <p className="text-2xl font-bold">₱{analytics?.totalRevenue || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Orders</h3>
          <p className="text-2xl font-bold">{analytics?.totalOrders || 0}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">User Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold">Students</h3>
            <p className="text-xl">{analytics?.totalStudents || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold">Owners</h3>
            <p className="text-xl">{analytics?.totalOwners || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <h3 className="font-semibold">Admins</h3>
            <p className="text-xl">{analytics?.totalAdmins || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}