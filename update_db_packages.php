<?php
// update_db_packages.php - Add packages functionality to existing database

try {
    $db = new PDO('sqlite:estimator.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Enable WAL mode and performance optimizations
    $db->exec('PRAGMA journal_mode=WAL');
    $db->exec('PRAGMA synchronous=NORMAL');
    $db->exec('PRAGMA cache_size=10000');
    $db->exec('PRAGMA temp_store=MEMORY');
    $db->exec('PRAGMA mmap_size=268435456'); // 256MB

    // Create packages table
    $db->exec("CREATE TABLE IF NOT EXISTS packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'camera_systems',
        base_price DECIMAL(10,2) DEFAULT 0.00,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Create package line items table
    $db->exec("CREATE TABLE IF NOT EXISTS package_line_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        package_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_cost DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        markup_percent DECIMAL(5,2),
        line_total DECIMAL(10,2),
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (package_id) REFERENCES packages (id) ON DELETE CASCADE
    )");

    // Create package categories table
    $db->exec("CREATE TABLE IF NOT EXISTS package_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Insert default package categories
    $stmt = $db->query("SELECT COUNT(*) FROM package_categories");
    if ($stmt->fetchColumn() == 0) {
        $defaultPackageCategories = [
            ['camera_systems', 'Camera Systems'],
            ['access_control', 'Access Control'],
            ['intrusion_detection', 'Intrusion Detection'],
            ['fire_safety', 'Fire Safety'],
            ['custom_packages', 'Custom Packages']
        ];
        $stmt = $db->prepare("INSERT INTO package_categories (name, label) VALUES (?, ?)");
        foreach ($defaultPackageCategories as $category) {
            $stmt->execute($category);
        }
    }

    // Insert sample packages
    $stmt = $db->query("SELECT COUNT(*) FROM packages");
    if ($stmt->fetchColumn() == 0) {
        $samplePackages = [
            [
                'name' => '4 Camera System Basic',
                'description' => 'Basic 4-camera security system with DVR, suitable for small residential properties',
                'category' => 'camera_systems',
                'base_price' => 1200.00,
                'status' => 'active'
            ],
            [
                'name' => '8 Camera System Professional',
                'description' => 'Professional 8-camera system with NVR, night vision, and remote monitoring capabilities',
                'category' => 'camera_systems', 
                'base_price' => 2400.00,
                'status' => 'active'
            ],
            [
                'name' => '16 Camera System Enterprise', 
                'description' => 'Enterprise-grade 16-camera system with advanced analytics, cloud storage, and professional installation',
                'category' => 'camera_systems',
                'base_price' => 4800.00,
                'status' => 'active'
            ]
        ];
        
        $stmt = $db->prepare("INSERT INTO packages (name, description, category, base_price, status) VALUES (?, ?, ?, ?, ?)");
        foreach ($samplePackages as $package) {
            $stmt->execute([
                $package['name'],
                $package['description'],
                $package['category'],
                $package['base_price'],
                $package['status']
            ]);
            
            $packageId = $db->lastInsertId();
            
            // Add sample line items for each package
            $sampleLineItems = [];
            
            if ($package['name'] === '4 Camera System Basic') {
                $sampleLineItems = [
                    ['description' => '4MP IP Security Camera', 'quantity' => 4, 'unit_cost' => 150.00, 'category' => 'hardware'],
                    ['description' => '4-Channel NVR System', 'quantity' => 1, 'unit_cost' => 200.00, 'category' => 'hardware'],
                    ['description' => 'Cat6 Network Cable (1000ft)', 'quantity' => 1, 'unit_cost' => 120.00, 'category' => 'parts_materials'],
                    ['description' => 'Power Supply 12V 10A', 'quantity' => 1, 'unit_cost' => 80.00, 'category' => 'hardware'],
                    ['description' => 'Installation and Configuration', 'quantity' => 8, 'unit_cost' => 75.00, 'category' => 'labor']
                ];
            } elseif ($package['name'] === '8 Camera System Professional') {
                $sampleLineItems = [
                    ['description' => '4MP IP Security Camera with Night Vision', 'quantity' => 8, 'unit_cost' => 180.00, 'category' => 'hardware'],
                    ['description' => '8-Channel NVR System with 2TB HDD', 'quantity' => 1, 'unit_cost' => 400.00, 'category' => 'hardware'],
                    ['description' => 'PoE Switch 16-Port', 'quantity' => 1, 'unit_cost' => 150.00, 'category' => 'hardware'],
                    ['description' => 'Cat6 Network Cable (2000ft)', 'quantity' => 1, 'unit_cost' => 200.00, 'category' => 'parts_materials'],
                    ['description' => 'Professional Installation and Setup', 'quantity' => 16, 'unit_cost' => 75.00, 'category' => 'labor']
                ];
            } elseif ($package['name'] === '16 Camera System Enterprise') {
                $sampleLineItems = [
                    ['description' => '4MP IP Security Camera with Advanced Analytics', 'quantity' => 16, 'unit_cost' => 220.00, 'category' => 'hardware'],
                    ['description' => '16-Channel Enterprise NVR with 8TB Storage', 'quantity' => 1, 'unit_cost' => 800.00, 'category' => 'hardware'],
                    ['description' => 'Managed PoE Switch 24-Port', 'quantity' => 1, 'unit_cost' => 300.00, 'category' => 'hardware'],
                    ['description' => 'UPS Battery Backup 1500VA', 'quantity' => 1, 'unit_cost' => 200.00, 'category' => 'hardware'],
                    ['description' => 'Cat6 Network Cable (3000ft)', 'quantity' => 1, 'unit_cost' => 350.00, 'category' => 'parts_materials'],
                    ['description' => 'Enterprise Installation and Configuration', 'quantity' => 24, 'unit_cost' => 85.00, 'category' => 'labor']
                ];
            }
            
            if (!empty($sampleLineItems)) {
                $stmt = $db->prepare("INSERT INTO package_line_items (package_id, description, quantity, unit_cost, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
                $sortOrder = 1;
                foreach ($sampleLineItems as $item) {
                    $stmt->execute([
                        $packageId,
                        $item['description'],
                        $item['quantity'],
                        $item['unit_cost'],
                        $item['category'],
                        $sortOrder++
                    ]);
                }
            }
        }
    }

    echo "Packages database update completed successfully! Added packages, package_line_items, and package_categories tables with sample data.";

} catch (PDOException $e) {
    echo "Database update failed: " . $e->getMessage();
}
?>