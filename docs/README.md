# Estimator - White-Label Estimate Generator

A fully customizable estimate generator application built with PHP and SQLite. Perfect for contractors, service providers, and small businesses who need to create professional estimates quickly and efficiently.

## Features

- **White-Label Ready**: Fully customizable branding with company name, logo, and colors
- **Dynamic Pricing**: Configurable markup percentages for different product categories
- **Product Management**: Complete CRUD operations for products and services
- **Package System**: Create and manage reusable service packages
- **Admin Panel**: Complete user management system for administrators
- **CSV Import/Export**: Bulk import products and export for backup
- **Professional Estimates**: Clean, printable estimates with your branding
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Secure Access**: Password-protected with session management and admin controls
- **History Tracking**: View, edit, and manage all past estimates

## Version

Current Version: **v1.2.4**

### What's New in v1.2.4
- **Admin User Management System**: Complete administrative control over user accounts
- **User Activation/Deactivation**: Admins can manage user access with proper security controls
- **Professional Navigation**: Admin functionality integrated into user dropdown menu
- **Enhanced Security**: Proper authentication and authorization for admin features
- **API Response Consistency**: Fixed backend responses for seamless frontend integration

### Previous Major Updates
- **v1.2.3**: Tailwind CSS v4.0 upgrade with 97% bundle size reduction, professional footer, enhanced UX
- **v1.2.2**: Complete package management system with CRUD operations and CSV import/export
- **v1.2.0**: Estimate export/import functionality with comprehensive CSV support
- **v1.1.0**: Complete white-labeling capabilities with dynamic branding

## Installation

1. Clone this repository
2. Configure your web server to serve the project directory
3. Run `setup.php` to initialize the database
4. Access the application through your web browser
5. Default password: `estimator123` (change this in settings)

## Requirements

- PHP 7.4 or higher
- SQLite3 extension
- Web server (Apache, Nginx, or built-in PHP server)

## File Structure

```
estimator/
├── index.html          # Main application interface
├── api.php            # Backend API handling all requests
├── setup.php          # Database initialization script
├── package.json       # Project metadata and dependencies
├── version.sh         # Version management script
├── docs/              # Documentation folder
└── README.md          # This file
```

## Configuration

### Company Settings
- Company Name
- Contact Information (phone, email)
- Warranty Terms
- Payment Terms
- Tax Rates
- Default Markup Percentages

### Product Categories
Manage custom product categories for better organization:
- Hardware
- Parts & Materials
- Labor
- Custom categories as needed

## Usage

1. **Settings**: Configure your company information and pricing
2. **Products**: Add your products/services or import via CSV
3. **Packages**: Create reusable service packages for common scenarios
4. **Estimates**: Create new estimates with line items
5. **History**: View and manage all estimates
6. **Admin Panel**: Manage user accounts (admin users only)
7. **Export**: Print or save estimates as needed

## Development

This is a single-page application with:
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: PHP with SQLite database
- **Authentication**: Session-based with password protection
- **API**: RESTful endpoints for all operations

## License

© 2025 - All rights reserved

## Support

For support and customization requests, please create an issue in this repository.
