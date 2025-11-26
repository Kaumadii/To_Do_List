<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    // GET /api/tasks?search=&status=&page=&per_page=
    public function index(Request $request)
    {
        $query = Task::query();

        // filter by logged-in user (optional but nice)
        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        if ($category = $request->get('category')) {
    if ($category !== 'all') {
        $query->where('category', $category);
    }
}

        $perPage = (int) $request->get('per_page', 5);

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    // GET /api/tasks/latest
    public function latest()
    {
        $query = Task::query();

        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        }

        return $query->orderByDesc('created_at')->limit(5)->get();
    }

    // POST /api/tasks
    public function store(Request $request)
{
    $data = $request->validate([
        'title'       => ['required', 'string', 'max:255'],
        'description' => ['nullable', 'string'],
        'status'      => ['nullable', 'string'],
        'category'    => ['nullable', 'string', 'max:100'],
        'due_date'    => ['nullable', 'date'],
        'attachment'  => ['nullable', 'file', 'max:2048'], // 2 MB
    ]);

    $task = new Task();
    $task->user_id     = $request->user()->id ?? null; // or your existing user logic
    $task->title       = $data['title'];
    $task->description = $data['description'] ?? null;
    $task->status      = $data['status'] ?? 'pending';
    $task->category    = $data['category'] ?? null;
    $task->due_date    = $data['due_date'] ?? null;

    // handle attachment
    if ($request->hasFile('attachment')) {
        $file = $request->file('attachment');
        $path = $file->store('attachments', 'public'); // storage/app/public/attachments
        $task->attachment_path = $path;
        $task->attachment_name = $file->getClientOriginalName();
    }

    $task->save();

    return response()->json($task, 201);
}


    // PUT /api/tasks/{task}
    public function update(Request $request, Task $task)
{
    $data = $request->validate([
        'title'       => ['required', 'string', 'max:255'],
        'description' => ['nullable', 'string'],
        'status'      => ['nullable', 'string'],
        'category'    => ['nullable', 'string', 'max:100'],
        'due_date'    => ['nullable', 'date'],
        'attachment'  => ['nullable', 'file', 'max:2048'],
    ]);

    $task->title       = $data['title'];
    $task->description = $data['description'] ?? null;
    $task->status      = $data['status'] ?? $task->status;
    $task->category    = $data['category'] ?? $task->category;
    $task->due_date    = $data['due_date'] ?? $task->due_date;

    if ($request->hasFile('attachment')) {
        $file = $request->file('attachment');
        $path = $file->store('attachments', 'public');
        $task->attachment_path = $path;
        $task->attachment_name = $file->getClientOriginalName();
    }

    $task->save();

    return response()->json($task);
}


    // DELETE /api/tasks/{task}  (soft delete)
    public function destroy(Task $task)
    {
        $task->delete();

        return response()->json(['message' => 'Deleted']);
    }

    // GET /api/tasks/deleted
    public function deleted(Request $request)
    {
        $query = Task::onlyTrashed();

        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        }

        $perPage = (int) $request->get('per_page', 5);

        return $query->orderByDesc('deleted_at')->paginate($perPage);
    }

    // POST /api/tasks/{id}/restore
    public function restore($id)
    {
        $task = Task::onlyTrashed()->findOrFail($id);
        $task->restore();

        return response()->json(['message' => 'Restored']);
    }

    // DELETE /api/tasks/{id}/force
    public function forceDelete($id)
    {
        $task = Task::onlyTrashed()->findOrFail($id);
        $task->forceDelete();

        return response()->json(['message' => 'Permanently deleted']);
    }
    
}

