<?php
// setup.php - Run this once to create the database and tables

try {
    $db = new PDO('sqlite:estimator.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Enable WAL mode and performance optimizations
    $db->exec('PRAGMA journal_mode=WAL');
    $db->exec('PRAGMA synchronous=NORMAL');
    $db->exec('PRAGMA cache_size=10000');
    $db->exec('PRAGMA temp_store=MEMORY');
    $db->exec('PRAGMA mmap_size=268435456'); // 256MB

    // Settings table
    $db->exec("CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_name TEXT UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Estimates table
    $db->exec("CREATE TABLE IF NOT EXISTS estimates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estimate_number TEXT UNIQUE NOT NULL,
        client_name TEXT NOT NULL,
        client_email TEXT,
        client_phone TEXT,
        project_address TEXT,
        project_type TEXT,
        system_types TEXT,
        subtotal DECIMAL(10,2),
        tax_amount DECIMAL(10,2),
        total_amount DECIMAL(10,2),
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Line items table
    $db->exec("CREATE TABLE IF NOT EXISTS line_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estimate_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_cost DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        markup_percent DECIMAL(5,2),
        line_total DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (estimate_id) REFERENCES estimates (id) ON DELETE CASCADE
    )");

    // Products and services table
    $db->exec("CREATE TABLE IF NOT EXISTS products_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        unit_cost DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Product categories table
    $db->exec("CREATE TABLE IF NOT EXISTS product_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Insert default categories if none exist
    $stmt = $db->query("SELECT COUNT(*) FROM product_categories");
    if ($stmt->fetchColumn() == 0) {
        $defaultCategories = [
            ['hardware', 'Hardware'],
            ['parts_materials', 'Parts & Materials'],
            ['labor', 'Labor']
        ];
        $stmt = $db->prepare("INSERT INTO product_categories (name, label) VALUES (?, ?)");
        foreach ($defaultCategories as $category) {
            $stmt->execute($category);
        }
    }

    // Add SKU column to existing table if it doesn't exist
    try {
        $db->exec("ALTER TABLE products_services ADD COLUMN sku TEXT");
    } catch (PDOException $e) {
        // Column already exists, ignore the error
    }

    // Add notes column to estimates table if it doesn't exist
    try {
        $db->exec("ALTER TABLE estimates ADD COLUMN notes TEXT");
    } catch (PDOException $e) {
        // Column already exists, ignore the error
    }

    // Insert default settings
    $defaultSettings = [
        ['hardware_markup', '25.00'],
        ['parts_materials_markup', '30.00'],
        ['labor_rate', '75.00'],
        ['labor_markup', '0.00'],
        ['sales_rep_commission', '5.00'],
        ['tax_rate', '13.00'],
        ['company_name', 'Udora Safety'],
        ['company_phone', '416 853 2603'],
        ['company_email', 'info@udorasafety.com'],
        ['warranty_terms', '1 year parts and labor warranty'],
        ['payment_terms', 'Net 30 days']
    ];

    $stmt = $db->prepare("INSERT OR IGNORE INTO settings (setting_name, setting_value) VALUES (?, ?)");
    foreach ($defaultSettings as $setting) {
        $stmt->execute($setting);
    }

    echo "Database setup completed successfully!";

} catch (PDOException $e) {
    echo "Database setup failed: " . $e->getMessage();
}
?>