<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class OcrService
{
    private string $driver;

    public function __construct()
    {
        $this->driver = config('services.ocr.driver', 'tesseract');
    }

    /**
     * Extract text from an image file path.
     *
     * @param  string $absolutePath  Absolute path to the image file
     * @return array{text: string|null, error: string|null}
     */
    public function extract(string $absolutePath): array
    {
        return match ($this->driver) {
            'google' => $this->extractWithGoogleVision($absolutePath),
            default  => $this->extractWithTesseract($absolutePath),
        };
    }

    // ─── Tesseract (local) ───────────────────────────────────────────────────────

    private function extractWithTesseract(string $absolutePath): array
    {
        if (! $this->isTesseractAvailable()) {
            return ['text' => null, 'error' => 'Tesseract is not installed on this server.'];
        }

        // Use only installed languages to avoid "Failed to load language" error
        $availableLangs = $this->getAvailableLangs();
        $langArg = in_array('ind', $availableLangs) ? 'ind+eng' : 'eng';

        $escapedPath = escapeshellarg($absolutePath);
        $outputBase  = tempnam(sys_get_temp_dir(), 'ocr_');

        // Run tesseract; output goes to $outputBase.txt
        exec("tesseract {$escapedPath} " . escapeshellarg($outputBase) . " -l {$langArg} 2>&1", $output, $code);

        $txtFile = $outputBase . '.txt';

        if ($code !== 0 || ! file_exists($txtFile)) {
            Log::error('Tesseract failed', ['output' => $output, 'code' => $code, 'lang' => $langArg]);
            return ['text' => null, 'error' => 'OCR failed: ' . implode("\n", $output)];
        }

        $text = file_get_contents($txtFile);
        @unlink($txtFile);
        @unlink($outputBase);

        if (empty(trim($text))) {
            return ['text' => null, 'error' => 'Foto tidak terbaca dengan baik. Coba foto ulang dengan pencahayaan yang lebih baik.'];
        }

        return ['text' => trim($text), 'error' => null];
    }

    private function getAvailableLangs(): array
    {
        exec('tesseract --list-langs 2>&1', $output);
        return array_filter($output, fn($l) => !str_starts_with($l, 'List') && !empty(trim($l)));
    }

    private function isTesseractAvailable(): bool
    {
        exec('which tesseract 2>/dev/null', $out, $code);
        return $code === 0;
    }

    // ─── Google Cloud Vision ─────────────────────────────────────────────────────

    private function extractWithGoogleVision(string $absolutePath): array
    {
        $apiKey  = config('services.google.cloud_vision_api_key', '');
        $content = base64_encode(file_get_contents($absolutePath));

        try {
            $response = Http::timeout(30)
                ->post("https://vision.googleapis.com/v1/images:annotate?key={$apiKey}", [
                    'requests' => [[
                        'image'    => ['content' => $content],
                        'features' => [['type' => 'TEXT_DETECTION']],
                    ]],
                ]);

            if ($response->failed()) {
                return ['text' => null, 'error' => 'Google Vision API error: ' . $response->status()];
            }

            $text = $response->json('responses.0.fullTextAnnotation.text') ?? '';
            return ['text' => trim($text), 'error' => empty($text) ? 'No text detected' : null];

        } catch (\Exception $e) {
            Log::error('Google Vision exception', ['error' => $e->getMessage()]);
            return ['text' => null, 'error' => $e->getMessage()];
        }
    }
}
