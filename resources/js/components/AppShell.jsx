import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppShell({ children }) {
  const [dark, setDark] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "nav-link nav-link-active" : "nav-link";

  return (
    <div className={dark ? "app-root dark" : "app-root"}>
      {/* 🔹 REAL HEADER BAR */}
      <header className="app-header">
        <div className="app-header-inner">
          {/* Logo + title */}
          <div className="app-header-left">
            <div className="app-logo">FocusFlow</div>
            <div className="app-tagline">
              Minimal to-do board with superpowers
            </div>
          </div>

          {/* Nav */}
          <nav className="app-nav">
            {user && (
              <>
                <Link to="/" className={isActive("/")}>
                  Dashboard
                </Link>
                <Link to="/tasks" className={isActive("/tasks")}>
                  Task Table
                </Link>
                <Link to="/categories" className={isActive("/categories")}>
                  Category
                </Link>
                <Link to="/calendar" className={isActive("/calendar")}>
                  Calendar
                </Link>
                <Link to="/deleted" className={isActive("/deleted")}>
                  Deleted Items
                </Link>
              </>
            )}
          </nav>

          {/* Dark toggle + Logout */}
          <div className="app-header-right">
            <button
              onClick={() => setDark((v) => !v)}
              title="Toggle dark mode"
              className="btn-theme-toggle"
            >
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>

            {user && (
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🔹 Page content under the header */}
      <main className="app-shell">{children}</main>
    </div>
  );
}

