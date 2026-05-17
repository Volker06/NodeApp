<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\NoteShare;
use App\Models\User;
use Illuminate\Http\Request;

class ShareController extends Controller
{
    public function share(Request $request, $noteId)
    {
        $request->validate([
            'email' => 'required|email',
            'permission' => 'required|in:read,edit',
        ]);

        $recipient = User::where('email', $request->email)->first();
        if (!$recipient) {
            return response()->json(['message' => 'Email không tồn tại trong hệ thống'], 404);
        }

        if ($recipient->id === $request->user()->id) {
            return response()->json(['message' => 'Không thể chia sẻ cho chính mình'], 400);
        }

        $note = Note::where('id', $noteId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // is_seen = false khi share mới hoặc cập nhật quyền
        NoteShare::updateOrCreate(
            ['note_id' => $note->id, 'recipient_id' => $recipient->id],
            [
                'owner_id' => $request->user()->id,
                'permission' => $request->permission,
                'is_seen' => false, // reset notification khi share/update
            ]
        );

        return response()->json(['message' => 'Chia sẻ thành công']);
    }

    public function getShares(Request $request, $noteId)
    {
        $note = Note::where('id', $noteId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $shares = NoteShare::where('note_id', $note->id)
            ->with('recipient')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'email' => $s->recipient->email,
                'name' => $s->recipient->name,
                'permission' => $s->permission,
                'shared_at' => $s->created_at,
            ]);

        return response()->json($shares);
    }

    public function revoke(Request $request, $shareId)
    {
        $share = NoteShare::where('id', $shareId)
            ->where('owner_id', $request->user()->id)
            ->firstOrFail();

        $share->delete();

        return response()->json(['message' => 'Đã thu hồi quyền truy cập']);
    }

    // Cập nhật quyền share (thay đổi read <-> edit)
    public function updatePermission(Request $request, $shareId)
    {
        $request->validate(['permission' => 'required|in:read,edit']);

        $share = NoteShare::where('id', $shareId)
            ->where('owner_id', $request->user()->id)
            ->firstOrFail();

        $share->update(['permission' => $request->permission, 'is_seen' => false]);

        return response()->json(['message' => 'Đã cập nhật quyền']);
    }

    public function sharedWithMe(Request $request)
    {
        $shares = NoteShare::where('recipient_id', $request->user()->id)
            ->with(['note.labels', 'owner'])
            ->get()
            ->map(fn($s) => [
                'share_id' => $s->id,
                'permission' => $s->permission,
                'shared_at' => $s->created_at,
                'is_seen' => $s->is_seen,
                'owner_name' => $s->owner->name,
                'owner_email' => $s->owner->email,
                'note' => $s->note,
            ]);

        return response()->json($shares);
    }

    // Đếm số share chưa xem (dùng cho badge thông báo)
    public function unseenCount(Request $request)
    {
        $count = NoteShare::where('recipient_id', $request->user()->id)
            ->where('is_seen', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    // Đánh dấu tất cả share là đã xem
    public function markAllSeen(Request $request)
    {
        NoteShare::where('recipient_id', $request->user()->id)
            ->where('is_seen', false)
            ->update(['is_seen' => true]);

        return response()->json(['message' => 'Đã đánh dấu tất cả là đã xem']);
    }

    // Xem nội dung note được chia sẻ + tự động đánh dấu đã xem
    public function viewSharedNote(Request $request, $shareId)
    {
        $share = NoteShare::where('id', $shareId)
            ->where('recipient_id', $request->user()->id)
            ->with(['note.labels', 'owner'])
            ->firstOrFail();

        // Đánh dấu đã xem khi mở note
        if (!$share->is_seen) {
            $share->update(['is_seen' => true]);
        }

        return response()->json([
            'note' => $share->note,
            'permission' => $share->permission,
            'owner_name' => $share->owner->name,
        ]);
    }

    // Chỉnh sửa note được chia sẻ (nếu có quyền edit)
    public function updateSharedNote(Request $request, $shareId)
    {
        $share = NoteShare::where('id', $shareId)
            ->where('recipient_id', $request->user()->id)
            ->where('permission', 'edit')
            ->firstOrFail();

        $share->note->update($request->only(['title', 'content']));

        return response()->json($share->note->load('labels'));
    }
}
