import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, LogOut, DollarSign, Users, Store, ShoppingBag, 
  TrendingUp, Search, Eye, Ban, CheckCircle, XCircle, 
  Power, AlertCircle, Clock, RefreshCcw, X 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';

/* =========================================================================
   MODULE 1: ANALYTICS OVERVIEW (REAL-TIME)
   ========================================================================= */
const AnalyticsOverview = () => {
  const [metrics, setMetrics] = useState({ revenue: 0, students: 0, stalls: 0, orders: 0 });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        const data = res.data.data;
        setMetrics({
          revenue: data.totalRevenue || 0,
          students: data.totalStudents || 0,
          stalls: data.activeStalls || 0,
          orders: data.totalOrders || 0
        });
      } catch (err) { console.error("Error fetching analytics", err); }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const weeklyData = [
    { name: 'Mon', sales: 4200 }, { name: 'Tue', sales: 3800 },
    { name: 'Wed', sales: 5500 }, { name: 'Thu', sales: 4800 },
    { name: 'Fri', sales: 8900 }, { name: 'Sat', sales: 6200 }, { name: 'Sun', sales: 7100 },
  ];

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex justify-between items-center">
          <div><p className="text-sm font-semibold text-gray-500 uppercase">Total Revenue</p><h3 className="text-2xl font-extrabold text-gray-900">₱ {metrics.revenue.toLocaleString()}</h3></div>
          <div className="p-4 rounded-full bg-green-100 text-green-700"><DollarSign size={24} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex justify-between items-center">
          <div><p className="text-sm font-semibold text-gray-500 uppercase">Active Students</p><h3 className="text-2xl font-extrabold text-gray-900">{metrics.students}</h3></div>
          <div className="p-4 rounded-full bg-blue-100 text-blue-700"><Users size={24} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex justify-between items-center">
          <div><p className="text-sm font-semibold text-gray-500 uppercase">Active Stalls</p><h3 className="text-2xl font-extrabold text-gray-900">{metrics.stalls}</h3></div>
          <div className="p-4 rounded-full bg-yellow-100 text-yellow-700"><Store size={24} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex justify-between items-center">
          <div><p className="text-sm font-semibold text-gray-500 uppercase">Total Orders</p><h3 className="text-2xl font-extrabold text-gray-900">{metrics.orders}</h3></div>
          <div className="p-4 rounded-full bg-purple-100 text-purple-700"><ShoppingBag size={24} /></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold mb-6">Weekly Sales Trends</h3>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10}/>
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `₱${value}`} dx={-10}/>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(value) => [`₱${value}`, 'Revenue']}/>
              <Line type="monotone" dataKey="sales" stroke="#7A0019" strokeWidth={3} dot={{ r: 4, fill: '#7A0019', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   MODULE 2: USER MANAGEMENT (REAL-TIME)
   ========================================================================= */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users?size=50');
      setUsers(res.data.data.content || []);
    } catch (err) { console.error("Error fetching users", err); }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      // Send request to the new toggle backend endpoint
      await api.put(`/admin/users/${id}/toggle-status`);
      
      // Show success popup depending on what just happened
      if (currentStatus === 'ACTIVE') {
        alert("User has been SUSPENDED.");
      } else {
        alert("User has been REACTIVATED and can order again!");
      }
      
      // Refresh the table immediately to show the new status
      fetchUsers();
    } catch (err) { 
      console.error(err);
      alert("Error: Failed to update user status. Check console or backend connection.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">User Management</h3>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#7A0019]" />
        </div>
      </div>
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Wallet</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {filteredUsers.length === 0 ? (
            <tr><td colSpan="7" className="text-center p-6 text-gray-500">No users found.</td></tr>
          ) : filteredUsers.map(u => (
            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-3 font-medium text-gray-900">#{u.id}</td>
              <td className="p-3 font-medium">{u.name}</td>
              <td className="p-3 text-gray-500">{u.email}</td>
              <td className="p-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-700">{u.role}</span></td>
              <td className="p-3 font-bold text-[#7A0019]">₱ {u.walletBalance?.toFixed(2)}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${u.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {u.accountStatus}
                </span>
              </td>
              <td className="p-3 flex gap-3">
                <button 
                  title={u.accountStatus === 'ACTIVE' ? "Suspend User" : "Reactivate User"} 
                  onClick={() => {
                    const action = u.accountStatus === 'ACTIVE' ? 'suspend' : 'reactivate';
                    if (window.confirm(`Are you sure you want to ${action} ${u.name}?`)) {
                      handleToggleStatus(u.id, u.accountStatus);
                    }
                  }} 
                  className={`transition-colors ${u.accountStatus === 'ACTIVE' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                >
                  {u.accountStatus === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* =========================================================================
   MODULE 3: STALL MANAGEMENT (REAL-TIME)
   ========================================================================= */
const StallManagement = () => {
  const [tab, setTab] = useState('active');
  const [stalls, setStalls] = useState([]);

  const fetchStalls = async () => {
    try {
      const res = await api.get('/marketplace/stalls');
      setStalls(res.data.data || []);
    } catch (err) { console.error("Error fetching stalls", err); }
  };

  useEffect(() => {
    fetchStalls();
    const interval = setInterval(fetchStalls, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (id) => {
    try {
      await api.put(`/admin/stalls/${id}/toggle`);
      fetchStalls();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b flex gap-2 bg-gray-50">
        <button onClick={() => setTab('active')} className={`px-4 py-2 text-sm font-bold rounded-lg ${tab === 'active' ? 'bg-white shadow text-[#7A0019]' : 'text-gray-500'}`}>All Stalls</button>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stalls.length === 0 ? (
           <p className="text-gray-500 col-span-full">No stalls available.</p>
        ) : stalls.map(stall => (
          <div key={stall.id} className="border rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-gray-100 rounded-lg text-[#7A0019]"><Store size={20} /></div>
                <div><h4 className="font-bold text-gray-900">{stall.name}</h4><p className="text-xs text-gray-500">{stall.category || "Food Stall"}</p></div>
              </div>
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className={`text-xs font-bold px-2 py-1 rounded ${(stall.isOpen ?? stall.open) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {(stall.isOpen ?? stall.open) ? "OPEN" : "CLOSED"}
              </span>
              <button onClick={() => handleToggle(stall.id)} className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors">
                <Power size={14}/> Force Toggle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   MODULE 4: GLOBAL ORDERS (REAL-TIME)
   ========================================================================= */
const GlobalOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.data || []);
    } catch (err) { console.error("Error fetching orders", err); }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in duration-300">
      <h3 className="text-lg font-bold mb-4">Global Order Feed</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Time</th>
              <th className="p-3">Student</th>
              <th className="p-3">Stall</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {orders.length === 0 ? (
              <tr><td colSpan="6" className="text-center p-6 text-gray-500">No orders placed yet.</td></tr>
            ) : orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 font-bold text-gray-900">{o.orderNumber}</td>
                <td className="p-3 text-gray-500">
                  {o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A"}
                </td>
                <td className="p-3 font-medium">{o.studentName || "Student"}</td>
                <td className="p-3 font-medium">{o.stallName || "Stall"}</td>
                <td className="p-3 font-bold text-[#7A0019]">₱ {o.totalPrice?.toFixed(2)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    o.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                    o.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                    o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================================
   MODULE 5: FINANCIALS & WALLET (REAL-TIME)
   ========================================================================= */
const Financials = () => {
  const [showModal, setShowModal] = useState(false);
  const [txns, setTxns] = useState([]);
  const [refundData, setRefundData] = useState({ userId: '', amount: '' });

  const fetchLedger = async () => {
    try {
      const res = await api.get('/admin/transactions');
      setTxns(res.data.data || []);
    } catch (err) { console.error("Error fetching transactions", err); }
  };

  useEffect(() => {
    fetchLedger();
    const interval = setInterval(fetchLedger, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefund = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/wallet/refund', refundData);
      alert('Refund issued successfully!');
      setShowModal(false);
      setRefundData({ userId: '', amount: '' });
      fetchLedger();
    } catch (err) { alert('Failed to issue refund. Make sure the User ID is correct.'); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Transaction Ledger</h3>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#7A0019] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#5a0012] transition-colors">
          <RefreshCcw size={16} /> Issue Refund
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr><th className="p-3">TXN ID</th><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Type</th><th className="p-3">Amount</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {txns.length === 0 ? (
               <tr><td colSpan="5" className="text-center p-6 text-gray-500">No transactions recorded.</td></tr>
            ) : txns.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 font-bold text-gray-900">#{t.id}</td>
                <td className="p-3 text-gray-500">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td className="p-3 font-medium">{t.user?.name || `User #${t.user?.id}`}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${t.transactionType === 'PAYMENT' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {t.transactionType}
                  </span>
                </td>
                <td className={`p-3 font-bold ${t.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {t.amount > 0 ? '+' : ''}₱ {Math.abs(t.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-900">Issue Refund</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleRefund} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">User ID</label>
                <input required type="number" placeholder="e.g. 1" value={refundData.userId} onChange={e=>setRefundData({...refundData, userId: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#7A0019]"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₱)</label>
                <input required type="number" step="0.01" placeholder="0.00" value={refundData.amount} onChange={e=>setRefundData({...refundData, amount: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#7A0019]"/>
              </div>
              <button type="submit" className="mt-2 w-full bg-[#7A0019] text-white font-bold py-2.5 rounded-lg hover:bg-[#5a0012] transition-colors">
                Process Refund
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   MASTER DASHBOARD LAYOUT
   ========================================================================= */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'stalls', label: 'Stall Management', icon: Store },
    { id: 'orders', label: 'Global Orders', icon: ShoppingBag },
    { id: 'finance', label: 'Financials', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="bg-[#7A0019] p-2.5 rounded-xl shadow-sm"><Shield className="text-white" size={24} /></div>
          <div><h2 className="font-extrabold text-gray-900 leading-tight">Admin Portal</h2><p className="text-xs font-medium text-gray-500">SnackDash</p></div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeMenu === item.id ? 'bg-[#fff1f2] text-[#7A0019]' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-[#7A0019] transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
          {menuItems.find(m => m.id === activeMenu)?.label}
        </h2>
        {activeMenu === 'overview' && <AnalyticsOverview />}
        {activeMenu === 'users' && <UserManagement />}
        {activeMenu === 'stalls' && <StallManagement />}
        {activeMenu === 'orders' && <GlobalOrders />}
        {activeMenu === 'finance' && <Financials />}
      </main>
    </div>
  );
}