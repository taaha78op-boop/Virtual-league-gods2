#!/bin/bash

# Football League Management System - Auto Installer
# Run this script to automatically setup the system

echo "========================================="
echo "⚽ Football League Management Installer"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL is not installed!${NC}"
    echo "Please install MySQL first: sudo apt-get install mysql-server"
    exit 1
fi

echo -e "${GREEN}✓ MySQL detected${NC}"

# Ask for database credentials
echo ""
echo "Please enter your MySQL credentials:"
read -p "MySQL Host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "MySQL Username [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -sp "MySQL Password: " DB_PASS
echo ""

read -p "Database Name [football_league]: " DB_NAME
DB_NAME=${DB_NAME:-football_league}

# Test connection
echo ""
echo "Testing MySQL connection..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1" &> /dev/null

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to connect to MySQL!${NC}"
    echo "Please check your credentials and try again."
    exit 1
fi

echo -e "${GREEN}✓ MySQL connection successful${NC}"

# Create database
echo ""
echo "Creating database..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci;"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database created${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
fi

# Import SQL
echo ""
echo "Importing database structure..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < database/setup.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database structure imported${NC}"
else
    echo -e "${RED}❌ Failed to import database${NC}"
    exit 1
fi

# Update config file
echo ""
echo "Updating configuration..."
cat > config/database.php << PHPEOF
<?php
// config/database.php - Auto-generated configuration

class Database {
    private \$host = "$DB_HOST";
    private \$db_name = "$DB_NAME";
    private \$username = "$DB_USER";
    private \$password = "$DB_PASS";
    private \$conn;
    
    public function getConnection() {
        \$this->conn = null;
        
        try {
            \$this->conn = new PDO(
                "mysql:host=" . \$this->host . ";dbname=" . \$this->db_name . ";charset=utf8mb4",
                \$this->username,
                \$this->password
            );
            \$this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            \$this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException \$e) {
            echo "Connection Error: " . \$e->getMessage();
        }
        
        return \$this->conn;
    }
}
?>
PHPEOF

echo -e "${GREEN}✓ Configuration updated${NC}"

# Set permissions
echo ""
echo "Setting permissions..."
chmod 755 api/
chmod 644 api/*.php
chmod 644 config/database.php
echo -e "${GREEN}✓ Permissions set${NC}"

# Summary
echo ""
echo "========================================="
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "========================================="
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo ""
echo "Default Login Credentials:"
echo "  Admin: admin123"
echo "  Team Manager: team123"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Change default passwords in production!${NC}"
echo ""
echo "Access your application at: http://your-domain.com"
echo ""

exit 0
