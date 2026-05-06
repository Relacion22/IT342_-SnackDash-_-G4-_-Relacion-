import React, { useState, useEffect } from 'react';
import { Search, Clock } from 'lucide-react';
// import api from '../lib/api';

export default function GlobalOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch - replace with api.get('/admin/orders')
    setIsLoading(true);
    setTimeout(() => {
      setOrders([
        { id: 'ORD-9012', student: 'Juan Dela Cruz', stall: 'Pizza Corner', amount: 350.00, status: 'Pending', time: '10:42 AM' },
        { id: 'ORD-9013', student: 'Maria Santos', stall: 'Burger House', amount: 150.00, status: 'Preparing', time: '10:35 AM' },
        { id: 'ORD-9014', student: 'Carlos Lim', stall: 'Vegan Delights', amount: 220.00, status: 'Ready', time: '10:20 AM' },
        { id: 'ORD-9015', student: 'Ana Garcia', stall: 'Sweet Treats', amount: 85.00, status: 'Completed', time: '09:15 AM' },
        { id: 'ORD-9016', student: 'Pedro Reyes', stall: 'Campus Cafe', amount: 120.00, status: 'Cancelled', time: '08:50 AM' },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Preparing': 'bg-blue-100 text-blue-800',
      'Ready': 'bg-purple-100 text-purple-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Global Orders</h3>
          <p className="text-sm text-gray-500">Live feed of all marketplace transactions</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stall</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading orders...</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-1.5"><Clock size={14}/> {order.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.student}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.stall}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#7A0019]">₱ {order.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}