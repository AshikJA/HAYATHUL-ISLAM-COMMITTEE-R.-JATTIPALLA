import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  LogOut,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

function ViewSingleMonthPage() {
  const { year, month } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'Expense'
  });
  
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = parseInt(month) - 1;
  const monthName = monthNames[monthIndex];
  const currentYear = parseInt(year);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTransactions();
  }, [user, year, month]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      const allTransactions = response.data;
      
      const filtered = allTransactions.filter(t => {
        const txnDate = new Date(t.date);
        return txnDate.getMonth() + 1 === parseInt(month) && txnDate.getFullYear() === parseInt(year);
      });
      
      setTransactions(filtered.reverse());
    } catch (err) {
      console.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingId) {
        await axios.put(`${API_URL}/transactions/${editingId}`, payload);
      } else {
        await axios.post(`${API_URL}/transactions`, payload);
      }

      resetForm();
      fetchTransactions();
    } catch (err) {
      console.error('Failed to save transaction');
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      date: new Date(transaction.date).toISOString().split('T')[0],
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type
    });
    setEditingId(transaction._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    
    try {
      await axios.delete(`${API_URL}/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      type: 'Expense'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-slate-100">

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/summary')}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold">{monthName} {year}</h1>
                <p className="text-sm opacity-80">Transactions</p>
              </div>
            </div>
            <div>
              <p className="text-sm opacity-80">Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Income / Expenses</p>
              <p className="text-lg font-bold">
                <span className="text-emerald-300">{formatCurrency(totalIncome)}</span>
                {' / '}
                <span className="text-rose-300">{formatCurrency(totalExpenses)}</span>
              </p>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-semibold text-slate-600">
              <div className="col-span-2">Date</div>
              <div className="col-span-5">Particulars</div>
              <div className="col-span-2 text-right">Income</div>
              <div className="col-span-2 text-right">Expense</div>
              <div className="col-span-1 text-center">Action</div>
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="border-b border-slate-200 bg-teal-50 px-4 py-3">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-2">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div className="col-span-5 flex gap-2">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-right"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <div className="px-3 py-2 bg-slate-200 rounded-lg text-sm text-right text-slate-500">-</div>
                </div>
                <div className="col-span-1 flex gap-1">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-teal-700"
                  >
                    {editingId ? 'Edit' : 'Add'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-2 py-2 text-slate-500 hover:bg-slate-200 rounded-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No transactions this month
              </div>
            ) : (
              transactions.map((transaction, index) => (
                <div 
                  key={transaction._id}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <div className="col-span-2 text-sm text-slate-600">
                    {formatDate(transaction.date)}
                  </div>
                  <div className="col-span-5 text-sm font-medium text-slate-700">
                    {transaction.description}
                  </div>
                  <div className="col-span-2 text-right text-sm">
                    {transaction.type === 'Income' ? (
                      <span className="text-emerald-500 font-semibold">
                        {formatCurrency(transaction.amount)}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </div>
                  <div className="col-span-2 text-right text-sm">
                    {transaction.type === 'Expense' ? (
                      <span className="text-rose-500 font-semibold">
                        {formatCurrency(transaction.amount)}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </div>
                  <div className="col-span-1 flex gap-1 justify-center">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-slate-100 border-t-2 border-indigo-600 px-4 py-3">
            <div className="grid grid-cols-12 gap-2 text-sm font-bold text-slate-700">
              <div className="col-span-2">TOTAL</div>
              <div className="col-span-5"></div>
              <div className="col-span-2 text-right text-emerald-500">{formatCurrency(totalIncome)}</div>
              <div className="col-span-2 text-right text-rose-500">{formatCurrency(totalExpenses)}</div>
              <div className="col-span-1"></div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              resetForm();
              setFormData({
                ...formData,
                date: `${year}-${month.padStart(2, '0')}-01`
              });
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-teal-700 shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </main>
    </div>
  );
}

export default ViewSingleMonthPage;