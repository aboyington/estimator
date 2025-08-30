<?php
// api.php - API endpoints for the estimator

session_start();
header('Content-Type: application/json');

// Helper function to hash passwords
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Helper function to verify passwords
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Helper function to get current user ID from session
function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

// Helper function to get current user info
function getCurrentUser($db) {
    $userId = getCurrentUserId();
    if (!$userId) return null;
    
    $stmt = $db->prepare("SELECT id, username, email, first_name, last_name FROM users WHERE id = ? AND is_active = 1");
    $stmt->execute([$userId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Authentication check - allow login, register, and check_auth without authentication
if (!isset($_SESSION['authenticated']) && !in_array($_REQUEST['action'] ?? '', ['login', 'register', 'check_auth'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

try {
    $db = new PDO('sqlite:estimator.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Enable WAL mode and performance optimizations
    $db->exec('PRAGMA journal_mode=WAL');
    $db->exec('PRAGMA synchronous=NORMAL');
    $db->exec('PRAGMA cache_size=10000');
    $db->exec('PRAGMA temp_store=MEMORY');
    $db->exec('PRAGMA mmap_size=268435456'); // 256MB

    $action = $_REQUEST['action'] ?? '';

    switch ($action) {
        case 'login':
            $data = json_decode(file_get_contents('php://input'), true);
            $username = trim($data['username'] ?? '');
            $password = $data['password'] ?? '';
            
            if (empty($username) || empty($password)) {
                echo json_encode(['success' => false, 'error' => 'Username and password are required']);
                break;
            }
            
            // Find user by username or email
            $stmt = $db->prepare("SELECT id, username, email, password_hash, first_name, last_name FROM users WHERE (username = ? OR email = ?) AND is_active = 1");
            $stmt->execute([$username, $username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && verifyPassword($password, $user['password_hash'])) {
                $_SESSION['authenticated'] = true;
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['user_email'] = $user['email'];
                
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'first_name' => $user['first_name'],
                        'last_name' => $user['last_name']
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Invalid username/email or password']);
            }
            break;
            
        case 'register':
            $data = json_decode(file_get_contents('php://input'), true);
            $username = trim($data['username'] ?? '');
            $email = trim($data['email'] ?? '');
            $password = $data['password'] ?? '';
            $firstName = trim($data['first_name'] ?? '');
            $lastName = trim($data['last_name'] ?? '');
            
            // Validation
            if (empty($username) || empty($email) || empty($password)) {
                echo json_encode(['success' => false, 'error' => 'Username, email, and password are required']);
                break;
            }
            
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success' => false, 'error' => 'Invalid email format']);
                break;
            }
            
            if (strlen($password) < 6) {
                echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters long']);
                break;
            }
            
            // Check if username or email already exists
            $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);
            
            if ($stmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'error' => 'Username or email already exists']);
                break;
            }
            
            // Create new user
            $passwordHash = hashPassword($password);
            $stmt = $db->prepare("INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$username, $email, $passwordHash, $firstName, $lastName]);
            
            $userId = $db->lastInsertId();
            
            // Auto-login after registration
            $_SESSION['authenticated'] = true;
            $_SESSION['user_id'] = $userId;
            $_SESSION['username'] = $username;
            $_SESSION['user_email'] = $email;
            
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $userId,
                    'username' => $username,
                    'email' => $email,
                    'first_name' => $firstName,
                    'last_name' => $lastName
                ]
            ]);
            break;
            
        case 'check_auth':
            if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
                $user = getCurrentUser($db);
                if ($user) {
                    echo json_encode(['authenticated' => true, 'user' => $user]);
                } else {
                    session_destroy();
                    echo json_encode(['authenticated' => false]);
                }
            } else {
                echo json_encode(['authenticated' => false]);
            }
            break;

        case 'logout':
            session_destroy();
            echo json_encode(['success' => true]);
            break;

        case 'get_settings':
            $stmt = $db->query("SELECT setting_name, setting_value FROM settings");
            $settings = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $settings[$row['setting_name']] = $row['setting_value'];
            }
            echo json_encode($settings);
            break;

        case 'update_settings':
            $settings = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("UPDATE settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_name = ?");
            foreach ($settings as $name => $value) {
                $stmt->execute([$value, $name]);
            }
            echo json_encode(['success' => true]);
            break;

        case 'save_estimate':
            $data = json_decode(file_get_contents('php://input'), true);
            $userId = getCurrentUserId();
            
            // Generate estimate number
            $estimateNumber = 'EST-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            
            // Insert estimate
            $stmt = $db->prepare("INSERT INTO estimates (estimate_number, client_name, client_email, client_phone, project_address, project_type, system_types, subtotal, tax_amount, total_amount, notes, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $estimateNumber,
                $data['client_name'],
                $data['client_email'] ?? '',
                $data['client_phone'] ?? '',
                $data['project_address'] ?? '',
                $data['project_type'] ?? '',
                json_encode($data['system_types'] ?? []),
                $data['subtotal'],
                $data['tax_amount'],
                $data['total_amount'],
                $data['notes'] ?? '',
                $data['status'] ?? 'draft',
                $userId
            ]);
            
            $estimateId = $db->lastInsertId();
            
            // Insert line items
            $stmt = $db->prepare("INSERT INTO line_items (estimate_id, description, quantity, unit_cost, category, markup_percent, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($data['line_items'] as $item) {
                $stmt->execute([
                    $estimateId,
                    $item['description'],
                    $item['quantity'],
                    $item['unit_cost'],
                    $item['category'],
                    $item['markup_percent'],
                    $item['line_total']
                ]);
            }
            
            echo json_encode(['success' => true, 'estimate_id' => $estimateId, 'estimate_number' => $estimateNumber]);
            break;

        case 'get_estimates':
            $stmt = $db->query("
                SELECT e.id, e.estimate_number, e.client_name, e.project_type, e.total_amount, e.status, e.created_at,
                       u.username as created_by_username, u.first_name as created_by_first_name, u.last_name as created_by_last_name
                FROM estimates e
                LEFT JOIN users u ON e.created_by = u.id
                ORDER BY e.created_at DESC LIMIT 50
            ");
            $estimates = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($estimates);
            break;

        case 'get_estimate':
            $id = $_GET['id'] ?? 0;
            $stmt = $db->prepare("SELECT * FROM estimates WHERE id = ?");
            $stmt->execute([$id]);
            $estimate = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($estimate) {
                $stmt = $db->prepare("SELECT * FROM line_items WHERE estimate_id = ?");
                $stmt->execute([$id]);
                $estimate['line_items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $estimate['system_types'] = json_decode($estimate['system_types'], true);
            }
            
            echo json_encode($estimate);
            break;

        case 'update_estimate':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? 0;
            
            if (!$id) {
                echo json_encode(['success' => false, 'error' => 'No estimate ID provided']);
                break;
            }
            
            // Update estimate
            $stmt = $db->prepare("UPDATE estimates SET client_name = ?, client_email = ?, client_phone = ?, project_address = ?, project_type = ?, system_types = ?, subtotal = ?, tax_amount = ?, total_amount = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([
                $data['client_name'],
                $data['client_email'] ?? '',
                $data['client_phone'] ?? '',
                $data['project_address'] ?? '',
                $data['project_type'] ?? '',
                json_encode($data['system_types'] ?? []),
                $data['subtotal'],
                $data['tax_amount'],
                $data['total_amount'],
                $data['notes'] ?? '',
                $data['status'] ?? 'draft',
                $id
            ]);
            
            // Delete existing line items
            $stmt = $db->prepare("DELETE FROM line_items WHERE estimate_id = ?");
            $stmt->execute([$id]);
            
            // Insert updated line items
            $stmt = $db->prepare("INSERT INTO line_items (estimate_id, description, quantity, unit_cost, category, markup_percent, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($data['line_items'] as $item) {
                $stmt->execute([
                    $id,
                    $item['description'],
                    $item['quantity'],
                    $item['unit_cost'],
                    $item['category'],
                    $item['markup_percent'],
                    $item['line_total']
                ]);
            }
            
            echo json_encode(['success' => true]);
            break;

        case 'update_estimate_status':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("UPDATE estimates SET status = ? WHERE id = ?");
            $stmt->execute([$data['status'], $data['id']]);
            
            echo json_encode(['success' => true]);
            break;

        case 'delete_estimate':
            $id = $_GET['id'] ?? $_POST['id'] ?? 0;
            
            if (!$id) {
                echo json_encode(['success' => false, 'error' => 'No estimate ID provided']);
                break;
            }
            
            // Delete line items first (foreign key constraint)
            $stmt = $db->prepare("DELETE FROM line_items WHERE estimate_id = ?");
            $stmt->execute([$id]);
            
            // Delete estimate
            $stmt = $db->prepare("DELETE FROM estimates WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
            break;

        case 'get_products_services':
            $stmt = $db->query("SELECT * FROM products_services ORDER BY name ASC");
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($products);
            break;

        case 'save_product_service':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $db->prepare("INSERT INTO products_services (sku, name, description, category, unit_cost) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['sku'] ?? '',
                $data['name'],
                $data['description'] ?? '',
                $data['category'],
                $data['unit_cost'] ?? 0
            ]);
            
            echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
            break;

        case 'update_product_service':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? 0;
            
            if (!$id) {
                echo json_encode(['success' => false, 'error' => 'No product ID provided']);
                break;
            }
            
            $stmt = $db->prepare("UPDATE products_services SET sku = ?, name = ?, description = ?, category = ?, unit_cost = ? WHERE id = ?");
            $stmt->execute([
                $data['sku'] ?? '',
                $data['name'],
                $data['description'] ?? '',
                $data['category'],
                $data['unit_cost'] ?? 0,
                $id
            ]);
            
            echo json_encode(['success' => true]);
            break;

        case 'delete_product_service':
            $id = $_GET['id'] ?? $_POST['id'] ?? 0;
            
            if (!$id) {
                echo json_encode(['success' => false, 'error' => 'No product ID provided']);
                break;
            }
            
            $stmt = $db->prepare("DELETE FROM products_services WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
            break;

        case 'get_product_categories':
            try {
                $stmt = $db->query("SELECT * FROM product_categories ORDER BY name");
                $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($categories);
            } catch (Exception $e) {
                echo json_encode(['error' => 'Failed to fetch categories: ' . $e->getMessage()]);
            }
            break;

        case 'add_product_category':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['name']) || empty(trim($input['name']))) {
                echo json_encode(['success' => false, 'error' => 'Category name is required']);
                break;
            }
            
            $name = trim($input['name']);
            $label = isset($input['label']) ? trim($input['label']) : $name;
            
            try {
                // Check if category already exists
                $stmt = $db->prepare("SELECT COUNT(*) FROM product_categories WHERE name = ?");
                $stmt->execute([$name]);
                
                if ($stmt->fetchColumn() > 0) {
                    echo json_encode(['success' => false, 'error' => 'Category already exists']);
                    break;
                }
                
                $stmt = $db->prepare("INSERT INTO product_categories (name, label) VALUES (?, ?)");
                $stmt->execute([$name, $label]);
                
                echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => 'Failed to add category: ' . $e->getMessage()]);
            }
            break;

        case 'update_product_category':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id']) || !isset($input['name']) || empty(trim($input['name']))) {
                echo json_encode(['success' => false, 'error' => 'Category ID and name are required']);
                break;
            }
            
            $id = $input['id'];
            $name = trim($input['name']);
            $label = isset($input['label']) ? trim($input['label']) : $name;
            
            try {
                // Check if another category with the same name exists
                $stmt = $db->prepare("SELECT COUNT(*) FROM product_categories WHERE name = ? AND id != ?");
                $stmt->execute([$name, $id]);
                
                if ($stmt->fetchColumn() > 0) {
                    echo json_encode(['success' => false, 'error' => 'Another category with this name already exists']);
                    break;
                }
                
                $stmt = $db->prepare("UPDATE product_categories SET name = ?, label = ? WHERE id = ?");
                $stmt->execute([$name, $label, $id]);
                
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => 'Failed to update category: ' . $e->getMessage()]);
            }
            break;

        case 'delete_product_category':
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                echo json_encode(['success' => false, 'error' => 'Category ID is required']);
                break;
            }
            
            try {
                // Check if category is being used by any products
                $stmt = $db->prepare("SELECT COUNT(*) FROM products_services WHERE category = (SELECT name FROM product_categories WHERE id = ?)");
                $stmt->execute([$id]);
                
                if ($stmt->fetchColumn() > 0) {
                    echo json_encode(['success' => false, 'error' => 'Cannot delete category that is being used by products']);
                    break;
                }
                
                $stmt = $db->prepare("DELETE FROM product_categories WHERE id = ?");
                $stmt->execute([$id]);
                
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => 'Failed to delete category: ' . $e->getMessage()]);
            }
            break;

        case 'bulk_delete_products':
            $data = json_decode(file_get_contents('php://input'), true);
            $ids = $data['ids'] ?? [];
            
            if (empty($ids) || !is_array($ids)) {
                echo json_encode(['success' => false, 'error' => 'No product IDs provided']);
                break;
            }
            
            $deletedCount = 0;
            $placeholders = str_repeat('?,', count($ids) - 1) . '?';
            $stmt = $db->prepare("DELETE FROM products_services WHERE id IN ($placeholders)");
            
            if ($stmt->execute($ids)) {
                $deletedCount = $stmt->rowCount();
                echo json_encode(['success' => true, 'deleted_count' => $deletedCount]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to delete products']);
            }
            break;

        case 'import_products_services':
            $products = json_decode(file_get_contents('php://input'), true);
            
            if (!is_array($products)) {
                echo json_encode(['success' => false, 'error' => 'Invalid data format']);
                break;
            }
            
            $imported = 0;
            $errors = [];
            
            $stmt = $db->prepare("INSERT INTO products_services (sku, name, description, category, unit_cost) VALUES (?, ?, ?, ?, ?)");
            
            foreach ($products as $index => $product) {
                // Skip empty rows
                if (empty($product['name'])) {
                    continue;
                }
                
                try {
                    $stmt->execute([
                        $product['sku'] ?? '',
                        $product['name'],
                        $product['description'] ?? '',
                        $product['category'] ?? 'hardware',
                        $product['unit_cost'] ?? 0
                    ]);
                    $imported++;
                } catch (PDOException $e) {
                    $errors[] = "Row " . ($index + 1) . ": " . $e->getMessage();
                }
            }
            
            if (count($errors) > 0) {
                echo json_encode([
                    'success' => false, 
                    'error' => 'Some products could not be imported', 
                    'imported' => $imported,
                    'errors' => $errors
                ]);
            } else {
                echo json_encode(['success' => true, 'imported' => $imported]);
            }
            break;

        case 'get_detailed_estimates':
            // Get all estimates with their line items for export
            $stmt = $db->query("
                SELECT e.*, 
                       GROUP_CONCAT(
                           li.description || '|' || li.quantity || '|' || li.unit_cost || '|' || li.category || '|' || li.markup_percent || '|' || li.line_total,
                           ';;'
                       ) as line_items_concat
                FROM estimates e
                LEFT JOIN line_items li ON e.id = li.estimate_id
                GROUP BY e.id
                ORDER BY e.created_at DESC
            ");
            $estimates = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Process line items for each estimate
            foreach ($estimates as &$estimate) {
                $estimate['line_items'] = [];
                if ($estimate['line_items_concat']) {
                    $lineItemStrings = explode(';;', $estimate['line_items_concat']);
                    foreach ($lineItemStrings as $itemString) {
                        $parts = explode('|', $itemString);
                        if (count($parts) >= 6) {
                            $estimate['line_items'][] = [
                                'description' => $parts[0],
                                'quantity' => $parts[1],
                                'unit_cost' => $parts[2],
                                'category' => $parts[3],
                                'markup_percent' => $parts[4],
                                'line_total' => $parts[5]
                            ];
                        }
                    }
                }
                unset($estimate['line_items_concat']);
            }
            
            echo json_encode($estimates);
            break;

        case 'import_estimates':
            $data = json_decode(file_get_contents('php://input'), true);
            $estimates = $data['estimates'] ?? [];
            
            if (!is_array($estimates)) {
                echo json_encode(['success' => false, 'error' => 'Invalid data format']);
                break;
            }
            
            $imported = 0;
            $errors = [];
            
            // Prepare statements
            $estimateStmt = $db->prepare("
                INSERT INTO estimates (estimate_number, client_name, client_email, client_phone, project_address, project_type, system_types, subtotal, tax_amount, total_amount, notes, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $lineItemStmt = $db->prepare("
                INSERT INTO line_items (estimate_id, description, quantity, unit_cost, category, markup_percent, line_total) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            foreach ($estimates as $index => $estimate) {
                // Skip empty estimates
                if (empty($estimate['client_name'])) {
                    continue;
                }
                
                try {
                    // Generate unique estimate number
                    $estimateNumber = 'EST-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                    
                    // Insert estimate
                    $estimateStmt->execute([
                        $estimateNumber,
                        $estimate['client_name'] ?? '',
                        $estimate['client_email'] ?? '',
                        $estimate['client_phone'] ?? '',
                        $estimate['project_address'] ?? '',
                        $estimate['project_type'] ?? 'residential',
                        json_encode([]), // Empty system types array
                        $estimate['subtotal'] ?? 0,
                        $estimate['tax_amount'] ?? 0,
                        $estimate['total_amount'] ?? 0,
                        $estimate['notes'] ?? '',
                        $estimate['status'] ?? 'draft'
                    ]);
                    
                    $estimateId = $db->lastInsertId();
                    
                    // Insert line items if present
                    if (isset($estimate['line_items']) && is_array($estimate['line_items'])) {
                        foreach ($estimate['line_items'] as $lineItem) {
                            if (!empty($lineItem['description'])) {
                                $lineItemStmt->execute([
                                    $estimateId,
                                    $lineItem['description'] ?? '',
                                    $lineItem['quantity'] ?? 1,
                                    $lineItem['unit_cost'] ?? 0,
                                    $lineItem['category'] ?? 'hardware',
                                    $lineItem['markup_percent'] ?? 0,
                                    $lineItem['line_total'] ?? 0
                                ]);
                            }
                        }
                    }
                    
                    $imported++;
                } catch (PDOException $e) {
                    $errors[] = "Estimate " . ($index + 1) . ": " . $e->getMessage();
                }
            }
            
            if (count($errors) > 0) {
                echo json_encode([
                    'success' => false, 
                    'error' => 'Some estimates could not be imported', 
                    'imported' => $imported,
                    'errors' => $errors
                ]);
            } else {
                echo json_encode(['success' => true, 'imported' => $imported]);
            }
            break;

        // Packages endpoints
        case 'get_packages':
            $stmt = $db->query("SELECT * FROM packages WHERE status = 'active' ORDER BY name ASC");
            $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($packages);
            break;

        case 'get_package':
            $id = $_GET['id'] ?? 0;
            $stmt = $db->prepare("SELECT * FROM packages WHERE id = ?");
            $stmt->execute([$id]);
            $package = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($package) {
                $stmt = $db->prepare("SELECT * FROM package_line_items WHERE package_id = ? ORDER BY sort_order ASC");
                $stmt->execute([$id]);
                $package['line_items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode($package);
            break;

        case 'save_package':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Insert package
            $stmt = $db->prepare("INSERT INTO packages (name, description, category, base_price, status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['name'],
                $data['description'] ?? '',
                $data['category'] ?? 'camera_systems',
                $data['base_price'] ?? 0.00,
                $data['status'] ?? 'active'
            ]);
            
            $packageId = $db->lastInsertId();
            
            // Insert package line items
            if (isset($data['line_items']) && is_array($data['line_items'])) {
                $stmt = $db->prepare("INSERT INTO package_line_items (package_id, description, quantity, unit_cost, category, markup_percent, line_total, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $sortOrder = 1;
                foreach ($data['line_items'] as $item) {
                    $stmt->execute([
                        $packageId,
                        $item['description'],
                        $item['quantity'],
                        $item['unit_cost'],
                        $item['category'],
                        $item['markup_percent'] ?? 0,
                        $item['line_total'] ?? 0,
                        $sortOrder++
                    ]);
                }
            }
            
            echo json_encode(['success' => true, 'package_id' => $packageId]);
            break;

        case 'update_package':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? 0;
            
            if (!$id) {
                echo json_encode(['success' => false, 'error' => 'No package ID provided']);
                break;
            }
            
            // Update package
            $stmt = $db->prepare("UPDATE packages SET name = ?, description = ?, category = ?, base_price = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([
                $data['name'],
                $data['description'] ?? '',
                $data['category'] ?? 'camera_systems',
                $data['base_price'] ?? 0.00,
                $data['status'] ?? 'active',
                $id
            ]);
            
            // Delete existing package line items
            $stmt = $db->prepare("DELETE FROM package_line_items WHERE package_id = ?");
            $stmt->execute([$id]);
            
            // Insert updated package line items
            if (isset($data['line_items']) && is_array($data['line_items'])) {
                $stmt = $db->prepare("INSERT INTO package_line_items (package_id, description, quantity, unit_cost, category, markup_percent, line_total, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $sortOrder = 1;
                foreach ($data['line_items'] as $item) {
                    $stmt->execute([
                        $id,
                        $item['description'],
                        $item['quantity'],
                        $item['unit_cost'],
                        $item['category'],
                        $item['markup_percent'] ?? 0,
                        $item['line_total'] ?? 0,
                        $sortOrder++
                    ]);
                }
            }
            
            echo json_encode(['success' => true]);
            break;

        case 'delete_package':
            $id = $_GET['id'] ?? $_POST['id'] ?? 0;
            
            if (!$id) {
                echo json_encode(['success' => false, 'error' => 'No package ID provided']);
                break;
            }
            
            // Delete package line items first (foreign key constraint)
            $stmt = $db->prepare("DELETE FROM package_line_items WHERE package_id = ?");
            $stmt->execute([$id]);
            
            // Delete package
            $stmt = $db->prepare("DELETE FROM packages WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
            break;

        case 'get_package_categories':
            $stmt = $db->query("SELECT * FROM package_categories ORDER BY name ASC");
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($categories);
            break;

        case 'add_package_category':
            $data = json_decode(file_get_contents('php://input'), true);
            $name = $data['name'] ?? '';
            $label = $data['label'] ?? '';
            
            if (!$name || !$label) {
                echo json_encode(['success' => false, 'error' => 'Name and label are required']);
                break;
            }
            
            // Check if category already exists
            $stmt = $db->prepare("SELECT id FROM package_categories WHERE name = ?");
            $stmt->execute([$name]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'error' => 'Category already exists']);
                break;
            }
            
            $stmt = $db->prepare("INSERT INTO package_categories (name, label) VALUES (?, ?)");
            $stmt->execute([$name, $label]);
            
            echo json_encode(['success' => true]);
            break;

        case 'update_package_category':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? 0;
            $name = $data['name'] ?? '';
            $label = $data['label'] ?? '';
            
            if (!$id || !$name || !$label) {
                echo json_encode(['success' => false, 'error' => 'ID, name and label are required']);
                break;
            }
            
            // Check if another category with this name already exists
            $stmt = $db->prepare("SELECT id FROM package_categories WHERE name = ? AND id != ?");
            $stmt->execute([$name, $id]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'error' => 'Another category with this name already exists']);
                break;
            }
            
            $stmt = $db->prepare("UPDATE package_categories SET name = ?, label = ? WHERE id = ?");
            $stmt->execute([$name, $label, $id]);
            
            echo json_encode(['success' => true]);
            break;

        case 'delete_package_category':
            $id = $_GET['id'] ?? $_POST['id'] ?? 0;
            
            if (!$id) {
                echo json_encode(['success' => false, 'error' => 'No category ID provided']);
                break;
            }
            
            // Check if category is being used by any packages
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM packages WHERE category = (SELECT name FROM package_categories WHERE id = ?)");
            $stmt->execute([$id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result['count'] > 0) {
                echo json_encode(['success' => false, 'error' => 'Cannot delete category that is being used by packages']);
                break;
            }
            
            $stmt = $db->prepare("DELETE FROM package_categories WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
            break;

        case 'duplicate_package':
            $id = $_POST['id'] ?? 0;
            
            if (!$id) {
                echo json_encode(['success' => false, 'error' => 'No package ID provided']);
                break;
            }
            
            // Get original package
            $stmt = $db->prepare("SELECT * FROM packages WHERE id = ?");
            $stmt->execute([$id]);
            $originalPackage = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$originalPackage) {
                echo json_encode(['success' => false, 'error' => 'Package not found']);
                break;
            }
            
            // Create new package with "Copy of" prefix
            $newName = 'Copy of ' . $originalPackage['name'];
            $stmt = $db->prepare("INSERT INTO packages (name, description, category, base_price, status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $newName,
                $originalPackage['description'],
                $originalPackage['category'],
                $originalPackage['base_price'],
                'active'
            ]);
            
            $newPackageId = $db->lastInsertId();
            
            // Copy line items
            $stmt = $db->prepare("SELECT * FROM package_line_items WHERE package_id = ? ORDER BY sort_order ASC");
            $stmt->execute([$id]);
            $lineItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($lineItems)) {
                $stmt = $db->prepare("INSERT INTO package_line_items (package_id, description, quantity, unit_cost, category, markup_percent, line_total, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($lineItems as $item) {
                    $stmt->execute([
                        $newPackageId,
                        $item['description'],
                        $item['quantity'],
                        $item['unit_cost'],
                        $item['category'],
                        $item['markup_percent'],
                        $item['line_total'],
                        $item['sort_order']
                    ]);
                }
            }
            
            echo json_encode(['success' => true, 'package_id' => $newPackageId, 'name' => $newName]);
            break;

        case 'add_product':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $db->prepare("INSERT INTO products_services (sku, name, description, category, unit_cost) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['sku'] ?? '',
                $data['name'],
                $data['description'] ?? '',
                $data['category'],
                $data['unit_cost'] ?? 0
            ]);
            
            echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
            break;

        case 'update_product':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? 0;
            
            if (!$id) {
                echo json_encode(['success' => false, 'error' => 'No product ID provided']);
                break;
            }
            
            $stmt = $db->prepare("UPDATE products_services SET sku = ?, name = ?, description = ?, category = ?, unit_cost = ? WHERE id = ?");
            $stmt->execute([
                $data['sku'] ?? '',
                $data['name'],
                $data['description'] ?? '',
                $data['category'],
                $data['unit_cost'] ?? 0,
                $id
            ]);
            
            echo json_encode(['success' => true]);
            break;

        case 'delete_product':
            $id = $_GET['id'] ?? $_POST['id'] ?? 0;
            
            if (!$id) {
                echo json_encode(['success' => false, 'error' => 'No product ID provided']);
                break;
            }
            
            $stmt = $db->prepare("DELETE FROM products_services WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
            break;

        // User management endpoints
        case 'get_current_user':
            $user = getCurrentUser($db);
            if ($user) {
                echo json_encode(['success' => true, 'user' => $user]);
            } else {
                echo json_encode(['success' => false, 'error' => 'User not found']);
            }
            break;
            
        case 'update_profile':
            $data = json_decode(file_get_contents('php://input'), true);
            $userId = getCurrentUserId();
            
            if (!$userId) {
                echo json_encode(['success' => false, 'error' => 'Not authenticated']);
                break;
            }
            
            $firstName = trim($data['first_name'] ?? '');
            $lastName = trim($data['last_name'] ?? '');
            $email = trim($data['email'] ?? '');
            
            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success' => false, 'error' => 'Valid email is required']);
                break;
            }
            
            // Check if email is already used by another user
            $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE email = ? AND id != ?");
            $stmt->execute([$email, $userId]);
            
            if ($stmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'error' => 'Email is already in use']);
                break;
            }
            
            $stmt = $db->prepare("UPDATE users SET first_name = ?, last_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$firstName, $lastName, $email, $userId]);
            
            // Update session email
            $_SESSION['user_email'] = $email;
            
            echo json_encode(['success' => true]);
            break;
            
        case 'change_password':
            $data = json_decode(file_get_contents('php://input'), true);
            $userId = getCurrentUserId();
            
            if (!$userId) {
                echo json_encode(['success' => false, 'error' => 'Not authenticated']);
                break;
            }
            
            $currentPassword = $data['current_password'] ?? '';
            $newPassword = $data['new_password'] ?? '';
            
            if (empty($currentPassword) || empty($newPassword)) {
                echo json_encode(['success' => false, 'error' => 'Current password and new password are required']);
                break;
            }
            
            if (strlen($newPassword) < 6) {
                echo json_encode(['success' => false, 'error' => 'New password must be at least 6 characters long']);
                break;
            }
            
            // Verify current password
            $stmt = $db->prepare("SELECT password_hash FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || !verifyPassword($currentPassword, $user['password_hash'])) {
                echo json_encode(['success' => false, 'error' => 'Current password is incorrect']);
                break;
            }
            
            // Update password
            $newPasswordHash = hashPassword($newPassword);
            $stmt = $db->prepare("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$newPasswordHash, $userId]);
            
            echo json_encode(['success' => true]);
            break;
            
        case 'get_all_users':
            $stmt = $db->query("SELECT id, username, email, first_name, last_name, is_active, created_at FROM users ORDER BY username ASC");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($users);
            break;

        case 'import_products':
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error']);
                break;
            }

            $file = $_FILES['file'];
            $filePath = $file['tmp_name'];
            
            // Check if it's a CSV file
            $fileType = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if ($fileType !== 'csv') {
                echo json_encode(['success' => false, 'error' => 'File must be a CSV']);
                break;
            }

            try {
                $imported = 0;
                $errors = [];
                
                if (($handle = fopen($filePath, 'r')) !== FALSE) {
                    // Read the header row
                    $headers = fgetcsv($handle);
                    if (!$headers) {
                        echo json_encode(['success' => false, 'error' => 'Invalid CSV file or empty headers']);
                        break;
                    }
                    
                    // Map headers to lowercase for flexible matching
                    $headerMap = [];
                    foreach ($headers as $index => $header) {
                        $headerMap[strtolower(trim($header))] = $index;
                    }
                    
                    // Prepare the insert statement
                    $stmt = $db->prepare("INSERT INTO products_services (sku, name, description, category, unit_cost) VALUES (?, ?, ?, ?, ?)");
                    
                    $rowNumber = 1; // Start at 1 since we've read the header
                    while (($row = fgetcsv($handle)) !== FALSE) {
                        $rowNumber++;
                        
                        // Skip empty rows
                        if (empty(array_filter($row))) {
                            continue;
                        }
                        
                        try {
                            // Extract data using flexible header mapping
                            $name = isset($headerMap['name']) ? trim($row[$headerMap['name']]) : '';
                            $sku = isset($headerMap['sku']) ? trim($row[$headerMap['sku']]) : '';
                            $description = isset($headerMap['description']) ? trim($row[$headerMap['description']]) : '';
                            $category = isset($headerMap['category']) ? trim($row[$headerMap['category']]) : 'Uncategorized';
                            
                            // Handle various cost column names
                            $unitCost = 0;
                            if (isset($headerMap['unit cost'])) {
                                $unitCost = floatval($row[$headerMap['unit cost']]);
                            } elseif (isset($headerMap['cost'])) {
                                $unitCost = floatval($row[$headerMap['cost']]);
                            } elseif (isset($headerMap['price'])) {
                                $unitCost = floatval($row[$headerMap['price']]);
                            }
                            
                            // Validate required fields
                            if (empty($name)) {
                                $errors[] = "Row $rowNumber: Product name is required";
                                continue;
                            }
                            
                            // Insert the product
                            $stmt->execute([
                                $sku,
                                $name,
                                $description,
                                $category,
                                $unitCost
                            ]);
                            
                            $imported++;
                        } catch (PDOException $e) {
                            $errors[] = "Row $rowNumber: " . $e->getMessage();
                        }
                    }
                    
                    fclose($handle);
                }
                
                // Return results
                if (count($errors) > 0) {
                    echo json_encode([
                        'success' => $imported > 0,
                        'count' => $imported,
                        'error' => count($errors) . ' rows had errors',
                        'errors' => array_slice($errors, 0, 10) // Limit to first 10 errors
                    ]);
                } else {
                    echo json_encode(['success' => true, 'count' => $imported]);
                }
                
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => 'Import failed: ' . $e->getMessage()]);
            }
            break;

        default:
            echo json_encode(['error' => 'Invalid action']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>