<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

try {
    $exportData = [];
    
    // Export all tables
    $tables = ['teams', 'players', 'matches', 'transfers', 'budgets', 'lineups', 'notifications', 'settings'];
    
    foreach($tables as $table) {
        $stmt = $db->query("SELECT * FROM {$table}");
        $exportData[$table] = $stmt->fetchAll();
    }
    
    $exportData['export_date'] = date('Y-m-d H:i:s');
    $exportData['version'] = '1.0';
    
    echo json_encode(['success' => true, 'data' => $exportData], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'خطا: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
