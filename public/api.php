<?php
// Output buffering baslat - istenmeyen ciktilari yakalamak icin
ob_start();

// Zaman dilimi ayari
date_default_timezone_set('Europe/Istanbul');

// Hata raporlamayi kapatalim (JSON bozulmasini onlemek icin)
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

function logDebug($msg) {
    file_put_contents(__DIR__ . '/debug.log', date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
}

logDebug("Request: " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI']);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Tamponu temizle ve cik
    ob_end_clean();
    exit(0);
}

function sendJson($data, $code = 200) {
    // Tamponu temizle - sadece JSON ciktisi gitmeli
    ob_end_clean();
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function sendError($message, $code = 500) {
    sendJson(['success' => false, 'message' => $message], $code);
}

// Utility to ensure data structure is complete
function repairDataStructure($data) {
    if (!is_array($data)) $data = [];
    
    $defaults = [
        'hero' => ['title' => '', 'description' => '', 'imageUrl' => ''],
        'about' => ['title' => '', 'text1' => '', 'text2' => '', 'imageUrl' => ''],
        'events' => [],
        'announcements' => [],
        'footer' => ['email' => '', 'phone' => '', 'address' => '', 'copyright' => ''],
        'infoCards' => [],
        'shopLinks' => [],
        'logos' => ["/tubitak.png", "/logo.png", "/baibu-logo.png"]
    ];

    foreach ($defaults as $key => $defaultVal) {
        if (!isset($data[$key])) {
            $data[$key] = $defaultVal;
        } else if (is_array($defaultVal) && !is_array($data[$key])) {
            // If it's supposed to be an array but it's not, reset it to default
            $data[$key] = $defaultVal;
        }
    }
    return $data;
}

try {
    // --- SETUP PATHS ---
    $possiblePaths = [
        'content.json',
        '../public/content.json',
        '../build/content.json',
        'public/content.json',
        'build/content.json',
        '../content.json'
    ];
    
    $activePaths = [];
    foreach ($possiblePaths as $p) {
        if (file_exists($p)) $activePaths[] = $p;
    }
    
    // Primary path for reading and setting context for backups/uploads
    $contentPath = !empty($activePaths) ? $activePaths[0] : 'content.json';
    $baseDir = dirname($contentPath);
    $backupDir = ($baseDir === '.' ? '' : $baseDir . '/') . 'backups/';
    $uploadDir = ($baseDir === '.' ? '' : $baseDir . '/') . 'uploads/';
    $uploadUrl = 'uploads/';

    // Ensure directories exist
    foreach ([$backupDir, $uploadDir] as $dir) {
        if ($dir && !file_exists($dir)) {
            mkdir($dir, 0777, true);
        }
    }

    // --- GET ACTIONS ---
    $action = $_GET['action'] ?? '';

    if ($action === 'list_backups') {
        $list = [];
        if (is_dir($backupDir)) {
            $files = scandir($backupDir);
            foreach ($files as $file) {
                if (strpos($file, 'content_') === 0 && strpos($file, '.json') !== false) {
                    $list[] = [
                        'file' => $file,
                        'date' => date("Y-m-d H:i:s", filemtime($backupDir . $file))
                    ];
                }
            }
        }
        usort($list, function($a, $b) { return strcmp($b['file'], $a['file']); });
        sendJson(['success' => true, 'backups' => $list]);
    }

    if ($action === 'restore') {
        $version = $_GET['version'] ?? '';
        if ($version && file_exists($backupDir . $version)) {
            $success = true;
            $source = $backupDir . $version;
            foreach ($activePaths as $target) {
                if (!copy($source, $target)) $success = false;
            }
            if ($success) {
                sendJson(['success' => true, 'message' => 'Geri yüklendi.']);
            }
        }
        sendError('Geri yükleme başarısız.');
    }

    if ($action === 'delete_backup') {
        $file = $_GET['file'] ?? '';
        if ($file && strpos($file, '/') === false && file_exists($backupDir . $file)) {
            if (unlink($backupDir . $file)) sendJson(['success' => true]);
        }
        sendError('Silme başarısız.');
    }

    // --- POST ACTION (Save) ---
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $jsonInput = $_POST['data'] ?? '';
        if (function_exists('get_magic_quotes_gpc') && get_magic_quotes_gpc()) {
            $jsonInput = stripslashes($jsonInput);
        }
        
        $newData = json_decode($jsonInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('JSON Hatası: ' . json_last_error_msg());
        }

        // Repair/Fill missing fields
        $newData = repairDataStructure($newData);

        // Backup current file
        if (file_exists($contentPath)) {
            copy($contentPath, $backupDir . 'content_' . date('Y-m-d_H-i-s') . '.json');
        }

        // Handle Image Uploads
        if (isset($_FILES['hero_image']) && $_FILES['hero_image']['error'] === UPLOAD_ERR_OK) {
            $name = time() . '_hero_' . basename($_FILES['hero_image']['name']);
            if (move_uploaded_file($_FILES['hero_image']['tmp_name'], $uploadDir . $name)) $newData['hero']['imageUrl'] = $uploadUrl . $name;
        }

        if (isset($_FILES['about_image']) && $_FILES['about_image']['error'] === UPLOAD_ERR_OK) {
            $name = time() . '_about_' . basename($_FILES['about_image']['name']);
            if (move_uploaded_file($_FILES['about_image']['tmp_name'], $uploadDir . $name)) $newData['about']['imageUrl'] = $uploadUrl . $name;
        }

        // Events & Announcements Images
        foreach (['events' => 'event_images_', 'announcements' => 'announcement_images_'] as $section => $prefix) {
            if (isset($newData[$section])) {
                foreach ($newData[$section] as $idx => &$item) {
                    $fileKey = $prefix . $idx;
                    if (isset($_FILES[$fileKey])) {
                        $files = $_FILES[$fileKey];
                        if (is_array($files['name'])) {
                            for ($i = 0; $i < count($files['name']); $i++) {
                                if ($files['error'][$i] === UPLOAD_ERR_OK) {
                                    $n = time() . "_{$section}_{$idx}_" . basename($files['name'][$i]);
                                    if (move_uploaded_file($files['tmp_name'][$i], $uploadDir . $n)) {
                                        if (!isset($item['images'])) $item['images'] = [];
                                        $item['images'][] = $uploadUrl . $n;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Logo Uploads
        if (isset($_FILES['logo_images'])) {
            $files = $_FILES['logo_images'];
            if (is_array($files['name'])) {
                for ($i = 0; $i < count($files['name']); $i++) {
                    if ($files['error'][$i] === UPLOAD_ERR_OK) {
                        $n = time() . '_logo_' . basename($files['name'][$i]);
                        if (move_uploaded_file($files['tmp_name'][$i], $uploadDir . $n)) $newData['logos'][] = $uploadUrl . $n;
                    }
                }
            }
        }

        // Save to ALL active paths
        $encoded = json_encode($newData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if (!$encoded) throw new Exception('Veri kodlanamadı.');

        $successCount = 0;
        foreach ($activePaths as $target) {
            if (file_put_contents($target, $encoded)) $successCount++;
        }

        if ($successCount > 0) {
            sendJson(['success' => true, 'data' => $newData, 'sync_count' => $successCount]);
        } else {
            // Fallback: try to write to the default content.json if no active paths identified
            if (file_put_contents('content.json', $encoded)) {
                sendJson(['success' => true, 'data' => $newData, 'sync_count' => 1]);
            } else {
                throw new Exception('Hiçbir dosyaya yazılamadı. İzinleri kontrol edin.');
            }
        }
    }
} catch (Throwable $e) {
    sendError($e->getMessage());
}
?>
