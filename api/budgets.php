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
            $stmt = $db->query("SELECT b.*, t.name as team_name FROM budgets b LEFT JOIN teams t ON b.team_id = t.id");
            sendResponse(true, $stmt->fetchAll());
            break;
        case 'getByTeam':
            $stmt = $db->prepare("SELECT * FROM budgets WHERE team_id = ?");
            $stmt->execute([$_GET['teamId']]);
            sendResponse(true, $stmt->fetch());
            break;
        case 'update':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("UPDATE budgets SET amount = ? WHERE team_id = ?");
            $stmt->execute([$input['amount'], $input['teamId']]);
            sendResponse(true, null, 'بودجه به‌روز شد');
            break;
        default:
            sendResponse(false, null, 'عملیات نامعتبر');
    }
} catch(PDOException $e) {
    sendResponse(false, null, 'خطا: ' . $e->getMessage());
}
?>
