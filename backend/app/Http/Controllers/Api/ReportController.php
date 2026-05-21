<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use League\Csv\Writer;
use SplTempFileObject;

class ReportController extends Controller
{
    public function exportCsv(Request $request)
    {
        $transactions = $this->getQuery($request)->get();

        $csv = Writer::createFromFileObject(new SplTempFileObject());
        
        // Headers
        $csv->insertOne(['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Nominal (Rp)', 'Sumber']);

        foreach ($transactions as $t) {
            $csv->insertOne([
                $t->transaction_date->format('Y-m-d'),
                $t->type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                $t->category->name,
                $t->description,
                $t->amount,
                $t->source === 'scan' ? 'Scan Struk' : 'Manual',
            ]);
        }

        $filename = 'laporan-keuangan-' . date('Ymd-His') . '.csv';

        return response((string) $csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Transfer-Encoding' => 'binary',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function exportPdf(Request $request)
    {
        $transactions = $this->getQuery($request)->get();
        $user = $request->user();
        
        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpense = $transactions->where('type', 'expense')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;

        $pdf = Pdf::loadView('reports.pdf', compact('transactions', 'user', 'totalIncome', 'totalExpense', 'netBalance'));
        
        $filename = 'laporan-keuangan-' . date('Ymd-His') . '.pdf';
        return $pdf->download($filename);
    }

    private function getQuery(Request $request)
    {
        $query = Transaction::forUser($request->user()->id)->with('category')->orderBy('transaction_date', 'asc');
        
        if ($period = $request->query('period')) { // e.g. 2026-05
            $parts = explode('-', $period);
            if (count($parts) === 2) {
                $query->inMonth((int) $parts[0], (int) $parts[1]);
            }
        }
        
        if ($start = $request->query('start_date')) {
            $query->where('transaction_date', '>=', $start);
        }
        if ($end = $request->query('end_date')) {
            $query->where('transaction_date', '<=', $end);
        }

        return $query;
    }
}
