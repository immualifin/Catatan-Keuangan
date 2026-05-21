<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'demo@catatkeuangan.com'],
            [
                'name'     => 'Demo User',
                'password' => Hash::make('password'),
                'currency' => 'IDR',
            ]
        );

        $this->call([CategorySeeder::class]);
    }
}
