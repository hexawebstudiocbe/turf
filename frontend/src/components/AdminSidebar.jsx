import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Grid,
  DollarSign,
  Settings,
  Users,
  CreditCard,
  ExternalLink,
  LogOut,
  Shield,
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Pitch Slots', path: '/admin/slots', icon: Grid },
    { name: 'Pricing & Policy', path: '/admin/pricing', icon: DollarSign },
    { name: 'Turf Profile', path: '/admin/turf', icon: Settings },
    { name: 'Customers CRM', path: '/admin/customers', icon: Users },
    { name: 'Payments Ledger', path: '/admin/payments', icon: CreditCard },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 min-h-screen flex flex-col justify-between p-4 sticky top-0 z-30">
      <div className="space-y-6">
        {/* Admin Brand */}
        <div className="px-3 py-2 border-b border-slate-800/60 pb-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-950/50">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-tight font-display">TurfBook</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">{user?.name || 'Owner Portal'}</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2 pt-4 border-t border-slate-800/80">
        <Link
          to="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-pitch-400 hover:bg-slate-900 transition"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Live Customer Site
          </span>
          <span className="text-[10px] text-pitch-400 bg-pitch-950 px-1.5 py-0.5 rounded border border-pitch-800">
            Preview
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
