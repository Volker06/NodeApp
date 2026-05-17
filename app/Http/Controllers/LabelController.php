<?php

namespace App\Http\Controllers;

use App\Models\Label;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    // Lấy danh sách labels
    public function index(Request $request)
    {
        $labels = Label::where('user_id', $request->user()->id)->get();
        return response()->json($labels);
    }

    // Tạo label mới
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $label = Label::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
        ]);
        return response()->json($label, 201);
    }

    // Đổi tên label
    public function update(Request $request, $id)
    {
        $label = Label::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
        $label->update(['name' => $request->name]);
        return response()->json($label);
    }

    // Xóa label
    public function destroy(Request $request, $id)
    {
        $label = Label::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
        $label->delete();
        return response()->json(['message' => 'Xóa thành công']);
    }

    // Gắn label vào note
    public function attachToNote(Request $request, $noteId)
    {
        $request->validate(['label_ids' => 'required|array']);
        $note = \App\Models\Note::where('id', $noteId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
        $note->labels()->sync($request->label_ids);
        return response()->json(['message' => 'Cập nhật labels thành công']);
    }
}