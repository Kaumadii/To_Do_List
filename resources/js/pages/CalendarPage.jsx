import React, { useEffect, useState, useMemo } from "react";
import AppShell from "../components/AppShell";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 1) Load ALL tasks (not just 5) for the calendar
    const loadTasks = async () => {
    try {
        setLoading(true);
        setError("");

        // get up to 1000 tasks in one go
        const res = await fetch("/api/tasks?per_page=1000");

        if (!res.ok) throw new Error("Failed to load tasks");

        const json = await res.json();

        // Handle both:
        //  - plain array  => json
        //  - paginated    => json.data
        const items = Array.isArray(json) ? json : json.data || [];

        console.log("Calendar tasks from API:", items); // 👈 debug
        setTasks(items);
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

    // 2) Convert tasks → FullCalendar events
   const events = useMemo(
    () =>
        tasks
            .filter((t) => t.due_date) // only tasks with a due date
            .map((t) => {
                let bg = "#e5e7eb"; // default grey
                if (t.status === "pending") bg = "#facc15";     // yellow
                if (t.status === "processing") bg = "#60a5fa"; // blue
                if (t.status === "done") bg = "#4ade80";       // green

                return {
                    id: t.id,
                    title: t.title || "Untitled task",
                    start: t.due_date,   // ✅ FullCalendar expects "start"
                    allDay: true,
                    backgroundColor: bg,
                    borderColor: bg,
                };
            }),
    [tasks]
);

console.log("Calendar events:", events);


    return (
        <AppShell>
            <div className="app-shell">
                {/* Header */}
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
                        <h1 style={{ margin: 0, fontSize: 32 }}>Task Calendar</h1>
                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: 14,
                                color: "var(--text-muted)",
                            }}
                        >
                            View all tasks on a monthly calendar (based on{" "}
                            <strong>due date</strong>).
                        </p>
                    </div>
                </div>

                {/* Error message */}
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

                {/* Calendar card */}
                <div className="card" style={{ padding: 20 }}>
                    {loading ? (
                        <p style={{ fontSize: 14 }}>Loading calendar...</p>
                    ) : (
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            height="auto"
                            events={events}
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,dayGridWeek,dayGridDay",
                            }}
                            eventDisplay="block"
                            eventClick={(info) => {
                                // simple helper when clicking event
                                alert(
                                    `${info.event.title}\nStatus: ${
                                        tasks.find((t) => t.id == info.event.id)
                                            ?.status || "unknown"
                                    }`
                                );
                            }}
                        />
                    )}
                </div>
            </div>
        </AppShell>
    );
}
