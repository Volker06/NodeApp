<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $notes = Note::where('user_id', $request->user()->id)
            ->with(['labels', 'images'])
            ->orderBy('is_pinned', 'desc')
            ->orderBy('pinned_at', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($notes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
        ]);

        $note = Note::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->content,
        ]);

        return response()->json($note->load(['labels', 'images']), 201);
    }

    public function update(Request $request, $id)
    {
        $note = Note::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $note->update($request->only(['title', 'content', 'is_pinned', 'pinned_at']));

        return response()->json($note->load(['labels', 'images']));
    }

    public function destroy(Request $request, $id)
    {
        $note = Note::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $note->delete();

        return response()->json(['message' => 'Xóa thành công']);
    }

    /**
     * Đặt mật khẩu lần đầu cho note (note chưa có password)
     * Yêu cầu: nhập password + password_confirmation
     */
    public function setPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:4|confirmed',
        ]);

        $note = Note::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($note->password) {
            return response()->json(['message' => 'Note đã có mật khẩu, hãy dùng chức năng đổi mật khẩu'], 400);
        }

        $note->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Đặt mật khẩu thành công']);
    }

    /**
     * Đổi mật khẩu note (note đã có password)
     * Yêu cầu: current_password + new_password + new_password_confirmation
     */
    public function changePassword(Request $request, $id)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:4|confirmed',
        ]);

        $note = Note::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (!$note->password) {
            return response()->json(['message' => 'Note chưa có mật khẩu'], 400);
        }

        if (!Hash::check($request->current_password, $note->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không đúng'], 401);
        }

        $note->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Đổi mật khẩu thành công']);
    }

    /**
     * Xác minh mật khẩu để mở note
     */
    public function verifyPassword(Request $request, $id)
    {
        $request->validate(['password' => 'required|string']);

        $note = Note::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (!Hash::check($request->password, $note->password)) {
            return response()->json(['message' => 'Mật khẩu không đúng'], 401);
        }

        return response()->json(['message' => 'Xác minh thành công']);
    }

    /**
     * Tắt mật khẩu note
     * Yêu cầu: nhập lại current_password để xác nhận
     */
    public function removePassword(Request $request, $id)
    {
        $request->validate(['password' => 'required|string']);

        $note = Note::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (!Hash::check($request->password, $note->password)) {
            return response()->json(['message' => 'Mật khẩu không đúng'], 401);
        }

        $note->update(['password' => null]);

        return response()->json(['message' => 'Đã tắt mật khẩu']);
    }

    public function uploadImage(Request $request, $id)
    {
        $request->validate([
            'image' => 'required|image|max:4096',
        ]);

        $note = Note::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $path = $request->file('image')->store('note-images', 'public');

        $image = $note->images()->create(['path' => $path]);

        return response()->json([
            'id' => $image->id,
            'url' => asset('storage/' . $path),
        ], 201);
    }

    public function deleteImage(Request $request, $noteId, $imageId)
    {
        $note = Note::where('id', $noteId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $image = $note->images()->findOrFail($imageId);
        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json(['message' => 'Xóa ảnh thành công']);
    }
}
