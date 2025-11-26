@component('mail::message')
# Task Due Tomorrow

Hi {{ $task->user->name ?? 'there' }},

This is a friendly reminder that the following task is due **tomorrow**:

**Title:** {{ $task->title }}

@isset($task->description)
**Description:**  
{{ $task->description }}
@endisset

**Category:** {{ $task->category ?? 'N/A' }}  
**Due date:** {{ \Carbon\Carbon::parse($task->due_date)->toFormattedDateString() }}

@component('mail::button', ['url' => config('app.url')])
Open My To-Do List
@endcomponent

Thanks,  
{{ config('app.name') }}
@endcomponent
