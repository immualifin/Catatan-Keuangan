<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    private array $defaults = [
        // ── Expense ──────────────────────────────────────────────
        ['name' => 'Makanan & Minuman', 'type' => 'expense', 'color' => '#f97316', 'icon' => '🍔'],
        ['name' => 'Transportasi',      'type' => 'expense', 'color' => '#3b82f6', 'icon' => '🚗'],
        ['name' => 'Belanja',           'type' => 'expense', 'color' => '#a855f7', 'icon' => '🛍️'],
        ['name' => 'Kesehatan',         'type' => 'expense', 'color' => '#22c55e', 'icon' => '💊'],
        ['name' => 'Hiburan',           'type' => 'expense', 'color' => '#ec4899', 'icon' => '🎬'],
        ['name' => 'Pendidikan',        'type' => 'expense', 'color' => '#14b8a6', 'icon' => '📚'],
        ['name' => 'Tagihan & Utilitas','type' => 'expense', 'color' => '#f59e0b', 'icon' => '💡'],
        ['name' => 'Lainnya',           'type' => 'expense', 'color' => '#6b7280', 'icon' => '📦'],
        // ── Income ───────────────────────────────────────────────
        ['name' => 'Gaji',      'type' => 'income', 'color' => '#10b981', 'icon' => '💼'],
        ['name' => 'Freelance', 'type' => 'income', 'color' => '#8b5cf6', 'icon' => '💻'],
        ['name' => 'Investasi', 'type' => 'income', 'color' => '#0ea5e9', 'icon' => '📈'],
        ['name' => 'Hadiah',    'type' => 'income', 'color' => '#f43f5e', 'icon' => '🎁'],
        ['name' => 'Lainnya',   'type' => 'income', 'color' => '#6b7280', 'icon' => '💰'],
    ];

    public function run(): void
    {
        User::all()->each(function (User $user) {
            $this->createForUser($user->id);
        });
    }

    public function createForUser(int $userId): void
    {
        foreach ($this->defaults as $cat) {
            Category::firstOrCreate(
                ['user_id' => $userId, 'name' => $cat['name'], 'type' => $cat['type']],
                array_merge($cat, ['user_id' => $userId, 'is_default' => true])
            );
        }
    }
}
