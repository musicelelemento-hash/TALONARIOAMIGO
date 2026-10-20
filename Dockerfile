# ==============================================================================
# DOCKERFILE MONOREPO — TALONARIO AMIGO (RENDER.COM)
# Compatible si Render ejecuta en la raíz del repo o con rootDir: TALONARIOAMIGO
# ==============================================================================

FROM php:8.1-fpm

# Instalar dependencias del sistema y librerías para MySQL y PostgreSQL (libpq-dev)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libpq-dev \
    zip \
    unzip \
    nginx

# Limpiar caché de apt
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar extensiones de PHP requeridas para Laravel, Postgres, MySQL y SRI (SOAP, Zip, GD, PDO)
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql pgsql mbstring exif pcntl bcmath gd soap zip xml

# Obtener Composer oficial
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www

# Copiar archivos del backend desde la subcarpeta TALONARIOAMIGO
COPY TALONARIOAMIGO/ /var/www/

# Purga cualquier .gz precomprimido que haya quedado suelto en public/
RUN find /var/www/public -name '*.gz' -delete

# Crear directorios de storage y bootstrap/cache si no existen
RUN mkdir -p /var/www/storage/app/public \
             /var/www/storage/framework/cache \
             /var/www/storage/framework/sessions \
             /var/www/storage/framework/views \
             /var/www/storage/logs \
             /var/www/bootstrap/cache

# Instalar dependencias de Composer optimizado para producción
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Ajustar permisos para storage y bootstrap/cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Copiar configuración de Nginx
COPY TALONARIOAMIGO/nginx.conf /etc/nginx/sites-available/default

# Exponer puerto HTTP para Render
EXPOSE 80

# Script de arranque: ajusta el puerto dinámico de Render ($PORT), corre migraciones y levanta PHP-FPM + Nginx
CMD ["sh", "-c", "sed -i \"s/listen 80;/listen ${PORT:-80};/g\" /etc/nginx/sites-available/default && php artisan migrate --force && php-fpm -D && nginx -g 'daemon off;'"]
