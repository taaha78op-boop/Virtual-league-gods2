<?php
// api/teams.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
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
            $stmt = $db->query("SELECT * FROM teams ORDER BY name");
            $teams = $stmt->fetchAll();
            sendResponse(true, $teams);
            break;
            
        case 'getById':
            $id = $_GET['id'] ?? 0;
            $stmt = $db->prepare("SELECT * FROM teams WHERE id = ?");
            $stmt->execute([$id]);
            $team = $stmt->fetch();
            sendResponse(true, $team);
            break;
            
        case 'create':
            $input = json_decode(file_get_contents('php://input'), true);
            $team = $input['team'];
            
            $stmt = $db->prepare("INSERT INTO teams (name, logo, manager, stadium, founded, city, budget) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $team['name'],
                $team['logo'] ?? null,
                $team['manager'] ?? null,
                $team['stadium'] ?? null,
                $team['founded'] ?? null,
                $team['city'] ?? null,
                $team['budget'] ?? 0
            ]);
            
            $teamId = $db->lastInsertId();
            
            // Create budget entry
            $stmt = $db->prepare("INSERT INTO budgets (team_id, amount, initial_budget) VALUES (?, ?, ?)");
            $budget = $team['budget'] ?? 0;
            $stmt->execute([$teamId, $budget, $budget]);
            
            sendResponse(true, ['id' => $teamId], 'تیم با موفقیت اضافه شد');
            break;
            
        case 'update':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'];
            $team = $input['team'];
            
            $stmt = $db->prepare("UPDATE teams SET name=?, logo=?, manager=?, stadium=?, founded=?, city=?, budget=? WHERE id=?");
            $stmt->execute([
                $team['name'],
                $team['logo'] ?? null,
                $team['manager'] ?? null,
                $team['stadium'] ?? null,
                $team['founded'] ?? null,
                $team['city'] ?? null,
                $team['budget'] ?? 0,
                $id
            ]);
            
            sendResponse(true, null, 'تیم با موفقیت ویرایش شد');
            break;
            
        case 'delete':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'];
            
            $stmt = $db->prepare("DELETE FROM teams WHERE id = ?");
            $stmt->execute([$id]);
            
            sendResponse(true, null, 'تیم با موفقیت حذف شد');
            break;
            
        default:
            sendResponse(false, null, 'عملیات نامعتبر');
    }
} catch(PDOException $e) {
    sendResponse(false, null, 'خطای دیتابیس: ' . $e->getMessage());
}
?>
