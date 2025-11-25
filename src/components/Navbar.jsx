import React from 'react';
import { LayoutDashboard, Wallet, CheckSquare, FileText } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  // useParams won't work here because Navbar is outside the Route.
  // We need to extract the ID from the pathname manually.
  // Path format: /trip/:id or /trip/:id/section
  const match = location.pathname.match(/^\/trip\/(\d+)/);
  const id = match ? match[1] : null;

  // Helper to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // If we are on the dashboard (no ID), we can either hide the nav or disable links.
  // Let's keep Dashboard always active, but disable others if no trip is selected.
  const isTripSelected = !!id;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border-color pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive ? 'text-accent-primary' : 'text-text-secondary hover:text-text-primary'}`}>
          <LayoutDashboard size={24} />
          <span className="text-xs font-medium">Dashboard</span>
        </NavLink>

        <NavLink
          to={isTripSelected ? `/trip/${id}/wallet` : '#'}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive(isTripSelected ? `/trip/${id}/wallet` : '/wallet') ? 'text-accent-primary' : 'text-text-secondary'} ${!isTripSelected ? 'opacity-50 cursor-not-allowed' : 'hover:text-text-primary'}`}
          onClick={(e) => !isTripSelected && e.preventDefault()}
        >
          <Wallet size={24} />
          <span className="text-xs font-medium">Wallet</span>
        </NavLink>

        <NavLink
          to={isTripSelected ? `/trip/${id}/packing` : '#'}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive(isTripSelected ? `/trip/${id}/packing` : '/packing') ? 'text-accent-primary' : 'text-text-secondary'} ${!isTripSelected ? 'opacity-50 cursor-not-allowed' : 'hover:text-text-primary'}`}
          onClick={(e) => !isTripSelected && e.preventDefault()}
        >
          <CheckSquare size={24} />
          <span className="text-xs font-medium">Packing</span>
        </NavLink>

        <NavLink
          to={isTripSelected ? `/trip/${id}/docs` : '#'}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive(isTripSelected ? `/trip/${id}/docs` : '/docs') ? 'text-accent-primary' : 'text-text-secondary'} ${!isTripSelected ? 'opacity-50 cursor-not-allowed' : 'hover:text-text-primary'}`}
          onClick={(e) => !isTripSelected && e.preventDefault()}
        >
          <FileText size={24} />
          <span className="text-xs font-medium">Docs</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
