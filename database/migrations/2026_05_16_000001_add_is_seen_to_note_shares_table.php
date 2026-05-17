<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('note_shares', function (Blueprint $table) {
            $table->boolean('is_seen')->default(false)->after('permission');
        });
    }

    public function down(): void
    {
        Schema::table('note_shares', function (Blueprint $table) {
            $table->dropColumn('is_seen');
        });
    }
};
