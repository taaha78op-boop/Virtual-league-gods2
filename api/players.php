<?php
// api/players.php
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
            $stmt = $db->query("SELECT p.*, t.name as team_name FROM players p 
                               LEFT JOIN teams t ON p.team_id = t.id 
                               ORDER BY p.name");
            $players = $stmt->fetchAll();
            sendResponse(true, $players);
            break;
            
        case 'getByTeam':
            $teamId = $_GET['teamId'] ?? 0;
            $stmt = $db->prepare("SELECT p.*, t.name as team_name FROM players p 
                                 LEFT JOIN teams t ON p.team_id = t.id 
                                 WHERE p.team_id = ? ORDER BY p.number");
            $stmt->execute([$teamId]);
            $players = $stmt->fetchAll();
            sendResponse(true, $players);
            break;
            
        case 'create':
            $input = json_decode(file_get_contents('php://input'), true);
            $player = $input['player'];
            
            $stmt = $db->prepare("INSERT INTO players (team_id, name, position, number, age, nationality, 
                                  overall, pace, shooting, passing, dribbling, defending, physical, 
                                  image, market_value) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $player['team'] ?? $player['team_id'],
                $player['name'],
                $player['position'],
                $player['number'] ?? null,
                $player['age'] ?? null,
                $player['nationality'] ?? null,
                $player['overall'] ?? 60,
                $player['pace'] ?? 60,
                $player['shooting'] ?? 60,
                $player['passing'] ?? 60,
                $player['dribbling'] ?? 60,
                $player['defending'] ?? 60,
                $player['physical'] ?? 60,
                $player['image'] ?? null,
                $player['marketValue'] ?? $player['market_value'] ?? 0
            ]);
            
            $playerId = $db->lastInsertId();
            sendResponse(true, ['id' => $playerId], 'بازیکن با موفقیت اضافه شد');
            break;
            
        case 'update':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'];
            $player = $input['player'];
            
            $stmt = $db->prepare("UPDATE players SET team_id=?, name=?, position=?, number=?, age=?, nationality=?, 
                                  overall=?, pace=?, shooting=?, passing=?, dribbling=?, defending=?, physical=?, 
                                  goals=?, assists=?, yellow_cards=?, red_cards=?, image=?, market_value=? 
                                  WHERE id=?");
            $stmt->execute([
                $player['team'] ?? $player['team_id'],
                $player['name'],
                $player['position'],
                $player['number'] ?? null,
                $player['age'] ?? null,
                $player['nationality'] ?? null,
                $player['overall'] ?? 60,
                $player['pace'] ?? 60,
                $player['shooting'] ?? 60,
                $player['passing'] ?? 60,
                $player['dribbling'] ?? 60,
                $player['defending'] ?? 60,
                $player['physical'] ?? 60,
                $player['goals'] ?? 0,
                $player['assists'] ?? 0,
                $player['yellowCards'] ?? $player['yellow_cards'] ?? 0,
                $player['redCards'] ?? $player['red_cards'] ?? 0,
                $player['image'] ?? null,
                $player['marketValue'] ?? $player['market_value'] ?? 0,
                $id
            ]);
            
            sendResponse(true, null, 'بازیکن با موفقیت ویرایش شد');
            break;
            
        case 'delete':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'];
            
            $stmt = $db->prepare("DELETE FROM players WHERE id = ?");
            $stmt->execute([$id]);
            
            sendResponse(true, null, 'بازیکن با موفقیت حذف شد');
            break;
            
        default:
            sendResponse(false, null, 'عملیات نامعتبر');
    }
} catch(PDOException $e) {
    sendResponse(false, null, 'خطای دیتابیس: ' . $e->getMessage());
}
?>
