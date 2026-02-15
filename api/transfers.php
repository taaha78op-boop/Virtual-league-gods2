<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();
$action = $_GET['action'] ?? $_POST['action'] ?? '';

function sendResponse($success, $data = null, $message = '') {
    echo json_encode(['success' => $success, 'data' => $data, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    switch($action) {
        case 'getAll':
            $stmt = $db->query("SELECT t.*, p.name as player_name, 
                               ft.name as from_team_name, tt.name as to_team_name
                               FROM transfers t 
                               LEFT JOIN players p ON t.player_id = p.id
                               LEFT JOIN teams ft ON t.from_team_id = ft.id
                               LEFT JOIN teams tt ON t.to_team_id = tt.id
                               ORDER BY t.transfer_date DESC");
            sendResponse(true, $stmt->fetchAll());
            break;
            
        case 'getPending':
            $stmt = $db->query("SELECT t.*, p.name as player_name, 
                               ft.name as from_team_name, tt.name as to_team_name
                               FROM transfers t 
                               LEFT JOIN players p ON t.player_id = p.id
                               LEFT JOIN teams ft ON t.from_team_id = ft.id
                               LEFT JOIN teams tt ON t.to_team_id = tt.id
                               WHERE t.status = 'pending'
                               ORDER BY t.transfer_date DESC");
            sendResponse(true, $stmt->fetchAll());
            break;
            
        case 'create':
            $input = json_decode(file_get_contents('php://input'), true);
            $transfer = $input['transfer'];
            
            $stmt = $db->prepare("INSERT INTO transfers (player_id, from_team_id, to_team_id, amount, transfer_type, status, notes) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $transfer['playerId'] ?? $transfer['player_id'],
                $transfer['fromTeam'] ?? $transfer['from_team_id'] ?? null,
                $transfer['toTeam'] ?? $transfer['to_team_id'],
                $transfer['amount'],
                $transfer['type'] ?? $transfer['transfer_type'] ?? 'buy',
                $transfer['status'] ?? 'pending',
                $transfer['notes'] ?? null
            ]);
            
            sendResponse(true, ['id' => $db->lastInsertId()], 'درخواست نقل و انتقال ثبت شد');
            break;
            
        case 'approve':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'];
            
            $db->beginTransaction();
            
            // Get transfer details
            $stmt = $db->prepare("SELECT * FROM transfers WHERE id = ?");
            $stmt->execute([$id]);
            $transfer = $stmt->fetch();
            
            // Update player team
            $stmt = $db->prepare("UPDATE players SET team_id = ? WHERE id = ?");
            $stmt->execute([$transfer['to_team_id'], $transfer['player_id']]);
            
            // Update budgets
            if($transfer['from_team_id']) {
                $stmt = $db->prepare("UPDATE budgets SET amount = amount + ?, total_earned = total_earned + ? WHERE team_id = ?");
                $stmt->execute([$transfer['amount'], $transfer['amount'], $transfer['from_team_id']]);
            }
            
            $stmt = $db->prepare("UPDATE budgets SET amount = amount - ?, total_spent = total_spent + ? WHERE team_id = ?");
            $stmt->execute([$transfer['amount'], $transfer['amount'], $transfer['to_team_id']]);
            
            // Update transfer status
            $stmt = $db->prepare("UPDATE transfers SET status = 'approved' WHERE id = ?");
            $stmt->execute([$id]);
            
            $db->commit();
            sendResponse(true, null, 'نقل و انتقال تایید شد');
            break;
            
        case 'reject':
            $input = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("UPDATE transfers SET status = 'rejected' WHERE id = ?");
            $stmt->execute([$input['id']]);
            sendResponse(true, null, 'نقل و انتقال رد شد');
            break;
            
        default:
            sendResponse(false, null, 'عملیات نامعتبر');
    }
} catch(PDOException $e) {
    if($db->inTransaction()) $db->rollBack();
    sendResponse(false, null, 'خطا: ' . $e->getMessage());
}
?>
