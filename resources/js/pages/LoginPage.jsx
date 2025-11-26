import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setError("Invalid email or password");
      return;
    }

    const data = await res.json();
    setUser(data);
    navigate(from, { replace: true });
  };

  return (
    // 🔹 No AppShell here – just a centered layout
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f6", // light grey bg similar to app
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          padding: "28px 24px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 8,
          }}
        >
          Welcome To My To Do List
        </h2>

        <p
          style={{
            marginTop: 0,
            marginBottom: 20,
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          Stay Focused. Stay Productive.
        </p>

        {error && (
          <div
            style={{
              marginBottom: 12,
              fontSize: 13,
              color: "var(--danger)",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: 12,
            textAlign: "left",
          }}
        >
          <div>
            <label
              style={{
                fontSize: 13,
                display: "block",
                marginBottom: 4,
              }}
            >
              Email
            </label>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: "95%" }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 13,
                display: "block",
                marginBottom: 4,
              }}
            >
              Password
            </label>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={{ width: "95%" }}
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            Login
          </button>
        </form>

        <p
          style={{
            marginTop: 16,
            fontSize: 13,
          }}
        >
          Don&apos;t have an account?{" "}
          <Link to="/register" style={{ color: "#4f46e5" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
