import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  return (
    <header className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">HAYATHUL ISLAM COMMITTEE(R.) JATTIPALLA, SULLIA, D.K</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/transactions')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all"
              >
                Cash Book
              </button>
              <button
                onClick={() => navigate('/summary')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all"
              >
                Summary
              </button>
              <button
                onClick={logout}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
  )
}

export default Navbar