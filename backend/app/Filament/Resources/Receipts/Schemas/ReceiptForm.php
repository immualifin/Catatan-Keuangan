<?php

namespace App\Filament\Resources\Receipts\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class ReceiptForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('user_id')
                    ->required()
                    ->numeric(),
                FileUpload::make('image_path')
                    ->image()
                    ->required(),
                Textarea::make('raw_ocr_text')
                    ->columnSpanFull(),
                TextInput::make('parsed_json'),
                Select::make('status')
                    ->options(['pending' => 'Pending', 'parsed' => 'Parsed', 'failed' => 'Failed'])
                    ->default('pending')
                    ->required(),
                TextInput::make('store_name'),
                DatePicker::make('receipt_date'),
                TextInput::make('total_amount')
                    ->numeric(),
            ]);
    }
}
