<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Todo App</title>

    {{-- Direct Vite dev server script (no @vite directive needed) --}}
    <script type="module" src="http://localhost:5173/resources/js/app.jsx"></script>

    <style>
        :root {
            --bg-light: #f3f4f6;
            --bg-card: #ffffff;
            --bg-dark: #020617;
            --bg-card-dark: #0f172a;
            --text-light: #111827;
            --text-muted: #6b7280;
            --primary: #4f46e5;
            --primary-soft: #eef2ff;
            --danger: #ef4444;
            --success: #22c55e;
        }
        body {
            margin: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background-color: var(--bg-light);
        }
        .app-root {
            min-height: 100vh;
        }
        .app-root.dark {
            background-color: var(--bg-dark);
            color: #e5e7eb;
        }
        .app-shell {
            max-width: 1100px;
            margin: 0 auto;
            padding: 24px 16px 40px;
        }
        .card {
            background-color: var(--bg-card);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 20px 25px -20px rgba(15,23,42,0.4);
        }
        .dark .card {
            background-color: var(--bg-card-dark);
        }
        .btn {
            border-radius: 999px;
            padding: 8px 16px;
            border: none;
            cursor: pointer;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .btn-primary {
            background: linear-gradient(135deg, #4f46e5, #6366f1);
            color: #fff;
        }
        .btn-outline {
            background: transparent;
            border: 1px solid #4b5563;
            color: inherit;
        }
        .btn-danger {
            background: #fee2e2;
            color: #b91c1c;
        }
        .dark .btn-danger {
            background: #7f1d1d;
            color: #fee2e2;
        }
        .btn-sm {
            padding: 4px 10px;
            font-size: 12px;
        }
        .input, .select, .textarea {
            width: 100%;
            border-radius: 999px;
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            font-size: 14px;
            outline: none;
        }
        .textarea {
            border-radius: 12px;
            min-height: 70px;
            resize: vertical;
        }
        .dark .input, .dark .select, .dark .textarea {
            background: #020617;
            border-color: #1f2937;
            color: #e5e7eb;
        }
        .badge {
            border-radius: 999px;
            padding: 2px 10px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .badge-pending {
            background-color: #fef9c3;
            color: #854d0e;
        }
        .badge-processing {
            background-color: #e0f2fe;
            color: #0369a1;
        }
        .badge-done {
            background-color: #dcfce7;
            color: #15803d;
        }
        .dark .badge-pending {
            background-color: #78350f;
            color: #fef9c3;
        }
        .dark .badge-processing {
            background-color: #082f49;
            color: #e0f2fe;
        }
        .dark .badge-done {
            background-color: #052e16;
            color: #bbf7d0;
        }
        .nav-link {
            font-size: 14px;
            padding: 8px 12px;
            border-radius: 999px;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
        }
        .nav-link-active {
            background-color: var(--primary-soft);
            color: var(--primary);
        }
        .dark .nav-link-active {
            background-color: rgba(79,70,229,0.25);
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        .table th, .table td {
            padding: 8px 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .dark .table th, .dark .table td {
            border-color: #111827;
        }
        .table th {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--text-muted);
        }
        .pagination {
            display: flex;
            gap: 8px;
            align-items: center;
            justify-content: flex-end;
            margin-top: 12px;
        }
        .pagination button {
            border-radius: 999px;
            border: 1px solid #d1d5db;
            background: transparent;
            padding: 4px 10px;
            cursor: pointer;
            font-size: 12px;
        }
        .dark .pagination button {
            border-color: #374151;
            color: #e5e7eb;
        }
        .chip {
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 999px;
            background-color: #e5e7eb;
        }
        .dark .chip {
            background-color: #111827;
        }
    </style>
</head>
<body>
    <div id="app"></div>
</body>
</html>


