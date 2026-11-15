<?php

// The API is called by the storefront's server, not by browsers. Browser access is limited to
// the storefront's own origin so no other site can read API responses from a visitor's browser.
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    'allowed_origins' => array_filter([rtrim((string) env('STOREFRONT_URL', 'http://localhost:3000'), '/')]),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type', 'X-Request-Id'],
    'exposed_headers' => ['X-Request-Id'],
    'max_age' => 600,
    'supports_credentials' => false,
];
