<?php
// api.php - API endpoints for the estimator

session_start();
header('Content-Type: application/json');

// Simple authentication check
if (!isset($_SESSION['authenticated']) && $_REQUEST['action'] !== 'login') {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

try {
    $db = new PDO('sqlite:udora_estimates.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_REQUEST['action'] ?? '';

    switch ($action) {
        case 'login':
            $password = $_POST['password'] ?? '';
            // Change this password as needed
            if ($password === 'udora12345') {
                $_SESSION['authenticated'] = true;
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Invalid password']);
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
            
            // Generate estimate number
            $estimateNumber = 'EST-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            
            // Insert estimate
            $stmt = $db->prepare("INSERT INTO estimates (estimate_number, client_name, client_email, client_phone, project_address, project_type, system_types, subtotal, tax_amount, total_amount, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
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
                $data['status'] ?? 'draft'
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
            $stmt = $db->query("SELECT id, estimate_number, client_name, project_type, total_amount, status, created_at FROM estimates ORDER BY created_at DESC LIMIT 50");
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

        default:
            echo json_encode(['error' => 'Invalid action']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>