# White-Label Estimator

A comprehensive, fully customizable web application for creating, managing, and tracking estimates for contractors and service providers. Built with modern Tailwind CSS v4.0 and featuring complete white-labeling capabilities.

## 🚀 Quick Start

1. **Set up local web server** (MAMP, XAMPP, or built-in PHP server)
2. **Open `index.html`** in your browser
3. **Default login password:** `udora12345` (configurable in `api.php`)
4. **Configure your company branding** in Settings tab

## 📁 Project Structure

```
/estimator/
├── README.md              # Project overview
├── index.html             # Main application (production-ready)
├── tailwind-app.js        # Core application JavaScript
├── packages.js            # Package management functionality
├── api.php                # Backend API endpoints
├── warp.md                # Technical documentation
├── estimator.db           # SQLite database
├── src/                   # 📁 Tailwind CSS source files
│   └── input.css          # Tailwind source with custom styles
├── dist/                  # 📁 Compiled production assets
│   └── output.css         # Optimized CSS (81KB)
├── docs/                  # 📁 All documentation
└── archive/               # 📁 Development & backup files
    ├── development/       # Dev files, old versions
    ├── database-files/    # Database backups
    ├── testing/           # Test files
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

## 🎨 Recent Updates (v1.2.3)

**✅ Tailwind CSS v4.0 & UI/UX Enhancements**
- Complete migration to Tailwind CSS v4.0 with 97% bundle size reduction (3MB → 81KB)
- Professional footer with dynamic company branding and version display
- Enhanced user experience with button loading states and visual feedback
- Improved form layouts with consistent spacing and professional presentation
- Custom modal system replacing browser prompts for better user experience

## 📋 Requirements

- PHP 7.4 or higher
- SQLite extension for PHP
- Web server (Apache, Nginx, or MAMP/XAMPP for development)
- Modern web browser

## 🚀 Getting Started

1. Clone or download the project files
2. Set up a local web server (MAMP, XAMPP, or similar)
3. Place files in your web server's document root
4. Open `index.html` in your browser
5. Login with default password: `udora12345`
6. Configure your company branding in Settings

## 🔧 Development

For CSS development with Tailwind v4.0:
```bash
# Watch for changes during development
npm run watch

# Build optimized CSS for production
npm run build
```

## 📞 Support

For technical support or questions about the White-Label Estimator, please refer to the documentation in the `/docs` folder or contact your system administrator.

---

**Version**: v1.2.3  
**Last Updated**: August 2025  
**Status**: Production Ready ✅
