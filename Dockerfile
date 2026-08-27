# ==============================================================================
# DOCKERFILE EN PRODUCCIÓN PARA TALONARIO AMIGO (RENDER.COM)
# PHP 8.1 FPM + Nginx + Extensiones necesarias para Firma Digital SOAP SRI
# ==============================================================================

FROM php:8.1-fpm

# Instalar dependencias del sistema y extensiones de PHP necesarias para el SRI (SOAP, OpenSSL, Zip, Pdo, Mbstring, Postgres)
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

# Limpiar cache de apt
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar extensiones de PHP requeridas para Laravel y firma digital SRI (SOAP, Zip, GD, PDO MySQL + PostgreSQL)
RUN docker-php-ext-install pdo_mysql pdo_pgsql pgsql mbstring exif pcntl bcmath gd soap zip xml

# Obtener Composer oficial
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www

# Copiar archivos del proyecto
COPY . /var/www

# Instalar dependencias de Composer sin dev y optimizar autoloader
RUN composer install --no-dev --optimize-autoloader

# Ajustar permisos para storage y bootstrap/cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/sites-available/default

# Puerto expuesto en Render
EXPOSE 80

# Script de arranque
CMD service nginx start && php-fpm
