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
        // Disabled until live Stripe credentials are enabled.
        'enabled' => (bool) env('STRIPE_ENABLED', false),
        'secret' => env('STRIPE_ENABLED', false) ? env('STRIPE_SECRET') : null,
        'webhook_secret' => env('STRIPE_ENABLED', false) ? env('STRIPE_WEBHOOK_SECRET') : null,
        'currency' => env('STRIPE_CURRENCY', 'usd'),
    ],

    'hellobee' => [
        // Buying this product (once paid) makes the buyer a network consultant.
        'activation_product' => env('HELLOBEE_ACTIVATION_PRODUCT', 'hellobee-filter-1500'),
        'direct_rate_percent' => 10,
        // Paid to each level above the seller. With no cap, an order placed N levels below the
        // owner pays out 10% + N x 1% in total, so deep trees cost more per sale.
        'upline_rate_percent' => 1,
        'max_upline_levels' => env('HELLOBEE_MAX_UPLINE_LEVELS'),
    ],

    'storefront' => [
        'url' => env('STOREFRONT_URL', 'http://localhost:3000'),
        'seed_demo_password' => env('SEED_DEMO_PASSWORD'),
        'revalidate_url' => env('STOREFRONT_REVALIDATE_URL'),
        'revalidate_secret' => env('STOREFRONT_REVALIDATE_SECRET'),
    ],

];
