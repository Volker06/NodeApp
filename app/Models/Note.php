<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'content',
        'is_pinned',
        'pinned_at',
        'password',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'pinned_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function labels()
{
    return $this->belongsToMany(Label::class, 'note_label');
}
public function shares()
{
    return $this->hasMany(NoteShare::class);
}

public function sharedWith()
{
    return $this->hasMany(NoteShare::class)->with('recipient');
}
public function images()
{
    return $this->hasMany(NoteImage::class);
}
}