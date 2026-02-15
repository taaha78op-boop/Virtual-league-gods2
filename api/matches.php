<?php
// api/matches.php
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
            $stmt = $db->query("SELECT m.*, 
                               ht.name as home_team_name, ht.logo as home_team_logo,
                               at.name as away_team_name, at.logo as away_team_logo
                               FROM matches m 
                               LEFT JOIN teams ht ON m.home_team_id = ht.id 
                               LEFT JOIN teams at ON m.away_team_id = at.id 
                               ORDER BY m.match_date DESC");
            $matches = $stmt->fetchAll();
            sendResponse(true, $matches);
            break;
            
        case 'create':
            $input = json_decode(file_get_contents('php://input'), true);
            $match = $input['match'];
            
            $stmt = $db->prepare("INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, 
                                  match_date, stadium, status, week_number, season, referee, attendance, match_stats) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $match['homeTeam'] ?? $match['home_team_id'],
                $match['awayTeam'] ?? $match['away_team_id'],
                $match['homeScore'] ?? $match['home_score'] ?? 0,
                $match['awayScore'] ?? $match['away_score'] ?? 0,
                $match['date'] ?? $match['match_date'],
                $match['stadium'] ?? null,
                $match['status'] ?? 'scheduled',
                $match['week'] ?? $match['week_number'] ?? null,
                $match['season'] ?? null,
                $match['referee'] ?? null,
                $match['attendance'] ?? null,
                json_encode($match['stats'] ?? $match['match_stats'] ?? [])
            ]);
            
            $matchId = $db->lastInsertId();
            sendResponse(true, ['id' => $matchId], 'مسابقه با موفقیت اضافه شد');
            break;
            
        case 'update':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'];
            $match = $input['match'];
            
            $stmt = $db->prepare("UPDATE matches SET home_team_id=?, away_team_id=?, home_score=?, away_score=?, 
                                  match_date=?, stadium=?, status=?, week_number=?, season=?, referee=?, attendance=?, match_stats=? 
                                  WHERE id=?");
            $stmt->execute([
                $match['homeTeam'] ?? $match['home_team_id'],
                $match['awayTeam'] ?? $match['away_team_id'],
                $match['homeScore'] ?? $match['home_score'] ?? 0,
                $match['awayScore'] ?? $match['away_score'] ?? 0,
                $match['date'] ?? $match['match_date'],
                $match['stadium'] ?? null,
                $match['status'] ?? 'scheduled',
                $match['week'] ?? $match['week_number'] ?? null,
                $match['season'] ?? null,
                $match['referee'] ?? null,
                $match['attendance'] ?? null,
                json_encode($match['stats'] ?? $match['match_stats'] ?? []),
                $id
            ]);
            
            sendResponse(true, null, 'مسابقه با موفقیت ویرایش شد');
            break;
            
        case 'delete':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'];
            
            $stmt = $db->prepare("DELETE FROM matches WHERE id = ?");
            $stmt->execute([$id]);
            
            sendResponse(true, null, 'مسابقه با موفقیت حذف شد');
            break;
            
        default:
            sendResponse(false, null, 'عملیات نامعتبر');
    }
} catch(PDOException $e) {
    sendResponse(false, null, 'خطای دیتابیس: ' . $e->getMessage());
}
?>
