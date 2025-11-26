import React, { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { toast } from "react-toastify";

export default function DeletedPage() {
    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    const load = () => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("per_page", 5);
        if (search) params.set("search", search);

        fetch(`/api/tasks/deleted?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                setTasks(data.data || []);
                setMeta({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    total: data.total,
                });
            });
    };

    useEffect(() => {
        load();
    }, [page]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        load();
    };

    const restore = async (id) => {
    try {
        const res = await fetch(`/api/tasks/${id}/restore`, {
            method: "POST",
        });

        if (!res.ok) {
            throw new Error("Failed to restore");
        }

        await load();

        // ✅ Toast success
        toast.success("Task restored successfully ✅");
    } catch (err) {
        console.error(err);
        // ✅ Toast error
        toast.error("Failed to restore task ❌");
    }
};

  const forceDelete = (taskId) => {
    toast(
        ({ closeToast }) => (
            <div style={{ padding: "8px" }}>
                <strong>Permanently delete this task?</strong>
                <p style={{ margin: "6px 0 14px" }}>
                    This action <b>cannot be undone</b>.
                </p>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                    }}
                >
                    {/* Cancel */}
                    <button
                        onClick={closeToast}
                        style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            border: "1px solid #ccc",
                            background: "#f3f4f6",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>

                    {/* Confirm Delete */}
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch(
                                    `/api/tasks/${taskId}/force`,
                                    { method: "DELETE" }
                                );

                                if (!res.ok) throw new Error("Delete failed");

                                toast.success("Task permanently deleted 🗑️");
                                load(); // reload list
                            } catch (error) {
                                toast.error("Failed to permanently delete ❌");
                            }

                            closeToast();
                        }}
                        style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            color: "#fff",
                            background: "#dc2626",
                            border: "none",
                            cursor: "pointer",
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
            style: {
                width: "320px",
                borderRadius: "14px",
            },
        }
    );
};



    return (
        <AppShell>
            <div className="card">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                    }}
                >
                    <div>
                        <h3 style={{ margin: 0 }}>Deleted Items</h3>
                        <p
                            style={{
                                marginTop: 4,
                                fontSize: 13,
                                color: "var(--text-muted)",
                            }}
                        >
                            Tasks in your recycle bin. Restore or remove forever.
                        </p>
                    </div>
                    <span className="chip">{meta.total} deleted</span>
                </div>

                <form
                    onSubmit={handleSearchSubmit}
                    style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 12,
                    }}
                >
                    <input
                        className="input"
                        style={{ maxWidth: 280 }}
                        placeholder="Search deleted tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="btn btn-outline btn-sm" type="submit"
                    style={{height: "36px",
            width: "110px",
            borderRadius: "9999px",
            fontSize: "14px",
            background: "transparent",
            border: "1px solid #cbd5e1",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",}}>
                        Search
                    </button>
                </form>

                <div style={{ overflowX: "auto" }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: "5%" }}>#</th>
                                <th style={{ width: "30%" }}>Title</th>
                                <th>Description</th>
                                <th style={{ width: "20%" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task, idx) => (
                                <tr key={task.id}>
                                    <td>
                                        {idx + 1 + (meta.current_page - 1) * 5}
                                    </td>
                                    <td>{task.title}</td>
                                    <td>{task.description}</td>
                                    <td>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 6,
                                            }}
                                        >
                                            <button
                                                className="btn btn-outline btn-sm"
                                                type="button"
                                                onClick={() => restore(task.id)}
                                            >
                                                Restore
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                type="button"
                                                onClick={() => forceDelete(task.id)}
                                            >
                                                Delete forever
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {tasks.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ fontSize: 13 }}>
                                        No deleted tasks.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span style={{ fontSize: 12 }}>
                        Page {meta.current_page} of {meta.last_page}
                    </span>
                    <button
                        disabled={meta.current_page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Prev
                    </button>
                    <button
                        disabled={meta.current_page >= meta.last_page}
                        onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                    >
                        Next
                    </button>
                </div>
            </div>
        </AppShell>
    );
}
