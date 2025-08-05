# Udora Safety Estimator - Installation Guide

## Requirements
- Web server with PHP 7.4+ and SQLite support
- Modern web browser

## Installation Steps

### 1. Upload Files
Upload these files to your web server directory:
- `index.html` - Main application
- `api.php` - Backend API handler
- `setup.php` - Database initialization script

### 2. Initialize Database
Visit `your-domain.com/setup.php` in your browser to create the database and tables. You should see "Database setup completed successfully!"

### 3. Security Setup
**Important:** Change the default password in `api.php`:
```php
// Line 19 in api.php - Change 'udora12345' to your secure password
if ($password === 'your_secure_password_here') {
```

### 4. Access the Application
Navigate to `your-domain.com/index.html` and login with your password.

## Default Settings
The system comes pre-configured with:
- Hardware markup: 25%
- Parts/Materials markup: 30%  
- Labor rate: $75/hour
- Tax rate: 13% (HST)
- Company info: Udora Safety details

## Features Overview

### Estimate Creation
- Client information capture
- Internal notes for estimates
- Multiple system types (CCTV, Alarm, Access Control, Cabling)
- Dynamic line items with automatic markup calculation
- Real-time total calculations
- Professional estimate preview and printing

### Settings Management
- Customizable markup percentages by category
- Company information updates
- Tax rate configuration
- Warranty and payment terms

### Estimate History
- View all saved estimates
- Edit existing estimates
- Delete estimates with confirmation
- Professional estimate preview
- Print functionality
- **Estimate Status Tracking:** Manage and track the status of each estimate (Draft, Sent, Approved).

### Products & Services Management
- Create and manage product catalog
- Organize products by category (Hardware, Parts/Materials, Labor)
- One-click product addition to estimates
- Edit and delete products
- Seamless integration with estimate creation
- **Pagination:** For easier browsing of large product catalogs.
- **Advanced Search & Filtering:** Quickly find products in large catalogs
  - Real-time search across product name, SKU, and description
  - Category-based filtering with dropdown selection
  - Combined search and category filtering
  - Dynamic filter status showing count and active filters
  - "Clear Filters" button for quick reset
- **CSV Import/Export:** Bulk import and export products via CSV files
  - Export entire catalog to CSV with proper value escaping
  - Import products from CSV with validation and error reporting
  - Format: SKU, Name, Category, Unit Cost, Description

## File Structure
```
/your-web-directory/
├── index.html          # Main application
├── api.php            # Backend API
├── setup.php          # Database setup
└── udora_estimates.db # SQLite database (created automatically)
```

## Security Notes
- Only you have access via password authentication
- Database stored locally on your server
- No external dependencies or cloud storage
- Session-based authentication

## Troubleshooting

### Database Issues
- Ensure SQLite is enabled in PHP
- Check file permissions on the directory
- Re-run setup.php if needed

### Login Issues  
- Verify password in api.php matches what you're entering
- Check browser developer console for errors
- Ensure PHP sessions are working

### Calculation Issues
- Verify settings are saved properly
- Check that markup percentages are configured
- Refresh the page and try again

## Customization
You can modify:
- Company branding in the CSS
- Default markup percentages in setup.php
- Password authentication method in api.php
- Estimate template in the preview function

## Backup
Regular backup of `udora_estimates.db` is recommended to preserve your estimate history and settings.
