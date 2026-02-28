<?php
header('Content-Type: application/json');
$dir = __DIR__ . '/backups/';
$files = glob($dir . 'content_*.json');
echo json_encode([
    'dir' => $dir,
    'exists' => file_exists($dir),
    'is_dir' => is_dir($dir),
    'glob_pattern' => $dir . 'content_*.json',
    'files_count' => $files ? count($files) : 0,
    'files_dump' => $files,
    'scandir' => file_exists($dir) ? scandir($dir) : null,
    'exec_ls' => shell_exec('ls -la ' . escapeshellarg($dir))
]);
