import React, { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";



const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "done", label: "Done" },
];

const STATUS_COLORS = {
    pending: "#facc15",
    processing: "#38bdf8",
    done: "#22c55e",
};

function buildStatusData(tasks) {
    const pending = tasks.filter((t) => t.status === "pending").length;
    const processing = tasks.filter((t) => t.status === "processing").length;
    const done = tasks.filter((t) => t.status === "done").length;

    return [
        { name: "Pending", value: pending, key: "pending" },
        { name: "Processing", value: processing, key: "processing" },
        { name: "Done", value: done, key: "done" },
    ].filter((item) => item.value > 0);
}

function buildDateData(tasks) {
    const map = {};

    tasks.forEach((t) => {
        let key = t.due_date;
        if (!key && t.created_at) {
            key = t.created_at.slice(0, 10);
        }
        if (!key) return;

        if (!map[key]) map[key] = 0;
        map[key] += 1;
    });

    return Object.entries(map)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count }));
}

export default function DashboardPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    category: "",       // 👈 new
    due_date: "",
    attachment: null,       // 👈 new
});

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const statusData = buildStatusData(tasks);
    const dateData = buildDateData(tasks);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/tasks/latest");
            if (!res.ok) throw new Error("Failed to load tasks");
            const data = await res.json();
            setTasks(data);
        } catch (e) {
            console.error(e);
            setError("Could not load tasks.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    setSaving(true);
    setError("");

    try {
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("description", form.description || "");
        fd.append("status", "pending");
        fd.append("category", form.category || "");
        fd.append("due_date", form.due_date || "");

        if (form.attachment) {
            fd.append("attachment", form.attachment);
        }

        const res = await fetch("/api/tasks", {
            method: "POST",
            body: fd, // 👈 no Content-Type header; browser sets multipart/form-data
        });

        if (!res.ok) {
            throw new Error("Failed to add task");
        }

        await loadTasks();

        setForm({
            title: "",
            description: "",
            status: "pending",
            category: "",
            due_date: "",
            attachment: null,
        });

        toast.success("Task added successfully 🎉");
    } catch (err) {
        console.error(err);
        setError("Could not add task.");
        toast.error("Failed to add task ❌");
    } finally {
        setSaving(false);
    }
};

    const handleStatusChange = async (task, newStatus) => {
    const previousStatus = task.status;

    // 👇 update UI immediately
    setTasks((prev) =>
        prev.map((t) =>
            t.id === task.id ? { ...t, status: newStatus } : t
        )
    );

    try {
        const res = await fetch(`/api/tasks/${task.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: task.title,
                description: task.description || "",
                status: newStatus,
            }),
        });

        if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
        console.error(err);
        setError("Could not update task.");

        // 👇 revert change if API fails
        setTasks((prev) =>
            prev.map((t) =>
                t.id === task.id ? { ...t, status: previousStatus } : t
            )
        );
    }
};


   const handleDelete = (taskId) => {
    toast(
        ({ closeToast }) => (
            <div style={{ padding: "6px" }}>
                <strong>Delete this task?</strong>
                <p style={{ margin: "6px 0 12px" }}>This action cannot be undone.</p>

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
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

                                if (!res.ok) throw new Error("Delete failed");

                                // ⬇️ SOFT DELETE - remove task from current list
                                setTasks((prev) =>
                                    prev.filter((t) => t.id !== taskId)
                                );

                                toast.success("Task deleted successfully 🚮");
                            } catch (e) {
                                toast.error("Failed to delete task ❌");
                            }

                            closeToast();
                        }}
                        style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            color: "#fff",
                            background: "#ef4444",
                            cursor: "pointer",
                            border: "none",
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
const [categories, setCategories] = useState([]);

const loadCategories = async () => {
    const res = await fetch("/api/categories");
    if (res.ok) {
        const data = await res.json();
        setCategories(data);
    }
};

useEffect(() => {
    loadCategories();
    loadTasks();   // already exists
}, []);

    const statusChipStyle = (status) => {
    const base = {
        padding: "4px 10px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",    // 👈 CENTER THE TEXT!
        width: "90px",                // 👈 consistent badge width
        textAlign: "center",          // 👈 ensures text centered
    };

    switch (status) {
        case "processing":
            return { ...base, backgroundColor: "#e0f2fe", color: "#0369a1" };
        case "done":
            return { ...base, backgroundColor: "#dcfce7", color: "#15803d" };
        default:
            return { ...base, backgroundColor: "#fef9c3", color: "#854d0e" };
    }
};

    return (
        <AppShell>
            <div className="app-shell">
                {/* Page title row */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                        marginTop: 8,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: 42,
                            }}
                        >
                            Task Dashboard
                        </h1>
                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: 18,
                                color: "var(--text-muted)",
                            }}
                        >
                            Track pending, processing, and done tasks after signing in.
                        </p>
                    </div>
                </div>
{/* Analytics section: Pie + Bar charts */}
<div
    className="card"
    style={{
        marginTop: 24,
        padding: 20,
        borderRadius: 18,
        boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
        background: "var(--card-bg, #0f172a0d)",
    }}
>
    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
        }}
    >
        <div>
            <h2
                style={{
                    margin: 0,
                    fontSize: 20,
                }}
            >
                Task Insights
            </h2>
            <p
                style={{
                    margin: "4px 0 0",
                    fontSize: 12,
                    color: "var(--text-muted)",
                }}
            >
                Overview of your task statuses and workload by date.
            </p>
        </div>
    </div>

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 24,
        }}
    >
        {/* Pie Chart – Status distribution */}
        <div>
            <h3
                style={{
                    margin: "0 0 8px",
                    fontSize: 14,
                    fontWeight: 600,
                }}
            >
                Status distribution
            </h3>
            {statusData.length === 0 ? (
                <p style={{ fontSize: 12 }}>No tasks to display.</p>
            ) : (
                <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={entry.key}
                                        fill={STATUS_COLORS[entry.key]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend
                                verticalAlign="bottom"
                                height={32}
                                iconSize={10}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>

        {/* Bar Chart – Tasks per date */}
        <div>
            <h3
                style={{
                    margin: "0 0 8px",
                    fontSize: 14,
                    fontWeight: 600,
                }}
            >
                Tasks per date
            </h3>
            {dateData.length === 0 ? (
                <p style={{ fontSize: 12 }}>No dated tasks to display.</p>
            ) : (
                <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                        <BarChart data={dateData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="date" fontSize={11} />
                            <YAxis allowDecimals={false} fontSize={11} />
                            <Tooltip />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#6366f1" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    </div>
</div>

                {/* Add Task bar – SAME ROW layout (Title | Description | Add) */}
                <div className="card" style={{ marginBottom: 32 }}>
                    <div
                        style={{
                            fontWeight: 600,
                            marginBottom: 12,
                            fontSize: 20,
                        }}
                    >
                        Add Task
                    </div>

                    <form
    onSubmit={handleAddTask}
    style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 16,
        alignItems: "center",
    }}
>
    {/* Left side – two rows of inputs */}
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Row 1: Title + Description */}
        <div
            style={{
                display: "flex",
                gap: 12,
                width: "100%",
            }}
        >
            <input
                className="input"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                required
                style={{ flex: 1 }}
            />

            <input
                className="input"
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                style={{ flex: 1 }}
            />
        </div>

        {/* Row 2: Category + Due date + Attachment */}
<div
    style={{
        display: "flex",
        gap: 12,
        width: "100%",
    }}
>

    {/* Category select */}
    <select
        className="input"
        name="category"
        value={form.category}
        onChange={handleChange}
        style={{ flex: 1 }}
    >
        <option value="">Select Category</option>
        {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
                {cat.name}
            </option>
        ))}
    </select>

    {/* Due date */}
    <input
        type="date"
        className="input"
        name="due_date"
        value={form.due_date}
        onChange={handleChange}
        style={{ flex: 1 }}
    />

    {/* Attachment input (styled like other inputs) */}
<div
    style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        border: "1px solid #d1d5db",
        borderRadius: "18px",
        padding: "0 12px",
        background: "#fff",
        height: "38px",
    }}
>
    <span style={{ fontSize: 14, color: "#0c0d0dff", flex: 1 }}>
        Attachment
    </span>

    <input
        type="file"
        name="attachment"
        onChange={(e) =>
            setForm((f) => ({ ...f, attachment: e.target.files[0] }))
        }
        style={{
            fontSize: 12,
            flex: 1,
            opacity: 0,        // hides raw file input
            cursor: "pointer",
            position: "absolute",
            height: "38px",
        }}
    />
</div>

</div>
    </div>
                        {/* Add Button */}
                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: "10px 22px",
                                whiteSpace: "nowrap",
                                fontSize: 14,
                            }}
                        >
                            {saving ? "Adding..." : "Add"}
                        </button>
                    </form>
                </div>

                {/* Your Tasks list (latest 5) */}
<div className="card">
    {/* Header */}
    <div
        style={{
            marginBottom: 12,
        }}
    >
        <div
            style={{
                fontWeight: 600,
                marginBottom: 4,
                fontSize: 20,
            }}
        >
            Your Tasks
        </div>
        <p
            style={{
                margin: 0,
                fontSize: 13,
                color: "var(--text-muted)",
            }}
        >
            Showing your latest 5 tasks.
        </p>
    </div>

    {error && (
        <div
            style={{
                marginBottom: 10,
                fontSize: 13,
                color: "var(--danger)",
            }}
        >
            {error}
        </div>
    )}

    {loading ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Loading tasks…
        </p>
    ) : tasks.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            No tasks yet. Start by adding a new task above.
        </p>
    ) : (
        <>
           {/* Task list */}
<div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
    {tasks.map((task) => {
        const status = task.status || "pending"; // safe default

        return (
            <div
                key={task.id}
                style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(148,163,184,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                }}
            >
                {/* Row 1: Title + Status dropdown */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    {/* Title – show DB title, no 'Untitled task' logic */}
                    <div
                        style={{
                            fontSize: 14,
                            fontWeight: 500,
                        }}
                    >
                        {task.title || "New task"}
                    </div>

                    {/* Status dropdown */}
                    <select
                        value={status}
                        onChange={(e) =>
                            handleStatusChange(task, e.target.value)
                        }
                        style={{
                            width: "120px",
                            height: "36px",
                            borderRadius: "9999px",
                            fontSize: "14px",
                            paddingLeft: "10px",
                            cursor: "pointer",
                        }}
                    >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="done">Done</option>
                    </select>
                </div>
{/* Row 2: Status + extra chips + Delete */}
<div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
    }}
>
    {/* Left side: chips */}
    <div
        style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            fontSize: 12,
            alignItems: "center",
        }}
    >
        {/* Status chip */}
        <span
            className="badge"
            style={statusChipStyle(status)}
        >
            {status.toUpperCase()}
        </span>

        {/* Category chip */}
        {task.category && (
            <span
                style={{
                    padding: "4px 10px",
                    borderRadius: 9999,
                    background: "#e0f2fe",
                    color: "#0369a1",
                    fontWeight: 500,
                }}
            >
                {task.category}
            </span>
        )}

        {/* Due date chip */}
        <span
            style={{
                padding: "4px 10px",
                borderRadius: 9999,
                background: "#f1f5f9",
                color: "#0f172a",
                fontWeight: 500,
            }}
        >
            {getDueLabel(task.due_date)}
        </span>
    </div>

    {/* Right side: Delete */}
    <button
        className="btn btn-danger btn-sm"
        type="button"
        onClick={() => handleDelete(task.id)}
        style={{
            width: "120px",
            height: "36px",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
        }}
    >
        Delete
    </button>
</div>

            </div>
        );
    })}
</div>

            {/* VIEW MORE BUTTON AT BOTTOM CENTER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 10,
                }}
            >
                <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{
                        fontSize: 12,
                        padding: "6px 14px",
                    }}
                    onClick={() => navigate("/tasks")}
                >
                    View more →
                </button>
            </div>

        </>
    )}
</div>
                
                </div>
        </AppShell>
    );
}
