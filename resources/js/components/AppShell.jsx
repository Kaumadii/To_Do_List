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
            <div className="app-shell">
                <header
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 24,
                    }}
                >
                   {/* Logo + title (without round icon) */}
<div style={{ display: "flex", alignItems: "center" }}>
    <div>
        <div style={{ fontWeight: 600, fontSize: 18 }}>
            FocusFlow
        </div>
        <div
            style={{
                fontSize: 12,
                color: "var(--text-muted)",
            }}
        >
            Minimal to-do board with superpowers
        </div>
    </div>
</div>


                   {/* Nav */}
<nav
    style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
    }}
>
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

            <Link to="/deleted" className={isActive("/deleted")}>
                Deleted Items
            </Link>
        </>
    )}
</nav>


                    {/* Dark mode + logout */}
<div
    style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
    }}
>
    {/* Dark mode button */}
    <button
        onClick={() => setDark((v) => !v)}
        title="Toggle dark mode"
        style={{
            height: "36px",
            width: "110px",
            borderRadius: "9999px",
            fontSize: "14px",
            background: "transparent",
            border: "1px solid #cbd5e1",
            cursor: "pointer",
        }}
    >
        {dark ? "☀️ Light" : "🌙 Dark"}
    </button>

    {/* Logout button */}
    {user && (
        <button
            onClick={handleLogout}
            style={{
                height: "36px",
                width: "110px",
                borderRadius: "9999px",
                fontSize: "14px",
                background: "#3b82f6",     // blue
                color: "white",
                border: "none",
                cursor: "pointer",
            }}
        >
            Logout
        </button>
    )}
</div>
                </header>

                {children}
            </div>
        </div>
    );
}
