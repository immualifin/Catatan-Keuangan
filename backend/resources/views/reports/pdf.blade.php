<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Keuangan</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #111; }
        .header p { margin: 5px 0 0; color: #666; }
        .summary { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
        .summary th, .summary td { padding: 10px; border: 1px solid #ddd; text-align: center; }
        .summary th { background: #f9f9f9; }
        .summary .income { color: #10b981; }
        .summary .expense { color: #f43f5e; }
        table.data { width: 100%; border-collapse: collapse; }
        table.data th, table.data td { padding: 8px; border-bottom: 1px solid #eee; text-align: left; }
        table.data th { background: #f4f4f5; font-weight: bold; border-bottom: 2px solid #ddd; }
        .text-right { text-align: right !important; }
        .badge { padding: 3px 6px; border-radius: 4px; font-size: 10px; }
        .badge-income { background: #d1fae5; color: #065f46; }
        .badge-expense { background: #ffe4e6; color: #9f1239; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CatatKeuangan - Laporan Transaksi</h1>
        <p>Pengguna: {{ $user->name }} | Dicetak: {{ date('d M Y H:i') }}</p>
    </div>

    <table class="summary">
        <tr>
            <th>Total Pemasukan</th>
            <th>Total Pengeluaran</th>
            <th>Saldo Bersih</th>
        </tr>
        <tr>
            <td class="income">Rp {{ number_format($totalIncome, 0, ',', '.') }}</td>
            <td class="expense">Rp {{ number_format($totalExpense, 0, ',', '.') }}</td>
            <td><strong>Rp {{ number_format($netBalance, 0, ',', '.') }}</strong></td>
        </tr>
    </table>

    <table class="data">
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th class="text-right">Nominal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $t)
            <tr>
                <td>{{ $t->transaction_date->format('d M Y') }}</td>
                <td>
                    @if($t->type === 'income')
                        <span class="badge badge-income">Pemasukan</span>
                    @else
                        <span class="badge badge-expense">Pengeluaran</span>
                    @endif
                </td>
                <td>{{ $t->category->name }}</td>
                <td>{{ $t->description ?: '-' }}</td>
                <td class="text-right">Rp {{ number_format($t->amount, 0, ',', '.') }}</td>
            </tr>
            @endforeach
            @if($transactions->isEmpty())
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">Tidak ada transaksi pada periode ini.</td>
            </tr>
            @endif
        </tbody>
    </table>
</body>
</html>
