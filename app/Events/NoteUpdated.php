<?php

namespace App\Events;

use App\Models\Note;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NoteUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Note $note,
        public int $editorId,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('note.' . $this->note->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'note_id' => $this->note->id,
            'title'   => $this->note->title,
            'content' => $this->note->content,
            'editor_id' => $this->editorId,
        ];
    }

    public function broadcastAs(): string
    {
        return 'note.updated';
    }
}