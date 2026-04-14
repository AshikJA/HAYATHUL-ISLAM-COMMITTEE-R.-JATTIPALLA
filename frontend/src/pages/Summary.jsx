import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

function Summary() {
  const [summary, setSummary] = useState([]);
  const [grandTotal, setGrandTotal] = useState({ income: 0, expenses: 0, net: 0 });
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/api/login');
      return;
    }
    fetchSummary();
  }, [user, year]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/summary/${year}`);
      setSummary(response.data.summary);
      setGrandTotal(response.data.grandTotal);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!user) {
    navigate('/api/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-5xl mx-auto px-2 py-4 md:px-4 md:py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-indigo-600 text-white px-3 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-lg md:text-lg font-bold">{year}</h1>
              <p className="text-sm opacity-80">Annual Summary</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setYear(year - 1)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded"
              >
                ←
              </button>
              <span className="px-4 font-bold">{year}</span>
              <button
                onClick={() => setYear(year + 1)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded"
                disabled={year >= new Date().getFullYear()}
              >
                →
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-200 bg-slate-50 hidden md:block">
                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-semibold text-slate-600">
                  <div className="col-span-4">Month</div>
                  <div className="col-span-2 text-right">Income</div>
                  <div className="col-span-2 text-right">Expense</div>
                  <div className="col-span-2 text-right">Balance</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>
              </div>

              {summary.map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div 
                    onClick={() => navigate(`/summary/${year}/${index + 1}`)}
                    className={`p-3 md:p-0 md:grid md:grid-cols-12 md:gap-2 md:px-4 md:py-4 border-b border-slate-100 cursor-pointer hover:bg-indigo-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <div className="md:col-span-4 flex items-center gap-2 text-slate-700 font-medium mb-1 md:mb-0">
                      <ChevronRight className="w-4 h-4 text-green-800" />
                      <span className="text-sm md:text-base">{item.month}</span>
                    </div>
                    <div className="md:col-span-2 md:text-right text-sm mb-1 md:mb-0">
                      <span className="md:hidden text-xs text-slate-500 mr-2">Income:</span>
                      <span className="text-emerald-500 font-semibold">
                        {item.income > 0 ? formatCurrency(item.income) : '-'}
                      </span>
                    </div>
                    <div className="md:col-span-2 md:text-right text-sm mb-1 md:mb-0">
                      <span className="md:hidden text-xs text-slate-500 mr-2">Expense:</span>
                      <span className="text-rose-500 font-semibold">
                        {item.expenses > 0 ? formatCurrency(item.expenses) : '-'}
                      </span>
                    </div>
                    <div className={`md:col-span-2 md:text-right text-sm mb-1 md:mb-0 font-bold ${
                      item.net >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      <span className="md:hidden text-xs text-slate-500 mr-2">Balance:</span>
                      {formatCurrency(item.net)}
                    </div>
                    <div className="md:col-span-2 md:text-right">
                      <span className="text-xs px-2 py-1 bg-slate-50 text-slate-500 rounded">
                        View →
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="bg-indigo-600 text-white px-3 py-3 md:px-4 md:py-4">
                <div className="grid grid-cols-12 gap-2 font-bold text-sm md:text-lg">
                  <div className="col-span-4">GRAND TOTAL</div>
                  <div className="col-span-2 text-right">{formatCurrency(grandTotal.income)}</div>
                  <div className="col-span-2 text-right">{formatCurrency(grandTotal.expenses)}</div>
                  <div className={`col-span-2 text-right ${
                    grandTotal.net >= 0 ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {formatCurrency(grandTotal.net)}
                  </div>
                  <div className="col-span-2"></div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Summary;