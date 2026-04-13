import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold md:text-xl">HAYATHUL ISLAM COMMITTEE(R.) JATTIPALLA, SULLIA, D.K</span>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-white/20 rounded-lg"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-start md:items-center gap-2 absolute md:static top-14 left-0 right-0 bg-indigo-600 md:bg-transparent p-3 md:p-0 z-50`}>
              <button
                onClick={() => { navigate('/transactions'); setMenuOpen(false); }}
                className="w-full md:w-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all text-left"
              >
                Cash Book
              </button>
              <button
                onClick={() => { navigate('/summary'); setMenuOpen(false); }}
                className="w-full md:w-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all text-left"
              >
                Summary
              </button>
              <button
                onClick={logout}
                className="w-full md:w-auto p-2 hover:bg-white/20 rounded-lg transition-all text-left"
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