import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://127.0.0.1:5000";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [balance, setBalance] = useState(0);
  const [displayName, setDisplayName] = useState(user?.username || "Profile");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setBalance(data.tokens);
          setDisplayName(data.username);
        }
      } catch (err) {
        console.error("Failed to fetch profile data in header:", err);
      }
    };

    fetchProfileData();

    // Listen for custom event to refresh profile immediately
    const handleProfileUpdate = () => {
      fetchProfileData();
    };
    window.addEventListener("balanceUpdated", handleProfileUpdate);
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("balanceUpdated", handleProfileUpdate);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [token]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const navLinkClass = ({ isActive }) =>
    `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive
      ? "text-blue-600 bg-blue-50"
      : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
    }`;
  return (
    <header className="bg-green-200 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-800">
          <NavLink to="/home">KU Ticket</NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex gap-2 items-center">
          <NavLink to="/home" className={navLinkClass}>
            <span className="text-lg font-semibold">Home</span>
          </NavLink>

          <NavLink to="/concert" className={navLinkClass}>
            <span className="text-lg font-semibold">Concert</span>
          </NavLink>

          <NavLink to="/about" className={navLinkClass}>
            <span className="text-lg font-semibold">About</span>
          </NavLink>

          {/* Admin links */}
          {user?.role === "admin" && (
            <>
              <span className="text-gray-400 mx-1">|</span>
              <NavLink to="/admin/add-concert" className={navLinkClass}>
                <span className="text-lg font-semibold">➕ Add</span>
              </NavLink>
              <NavLink to="/admin/drafts" className={navLinkClass}>
                <span className="text-lg font-semibold">📋 Drafts</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Profile + Logout */}
        <div className="flex items-center gap-3">
          {/* Token Balance (mock data) */}
          <NavLink to="/top-up">
            <span className="text-lg">🪙</span>
            <span className="text-sm font-semibold text-yellow-700">
              {balance.toLocaleString()}
            </span>
          </NavLink>

          {/* Profile */}
          <NavLink
            to="/profile"
            className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-md transition"
          >
            {/* Avatar */}
            <div className="w-3 h-3 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold"></div>

            <span className="text-sm font-medium text-gray-700">
              {displayName}
            </span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-red-200 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
