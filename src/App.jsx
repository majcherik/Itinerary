import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TripDetails from './pages/TripDetails';
import Wallet from './pages/Wallet';
import PackingList from './pages/PackingList';
import Documents from './pages/Documents';

function App() {
  return (
    <TripProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trip/:id" element={<TripDetails />} />
            <Route path="/trip/:id/wallet" element={<Wallet />} />
            <Route path="/trip/:id/packing" element={<PackingList />} />
            <Route path="/trip/:id/docs" element={<Documents />} />
          </Routes>
        </Layout>
      </Router>
    </TripProvider>
  );
}

export default App;
