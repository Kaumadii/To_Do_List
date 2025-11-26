<?php

namespace App\Console\Commands;

use App\Mail\TaskDueReminderMail;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTaskDueReminders extends Command
{
    protected $signature = 'tasks:send-due-reminders';
    protected $description = 'Send email reminders for tasks that are due tomorrow';

    public function handle()
    {
        $tomorrow = Carbon::tomorrow()->toDateString();

        $tasks = Task::whereDate('due_date', $tomorrow)
            ->where('status', '!=', 'done')
            ->with('user')
            ->get();

        if ($tasks->isEmpty()) {
            $this->info('No tasks due tomorrow.');
            return 0;
        }

        foreach ($tasks as $task) {
            if (!$task->user || !$task->user->email) {
                continue;
            }

            Mail::to($task->user->email)->send(new TaskDueReminderMail($task));

            $this->info("Reminder sent for task #{$task->id} to {$task->user->email}");
        }

        return 0;
    }
}
