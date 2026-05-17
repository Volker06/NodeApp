<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NoteShare extends Model
{
    protected $fillable = ['note_id', 'owner_id', 'recipient_id', 'permission', 'is_seen'];

    public function note()
    {
        return $this->belongsTo(Note::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }
}
