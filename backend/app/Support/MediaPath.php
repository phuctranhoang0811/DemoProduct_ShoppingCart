<?php

namespace App\Support;

use Closure;

class MediaPath
{
    private const RELATIVE_IMAGE_PATTERN = '#^/images/(?!.*\.\.)[A-Za-z0-9._/-]+$#';

    private const DATA_IMAGE_PATTERN = '#^data:image/(?:png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$#';

    /** Accepts absolute http(s) URLs or safe site-relative `/images/...` paths. */
    public static function urlOrSitePath(): Closure
    {
        return static function (string $attribute, mixed $value, Closure $fail): void {
            if (! is_string($value) || ! self::isHttpUrl($value) && ! self::isSiteImagePath($value)) {
                $fail("The {$attribute} field must be a valid http(s) URL or /images/ path.");
            }
        };
    }

    /** Accepts URLs, `/images/...` paths, or uploaded base64 data URIs up to ~800 KB binary. */
    public static function eventImage(): Closure
    {
        return static function (string $attribute, mixed $value, Closure $fail): void {
            if (! is_string($value)) {
                $fail("The {$attribute} field must be a string.");

                return;
            }

            if (self::isHttpUrl($value) || self::isSiteImagePath($value)) {
                return;
            }

            if (strlen($value) <= 1_200_000 && preg_match(self::DATA_IMAGE_PATTERN, $value) === 1) {
                return;
            }

            $fail("The {$attribute} field must be a valid URL, /images/ path, or uploaded image.");
        };
    }

    private static function isHttpUrl(string $value): bool
    {
        if (strlen($value) > 2048 || ! filter_var($value, FILTER_VALIDATE_URL)) {
            return false;
        }

        $scheme = strtolower((string) parse_url($value, PHP_URL_SCHEME));

        return in_array($scheme, ['http', 'https'], true);
    }

    private static function isSiteImagePath(string $value): bool
    {
        return strlen($value) <= 2048 && preg_match(self::RELATIVE_IMAGE_PATTERN, $value) === 1;
    }
}
