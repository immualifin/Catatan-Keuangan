<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CohereService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl = 'https://api.cohere.ai/v1';

    public function __construct()
    {
        $this->apiKey = config('services.cohere.api_key', '');
        $this->model  = config('services.cohere.model', 'command-r-plus');
    }

    /**
     * Parse OCR text from a receipt and return structured data.
     */
    public function parseReceipt(string $ocrText): array
    {
        // Clean the OCR text to reduce repetitive patterns that trigger loop detection
        $cleanedText = $this->cleanOcrText($ocrText);
        $prompt = $this->buildPrompt($cleanedText);

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post("{$this->baseUrl}/chat", [
                    'model'       => $this->model,
                    'message'     => $prompt,
                    'temperature' => 0.3,
                    'preamble'    => 'You are a JSON data extraction assistant. Always respond with valid JSON only.',
                ]);

            if ($response->failed()) {
                $body = $response->json();
                $errMsg = $body['message'] ?? $response->body();

                // Handle Cohere loop detection — retry with more aggressively truncated text
                if (str_contains($errMsg, 'looping content') || str_contains($errMsg, 'loop detection')) {
                    return $this->retryWithTruncatedText($cleanedText);
                }

                Log::error('Cohere API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return $this->emptyResult('API request failed: ' . $response->status());
            }

            $content = $response->json('text') ?? '';
            return $this->extractJson($content);

        } catch (\Exception $e) {
            Log::error('CohereService exception', ['error' => $e->getMessage()]);
            return $this->emptyResult($e->getMessage());
        }
    }

    /**
     * Retry with heavily truncated and de-duplicated OCR text.
     */
    private function retryWithTruncatedText(string $ocrText): array
    {
        // Remove duplicate lines and limit to 800 chars
        $lines = array_unique(explode("\n", $ocrText));
        $shortened = implode("\n", array_slice($lines, 0, 40));
        $shortened = substr($shortened, 0, 800);

        $prompt = $this->buildPrompt($shortened);

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post("{$this->baseUrl}/chat", [
                    'model'       => $this->model,
                    'message'     => $prompt,
                    'temperature' => 0.5,
                ]);

            if ($response->failed()) {
                return $this->emptyResult('Gagal memproses struk setelah retry: ' . $response->status());
            }

            $content = $response->json('text') ?? '';
            return $this->extractJson($content);

        } catch (\Exception $e) {
            return $this->emptyResult($e->getMessage());
        }
    }

    /**
     * Clean OCR text: remove repeated blank lines, deduplicate consecutive identical lines.
     */
    private function cleanOcrText(string $text): string
    {
        $lines = explode("\n", $text);
        $cleaned = [];
        $prev = null;
        $blankCount = 0;

        foreach ($lines as $line) {
            $trimmed = trim($line);

            // Skip excessive blank lines
            if ($trimmed === '') {
                $blankCount++;
                if ($blankCount <= 1) $cleaned[] = '';
                continue;
            }
            $blankCount = 0;

            // Skip consecutive duplicate lines
            if ($trimmed === $prev) continue;

            $cleaned[] = $trimmed;
            $prev = $trimmed;
        }

        // Limit to 1500 chars to avoid context issues
        return substr(implode("\n", $cleaned), 0, 1500);
    }

    private function buildPrompt(string $ocrText): string
    {
        return <<<PROMPT
Extract receipt data from the text below. Return ONLY a valid JSON object, no explanation.

JSON format:
{"store_name":"string or null","receipt_date":"YYYY-MM-DD or null","items":[{"name":"string","quantity":number,"price":number}],"total":number or null,"currency":"IDR"}

Rules:
- All prices in Rupiah (integer, no decimals)
- If data not found, use null
- Return ONLY the JSON object

Receipt text:
{$ocrText}
PROMPT;
    }

    /**
     * Extract and validate JSON from model response.
     */
    private function extractJson(string $content): array
    {
        // Strip markdown code fences if present
        $content = preg_replace('/^```(?:json)?\s*/m', '', $content);
        $content = preg_replace('/```\s*$/m', '', $content);
        $content = trim($content);

        // Try to find JSON object in the response
        if (preg_match('/\{.*\}/s', $content, $matches)) {
            $json = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $this->normaliseResult($json);
            }
        }

        Log::warning('Cohere returned invalid JSON', ['content' => $content]);
        return $this->emptyResult('Could not parse JSON from response');
    }

    private function normaliseResult(array $data): array
    {
        return [
            'store_name'   => $data['store_name'] ?? null,
            'receipt_date' => $data['receipt_date'] ?? null,
            'items'        => array_map(function ($item) {
                return [
                    'name'     => (string) ($item['name'] ?? ''),
                    'quantity' => (int)   ($item['quantity'] ?? 1),
                    'price'    => (int)   ($item['price'] ?? 0),
                ];
            }, $data['items'] ?? []),
            'total'    => isset($data['total']) ? (int) $data['total'] : null,
            'currency' => $data['currency'] ?? 'IDR',
            'error'    => null,
        ];
    }

    private function emptyResult(string $error): array
    {
        return [
            'store_name'   => null,
            'receipt_date' => null,
            'items'        => [],
            'total'        => null,
            'currency'     => 'IDR',
            'error'        => $error,
        ];
    }
}
