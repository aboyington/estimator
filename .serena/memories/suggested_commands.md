# White-Label Estimator - Essential Commands

## Development Commands

### Project Setup
```bash
# Initial setup (run once)
php setup.php

# Check if database exists and is properly configured
ls -la udora_estimates.db

# Test database connectivity
php debug.php
```

### Version Management
```bash
# Bump patch version (1.1.0 → 1.1.1)
./version.sh patch

# Bump minor version (1.1.0 → 1.2.0)
./version.sh minor

# Bump major version (1.1.0 → 2.0.0)
./version.sh major

# Check current version
node -pe "require('./package.json').version"
```

### Local Development Server
```bash
# Start PHP built-in server (for development)
php -S localhost:8080

# Access application
open http://localhost:8080

# For MAMP users (as per user's setup)
# Place project in /Applications/MAMP/htdocs/estimator/
# Access via http://localhost/estimator/
```

### Database Operations
```bash
# Backup database
cp udora_estimates.db udora_estimates_backup_$(date +%Y%m%d_%H%M%S).db

# Check database structure
sqlite3 udora_estimates.db ".schema"

# View table contents (for debugging)
sqlite3 udora_estimates.db "SELECT * FROM settings;"
sqlite3 udora_estimates.db "SELECT * FROM estimates LIMIT 5;"
```

### File Management
```bash
# Check project structure
ls -la

# View file permissions
ls -la udora_estimates.db api.php index.html

# Make scripts executable
chmod +x version.sh
```

## Git/Version Control Commands

### Repository Management
```bash
# Check git status
git status

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature description"

# Push to remote
git push origin main

# Create and push version tag
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin v1.1.0
```

### Branching Strategy
```bash
# Create feature branch
git checkout -b feature/new-feature-name

# Switch back to main
git checkout main

# Merge feature branch
git merge feature/new-feature-name
```

## macOS-Specific Commands

### System Commands
```bash
# Open project in default editor
open -a "Visual Studio Code" .

# Open in web browser
open http://localhost:8080

# Check PHP version
php --version

# Check SQLite version
sqlite3 --version
```

### File System
```bash
# Search for files
find . -name "*.php" -type f
find . -name "*.js" -type f

# Grep for patterns
grep -r "function" --include="*.php" .
grep -r "const " --include="*.js" .

# View file contents
cat api.php | head -50
tail -f /var/log/apache2/error.log  # If using Apache
```

## Testing Commands

### Manual Testing
```bash
# Test API endpoints directly
curl -X POST http://localhost:8080/api.php \
  -H "Content-Type: application/json" \
  -d '{"action":"get_settings"}'

# Test login endpoint
curl -X POST http://localhost:8080/api.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=login&password=udora12345"
```

### Browser Testing
```bash
# Test in different browsers
open -a "Google Chrome" http://localhost:8080
open -a "Safari" http://localhost:8080
open -a "Firefox" http://localhost:8080
```

## Production Deployment Commands

### File Permissions
```bash
# Set proper file permissions
chmod 644 *.php *.html
chmod 600 udora_estimates.db
chmod 755 .
```

### Security Checks
```bash
# Check for sensitive files
ls -la *.db *.log *.bak

# Ensure .gitignore is working
git status --ignored
```

## Troubleshooting Commands

### Debug Mode
```bash
# Enable PHP error reporting (add to api.php temporarily)
# ini_set('display_errors', 1);
# error_reporting(E_ALL);

# Check PHP error log
tail -f /var/log/php/error.log

# Check Apache/Nginx error logs
tail -f /var/log/apache2/error.log
```

### Database Issues
```bash
# Check database integrity
sqlite3 udora_estimates.db "PRAGMA integrity_check;"

# Recreate database
rm udora_estimates.db
php setup.php
```