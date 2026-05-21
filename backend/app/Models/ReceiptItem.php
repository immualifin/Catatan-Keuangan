<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReceiptItem extends Model
{
    protected $fillable = [
        'receipt_id',
        'name',
        'price',
        'quantity',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'price'    => 'integer',
            'quantity' => 'integer',
            'subtotal' => 'integer',
        ];
    }

    public function receipt()
    {
        return $this->belongsTo(Receipt::class);
    }
}
