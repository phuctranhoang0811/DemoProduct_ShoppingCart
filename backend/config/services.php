<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        // Prefer a restricted key (rk_...) limited to Checkout Sessions.
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'currency' => env('STRIPE_CURRENCY', 'usd'),
    ],

    'hellobee' => [
        // Buying this product (once paid) makes the buyer a network consultant.
        'activation_product' => env('HELLOBEE_ACTIVATION_PRODUCT', 'hellobee-filter-1500'),
        'direct_rate_percent' => 10,
        'owner_override_percent' => 1,
    ],

    'storefront' => [
        'url' => env('STOREFRONT_URL', 'http://localhost:3000'),
        'seed_demo_password' => env('SEED_DEMO_PASSWORD'),
        'revalidate_url' => env('STOREFRONT_REVALIDATE_URL'),
        'revalidate_secret' => env('STOREFRONT_REVALIDATE_SECRET'),
    ],

];
