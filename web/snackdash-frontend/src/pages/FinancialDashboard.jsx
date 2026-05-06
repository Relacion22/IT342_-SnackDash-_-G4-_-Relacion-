import React, { useState } from 'react';
import { CreditCard, RefreshCcw, X } from 'lucide-react';
// import api from '../lib/api';

export default function FinancialDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refundData, setRefundData] = useState({ userId: '', amount: '' });
  
  // Simulated Ledger
  const transactions = [
    { id: 'TXN-001', date: '2026-05-06', user: 'Juan Dela Cruz', type: 'Payment', amount: -350.00 },
    { id: 'TXN-002', date: '2026-05-06', user: 'Maria Santos', type: 'Top-up', amount: +1000.00 },
    { id: 'TXN-003', date: '2026-05-05', user: 'Carlos Lim', type: 'Refund', amount: +120.00 },
  ];

  const handleIssueRefund = async (e) => {
    e.preventDefault();
    console.log("Issuing refund:", refundData);
    // await api.post('/admin/wallet/refund', refundData);
    alert('Refund issued successfully!');
    setIsModalOpen(false);
    setRefundData({ userId: '', amount: '' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 overflow-hidden relative">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Financials & Wallet</h3>
          <p className="text-sm text-gray-500">Transaction ledger and dispute resolution</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#7A0019] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#5a0012] transition-colors"
        >
          <RefreshCcw size={16} /> Issue Refund
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TXN ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{txn.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{txn.date}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{txn.user}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${txn.type === 'Payment' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {txn.type}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm font-bold ${txn.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {txn.amount > 0 ? '+' : ''}₱ {Math.abs(txn.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Issue Refund Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Issue Manual Refund</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleIssueRefund} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">User ID</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7A0019] outline-none" 
                  value={refundData.userId} onChange={e => setRefundData({...refundData, userId: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Refund Amount (₱)</label>
                <input 
                  type="number" step="0.01" required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7A0019] outline-none" 
                  value={refundData.amount} onChange={e => setRefundData({...refundData, amount: e.target.value})}
                />
              </div>
              <button type="submit" className="mt-2 w-full bg-[#7A0019] text-white py-2.5 rounded-lg font-bold hover:bg-[#5a0012]">
                Process Refund
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}