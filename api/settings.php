<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
require_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();
$action = $_GET['action'] ?? $_POST['action'] ?? '';

function sendResponse($s, $d = null, $m = '') {
    echo json_encode(['success' => $s, 'data' => $d, 'message' => $m], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    switch($action) {
        case 'get':
            $stmt = $db->query("SELECT * FROM settings");
            $settings = [];
            foreach($stmt->fetchAll() as $s) {
                $settings[$s['setting_key']] = $s['setting_value'];
            }
            sendResponse(true, $settings);
            break;
        case 'update':
            $input = json_decode(file_get_contents('php://input'), true);
            foreach($input['settings'] as $key => $value) {
                $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
                $stmt->execute([$key, $value, $value]);
            }
            sendResponse(true, null, 'تنظیمات ذخیره شد');
            break;
        default:
            sendResponse(false, null, 'عملیات نامعتبر');
    }
} catch(PDOException $e) {
    sendResponse(false, null, 'خطا: ' . $e->getMessage());
}
?>
