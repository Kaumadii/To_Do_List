<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'category',      // 👈
        'due_date',
        'attachment_path',
        'attachment_name',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
