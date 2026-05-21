<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key'    => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token'    => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // ─── Custom Services ─────────────────────────────────────────────────────

    'cohere' => [
        'api_key' => env('COHERE_API_KEY', ''),
        'model'   => env('COHERE_MODEL', 'command-r-plus-08-2024'),
    ],

    'ocr' => [
        'driver' => env('OCR_DRIVER', 'tesseract'),
    ],

    'google' => [
        'cloud_vision_api_key' => env('GOOGLE_CLOUD_VISION_API_KEY', ''),
    ],

    'upload' => [
        'max_size' => env('UPLOAD_MAX_SIZE_MB', 10),
    ],

];
