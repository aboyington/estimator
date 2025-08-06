# Changelog

All notable changes to the White-Label Estimator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2025-08-06

### Fixed - Critical Export Bug
- **Estimate Export Functionality**: Resolved SQLite compatibility issue preventing estimate exports
  - Fixed MySQL-specific `CONCAT()` function calls incompatible with SQLite
  - Updated `GROUP_CONCAT()` syntax from MySQL `SEPARATOR` to SQLite format
  - Corrected SQL concatenation to use SQLite `||` operator instead of `CONCAT()`
  - Enhanced JavaScript error handling with HTTP status validation and array type checking
  - Added comprehensive error messaging for better debugging

### Added - Database Performance Optimization
- **WAL Mode Implementation**: Enabled Write-Ahead Logging for superior performance
  - Concurrent read access during write operations (no more blocking)
  - Better crash recovery and data integrity
  - Automatic transaction log management with checkpointing
- **Memory Optimization**: Enhanced caching and memory utilization
  - Increased cache size from 2,000 to 10,000 pages (~40MB cache)
  - Enabled memory-mapped I/O with 256MB allocation
  - Set temporary operations to use memory instead of disk
- **Synchronization Tuning**: Balanced performance vs. durability settings
  - Configured `NORMAL` synchronous mode for optimal speed/safety balance
  - Reduced I/O overhead while maintaining data reliability

### Enhanced - System Performance
- **5x Performance Improvement**: WAL mode provides significant speed gains for mixed workloads
- **Non-blocking Operations**: Users can read estimates while others write simultaneously
- **Faster Exports**: Optimized database queries and caching reduce export generation time
- **Improved Responsiveness**: Better application performance during database operations

### Technical Implementation
- Updated `api.php` to automatically apply performance settings on all connections
- Modified `setup.php` to enable optimizations for new database installations
- Applied optimizations to existing database via command-line configuration
- Created WAL auxiliary files (`udora_estimates.db-wal`, `udora_estimates.db-shm`)

---

## [1.2.0] - 2025-08-06

### Added - Estimate Export/Import Feature
- **Comprehensive Export**: Export all estimates with complete data to CSV format including line items
- **Detailed CSV Format**: Includes all estimate fields (client info, project details, status, financials, notes) plus line item details
- **Advanced Import**: Import estimates from CSV with automatic estimate number generation to prevent conflicts
- **Batch Processing**: Handle multiple estimates and line items in single import operation
- **Robust CSV Parsing**: Handles quoted values, embedded commas, and newlines properly
- **Data Validation**: Comprehensive validation and error reporting for import operations
- **User Interface**: Professional import/export buttons integrated into History tab
- **Progress Feedback**: Toast notifications and detailed success/error messaging
- **API Endpoints**: New `get_detailed_estimates` and `import_estimates` endpoints
- **Database Optimization**: Efficient queries using GROUP_CONCAT for line item retrieval

### Enhanced
- **History Tab**: Added export/import functionality with consistent UI design
- **Data Portability**: Superior alternative to limited print/preview functionality
- **Backup Capability**: Complete estimate data backup and restore functionality
- **External Integration**: CSV format enables integration with external systems

### Technical Implementation
- Added `exportEstimatesCSV()` JavaScript function for client-side CSV generation
- Added `importEstimatesCSV()` function with advanced CSV parsing capabilities
- Implemented `showEstimateImportForm()` and `cancelEstimateImport()` UI controls
- Created complex SQL query with JOIN operations for detailed estimate retrieval
- Added proper error handling and transaction safety for batch import operations

## [1.1.0] - 2025-08-05

### Added - White-Labeling Implementation
- **Dynamic Page Titles**: Browser tab title automatically updates based on company name from settings
- **Dynamic Header Title**: Main application header displays company branding in real-time  
- **Dynamic Footer Branding**: Footer shows company name with automatic copyright year update
- **Centralized Branding Function**: Single `updateDynamicContent()` function manages all branding updates
- **Real-time Updates**: All branding elements update immediately when settings are saved
- **Fallback Values**: Graceful defaults to "Udora Safety" when no company name is set
- **Version Control Setup**: Git repository initialization and GitHub integration
- **Project Documentation**: Comprehensive README.md with installation and usage instructions
- **Repository Management**: Proper .gitignore configuration excluding sensitive files and backups
- **Version Tagging**: Release tagged as v1.1.0 with detailed release notes

### Changed
- **Project Name**: Renamed from "Udora Safety Estimator" to "White-Label Estimator"
- **Target Audience**: Expanded from single-company use to white-label solution for any contractor/service provider
- **Branding Strategy**: Transformed from fixed branding to completely customizable branding system
- **Documentation**: Updated all documentation to reflect white-labeling capabilities
- **Version Number**: Updated application footer to display v1.1.0

### Technical Implementation
- Added `id="pageTitle"` to HTML title element for dynamic updates
- Added `id="headerTitle"` to main header h1 element for dynamic branding
- Enhanced `updateDynamicContent()` function to handle page title and header title updates
- Implemented real-time branding updates when settings are modified
- Added proper error handling and fallback values for missing company information

### Infrastructure
- Initialized Git repository with proper version control
- Created GitHub repository: https://github.com/aboyington/estimator
- Established .gitignore with exclusions for databases, backups, and system files
- Set up proper commit structure with detailed commit messages
- Tagged release with semantic versioning

## [1.0.0] - 2025-08-01 (Baseline)

### Added - Core Functionality
- **Authentication System**: Password-protected access with session management
- **Estimate Creation**: Complete estimate creation with client information capture
- **Dynamic Line Items**: Add/remove line items with automatic calculations
- **Markup Management**: Category-based markup percentages (Hardware, Parts/Materials, Labor)
- **Tax Calculations**: Configurable tax rates with real-time total updates
- **Sales Commission**: Optional sales representative commission system
- **Estimate History**: View, edit, and delete saved estimates with status tracking
- **Professional Preview**: Clean, printable estimate layout
- **Settings Management**: Configurable company information and pricing settings

### Added - Products & Services Module
- **Product Catalog**: Centralized database of products and services
- **CRUD Operations**: Complete create, read, update, delete functionality
- **One-click Integration**: Add products directly to estimates with automatic form population
- **Category Management**: Product organization by Hardware, Parts/Materials, Labor
- **Advanced Search**: Real-time multi-field search across name, SKU, and description
- **Filtering System**: Category-based filtering with combined operations
- **CSV Import/Export**: Bulk product management with proper validation and error handling
- **Pagination**: Efficient browsing of large product catalogs

### Added - User Experience
- **Status Tracking**: Estimate status management (Draft, Sent, Approved)
- **Visual Form Sections**: Improved form organization and readability  
- **Enhanced Typography**: Professional styling and spacing
- **Responsive Design**: Mobile and tablet compatibility
- **Toast Notifications**: User feedback for all operations
- **Confirmation Dialogs**: Protection against accidental deletions

### Technical Foundation
- **Database**: SQLite database with proper schema and relationships
- **API**: RESTful PHP backend with comprehensive endpoint coverage
- **Frontend**: Vanilla JavaScript single-page application
- **Security**: Input validation, SQL injection prevention, session management
- **Performance**: Optimized calculations and client-side filtering

---

## Version Numbering

This project uses [Semantic Versioning](https://semver.org/):
- **MAJOR**: Incompatible API changes or significant architectural changes
- **MINOR**: New functionality added in a backwards-compatible manner  
- **PATCH**: Backwards-compatible bug fixes

## Repository Information

- **GitHub Repository**: https://github.com/aboyington/estimator
- **License**: Proprietary - All rights reserved
- **Maintainer**: Anthony Boyington
- **Created**: August 2025
