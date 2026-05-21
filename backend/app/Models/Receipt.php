<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'image_path',
        'raw_ocr_text',
        'parsed_json',
        'status',
        'store_name',
        'receipt_date',
        'total_amount',
    ];

    protected function casts(): array
    {
        return [
            'parsed_json'  => 'array',
            'receipt_date' => 'date',
            'total_amount' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(ReceiptItem::class);
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeParsed($query)
    {
        return $query->where('status', 'parsed');
    }

    public function getImageUrlAttribute(): string
    {
        return asset('storage/' . $this->image_path);
    }

    public function isPending(): bool  { return $this->status === 'pending'; }
    public function isParsed(): bool   { return $this->status === 'parsed'; }
    public function isFailed(): bool   { return $this->status === 'failed'; }
}
