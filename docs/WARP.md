# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Essential Development Commands

### Project Setup & Database
```bash
# Initialize database (run once or after schema changes)
php setup.php

# Check database exists and verify structure
ls -la udora_estimates.db* 
sqlite3 udora_estimates.db ".schema"

# Backup database
cp udora_estimates.db udora_estimates_backup_$(date +%Y%m%d_%H%M%S).db

# Database maintenance
sqlite3 udora_estimates.db "PRAGMA wal_checkpoint; VACUUM;"
```

### Local Development Server
```bash
# Using MAMP (preferred for this project)
# Place project in /Applications/MAMP/htdocs/estimator/
# Access via: http://localhost/estimator/
# Default password: udora12345

# Alternative: PHP built-in server for quick testing
php -S localhost:8080 -t .
open http://localhost:8080
```

### Version Management
```bash
# Bump version (updates package.json and index.html footer)
./version.sh patch    # 1.2.0 → 1.2.1
./version.sh minor    # 1.2.0 → 1.3.0
./version.sh major    # 1.2.0 → 2.0.0

# Check current version
node -pe "require('./package.json').version"
```

### Development Tools
```bash
# View database content
sqlite3 udora_estimates.db "SELECT * FROM settings LIMIT 5;"
sqlite3 udora_estimates.db "SELECT * FROM estimates ORDER BY created_at DESC LIMIT 3;"

# Test API endpoints
curl -X POST http://localhost:8080/api.php -H "Content-Type: application/json" -d '{"action":"get_settings"}'

# Check file permissions
ls -la udora_estimates.db api.php index.html
```

## Architecture Overview

### Single-Page Application Structure
This is a vanilla JavaScript SPA with PHP backend API. No frameworks or build tools required.

**Frontend Flow:**
- `index.html` → Single page with multiple sections (New Estimate, History, Products, Packages, Settings)
- JavaScript manages section visibility and state
- All data fetched via API calls to `api.php`
- Real-time calculations in frontend, validated on backend

**Backend Flow:**
- `api.php` → Single file handling all API endpoints with action-based routing
- Session-based authentication (password: configurable in api.php)
- SQLite database with WAL mode for performance
- JSON responses for all API calls

**White-Label System:**
- Company settings stored in `settings` table
- Dynamic page title, header, and footer update via `updateDynamicContent()`
- Branding updates happen real-time when settings saved
- Fallback to "Udora Safety" defaults

## Key API Endpoints

All endpoints go through `api.php` with `action` parameter:

### Authentication
```bash
# Login
curl -X POST api.php -d "action=login&password=udora12345"

# Logout  
curl -X POST api.php -d "action=logout"
```

### Settings Management
```bash
# Get all settings
curl api.php?action=get_settings

# Update settings (white-labeling, markup rates, company info)
curl -X POST api.php -H "Content-Type: application/json" -d '{"action":"update_settings","company_name":"New Company"}'
```

### Estimates
```bash
# Get estimates list
curl api.php?action=get_estimates

# Get single estimate with line items
curl api.php?action=get_estimate&id=123

# Save new estimate
curl -X POST api.php -H "Content-Type: application/json" -d '{"action":"save_estimate","client_name":"Test Client","line_items":[...]}'

# Export all estimates to CSV
curl api.php?action=get_detailed_estimates
```

### Products & Services
```bash
# Get products catalog
curl api.php?action=get_products_services

# Add product
curl -X POST api.php -H "Content-Type: application/json" -d '{"action":"add_product","name":"Test Product","category":"hardware"}'

# Import products from CSV
curl -X POST api.php -F "action=import_products" -F "csv_file=@products.csv"
```

### Packages (v1.2.2+)
```bash
# Get packages
curl api.php?action=get_packages

# Add package
curl -X POST api.php -H "Content-Type: application/json" -d '{"action":"add_package","name":"Camera Package","category":"camera_systems"}'
```

## Database Schema Overview

### Core Tables
- **settings** - Key-value configuration (markup rates, company info, white-label settings)
- **estimates** - Estimate header (client info, totals, status, notes)
- **line_items** - Estimate line items (foreign key to estimates)
- **products_services** - Product catalog (name, category, unit_cost, sku)
- **product_categories** - Dynamic categories for products
- **packages** - Service packages (v1.2.2+)
- **package_categories** - Package categorization (v1.2.2+)

### Key Features
- SQLite with WAL mode enabled for concurrent access
- DECIMAL precision for financial calculations  
- Foreign key constraints with CASCADE delete
- Automatic timestamps (created_at, updated_at)
- JSON storage for system_types arrays

### Database Performance
WAL mode optimizations applied in api.php and setup.php:
```sql
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=10000;
PRAGMA temp_store=MEMORY;
PRAGMA mmap_size=268435456; -- 256MB
```

## Testing & Debugging

### Manual Testing Workflow
1. Login with default password: `udora12345`
2. Create test estimate with multiple line items
3. Test markup calculations (Hardware: 25%, Parts: 30%, Labor: $75/hr)
4. Verify estimate appears in History
5. Test CSV export/import functionality
6. Test white-labeling by changing company name in Settings

### API Testing
```bash
# Test estimate creation
curl -X POST http://localhost:8080/api.php \
  -H "Content-Type: application/json" \
  -d '{"action":"save_estimate","client_name":"Test Client","subtotal":1000,"tax_amount":130,"total_amount":1130,"line_items":[{"description":"Test Item","quantity":1,"unit_cost":100,"category":"hardware","markup_percent":25,"line_total":125}]}'
```

### Debug Mode
Add to api.php temporarily for debugging:
```php
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

## File Structure & Configuration

```
estimator/
├── index.html              # Main SPA interface
├── packages.js             # Package management module (v1.2.2+)
├── api.php                 # Backend API with all endpoints  
├── setup.php               # Database initialization
├── version.sh              # Version bump script
├── package.json            # Project metadata and version
├── udora_estimates.db      # SQLite database (created by setup.php)
├── docs/                   # Documentation
│   ├── udora_estimator_prd.md
│   ├── installation_instructions.md
│   └── CHANGELOG.md
└── .serena/                # Serena AI configuration
```

### Configuration Notes
- **Password:** Change in api.php line ~31: `if ($password === 'udora12345')`
- **White-labeling:** All done through Settings UI, stored in database
- **File permissions:** Database file needs write permissions
- **No build process:** Vanilla JS/PHP, deploy files as-is

## Security Considerations

### Backend Security
- All database queries use prepared statements (PDO)
- Session-based authentication with server-side validation
- Input sanitization on all POST/PUT operations
- File upload validation for CSV imports (mime type checking)

### Database Security
- SQLite file should have restricted permissions (600/644)
- WAL files (.db-wal, .db-shm) created automatically
- Regular backups recommended for data protection

### Password Security
- Default password `udora12345` should be changed in production
- Password stored in plaintext in api.php (consider hashing for production)
- Session management prevents unauthorized access

## Deployment Notes

### Production Deployment
1. **Server Requirements:** PHP 7.4+, SQLite3 extension, Apache/Nginx
2. **File Upload:** Copy all files except `.git/`, `.serena/`, docs can be omitted
3. **Database Setup:** Run `php setup.php` on new server
4. **Permissions:** Ensure web server can write to database file and directory
5. **Password:** Change default password in api.php before deployment
6. **HTTPS:** Recommend SSL for production (login credentials transmitted)

### MAMP to Production Migration
1. Export database: `cp udora_estimates.db production_backup.db`
2. Upload files to web root
3. Set proper file permissions: `chmod 644 *.php *.html && chmod 600 *.db`
4. Test database connectivity and API endpoints
5. Update any hardcoded localhost URLs if present

## Common Issues & Solutions

### Database Issues
- **Error: Database locked** → Check WAL mode enabled, verify file permissions
- **No database file** → Run `php setup.php` to initialize
- **Export fails** → Check SQLite compatibility, verify WAL checkpoint

### Authentication Issues  
- **Can't login** → Verify password in api.php matches input
- **Session expired** → Check PHP session configuration, restart if needed

### White-Label Issues
- **Branding not updating** → Check `updateDynamicContent()` function calls
- **Company name missing** → Verify settings table has `company_name` entry

### Performance Issues
- **Slow queries** → Run `PRAGMA wal_checkpoint; VACUUM;` on database
- **Large CSV imports** → Process in smaller batches, increase PHP memory limit

---

**Current Version:** v1.2.2 (Package Management)  
**Technology Stack:** HTML5, CSS3, Vanilla JavaScript, PHP 7.4+, SQLite3  
**Default Login:** udora12345 (change in production)
