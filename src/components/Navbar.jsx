import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const RoleLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <NavLink 
            to="/login" 
            onClick={() => setOpen(false)} 
            className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Login
          </NavLink>
          <NavLink 
            to="/register" 
            onClick={() => setOpen(false)} 
            className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Register
          </NavLink>
        </>
      );
    }

    if (user?.role === 'ADMIN') {
      return (
        <>
          <NavLink 
            to="/admin" 
            onClick={() => setOpen(false)} 
            className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/admin/orders" 
            onClick={() => setOpen(false)} 
            className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Orders
          </NavLink>
          <NavLink 
            to="/admin/riders" 
            onClick={() => setOpen(false)} 
            className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Riders
          </NavLink>
          <NavLink 
            to="/admin/stations" 
            onClick={() => setOpen(false)} 
            className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Stations
          </NavLink>
        </>
      );
    }

    if (user?.role === 'RIDER') {
      return (
        <>
          <NavLink 
            to="/rider" 
            end
            onClick={() => setOpen(false)} 
            className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/rider/available-orders" 
            onClick={() => setOpen(false)} 
            className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Available Orders
          </NavLink>
          <NavLink 
            to="/rider/my-orders" 
            onClick={() => setOpen(false)} 
            className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
          >
            My Orders
          </NavLink>
          <NavLink 
            to="/rider/earnings" 
            onClick={() => setOpen(false)} 
            className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Earnings
          </NavLink>
        </>
      );
    }

    if (user?.role === 'STATION_MANAGER') {
      return (
        <NavLink 
          to="/manager" 
          onClick={() => setOpen(false)} 
          className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
        >
          Station Dashboard
        </NavLink>
      );
    }

    // CUSTOMER
    return (
      <>
        <NavLink 
          to="/home" 
          end
          onClick={() => setOpen(false)} 
          className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
        >
          Home
        </NavLink>
        <NavLink 
          to="/orders" 
          onClick={() => setOpen(false)} 
          className={({ isActive }) => `block py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-green-50 text-green-600 font-semibold' : 'hover:bg-gray-100'}`}
        >
          My Orders
        </NavLink>
      </>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo/title navigates to role-appropriate home/dashboard */}
          <button
            onClick={() => {
              const path = user?.role === 'ADMIN' ? '/admin' : 
                          user?.role === 'RIDER' ? '/rider' : 
                          user?.role === 'STATION_MANAGER' ? '/manager' : '/';
              navigate(path);
              setOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img src="/images/citygrid_logo.png" alt="Citygrid" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Citygrid Energy</h1>
              <p className="text-xs text-gray-600">Reliable gas delivery</p>
            </div>
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          <RoleLinks />
          {isAuthenticated && (
            <button 
              onClick={handleLogout} 
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((s) => !s)}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-900">
              {open ? (
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer + overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!open}
      >
        {/* overlay */}
        <div 
          className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setOpen(false)} 
        />

        {/* drawer */}
        <aside
          ref={drawerRef}
          className={`absolute right-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/citygrid_logo.png" alt="Citygrid" className="h-8 w-auto" />
              <div>
                <div className="text-sm font-semibold">Citygrid Energy</div>
                <div className="text-xs text-gray-600">
                  {isAuthenticated ? `Welcome, ${user?.fullName?.split(' ')[0]}` : 'Welcome'}
                </div>
              </div>
            </div>
            <button 
              aria-label="Close menu" 
              onClick={() => setOpen(false)} 
              className="p-2 hover:bg-gray-100 rounded"
            >
              ✕
            </button>
          </div>

          <nav className="p-4 flex flex-col gap-1 text-sm">
            <RoleLinks />
            {isAuthenticated && (
              <button 
                onClick={handleLogout} 
                className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Logout
              </button>
            )}
          </nav>
        </aside>
      </div>
    </header>
  );
}