<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('image_path');
            $table->longText('raw_ocr_text')->nullable();
            $table->json('parsed_json')->nullable();
            $table->enum('status', ['pending', 'parsed', 'failed'])->default('pending');
            $table->string('store_name')->nullable();
            $table->date('receipt_date')->nullable();
            $table->unsignedBigInteger('total_amount')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
