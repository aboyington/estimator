<?php
// api_fixed.php - Improved version with better error handling

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session
session_start();

// Set content type
header('Content-Type: application/json');

// Add CORS headers if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get action
$action = $_REQUEST['action'] ?? '';

// Log the request for debugging
error_log("API Request - Action: $action, Method: " . $_SERVER['REQUEST_METHOD']);

// Simple authentication check (skip for login)
if (!isset($_SESSION['authenticated']) && $action !== 'login') {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated', 'session_status' => session_status()]);
    exit;
}

try {
    // Try to connect to database
    if (!file_exists('udora_estimates.db')) {
        throw new Exception('Database file does not exist. Please run setup.php first.');
    }
    
    $db = new PDO('sqlite:udora_estimates.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    switch ($action) {
        case 'login':
            $password = $_POST['password'] ?? '';
            error_log("Login attempt with password: '$password'");
            
            // Change this password as needed
            if ($password === 'udora2024') {
                $_SESSION['authenticated'] = true;
                error_log("Login successful, session set");
                echo json_encode(['success' => true, 'session_id' => session_id()]);
            } else {
                error_log("Login failed, wrong password");
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
            $input = file_get_contents('php://input');
            $settings = json_decode($input, true);
            
            if (!$settings) {
                throw new Exception('Invalid JSON data received');
            }
            
            $stmt = $db->prepare("UPDATE settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_name = ?");
            foreach ($settings as $name => $value) {
                $stmt->execute([$value, $name]);
            }
            echo json_encode(['success' => true]);
            break;

        case 'save_estimate':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!$data) {
                throw new Exception('Invalid JSON data received');
            }
            
            // Generate estimate number
            $estimateNumber = 'EST-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            
            // Insert estimate
            $stmt = $db->prepare("INSERT INTO estimates (estimate_number, client_name, client_email, client_phone, project_address, project_type, system_types, subtotal, tax_amount, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
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
                $data['total_amount']
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

        default:
            echo json_encode(['error' => 'Invalid action: ' . $action]);
    }

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>