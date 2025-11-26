import React, { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { toast } from "react-toastify";

export default function CategoriesPage() {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch("/api/categories");
            if (!res.ok) throw new Error("Failed to load categories");
            const data = await res.json();
            setCategories(data);
        } catch (e) {
            console.error(e);
            setError("Could not load categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSaving(true);
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) throw new Error("Failed to create");

            const newCat = await res.json();

            // soft add to list
            setCategories((prev) => [newCat, ...prev]);
            setName("");
            toast.success("Category created ✅");
        } catch (e) {
            console.error(e);
            toast.error("Failed to create category ❌");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id) => {
        toast(
            ({ closeToast }) => (
                <div style={{ padding: "6px" }}>
                    <strong>Delete this category?</strong>
                    <p style={{ margin: "6px 0 12px" }}>
                        Tasks already using it will still keep the text value.
                    </p>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 8,
                        }}
                    >
                        <button
                            onClick={closeToast}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                border: "1px solid #d4d4d8",
                                background: "#f4f4f5",
                                cursor: "pointer",
                                fontSize: 13,
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch(
                                        `/api/categories/${id}`,
                                        { method: "DELETE" }
                                    );
                                    if (!res.ok)
                                        throw new Error("Delete failed");

                                    setCategories((prev) =>
                                        prev.filter((c) => c.id !== id)
                                    );
                                    toast.success(
                                        "Category deleted successfully 🗑️"
                                    );
                                } catch (err) {
                                    console.error(err);
                                    toast.error(
                                        "Failed to delete category ❌"
                                    );
                                } finally {
                                    closeToast();
                                }
                            }}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                border: "none",
                                background: "#ef4444",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: 13,
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ),
            {
                closeOnClick: false,
                autoClose: false,
                position: "top-center",
                style: { width: "310px", borderRadius: "12px" },
            }
        );
    };

    return (
        <AppShell>
            <div
                style={{
                    maxWidth: 800,
                    margin: "24px auto",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 18,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: 28,
                            }}
                        >
                            Create Category
                        </h1>
                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: 13,
                                color: "var(--text-muted)",
                            }}
                        >
                            Define reusable categories to organize your tasks.
                        </p>
                    </div>
                </div>

                {/* Create form */}
                <div
                    className="card"
                    style={{
                        marginBottom: 20,
                        padding: 20,
                        borderRadius: 16,
                    }}
                >
                    <form
                        onSubmit={handleCreate}
                        style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                        }}
                    >
                        <input
                            className="common-input"
                            placeholder="Category name (e.g. Work, Study)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{  flex: 1,
                height: 40,            // ⬅ same as button
                borderRadius: 9999,    // ⬅ pill shape, same as button
                fontSize: 14,
                padding: "0 16px",
                border: "1px solid #e2e8f0",
                outline: "none", }}
                        />
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                height: 40,
                                padding: "0 20px",
                                borderRadius: 9999,
                                border: "none",
                                background: "#22c55e",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: 14,
                                boxShadow:
                                    "0 12px 30px rgba(34,197,94,0.35)",
                            }}
                        >
                            {saving ? "Saving..." : "Add Category"}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div
                    className="card"
                    style={{
                        padding: 20,
                        borderRadius: 16,
                    }}
                >
                    <h2
                        style={{
                            marginTop: 0,
                            marginBottom: 12,
                            fontSize: 16,
                        }}
                    >
                        Category List
                    </h2>

                    {loading ? (
                        <p style={{ fontSize: 13 }}>Loading categories…</p>
                    ) : error ? (
                        <p
                            style={{
                                fontSize: 13,
                                color: "var(--danger)",
                            }}
                        >
                            {error}
                        </p>
                    ) : categories.length === 0 ? (
                        <p style={{ fontSize: 13 }}>
                            No categories yet. Create your first one above.
                        </p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 40 }}>#</th>
                                        <th>Name</th>
                                        <th style={{ width: 140 }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat, idx) => (
                                        <tr key={cat.id}>
                                            <td>{idx + 1}</td>
                                            <td>{cat.name}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(cat.id)
                                                    }
                                                    style={{
                                                        background:
                                                            "#fee2e2",
                                                        color: "#b91c1c",
                                                        padding:
                                                            "6px 14px",
                                                        borderRadius: 9999,
                                                        border: "none",
                                                        fontSize: 13,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
