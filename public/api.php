<?php
// Hata raporlamayi acalim
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

function sendError($message, $code = 500) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

try {
    // Resim yukleme klasoru
    $uploadDir = 'uploads/';
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            throw new Exception("Upload klasoru olusturulamadi.");
        }
    }

    $response = ['success' => false, 'message' => 'Islem basarisiz'];

    // Geri alma (Restore) islemi
    if (isset($_GET['action']) && $_GET['action'] === 'restore') {
        $version = $_GET['version'] ?? '';
        if ($version && file_exists("backups/$version")) {
            if (copy("backups/$version", 'content.json')) {
                echo json_encode(['success' => true, 'message' => 'Sistem geri yuklendi: ' . $version]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Geri yukleme basarisiz']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Yedek bulunamadi']);
        }
        exit;
    }

    // Yedekleri listeleme
    if (isset($_GET['action']) && $_GET['action'] === 'list_backups') {
        $backups = glob("backups/content_*.json");
        $list = [];
        if ($backups) {
            foreach ($backups as $backup) {
                $list[] = [
                    'file' => basename($backup),
                    'date' => date("Y-m-d H:i:s", filemtime($backup))
                ];
            }
            // Yeniden eskiye sirala
            usort($list, function($a, $b) {
                return strcmp($b['file'], $a['file']);
            });
        }
        
        echo json_encode(['success' => true, 'backups' => $list]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Mevcut content.json'i oku
        $contentPath = 'content.json';
        if (file_exists($contentPath)) {
            $currentContentData = json_decode(file_get_contents($contentPath), true);
        } else {
            $currentContentData = null;
        }
        
        if (!$currentContentData) {
            $currentContentData = [
                'hero' => [],
                'about' => [],
                'events' => [],
                'announcements' => [],
                'footer' => []
            ];
        }
        
        // YEDEKLEME: Degisiklik yapmadan once mevcut hali yedekle
        if (!file_exists('backups')) {
            mkdir('backups', 0777, true);
        }
        $backupFileName = 'backups/content_' . date('Y-m-d_H-i-s') . '.json';
        if (file_exists($contentPath)) {
            copy($contentPath, $backupFileName);
        }

        // Form data ile gelen JSON verisini al
        $jsonInput = $_POST['data'] ?? '';
        // Magic quotes temizleme (eski PHP surumleri icin)
        if (function_exists('get_magic_quotes_gpc') && get_magic_quotes_gpc()) {
            $jsonInput = stripslashes($jsonInput);
        }
        
        $newData = json_decode($jsonInput, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            // Eger JSON hatali ise veya data gelmemis ise
            if (empty($jsonInput)) {
                // Sadece resim yuklenmis olabilir mi? Hayir, React tarafindan data hep gonderiliyor.
                throw new Exception('Veri alinamadi (data bos).');
            }
            throw new Exception('JSON decode hatasi: ' . json_last_error_msg());
        } else {
            
            // --- 1. Hero Gorseli ---
            if (isset($_FILES['hero_image']) && $_FILES['hero_image']['error'] === UPLOAD_ERR_OK) {
                $fileName = time() . '_hero_' . basename($_FILES['hero_image']['name']);
                if(move_uploaded_file($_FILES['hero_image']['tmp_name'], $uploadDir . $fileName)) {
                    $newData['hero']['imageUrl'] = $uploadDir . $fileName;
                }
            } 

            // --- 2. About Gorseli ---
            if (isset($_FILES['about_image']) && $_FILES['about_image']['error'] === UPLOAD_ERR_OK) {
                $fileName = time() . '_about_' . basename($_FILES['about_image']['name']);
                if(move_uploaded_file($_FILES['about_image']['tmp_name'], $uploadDir . $fileName)) {
                    $newData['about']['imageUrl'] = $uploadDir . $fileName;
                }
            }
            
            // --- 3. Etkinlik Gorselleri ---
            if (isset($newData['events']) && is_array($newData['events'])) {
                foreach ($newData['events'] as $index => &$event) {
                    // Eger 'images' alani yoksa, eski veriden veya bos array olarak baslat
                    if (!isset($event['images'])) {
                        $oldImages = isset($currentContentData['events'][$index]['images']) ? $currentContentData['events'][$index]['images'] : [];
                        $event['images'] = $oldImages;
                    }

                    // Bu index icin dosya yuklenmis mi?
                    $fileKey = 'event_images_' . $index;
                    
                    if (isset($_FILES[$fileKey])) {
                        $files = $_FILES[$fileKey];
                        // Coklu dosya yukleme dongusu
                        if (is_array($files['name'])) {
                            for ($i = 0; $i < count($files['name']); $i++) {
                                if ($files['error'][$i] === UPLOAD_ERR_OK) {
                                    $name = $files['name'][$i];
                                    $tmpName = $files['tmp_name'][$i];
                                    
                                    $newFileName = time() . '_event_' . $index . '_' . basename($name);
                                    if (move_uploaded_file($tmpName, $uploadDir . $newFileName)) {
                                        $event['images'][] = $uploadDir . $newFileName;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // --- 4. Duyuru Gorselleri ---
            if (isset($newData['announcements']) && is_array($newData['announcements'])) {
                foreach ($newData['announcements'] as $index => &$announcement) {
                    if (!isset($announcement['images'])) {
                         $oldImages = isset($currentContentData['announcements'][$index]['images']) ? $currentContentData['announcements'][$index]['images'] : [];
                        $announcement['images'] = $oldImages;
                    }

                    $fileKey = 'announcement_images_' . $index;
                    
                    if (isset($_FILES[$fileKey])) {
                        $files = $_FILES[$fileKey];
                        if (is_array($files['name'])) {
                            for ($i = 0; $i < count($files['name']); $i++) {
                                if ($files['error'][$i] === UPLOAD_ERR_OK) {
                                    $name = $files['name'][$i];
                                    $tmpName = $files['tmp_name'][$i];
                                    
                                    $newFileName = time() . '_ann_' . $index . '_' . basename($name);
                                    if (move_uploaded_file($tmpName, $uploadDir . $newFileName)) {
                                        $announcement['images'][] = $uploadDir . $newFileName;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // JSON dosyasini guncelle
            if(file_put_contents('content.json', json_encode($newData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
                $response['success'] = true;
                $response['message'] = 'Guncelleme basarili!';
                $response['data'] = $newData;
            } else {
                throw new Exception('content.json dosyasina yazilamadi. Yazma izni var mi?');
            }
        }
        
        echo json_encode($response);
    }
} catch (Throwable $e) {
    sendError('Sunucu hatasi (catch): ' . $e->getMessage());
}
?>
