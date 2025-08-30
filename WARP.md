# Estimator Project Documentation

## Overview
A comprehensive web application for creating, managing, and tracking estimates for safety systems and services, built with Tailwind CSS v4.0 and vanilla JavaScript.

## Technology Stack
- **Frontend**: HTML5, Tailwind CSS v4.0, Vanilla JavaScript
- **Server**: Apache (MAMP) on port 80
- **Build Tools**: Tailwind CLI v4.0, npm
- **Browser Support**: Safari 16.4+, Chrome 111+, Firefox 128+

## Project Structure
```
/estimator/
├── index.html                 # Main application (production-ready)
├── tailwind-app.js            # Core application JavaScript
├── packages.js                # Package management functionality
├── src/
│   └── input.css              # Tailwind CSS source with custom styles
├── dist/
│   └── output.css             # Compiled production CSS (81KB)
├── package.json               # Build scripts and dependencies
└── warp.md                    # This documentation file
```

## Features
- **Estimate Creation**: Full estimate builder with client info, project details, and line items
- **History Management**: View, search, and filter past estimates
- **Product Catalog**: Manage products/services with categories and pricing
- **Package System**: Create and manage service packages
- **Settings**: Configure pricing, markup, tax rates, and company information
- **Export/Import**: CSV functionality for data management
- **Responsive Design**: Mobile-friendly interface with responsive navigation
- **Professional Footer**: Dynamic footer with company branding, copyright, and version display

## Tailwind CSS v4.0 Setup

### Migration History
- **Previous**: Using Tailwind CDN (~3MB) - not recommended for production
- **v3.4 Attempt**: Had class detection issues with standalone binary
- **v4.0 Success**: Official upgrade tool migration with modern features

### Current Configuration
**CSS-first configuration** in `src/input.css`:
```css
@import "tailwindcss";

@theme {
  /* Custom color palette */
  --color-udora-50: #f0f4f8;
  --color-udora-500: #2a5298;
  --color-udora-600: #1e3c72;
  --color-udora-700: #1a3461;
  --color-brand-light: #f5f7fa;
  
  /* Custom design tokens */
  --font-family-sans: 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', sans-serif;
  --shadow-card: 0 2px 10px rgba(0, 0, 0, 0.1);
  --shadow-modal: 0 10px 30px rgba(0, 0, 0, 0.2);
  --radius-card: 10px;
}

/* Custom component styles */
.section { display: none; }
.section.active { display: block; }
/* ... additional custom styles ... */
```

### Build Commands
```bash
# Production build (minified)
npm run build

# Development watch mode
npm run watch

# Development server
npm run dev
```

### Performance Benefits
- **Bundle Size**: 81KB (vs 3MB CDN) - **97% reduction**
- **Build Speed**: 5x faster full builds, 100x faster incremental builds
- **Modern CSS**: Uses @property, color-mix(), cascade layers
- **No CDN Dependency**: Fully self-contained

## Development Workflow

### Local Development
1. **Server**: MAMP running on `http://localhost/index.html`
2. **CSS Development**: Run `npm run watch` for live CSS compilation
3. **File Structure**: All source files in project root, compiled CSS in `dist/`

### Production Deployment
1. Run `npm run build` to generate optimized CSS
2. Ensure `dist/output.css` is accessible via web server
3. `index.html` links to compiled CSS (no CDN dependency)

## Custom Styling System

### Color Palette
- **Udora Colors**: Custom blue palette for branding
  - Primary: `#1e3c72` (udora-600)
  - Secondary: `#2a5298` (udora-500) 
  - Light: `#f0f4f8` (udora-50)
- **Brand Colors**: Semantic color tokens
  - Light background: `#f5f7fa` (brand-light)

### Component Classes
- **Navigation**: `.nav-link`, `.mobile-menu`
- **Forms**: `.form-row`, `.form-group`, `.checkbox-group`
- **Tables**: `.line-item`, `.totals`, `.status-badge`
- **UI Components**: `.toast`, `.shadow-card`, `.shadow-modal`

## Application Architecture

### Core Files
- **index.html**: Main application with login screen and tabbed interface
- **tailwind-app.js**: Core functionality (navigation, forms, calculations)
- **packages.js**: Package management features

### Key Features Implementation
- **State Management**: Vanilla JavaScript with localStorage persistence
- **Navigation**: Tab-based SPA with section visibility control
- **Form Handling**: Dynamic form generation and validation
- **Data Export**: CSV generation and download functionality
- **Responsive Design**: Mobile-first with collapsible navigation

## Browser Compatibility
- **Modern Browsers Only**: Requires Safari 16.4+, Chrome 111+, Firefox 128+
- **CSS Features Used**: @property, color-mix(), cascade layers, container queries
- **Fallback Strategy**: No fallbacks - modern CSS features are required

## Recent Updates

### Tailwind CSS v4.0 Upgrade (August 2025)
- ✅ **Automated Migration**: Used `npx @tailwindcss/upgrade` tool
- ✅ **CSS-first Config**: Migrated from JS config to CSS `@theme` blocks
- ✅ **Modern CLI**: Using `@tailwindcss/cli` package
- ✅ **Performance**: Achieved 97% bundle size reduction vs CDN
- ✅ **Compatibility**: All custom colors and components working
- ✅ **Production Ready**: No console warnings, optimized build

### UI/UX Improvements (August 2025)
- ✅ **Professional Footer**: Added dynamic footer with company branding, copyright year, and version display
- ✅ **Footer Positioning**: Fixed flexbox layout to properly position footer at bottom of viewport
- ✅ **Background Color Fix**: Resolved visibility issue with gray-800 background and inline style backup
- ✅ **Custom Input Modal**: Replaced browser prompts with styled modal for category editing
- ✅ **Modal Integration**: Professional modal system with Tailwind CSS styling
- ✅ **Dynamic Content**: Footer updates automatically with settings changes

### Benefits Gained
1. **Performance**: Much faster page loads (81KB vs 3MB)
2. **Modern CSS**: Access to latest CSS features and optimizations
3. **Developer Experience**: Faster builds and better tooling
4. **Production Ready**: No development dependencies in production
5. **Future Proof**: Using stable, officially released version
6. **Professional UI**: Complete user interface with branded footer and modal system

## Maintenance Notes

### CSS Compilation
- **Source**: `src/input.css` contains all styles and configuration
- **Output**: `dist/output.css` is the compiled production CSS
- **Build Process**: Automatically scans HTML files for used classes
- **Custom Styles**: Component-specific styles are preserved at end of compiled CSS

### Dependencies
```json
{
  "devDependencies": {
    "@tailwindcss/cli": "^4.1.12",
    "tailwindcss": "^4.1.12"
  }
}
```

### File Serving
- **Local Development**: MAMP serving from project root
- **CSS Path**: `dist/output.css` must be accessible via web server
- **JavaScript**: Client-side only, no build process needed

## Future Considerations

### Potential Enhancements
- **Database Integration**: Replace localStorage with server-side storage
- **Authentication**: Implement proper user authentication system
- **API Integration**: Add REST API for data management
- **Progressive Web App**: Add service worker for offline functionality

### CSS Framework Evolution
- **Tailwind Updates**: Monitor for v4.x patch updates
- **Browser Support**: Expand support when older browser usage drops
- **Performance**: Consider additional optimizations as needed

---

*Last Updated: August 30, 2025*
*Tailwind CSS Version: v4.1.12*
*Status: Production Ready ✅*
