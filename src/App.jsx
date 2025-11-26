import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TripDetails from './pages/TripDetails';
import Wallet from './pages/Wallet';
import PackingList from './pages/PackingList';
import Documents from './pages/Documents';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import MenuDockResponsive from './components/MenuDockResponsive';

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/trip/:id" element={<TripDetails />} />
                      <Route path="/trip/:id/wallet" element={<Wallet />} />
                      <Route path="/trip/:id/packing" element={<PackingList />} />
                      <Route path="/trip/:id/docs" element={<Documents />} />
                    </Routes>
                  </Layout>
                  <MenuDockResponsive />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
