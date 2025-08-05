<?php
// debug.php - Create this file to test your setup

echo "<h2>Udora Estimator Debug</h2>";

// Test 1: PHP Version
echo "<h3>1. PHP Version</h3>";
echo "PHP Version: " . phpversion() . "<br>";

// Test 2: SQLite Support
echo "<h3>2. SQLite Support</h3>";
if (class_exists('PDO') && in_array('sqlite', PDO::getAvailableDrivers())) {
    echo "✅ SQLite PDO support is available<br>";
} else {
    echo "❌ SQLite PDO support is NOT available<br>";
}

// Test 3: Database File
echo "<h3>3. Database File</h3>";
if (file_exists('udora_estimates.db')) {
    echo "✅ Database file exists<br>";
    echo "File size: " . filesize('udora_estimates.db') . " bytes<br>";
    echo "File permissions: " . substr(sprintf('%o', fileperms('udora_estimates.db')), -4) . "<br>";
} else {
    echo "❌ Database file does not exist - run setup.php first<br>";
}

// Test 4: Session Support
echo "<h3>4. Session Support</h3>";
session_start();
if (session_status() === PHP_SESSION_ACTIVE) {
    echo "✅ Sessions are working<br>";
    echo "Session ID: " . session_id() . "<br>";
} else {
    echo "❌ Sessions are not working<br>";
}

// Test 5: Test Database Connection
echo "<h3>5. Database Connection Test</h3>";
try {
    $db = new PDO('sqlite:udora_estimates.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Database connection successful<br>";
    
    // Check if tables exist
    $tables = ['settings', 'estimates', 'line_items'];
    foreach ($tables as $table) {
        $stmt = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='$table'");
        if ($stmt->fetch()) {
            echo "✅ Table '$table' exists<br>";
        } else {
            echo "❌ Table '$table' does not exist<br>";
        }
    }
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "<br>";
}

// Test 6: Test Login API
echo "<h3>6. Login API Test</h3>";
echo '<form method="post" action="debug.php">
    <input type="hidden" name="test_login" value="1">
    <input type="password" name="password" placeholder="Enter password" required>
    <button type="submit">Test Login</button>
</form>';

if (isset($_POST['test_login'])) {
    $password = $_POST['password'] ?? '';
    echo "<p>Testing password: '$password'</p>";
    
    // This is the same logic as in api.php
    if ($password === 'udora2024') {
        echo "✅ Password matches!<br>";
        $_SESSION['authenticated'] = true;
        echo "✅ Session set successfully<br>";
    } else {
        echo "❌ Password does not match 'udora2024'<br>";
    }
}

// Test 7: Browser Console Check
echo "<h3>7. Browser Console Instructions</h3>";
echo "<p>Open your browser's Developer Tools (F12) and check the Console tab for JavaScript errors when trying to log in.</p>";

// Test 8: API Endpoint Test
echo "<h3>8. API Endpoint Test</h3>";
echo '<p>Test the API directly: <a href="api.php?action=get_settings" target="_blank">Click here to test API</a></p>';
echo '<p>You should see either JSON data or an authentication error.</p>';

?>

<script>
// Test JavaScript
console.log("Debug script loaded successfully");

function testLogin() {
    console.log("Testing login function...");
    
    fetch('api.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'action=login&password=udora2024'
    })
    .then(response => {
        console.log("Response status:", response.status);
        return response.text();
    })
    .then(text => {
        console.log("Response text:", text);
        try {
            const json = JSON.parse(text);
            console.log("Parsed JSON:", json);
        } catch (e) {
            console.log("Not valid JSON:", e);
        }
    })
    .catch(error => {
        console.log("Fetch error:", error);
    });
}
</script>

<h3>9. JavaScript Login Test</h3>
<button onclick="testLogin()">Test Login via JavaScript</button>
<p>Check the browser console for results.</p>