import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Edit3, Save, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [balance, setBalance] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'Expense'
  });

  const [templateData, setTemplateData] = useState({
    description: '',
    amount: '',
    type: 'Income'
  });

  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTransactions();
    fetchTemplates();
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
      calculateBalance(response.data);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/templates`);
      setTemplates(response.data);
    } catch (err) {
      console.error('Failed to fetch templates');
    }
  };

  const calculateBalance = (txns) => {
    const total = txns.reduce((acc, txn) => {
      return txn.type === 'Income' ? acc + txn.amount : acc - txn.amount;
    }, 0);
    setBalance(total);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
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
      setError(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...templateData,
        amount: parseFloat(templateData.amount)
      };

      if (editingTemplateId) {
        await axios.put(`${API_URL}/templates/${editingTemplateId}`, payload);
      } else {
        await axios.post(`${API_URL}/templates`, payload);
      }

      resetTemplateForm();
      fetchTemplates();
    } catch (err) {
      console.error('Failed to save template');
    }
  };

  const handleUseTemplate = async (templateId) => {
    try {
      await axios.post(`${API_URL}/templates/${templateId}/use`);
      fetchTransactions();
    } catch (err) {
      console.error('Failed to use template');
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

  const handleEditTemplate = (template) => {
    setTemplateData({
      description: template.description,
      amount: template.amount.toString(),
      type: template.type
    });
    setEditingTemplateId(template._id);
    setShowTemplateForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    
    try {
      await axios.delete(`${API_URL}/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    
    try {
      await axios.delete(`${API_URL}/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error('Failed to delete template');
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

  const resetTemplateForm = () => {
    setTemplateData({
      description: '',
      amount: '',
      type: 'Income'
    });
    setEditingTemplateId(null);
    setShowTemplateForm(false);
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
    return <Navigate to="/login" />;
  }

  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-7xl mx-auto px-2 py-4 md:px-4 md:py-6 flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-indigo-600 text-white px-3 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-xs md:text-sm opacity-80">Current Balance</p>
                <p className={`text-xl md:text-2xl font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs md:text-sm opacity-80">Total Income / Expenses</p>
                <p className="text-sm md:text-lg font-bold">
                  <span className="text-emerald-500">{formatCurrency(totalIncome)}</span>
                  {' / '}
                  <span className="text-rose-500">{formatCurrency(totalExpenses)}</span>
                </p>
              </div>
            </div>

            <div className="border-b border-slate-200 bg-slate-50 hidden md:block">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-semibold text-slate-600">
                <div className="col-span-2">Date</div>
                <div className="col-span-5">Particulars</div>
                <div className="col-span-2 text-right">Income</div>
                <div className="col-span-2 text-right">Expense</div>
                <div className="col-span-1 text-center">Action</div>
              </div>
            </div>

            {showForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-slate-200 bg-indigo-50 px-2 py-2 md:px-4 md:py-3 overflow-hidden"
              >
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-12 md:col-span-2">
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-2 py-2 md:px-3 md:py-2 bg-white border border-slate-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div className="col-span-12 md:col-span-5 flex flex-col md:flex-row gap-2">
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="px-2 py-2 md:px-3 md:py-2 bg-white border border-slate-300 rounded-lg text-sm"
                      >
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                      </select>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description"
                        className="flex-1 px-2 py-2 md:px-3 md:py-2 bg-white border border-slate-300 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0"
                        className="w-full px-2 py-2 md:px-3 md:py-2 bg-white border border-slate-300 rounded-lg text-sm text-right"
                        required
                      />
                    </div>
                    <div className="hidden md:block col-span-2">
                      <div className="px-3 py-2 bg-slate-200 rounded-lg text-sm text-right text-slate-400">-</div>
                    </div>
                    <div className="col-span-12 md:col-span-1 flex gap-1">
                      <button
                        type="submit"
                        className="flex-1 md:flex-none px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                      >
                        {editingId ? 'Edit' : 'Add'}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-2 py-2 text-slate-500 hover:bg-slate-200 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  No transactions yet
                </div>
              ) : (
                transactions.map((transaction, index) => (
                  <div 
                    key={transaction._id}
                    className={`p-3 md:p-0 md:grid md:grid-cols-12 md:gap-2 md:px-4 md:py-3 border-b border-slate-100 hover:bg-slate-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <div className="md:col-span-2 text-sm text-slate-600 mb-1 md:mb-0">
                      {formatDate(transaction.date)}
                    </div>
                    <div className="md:col-span-5 text-sm font-medium text-slate-700 mb-1 md:mb-0 flex items-center justify-between">
                      <span>{transaction.description}</span>
                      <div className="md:hidden flex gap-1">
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
                    <div className="md:col-span-2 md:text-right text-sm mb-1 md:mb-0">
                      {transaction.type === 'Income' ? (
                        <span className="text-emerald-500 font-semibold">
                          {formatCurrency(transaction.amount)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </div>
                    <div className="md:col-span-2 md:text-right text-sm mb-1 md:mb-0">
                      {transaction.type === 'Expense' ? (
                        <span className="text-rose-500 font-semibold">
                          {formatCurrency(transaction.amount)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </div>
                    <div className="hidden md:flex md:col-span-1 gap-1 justify-center">
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

            <div className="bg-slate-100 border-t-2 border-indigo-600 px-3 py-2 md:px-4 md:py-3">
              <div className="grid grid-cols-12 gap-2 text-xs md:text-sm font-bold text-slate-700">
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
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        <div className="w-full md:w-80">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-20">
            <div className="bg-indigo-600 text-white px-3 py-2 md:px-4 md:py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-bold text-sm md:text-base">Quick Add</span>
              </div>
              <button
                onClick={() => setShowTemplateForm(!showTemplateForm)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showTemplateForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-slate-200 bg-indigo-50 p-3 overflow-hidden"
              >
                <form onSubmit={handleTemplateSubmit}>
                  <div className="space-y-2">
                    <select
                      value={templateData.type}
                      onChange={(e) => setTemplateData({ ...templateData, type: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-sm"
                    >
                      <option value="Income">Income</option>
                      <option value="Expense">Expense</option>
                    </select>
                    <input
                      type="text"
                      value={templateData.description}
                      onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                      placeholder="Description"
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-sm"
                      required
                    />
                    <input
                      type="number"
                      value={templateData.amount}
                      onChange={(e) => setTemplateData({ ...templateData, amount: e.target.value })}
                      placeholder="Amount"
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-sm text-right"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                    >
                      <Save className="w-4 h-4" />
                      {editingTemplateId ? 'Update' : 'Save Template'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="max-h-[50vh] overflow-y-auto">
              {templates.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No templates yet.<br/>Click + to add one.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {templates.map((template) => (
                    <div key={template._id} className="p-3 hover:bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          template.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {template.type}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="p-1 text-slate-400 hover:text-indigo-600"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template._id)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-700">{template.description}</p>
                      <p className={`text-sm font-bold ${
                        template.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {formatCurrency(template.amount)}
                      </p>
                      <button
                        onClick={() => handleUseTemplate(template._id)}
                        className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-600 rounded text-sm hover:bg-indigo-200 transition-colors"
                      >
                        <Zap className="w-3 h-3" />
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transactions;