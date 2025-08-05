# Changelog

All notable changes to the White-Label Estimator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
