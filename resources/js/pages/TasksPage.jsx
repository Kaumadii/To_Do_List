import React, { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import { toast } from "react-toastify";

const getDueLabel = (dueDateStr) => {
    if (!dueDateStr) return "No due date";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffMs = due.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return `${diffDays} days more`;
    if (diffDays === 1) return "1 day more";
    if (diffDays === 0) return "Due today";
    if (diffDays === -1) return "Expired 1 day ago";
    return `Expired ${Math.abs(diffDays)} days ago`;
};

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState(""); // 👈 NEW
    const [categories, setCategories] = useState([]); 
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        status: "pending",
    }); 
     

    const load = () => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("per_page", 5);
        if (search) params.set("search", search);
        if (statusFilter) params.set("status", statusFilter);
        if (categoryFilter) params.set("category", categoryFilter); 

        if (categoryFilter) params.set("category", categoryFilter);

        fetch(`/api/tasks?${params.toString()}`)
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

        // 👇 Load category list for the filter dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                if (!res.ok) throw new Error("Failed to load categories");
                const data = await res.json();
                setCategories(data);   // expects an array [{id, name}, ...]
            } catch (err) {
                console.error(err);
                // optional: toast.error("Could not load categories");
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        load();
    }, [page, statusFilter, categoryFilter]);

    const loadCategories = () => {
    fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
            setCategories(data || []);
        })
        .catch((err) => {
            console.error("Failed to load categories", err);
        });
};
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        load();
    };

    const startEdit = (task) => {
        setEditingId(task.id);
        setEditForm({
            title: task.title,
            description: task.description || "",
            status: task.status,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async (id) => {
        const res = await fetch(`/api/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editForm),
        });
        if (!res.ok) return;
        setEditingId(null);
        load();
    };

    const handleDelete = (taskId) => {
    toast(
        ({ closeToast }) => (
            <div style={{ padding: "8px" }}>
                <strong>Delete this task?</strong>
                <p style={{ margin: "6px 0 14px" }}>
                    This action cannot be undone.
                </p>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                    }}
                >
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

                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch(`/api/tasks/${taskId}`, {
                                    method: "DELETE",
                                });

                                if (!res.ok) throw new Error("Failed");

                                toast.success("Task deleted successfully 🚮");
                                load(); // reload table
                            } catch (error) {
                                toast.error("Failed to delete task ❌");
                            }

                            closeToast();
                        }}
                        style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            background: "#ef4444",
                            color: "#fff",
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
            style: { width: "300px", borderRadius: "12px" },
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
                        <h3 style={{ margin: 0 }}>Task Table</h3>
                        <p
                            style={{
                                marginTop: 4,
                                fontSize: 15,
                                color: "var(--text-muted)",
                            }}
                        >
                            View, search, edit, and manage your tasks.
                        </p>
                    </div>
                    <span className="chip">{meta.total} total</span>
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
        placeholder="Search by title or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
    />

    {/* Status filter */}
    <select
        className="select"
        style={{ maxWidth: 160 }}
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
    >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="done">Done</option>
    </select>

    {/* 👇 NEW Category filter */}
    <select
        className="select"
        style={{ maxWidth: 180 }}
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
    >
        <option value="">All categories</option>
        {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
                {cat.name}
            </option>
        ))}
    </select>

    <button
        className="btn btn-outline btn-sm"
        type="submit"
        style={{
            height: "36px",
            width: "110px",
            borderRadius: "9999px",
            fontSize: "14px",
            background: "transparent",
            border: "1px solid #cbd5e1",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
        }}
    >
        Search
    </button>
</form>

                <div style={{ overflowX: "auto" }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: "5%" }}>#</th>
                                <th style={{ width: "25%" }}>Title</th>
                                <th>Description</th>
                                <th>Category</th>    {/* 👈 new */}
                                <th>Due</th>
                                <th>Attachment</th>
                                <th style={{ width: "15%" }}>Status</th>
                                <th style={{ width: "15%" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
    {tasks.map((task, idx) => {
        const isEditing = editingId === task.id;

        return (
            <tr key={task.id}>
                {/* # */}
                <td>
                    {idx + 1 + (meta.current_page - 1) * 5}
                </td>

                {/* Title */}
                <td>
                    {isEditing ? (
                        <input
                            className="input"
                            value={editForm.title}
                            onChange={(e) =>
                                setEditForm((f) => ({
                                    ...f,
                                    title: e.target.value,
                                }))
                            }
                        />
                    ) : (
                        task.title
                    )}
                </td>

                {/* Description */}
                <td>
                    {isEditing ? (
                        <textarea
                            className="textarea"
                            value={editForm.description}
                            onChange={(e) =>
                                setEditForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                }))
                            }
                        />
                    ) : (
                        task.description
                    )}
                </td>

                {/* Category */}
                <td>
                    {isEditing ? (
                        <select
                            className="select"
                            value={editForm.category ?? ""}
                            onChange={(e) =>
                                setEditForm((f) => ({
                                    ...f,
                                    category: e.target.value,
                                }))
                            }
                        >
                            <option value="">Select category</option>
                            <option value="Study">Study</option>
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Personal">Personal</option>
                        </select>
                    ) : (
                        task.category || "-"
                    )}
                </td>

                {/* Due date / expire label */}
                <td>
                    {isEditing ? (
                        <input
                            type="date"
                            className="input"
                            value={editForm.due_date || ""}
                            onChange={(e) =>
                                setEditForm((f) => ({
                                    ...f,
                                    due_date: e.target.value,
                                }))
                            }
                        />
                    ) : (
                        <span>{getDueLabel(task.due_date)}</span>
                    )}
                </td>
                <td>

    {task.attachment_path ? (
        <a
            href={`/storage/${task.attachment_path}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, color: "#2563eb" }}
        >
            View
        </a>
    ) : (
        <span style={{ fontSize: 12, color: "#9ca3af" }}>None</span>
    )}
</td>


                {/* Status */}
                <td>
                    {isEditing ? (
                        <select
                            className="select"
                            value={editForm.status}
                            onChange={(e) =>
                                setEditForm((f) => ({
                                    ...f,
                                    status: e.target.value,
                                }))
                            }
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="done">Done</option>
                        </select>
                    ) : (
                        <StatusBadge status={task.status} />
                    )}
                </td>

                {/* Actions */}
                <td>
                    {isEditing ? (
                        <div
                            style={{
                                display: "flex",
                                gap: 6,
                            }}
                        >
                            <button
                                className="btn btn-primary btn-sm"
                                type="button"
                                onClick={() => saveEdit(task.id)}
                            >
                                Save
                            </button>
                            <button
                                className="btn btn-outline btn-sm"
                                type="button"
                                onClick={cancelEdit}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                gap: 6,
                            }}
                        >
                            <button
                                className="btn btn-outline btn-sm"
                                type="button"
                                onClick={() => startEdit(task)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                type="button"
                                onClick={() => handleDelete(task.id)}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </td>
            </tr>
        );
    })}

    {tasks.length === 0 && (
        <tr>
            {/* 7 columns now: #, Title, Description, Category, Due, Status, Actions */}
            <td colSpan="7" style={{ fontSize: 13 }}>
                No tasks found.
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
