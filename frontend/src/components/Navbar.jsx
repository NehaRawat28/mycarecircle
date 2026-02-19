import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, Pill, Stethoscope, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const navItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/" },
    { name: "Family", icon: <Users size={20} />, path: "/family" },
    { name: "Medicines", icon: <Pill size={20} />, path: "/medicines" },
    { name: "Appointments", icon: <Stethoscope size={20} />, path: "/appointments" },
    { name: "Emergency", icon: <AlertCircle size={20} />, path: "/emergency" }
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-zinc-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-bold text-xl text-slate-800">
          MyCareCircle
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path
                  ? "bg-slate-800 text-white"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-zinc-50 rounded-lg p-2 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-zinc-900">{user?.name || "User"}</div>
              <div className="text-xs text-zinc-500">Primary User</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-medium">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg py-2">
              <div className="px-4 py-2 border-b border-zinc-100">
                <p className="text-sm font-medium text-zinc-900">{user?.name}</p>
                <p className="text-xs text-zinc-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
