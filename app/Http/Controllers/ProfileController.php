<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    // Cập nhật thông tin profile
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $request->user()->update([
            'name' => $request->name,
        ]);

        return response()->json($request->user());
    }

    // Upload avatar
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        $user = $request->user();

        // Xóa avatar cũ
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return response()->json([
            'avatar_url' => asset('storage/' . $path)
        ]);
    }

    // Đổi mật khẩu
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không đúng'], 401);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Đổi mật khẩu thành công']);
    }
    // Cập nhật preferences
public function updatePreferences(Request $request)
{
    $request->validate([
        'theme' => 'nullable|in:light,dark',
        'font_size' => 'nullable|in:small,medium,large',
        'note_color' => 'nullable|string|max:20',
    ]);

    $request->user()->update($request->only(['theme', 'font_size', 'note_color']));

    return response()->json($request->user());
}
}