<?php
// PHP Development Server Router
// /api.php isteklerini PHP ile çalıştır, diğer dosyaları public/ klasöründen serve et

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// API isteklerini yönlendir
if ($requestUri === '/api.php' || strpos($requestUri, '/api.php?') === 0) {
    // api.php'yi bu scriptle aynı klasörden çalıştır
    require __DIR__ . '/api.php';
    exit;
}

// debug_backups.php
if ($requestUri === '/debug_backups.php') {
    require __DIR__ . '/../public/debug_backups.php';
    exit;
}

// Diğer tüm istekler için public/ klasörüne bak
$publicPath = __DIR__ . '/../public' . $requestUri;

if (file_exists($publicPath) && !is_dir($publicPath)) {
    return false; // PHP built-in server static dosyayı serve eder
}

// SPA fallback - index.html
$indexPath = __DIR__ . '/../public/index.html';
if (file_exists($indexPath)) {
    header('Content-Type: text/html; charset=UTF-8');
    readfile($indexPath);
    exit;
}

http_response_code(404);
echo 'Not Found';
