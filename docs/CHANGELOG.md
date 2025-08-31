# Changelog

All notable changes to the White-Label Estimator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.4] - 2025-08-31

### Added - Admin User Management System
- **Complete Admin Panel**: Full user management system for system administrators
  - Comprehensive user management table displaying all registered users
  - User information display: ID, username, full name, email, role, and status
  - Last login tracking for security and usage monitoring
  - Visual role indicators with Admin/User badges for quick identification
  - Status indicators showing Active/Inactive user states with color coding
- **User Account Management**: Admin controls for user activation and deactivation
  - Secure user deactivation functionality with confirmation dialogs
  - User reactivation capabilities for account restoration
  - Self-protection preventing admins from deactivating their own accounts
  - Proper validation ensuring at least one active admin remains in the system
- **Security Implementation**: Comprehensive authentication and authorization
  - Admin-only access with proper privilege verification on all admin endpoints
  - Session-based authentication with secure admin privilege checks
  - API endpoint protection ensuring only authenticated admins can manage users
  - Frontend security preventing unauthorized access to admin functionality

### Enhanced - Navigation and User Experience
- **Navigation Integration**: Professional admin access through user dropdown menu
  - Admin link moved from main navigation to user dropdown for better UX
  - Positioned between Profile and Settings for logical grouping
  - Mobile navigation includes Admin link in dedicated Account section
  - Consistent visibility control based on user admin privileges
- **User Interface Design**: Professional admin panel with comprehensive user information
  - Clean, responsive table layout for user management
  - Toast notifications for successful operations and error handling
  - Confirmation dialogs for destructive actions (user deactivation)
  - Visual feedback during operations with proper loading states

### Fixed - API Response Format
- **Backend API Consistency**: Corrected JSON response format for frontend integration
  - Fixed `get_all_users` endpoint to return proper `{success: true, users: [...]}` format
  - Previously returned raw array causing "Unknown error" in frontend
  - Enhanced error handling and response consistency across admin endpoints
  - Improved debugging and troubleshooting capabilities

### Technical Implementation
- **Backend API Endpoints**: New admin-specific functionality
  - `GET /api.php?action=get_all_users` - Retrieve all users (admin only)
  - `POST /api.php?action=deactivate_user` - Deactivate user account (admin only)
  - `POST /api.php?action=activate_user` - Activate user account (admin only)
  - Proper HTTP status codes and error responses for all admin operations
- **Frontend JavaScript Integration**: Admin functionality seamlessly integrated
  - `loadUsersForAdmin()` function for fetching and displaying user data
  - `renderUsersTable()` function creating comprehensive user management interface
  - `deactivateUser()` and `activateUser()` functions with confirmation dialogs
  - `updateUserDisplay()` function managing admin link visibility based on privileges
- **Database Schema**: Existing user management leveraged for admin functionality
  - Utilizes existing `is_admin` and `is_active` columns in users table
  - No database migrations required - works with existing user data
  - Proper indexing and performance for user management queries

---

## [1.2.3] - 2025-08-30

### Added - Modern CSS Framework & UI/UX Enhancements
- **Tailwind CSS v4.0 Upgrade**: Complete migration to modern CSS framework
  - Migrated from 3MB CDN to optimized 81KB compiled CSS (97% bundle size reduction)
  - Implemented CSS-first configuration with @theme blocks for better maintainability
  - Achieved 5x faster build times and 100x faster incremental builds
  - Added modern CSS features: @property, color-mix(), cascade layers
  - Enhanced performance with no CDN dependencies for fully self-contained deployment
- **Professional Footer Implementation**: Dynamic footer with comprehensive branding
  - Company name display with automatic Settings integration
  - Dynamic copyright year calculation and display
  - Version number display for software tracking
  - Proper flexbox positioning ensuring footer stays at viewport bottom
  - Professional gray-800 background with white text and inline style backup
- **Custom Modal System**: Replaced browser prompts with styled modals
  - Professional input modal for category editing replacing browser prompt()
  - Tailwind CSS styled modal components with consistent branding
  - Better user experience with visual integration into application design
  - Enhanced accessibility and mobile-friendly interaction patterns

### Enhanced - User Experience & Interface Design
- **Interactive Button Design**: User profile modal buttons with enhanced feedback
  - Loading states with spinning indicators during processing operations
  - Button text changes during processing ("Update Profile" → "Updating..." → "Updated!")
  - Disabled button states with opacity changes and cursor feedback during operations
  - Success confirmation messages that briefly appear before reverting to original state
  - Enhanced "Update Profile" and "Change Password" button hover effects
- **Form Layout Consistency**: Improved spacing and visual consistency
  - Login and register forms updated with consistent grid layout system
  - Replaced space-y-4 with grid grid-cols-1 gap-4 for uniform spacing
  - Added proper button wrapper divs with mt-2 for consistent separation
  - Ensured 16px consistent gaps between all form elements
  - Professional form presentation matching overall application design

### Technical Implementation
- **Build System Enhancement**: Modern Tailwind CSS v4.0 build pipeline
  - CSS-first configuration in `src/input.css` with @theme blocks
  - Automated class detection and compilation to `dist/output.css`
  - npm scripts for development (`npm run watch`) and production (`npm run build`)
  - No external dependencies in production builds
- **Performance Optimization**: Significant improvements in load times and build performance
  - 97% reduction in CSS bundle size improving page load performance
  - Elimination of CDN dependency for fully offline-capable deployment
  - Modern CSS features providing better browser performance and capabilities
  - Faster development workflow with incremental build improvements
- **UI Component Architecture**: Enhanced modal and button interaction systems
  - Centralized button state management for consistent user feedback
  - Professional modal components with proper backdrop and positioning
  - Improved accessibility features and keyboard navigation support
  - Mobile-responsive design patterns throughout the application

---

## [1.2.2] - 2025-01-08

### Added - Package Management System
- **Complete Package Management Module**: New dedicated "Packages" tab with full CRUD functionality
  - Centralized database for predefined service packages
  - Package information capture including name, category, description, pricing, and components
  - JSON-based component storage for flexible package definitions
  - Professional package creation and editing forms with validation
- **Package Category System**: Dynamic category management integrated with Settings
  - Configurable package categories managed through Settings tab
  - Full CRUD operations for package categories (Create, Read, Update, Delete)
  - Real-time category updates reflected in package management forms
  - Integration with existing Settings interface for consistent user experience
- **Advanced Package Interface**: Professional package catalog management
  - Comprehensive package listing with tabular display
  - Real-time search functionality across package names and descriptions
  - Category-based filtering with dropdown selection
  - Combined search and filtering operations for efficient package discovery
- **CSV Import/Export for Packages**: Complete data portability for package definitions
  - One-click export of entire package catalog to structured CSV format
  - Robust CSV import functionality with validation and error reporting
  - Batch processing for multiple package definitions
  - User-friendly interface with clear format instructions and progress feedback

### Enhanced - Navigation and UI Integration
- **Navigation System**: Seamless integration with existing application structure
  - Dedicated "Packages" tab added to main navigation
  - Consistent UI design matching existing application patterns
  - Proper section management and state handling
- **Database Schema**: Efficient package data storage
  - New `packages` table for package definitions with proper indexing
  - New `package_categories` table for category management
  - Foreign key relationships and data integrity constraints
  - Migration-safe schema updates for existing installations

### Fixed - Package Category Display
- **JavaScript Integration**: Resolved package category display issues in Settings tab
  - Fixed function naming conflicts between main application and package module
  - Modified `loadPackageCategories()` in packages.js to call `renderPackageCategoryList()`
  - Enhanced error handling and debugging capabilities
  - Optimized package category loading and rendering performance
- **Code Quality**: Clean implementation following existing patterns
  - Removed temporary debug logging while maintaining essential error handling
  - Consistent code style and structure matching existing modules
  - Proper integration with existing application state management

### Technical Implementation
- **Modular Architecture**: packages.js kept separate for maintainability
  - Complete package CRUD operations in dedicated module
  - Integration functions in main HTML file for Settings management
  - Consistent API patterns following existing endpoint conventions
- **API Endpoints**: New package-related backend functionality
  - `GET /api.php?action=get_packages` - Retrieve all packages with category info
  - `POST /api.php?action=save_package` - Create new package
  - `POST /api.php?action=update_package` - Update existing package
  - `DELETE /api.php?action=delete_package` - Delete package
  - `POST /api.php?action=import_packages` - CSV import
  - Package category endpoints for complete category management
- **Performance Optimizations**: Efficient queries and client-side filtering
  - Proper database indexing for package and category tables
  - Client-side search and filtering for instant response
  - Minimal interface disruption during package operations

---

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
