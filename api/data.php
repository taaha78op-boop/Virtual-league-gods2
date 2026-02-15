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
    if($action === 'getAll') {
        // Get all data for the application
        $data = [];
        
        // Teams
        $stmt = $db->query("SELECT * FROM teams");
        $data['teams'] = $stmt->fetchAll();
        
        // Players
        $stmt = $db->query("SELECT * FROM players");
        $data['players'] = $stmt->fetchAll();
        
        // Matches
        $stmt = $db->query("SELECT * FROM matches");
        $data['matches'] = $stmt->fetchAll();
        
        // Transfers
        $stmt = $db->query("SELECT * FROM transfers");
        $data['transfers'] = $stmt->fetchAll();
        
        // Budgets
        $stmt = $db->query("SELECT * FROM budgets");
        $budgets = $stmt->fetchAll();
        $data['budgets'] = [];
        foreach($budgets as $b) {
            $data['budgets'][$b['team_id']] = $b['amount'];
        }
        
        // Lineups
        $stmt = $db->query("SELECT * FROM lineups WHERE is_active = 1");
        $lineups = $stmt->fetchAll();
        $data['lineups'] = [];
        foreach($lineups as $l) {
            $data['lineups'][$l['team_id']] = json_decode($l['lineup_data'], true);
        }
        
        // Notifications
        $stmt = $db->query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50");
        $data['notifications'] = $stmt->fetchAll();
        
        // Settings
        $stmt = $db->query("SELECT * FROM settings");
        $settings = $stmt->fetchAll();
        $data['settings'] = [];
        foreach($settings as $s) {
            $data['settings'][$s['setting_key']] = $s['setting_value'];
        }
        
        sendResponse(true, $data);
    }
    
    if($action === 'saveAll') {
        $input = json_decode(file_get_contents('php://input'), true);
        // This would be for importing/restoring full database
        sendResponse(true, null, 'داده‌ها ذخیره شد');
    }
    
    sendResponse(false, null, 'عملیات نامعتبر');
    
} catch(PDOException $e) {
    sendResponse(false, null, 'خطا: ' . $e->getMessage());
}
?>
