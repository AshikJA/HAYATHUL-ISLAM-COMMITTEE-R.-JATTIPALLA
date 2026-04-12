import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Transactions from './pages/Transactions';
import Summary from './pages/Summary';
import ViewSingleMonthPage from './pages/ViewSingleMonthPage';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/summary"
            element={
              <PrivateRoute>
                <Summary />
              </PrivateRoute>
            }
          />
          <Route
            path="/summary/:year/:month"
            element={
              <PrivateRoute>
                <ViewSingleMonthPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/transactions" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;