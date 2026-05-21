<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receipt;
use App\Models\Transaction;
use App\Services\CohereService;
use App\Services\OcrService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReceiptController extends Controller
{
    private OcrService $ocrService;
    private CohereService $cohereService;

    public function __construct(OcrService $ocrService, CohereService $cohereService)
    {
        $this->ocrService = $ocrService;
        $this->cohereService = $cohereService;
    }

    public function upload(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:' . (config('services.upload.max_size', 10) * 1024)],
        ]);

        $path = $request->file('image')->store('receipts', 'public');

        $receipt = Receipt::create([
            'user_id'    => $request->user()->id,
            'image_path' => $path,
            'status'     => 'pending',
        ]);

        return response()->json(['data' => $this->resource($receipt)], 201);
    }

    public function process(Request $request, Receipt $receipt)
    {
        $this->authorise($request, $receipt);

        if ($receipt->status !== 'pending') {
            return response()->json(['message' => 'Struk sudah diproses sebelumnya.'], 422);
        }

        $absolutePath = storage_path('app/public/' . $receipt->image_path);
        
        // 1. OCR Extraction
        $ocrResult = $this->ocrService->extract($absolutePath);
        
        if ($ocrResult['error']) {
            $receipt->update(['status' => 'failed', 'raw_ocr_text' => $ocrResult['error']]);
            return response()->json(['message' => 'Gagal membaca teks dari gambar', 'error' => $ocrResult['error']], 500);
        }

        $receipt->raw_ocr_text = $ocrResult['text'];

        // 2. AI Parsing with Cohere
        $parsedData = $this->cohereService->parseReceipt($ocrResult['text']);

        if ($parsedData['error']) {
            $receipt->update(['status' => 'failed', 'parsed_json' => $parsedData]);
            return response()->json(['message' => 'Gagal memproses data struk dengan AI', 'error' => $parsedData['error']], 500);
        }

        // 3. Save Parsed Data
        $receipt->update([
            'status'       => 'parsed',
            'parsed_json'  => $parsedData,
            'store_name'   => $parsedData['store_name'],
            'receipt_date' => $parsedData['receipt_date'],
            'total_amount' => $parsedData['total'],
        ]);

        // Save items
        foreach ($parsedData['items'] as $item) {
            $receipt->items()->create([
                'name'     => $item['name'],
                'price'    => $item['price'],
                'quantity' => $item['quantity'],
                'subtotal' => $item['price'] * $item['quantity'],
            ]);
        }

        return response()->json(['data' => $this->resource($receipt->load('items'))]);
    }

    public function show(Request $request, Receipt $receipt)
    {
        $this->authorise($request, $receipt);
        return response()->json(['data' => $this->resource($receipt->load('items'))]);
    }

    public function confirm(Request $request, Receipt $receipt)
    {
        $this->authorise($request, $receipt);

        if ($receipt->status !== 'parsed') {
            return response()->json(['message' => 'Struk belum selesai diproses atau gagal.'], 422);
        }

        if ($receipt->transaction()->exists()) {
            return response()->json(['message' => 'Struk sudah dikonfirmasi sebelumnya.'], 422);
        }

        $data = $request->validate([
            'category_id'      => ['required', 'exists:categories,id'],
            'store_name'       => ['nullable', 'string', 'max:255'],
            'receipt_date'     => ['required', 'date_format:Y-m-d'],
            'total_amount'     => ['required', 'integer', 'min:1'],
            'items'            => ['required', 'array', 'min:1'],
            'items.*.id'       => ['nullable', 'exists:receipt_items,id'],
            'items.*.name'     => ['required', 'string', 'max:255'],
            'items.*.price'    => ['required', 'integer', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        // Validate category
        $category = $request->user()->categories()->findOrFail($data['category_id']);
        if ($category->type !== 'expense') {
            return response()->json(['message' => 'Kategori struk harus tipe pengeluaran.'], 422);
        }

        DB::beginTransaction();
        try {
            // Update receipt details
            $receipt->update([
                'store_name'   => $data['store_name'],
                'receipt_date' => $data['receipt_date'],
                'total_amount' => $data['total_amount'],
            ]);

            // Sync items (delete missing ones, update existing, create new)
            $existingItemIds = $receipt->items()->pluck('id')->toArray();
            $providedItemIds = collect($data['items'])->pluck('id')->filter()->toArray();
            
            $itemsToDelete = array_diff($existingItemIds, $providedItemIds);
            if (!empty($itemsToDelete)) {
                $receipt->items()->whereIn('id', $itemsToDelete)->delete();
            }

            foreach ($data['items'] as $itemData) {
                $subtotal = $itemData['price'] * $itemData['quantity'];
                if (isset($itemData['id'])) {
                    $receipt->items()->where('id', $itemData['id'])->update([
                        'name'     => $itemData['name'],
                        'price'    => $itemData['price'],
                        'quantity' => $itemData['quantity'],
                        'subtotal' => $subtotal,
                    ]);
                } else {
                    $receipt->items()->create([
                        'name'     => $itemData['name'],
                        'price'    => $itemData['price'],
                        'quantity' => $itemData['quantity'],
                        'subtotal' => $subtotal,
                    ]);
                }
            }

            // Create final transaction
            $transaction = Transaction::create([
                'user_id'          => $request->user()->id,
                'category_id'      => $category->id,
                'receipt_id'       => $receipt->id,
                'type'             => 'expense',
                'amount'           => $data['total_amount'],
                'description'      => $data['store_name'] ? "Belanja di {$data['store_name']}" : "Belanja dari Scan Struk",
                'transaction_date' => $data['receipt_date'],
                'source'           => 'scan',
            ]);

            DB::commit();

            return response()->json([
                'message'     => 'Struk berhasil dikonfirmasi dan dicatat.',
                'transaction' => $transaction,
                'receipt'     => $this->resource($receipt->fresh('items')),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan sistem.', 'error' => $e->getMessage()], 500);
        }
    }

    private function authorise(Request $request, Receipt $receipt): void
    {
        abort_if($receipt->user_id !== $request->user()->id, 403);
    }

    private function resource(Receipt $r): array
    {
        return [
            'id'           => $r->id,
            'image_url'    => $r->image_url,
            'status'       => $r->status,
            'store_name'   => $r->store_name,
            'receipt_date' => $r->receipt_date ? $r->receipt_date->format('Y-m-d') : null,
            'total_amount' => $r->total_amount,
            'items'        => $r->relationLoaded('items') ? $r->items->map(fn ($i) => [
                'id'       => $i->id,
                'name'     => $i->name,
                'price'    => $i->price,
                'quantity' => $i->quantity,
                'subtotal' => $i->subtotal,
            ]) : [],
            'created_at'   => $r->created_at,
        ];
    }
}
