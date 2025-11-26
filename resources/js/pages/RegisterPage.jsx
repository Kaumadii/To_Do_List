import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) navigate("/");
    }, [user]);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.message || "Registration failed");
            return;
        }

        const data = await res.json();
        setUser(data);
        navigate("/");
    };

    return (
        <AppShell>
            <div
                style={{
                    display: "grid",
                    placeItems: "center",
                    minHeight: "70vh",
                }}
            >
                <div style={{ maxWidth: 400, width: "100%" }} className="card">
                    <h2 style={{ marginTop: 0, marginBottom: 8 }}>Create account</h2>
                    <p style={{ marginTop: 0, fontSize: 13, color: "var(--text-muted)" }}>
                        Your personal space to plan and track tasks.
                    </p>

                    {error && (
                        <div
                            style={{
                                marginTop: 8,
                                marginBottom: 8,
                                fontSize: 13,
                                color: "var(--danger)",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
                        <div>
                            <label
                                style={{ fontSize: 13, display: "block", marginBottom: 4 }}
                            >
                                Name
                            </label>
                            <input
                                className="input"
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                style={{ width: "93%", }}
                            />
                        </div>
                        <div>
                            <label
                                style={{ fontSize: 13, display: "block", marginBottom: 4 }}
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
                                style={{ width: "93%", }}
                            />
                        </div>
                        <div>
                            <label
                                style={{ fontSize: 13, display: "block", marginBottom: 4 }}
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
                                style={{ width: "93%", }}
                            />
                        </div>
                        <div>
                            <label
                                style={{ fontSize: 13, display: "block", marginBottom: 4 }}
                            >
                                Confirm password
                            </label>
                            <input
                                className="input"
                                type="password"
                                name="password_confirmation"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                required
                                style={{ width: "93%", }}
                            />
                        </div>
                        <button className="btn btn-primary"
                            type="submit"
                            style={{
                                width: "100%", // full-width, centered
                                justifyContent: "center",
                                marginTop: 8,
                            }}>
                            Register
                        </button>
                    </form>

                    <p
                        style={{
                            marginTop: 16,
                            fontSize: 13,
                            textAlign: "center",
                        }}
                    >
                        Already have an account?{" "}
                        <Link to="/login" style={{ color: "#4f46e5" }}>
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </AppShell>
    );
}
