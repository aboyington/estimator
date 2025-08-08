# White-Label Estimator - Technology Stack

## Core Technologies

### Frontend
- **HTML5**: Semantic markup with responsive structure
- **CSS3**: Professional styling with mobile responsiveness
  - Custom CSS with Udora Safety blue theme (#1e3c72)
  - Grid-based responsive layout
  - Professional typography (Segoe UI font family)
- **JavaScript (ES6+)**: Vanilla JavaScript (no frameworks)
  - Dynamic functionality and real-time calculations
  - API communication with fetch() calls
  - Client-side filtering and search
  - Form validation and UI state management

### Backend
- **PHP 7.4+**: Server-side processing and API endpoints
  - RESTful API design with action-based routing
  - Session-based authentication
  - PDO for database operations
  - JSON API responses

### Database
- **SQLite**: Lightweight database for data persistence
  - Local storage (no cloud dependencies)
  - Tables: settings, estimates, line_items, products_services, product_categories
  - Foreign key relationships with CASCADE delete
  - DECIMAL precision for financial calculations

## Architecture
- **Single-Page Application (SPA)**: All functionality in one HTML file
- **API-First Design**: Clean separation between frontend and backend
- **Session Security**: Password protection with server-side session management
- **Local Data Storage**: Complete data privacy with on-premises SQLite database

## Development Tools
- **Version Control**: Git with GitHub integration
- **Version Management**: Custom shell script (version.sh) with npm integration
- **Package Management**: Basic package.json for version tracking
- **Database Setup**: Automated setup.php script for initialization

## File Structure
```
estimator/
├── index.html          # Main SPA interface
├── api.php            # Backend API with all endpoints
├── setup.php          # Database initialization
├── package.json       # Project metadata
├── version.sh         # Version management script
├── docs/              # Documentation
└── .serena/           # Serena AI agent configuration
```