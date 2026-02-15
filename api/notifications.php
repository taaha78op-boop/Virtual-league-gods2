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
        case 'getAll':
            $stmt = $db->query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100");
            sendResponse(true, $stmt->fetchAll());
            break;
        case 'create':
            $input = json_decode(file_get_contents('php://input'), true);
            $n = $input['notification'];
            $stmt = $db->prepare("INSERT INTO notifications (text, type, related_team_id) VALUES (?, ?, ?)");
            $stmt->execute([$n['text'], $n['type'] ?? 'info', $n['related_team_id'] ?? null]);
            sendResponse(true, ['id' => $db->lastInsertId()]);
            break;
        case 'delete':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("DELETE FROM notifications WHERE id = ?");
            $stmt->execute([$input['id']]);
            sendResponse(true, null, 'حذف شد');
            break;
        default:
            sendResponse(false, null, 'عملیات نامعتبر');
    }
} catch(PDOException $e) {
    sendResponse(false, null, 'خطا: ' . $e->getMessage());
}
?>
