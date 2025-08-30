# Udora Safety Estimate Generator

A comprehensive web application for creating, managing, and tracking estimates for safety systems and services.

## 🚀 Quick Start

1. **Production Version (Tailwind CSS):**
   - Open `index-tailwind.html` in your browser
   - Modern, responsive design with Tailwind CSS

2. **Legacy Version:**
   - Open `index.html` in your browser
   - Original custom CSS version

## 📁 Project Structure

```
/estimator/
├── README.md              # Project overview
├── index-tailwind.html    # Main application (Tailwind CSS)
├── index.html             # Legacy version (custom CSS)
├── tailwind-app.js        # Main JavaScript functionality
├── packages.js            # Package management functionality
├── api.php                # Backend API endpoints
├── estimator.db           # SQLite database
├── docs/                  # 📁 All documentation
└── archive/               # 📁 Development & backup files
    ├── development/       # Dev tools, configs, debug files
    ├── database-files/    # Database backups & temp files
    ├── testing/           # Test files & style backups
    └── _backup/           # Original backup folder
```

## ✨ Features

- **Estimate Creation**: Build detailed estimates with line items, markup calculations, and totals
- **Client Management**: Track client information and project details
- **Product Catalog**: Manage products and services with categories and pricing
- **Package System**: Create reusable service packages with multiple line items
- **History & Tracking**: View, edit, and manage estimate history
- **CSV Operations**: Export and import data for estimates, products, and packages
- **Settings Management**: Configure company details, tax rates, and markup percentages
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 📖 Documentation

All project documentation is located in the `/docs` folder:

- **[Installation Instructions](docs/installation_instructions.md)** - Setup and deployment guide
- **[Product Requirements](docs/udora_estimator_prd.md)** - Detailed feature specifications  
- **[Tailwind Migration Guide](docs/TAILWIND_MIGRATION_COMPLETE.md)** - Modern CSS migration details
- **[Database Performance](docs/database_performance.md)** - Database optimization notes
- **[Development Guide](docs/WARP.md)** - Technical implementation details
- **[Changelog](docs/CHANGELOG.md)** - Version history and updates

## 🛠 Technology Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: PHP 7.4+
- **Database**: SQLite
- **Server**: Apache/Nginx with PHP support

## 🎨 Recent Updates

**✅ Tailwind CSS Migration Complete**
- Modern utility-first CSS architecture
- Responsive design across all devices
- Custom Udora Safety brand colors
- Improved performance and maintainability
- All original functionality preserved

## 📋 Requirements

- PHP 7.4 or higher
- SQLite extension for PHP
- Web server (Apache, Nginx, or MAMP/XAMPP for development)
- Modern web browser

## 🚀 Getting Started

1. Clone or download the project files
2. Set up a local web server (MAMP, XAMPP, or similar)
3. Place files in your web server's document root
4. Open `index-tailwind.html` in your browser
5. Default password is configured in `api.php`

## 📞 Support

For technical support or questions about the Udora Safety Estimate Generator, please refer to the documentation in the `/docs` folder or contact your system administrator.

---

**Version**: 2.0 (Tailwind CSS)  
**Last Updated**: August 2024  
**Status**: Production Ready ✅
