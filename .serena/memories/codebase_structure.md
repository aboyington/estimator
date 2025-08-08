# White-Label Estimator - Codebase Structure

## Project Architecture Overview

The White-Label Estimator is a single-page application (SPA) with a clean separation between frontend and backend components.

## Core Files

### Frontend
- **`index.html`** (Main Application)
  - Complete SPA with embedded CSS and JavaScript
  - Responsive design with mobile-first approach
  - Dynamic content areas for different sections
  - White-labeling elements with dynamic IDs
  - Authentication interface and main application UI

- **`packages.js`** (Package Management Module)
  - Complete package CRUD operations
  - Package category filtering and search
  - CSV import/export functionality
  - Integration with main application state

### Backend
- **`api.php`** (REST API Controller)
  - All API endpoints in single file
  - Action-based routing system
  - Session authentication management
  - Complete CRUD operations for all entities
  - JSON response format throughout

### Database
- **`setup.php`** (Database Initialization)
  - Creates SQLite database and all tables
  - Inserts default settings and categories
  - Handles schema migrations and updates
  - One-time setup script for new installations

- **`udora_estimates.db`** (SQLite Database)
  - Local file-based database
  - No external dependencies
  - Complete data isolation

## Database Schema

### Core Tables
1. **`settings`** - Configuration and company information
   - Key-value pairs for all application settings
   - Company branding information
   - Markup percentages and tax rates

2. **`estimates`** - Main estimate records
   - Client information and project details
   - Financial totals and status tracking
   - Timestamp tracking for audit purposes

3. **`line_items`** - Individual estimate line items
   - Foreign key relationship to estimates
   - Product details and pricing calculations
   - Category-based markup tracking

4. **`products_services`** - Product catalog
   - Centralized product/service database
   - SKU, name, description, category, pricing
   - Integration with estimate line items

5. **`product_categories`** - Category management
   - Hardware, Parts & Materials, Labor
   - Extensible category system

6. **`packages`** - Package definitions and templates
   - Name, description, category, and pricing
   - Package components and bundled items
   - Integration with estimate line items

7. **`package_categories`** - Package category management
   - Organized package groupings
   - Extensible package categorization system
   - Links to packages for filtering and organization

## Frontend Structure (within index.html)

### CSS Organization
- **Base Styles**: Reset, typography, color scheme
- **Layout Components**: Header, navigation, containers
- **Form Styling**: Input fields, buttons, validation states
- **Table Styling**: Data tables with sorting and pagination
- **Responsive Design**: Mobile breakpoints and adaptations
- **Toast Notifications**: User feedback system
- **Print Styles**: Professional estimate output formatting

### JavaScript Modules (Logical Organization)
1. **Authentication Module**
   - Login/logout functionality
   - Session management
   - Password validation

2. **Navigation Module**
   - Section switching
   - Active state management
   - URL fragment handling

3. **Estimate Management**
   - Form handling for estimate creation/editing
   - Line item dynamic addition/removal
   - Real-time calculation engine
   - Status management (Draft/Sent/Approved)

4. **Product Management**
   - CRUD operations for product catalog
   - Search and filtering functionality
   - CSV import/export processing
   - Pagination handling

5. **Package Management**
   - Complete package CRUD operations
   - Package category filtering and search
   - CSV import/export functionality
   - Template-based package creation
   - Integration with estimate line items

6. **Settings Management**
   - Company information updates
   - Markup percentage configuration
   - Product and package category management
   - White-labeling dynamic updates

7. **API Communication**
   - Fetch API wrapper functions
   - Error handling and user feedback
   - Response processing and validation

8. **UI Helper Functions**
   - Toast notification system
   - Form validation utilities
   - Dynamic content updates
   - Print functionality

## API Endpoint Structure

### Authentication Endpoints
- `POST /api.php?action=login` - User authentication
- `POST /api.php?action=logout` - Session termination

### Settings Endpoints
- `GET /api.php?action=get_settings` - Retrieve all settings
- `POST /api.php?action=update_settings` - Update settings

### Estimate Endpoints
- `POST /api.php?action=save_estimate` - Create new estimate
- `GET /api.php?action=get_estimates` - List all estimates
- `GET /api.php?action=get_estimate&id=X` - Get specific estimate
- `POST /api.php?action=update_estimate` - Update existing estimate
- `POST /api.php?action=update_estimate_status` - Update status only
- `DELETE /api.php?action=delete_estimate&id=X` - Delete estimate

### Product Endpoints
- `GET /api.php?action=get_products_services` - List all products
- `POST /api.php?action=save_product_service` - Create/update product
- `POST /api.php?action=update_product_service` - Update existing product
- `DELETE /api.php?action=delete_product_service` - Delete product
- `POST /api.php?action=bulk_delete_products` - Delete multiple products
- `POST /api.php?action=import_products_csv` - CSV import

### Category Endpoints
- `GET /api.php?action=get_product_categories` - List product categories
- `POST /api.php?action=add_product_category` - Create product category
- `POST /api.php?action=update_product_category` - Update product category
- `DELETE /api.php?action=delete_product_category` - Delete product category

### Package Endpoints
- `GET /api.php?action=get_packages` - List all packages
- `POST /api.php?action=save_package` - Create new package
- `POST /api.php?action=update_package` - Update existing package
- `DELETE /api.php?action=delete_package` - Delete package
- `POST /api.php?action=import_packages` - CSV import

### Package Category Endpoints
- `GET /api.php?action=get_package_categories` - List package categories
- `POST /api.php?action=add_package_category` - Create package category
- `POST /api.php?action=update_package_category` - Update package category
- `DELETE /api.php?action=delete_package_category` - Delete package category

## Data Flow

1. **User Authentication**: Session-based security check for all operations
2. **Frontend Request**: JavaScript makes API calls via fetch()
3. **API Processing**: PHP processes request, validates data, interacts with SQLite
4. **Database Operations**: SQLite handles data persistence and retrieval
5. **Response Delivery**: JSON response back to frontend
6. **UI Updates**: JavaScript updates DOM and provides user feedback

## Security Architecture

- **Authentication**: Simple password-based authentication
- **Session Management**: PHP sessions with secure configuration
- **Database Security**: Prepared statements prevent SQL injection
- **Local Storage**: No external data transmission
- **File Permissions**: Secure file system permissions

## White-Labeling Implementation

- **Dynamic Elements**: Page title, header title, footer branding
- **Centralized Function**: `updateDynamicContent()` manages all updates
- **Real-time Updates**: Changes reflect immediately when settings saved
- **Fallback Values**: Graceful defaults when company information missing