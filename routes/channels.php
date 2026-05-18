<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('note.{noteId}', function ($user, $noteId) {
    // Kiểm tra user có quyền xem note này không
    // (là chủ sở hữu hoặc được chia sẻ)
    $note = \App\Models\Note::find($noteId);
    
    if (!$note) return false;
    
    // Là chủ note
    if ($note->user_id === $user->id) {
        return ['id' => $user->id, 'name' => $user->name];
    }
    
    // Được chia sẻ note
    $share = \App\Models\NoteShare::where('note_id', $noteId)
        ->where('recipient_id', $user->id)
        ->first();
        
    if ($share) {
        return ['id' => $user->id, 'name' => $user->name];
    }
    
    return false;
});