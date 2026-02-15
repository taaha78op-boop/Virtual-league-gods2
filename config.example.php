<?php
// config.example.php
// Copy this to config.php and modify with your settings

return [
    'database' => [
        'host' => 'localhost',
        'name' => 'football_league',
        'user' => 'root',
        'pass' => '',
        'charset' => 'utf8mb4'
    ],
    
    'app' => [
        'name' => 'Football League Management',
        'env' => 'production',
        'debug' => false,
        'timezone' => 'Asia/Tehran'
    ],
    
    'security' => [
        'admin_password' => 'admin123', // Change this!
        'session_lifetime' => 3600,
        'allowed_origins' => ['*']
    ],
    
    'league' => [
        'name' => 'لیگ برتر فوتبال',
        'season' => '2024-2025',
        'default_budget' => 50000000000
    ]
];
?>
