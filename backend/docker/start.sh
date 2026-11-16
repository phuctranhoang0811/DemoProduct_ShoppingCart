#!/bin/sh
set -eu

PORT="${PORT:-8000}"
if [ -z "${PORT##*[!0-9]*}" ]; then
  echo "Invalid PORT value" >&2
  exit 1
fi

sed "s/__PORT__/${PORT}/g" /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/sites-enabled/default

mkdir -p /var/www/storage/framework/cache/data \
         /var/www/storage/framework/sessions \
         /var/www/storage/framework/views \
         /var/www/storage/logs \
         /var/www/bootstrap/cache

# Cache Laravel config/routes at runtime when Railway env vars are present
if [ "${APP_ENV:-}" = "production" ]; then
  php artisan config:cache
  php artisan route:cache
fi

chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

nginx -t -q
php-fpm -D
exec nginx -g "daemon off;"
