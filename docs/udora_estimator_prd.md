# Udora Safety Estimator - Product Requirements Document

## Project Overview
**Product Name:** Udora Safety Estimator  
**Version:** 1.6
**Date:** August 2025
**Project Type:** Web Application  
**Technology Stack:** HTML, CSS, JavaScript, PHP, SQLite  

A secure, single-page web application for creating professional estimates for security systems, alarm systems, CCTV, and access control installations. Designed exclusively for Udora Safety internal use with password-protected access.

## Business Requirements

### Primary Objectives
- Streamline estimate creation process for security system installations
- Ensure consistent pricing with automated markup calculations
- Generate professional-looking estimates for client presentation
- Maintain estimate history for reference and follow-up
- Provide centralized product/service catalog for consistent estimates
- Provide secure, private access for company use only

### Target Users
- Primary: Udora Safety sales representatives and project managers
- Secondary: Company owner for oversight and final approvals

## Functional Requirements

### 1. Authentication & Security
- **Password Protection:** Single password authentication for app access
- **Session Management:** Secure session-based authentication
- **Data Privacy:** All data stored locally on company server
- **Access Control:** No public access or external user registration

### 2. Estimate Creation Module
#### Client Information Capture
- Client name (required)
- Contact details (email, phone)
- Project address
- Project type selection (Residential/Commercial)
- Internal notes for estimate

#### System Type Selection
- CCTV/Security Cameras
- Alarm Systems  
- Access Control
- Structured Cabling
- Multiple system types per estimate

#### Dynamic Line Items
- Product/service description
- Quantity input
- Unit cost (pre-markup)
- Category classification:
  - Hardware
  - Parts & Materials
  - Labor
- Automatic markup application based on category
- Real-time line total calculation
- Add/remove line items functionality

#### Automatic Calculations
- Subtotal computation
- Optional sales representative commission (configurable percentage)
- Tax calculation (configurable HST rate)
- Final total with all markups, commissions, and taxes
- Real-time updates as items are modified
- Dynamic commission display when enabled

### 3. Settings Management
#### Markup Configuration
- Hardware markup percentage (default: 25%)
- Parts & materials markup percentage (default: 30%)
- Labor rate per hour (default: $75)
- Labor markup percentage (default: 0%)
- Sales representative commission percentage (default: 5%)

#### Tax & Billing Settings
- Configurable tax rate (default: 13% HST)
- Payment terms customization
- Warranty terms configuration

#### Company Information
- Company name and contact details
- Default company information pre-populated
- Customizable terms and conditions

### 4. Estimate Output & Management
#### Professional Estimate Generation
- Clean, branded estimate layout
- Company header with contact information
- Client billing information display
- Detailed line item breakdown
- Subtotal, tax, and total calculations
- Terms and conditions footer

#### Export & Printing
- Print-friendly estimate format
- PDF-ready output for client delivery
- Professional presentation quality

#### Estimate History & Management
- Comprehensive estimate database with tabular view
- View previously created estimates with full detail preview
- Edit existing estimates with form population
- Delete estimates with confirmation protection
- Estimate numbering system (EST-YYYY-XXXX format)
- Date tracking and organization
- Seamless transition between viewing, editing, and creating estimates

### 5. Products & Services Management Module
#### Product Catalog Management
- Centralized database of frequently used products and services
- Product information including name, description, category, and unit cost
- Category classification matching estimate line items (Hardware, Parts/Materials, Labor)
- Add, edit, and delete products with full CRUD functionality
- Confirmation dialogs for destructive operations

#### Estimate Integration
- One-click product addition to active estimates
- Automatic form population with product details
- Seamless integration with existing markup and calculation systems
- Pre-configured category selection and unit costs
- Immediate total recalculation upon product addition

#### User Interface Features
- Tabular product listing with pagination
- Inline editing capabilities for existing products
- Form-based product creation and modification
- **Advanced Search and Filter System** for efficient product discovery
- Category-based organization and display
- Real-time filter status display with active filter indicators

#### CSV Import/Export Functionality
- **CSV Export:** One-click export of entire product catalog to CSV format
  - Proper CSV value escaping for commas, quotes, and newlines
  - Headers: SKU, Name, Category, Unit Cost, Description
  - Automatic file download with timestamped filename
- **CSV Import:** Bulk product import from CSV files
  - Robust CSV parser handling quoted values and embedded commas
  - Format validation and error reporting per row
  - Success/failure reporting with detailed feedback
  - User-friendly interface with format instructions
  - Backend API integration for secure data processing

#### Advanced Search and Filtering System
- **Multi-field Search Functionality**
  - Real-time search across product name, SKU, and description fields
  - Case-insensitive text matching with partial string support
  - Instant results display as user types (no search button required)
  - Search query highlighting in filter status display
- **Category-based Filtering**
  - Dropdown filter for Hardware, Parts/Materials, and Labor categories
  - "All Categories" option for comprehensive product viewing
  - Category filter integration with search functionality
  - Clear visual category labels in results
- **Combined Filter Operations**
  - Simultaneous search and category filtering capability
  - Logical AND operation between search and category filters
  - Products must match both search query AND selected category
  - Independent filter clearing (search can be cleared while maintaining category filter)
- **Dynamic Filter Status Display**
  - Real-time count of filtered vs. total products (e.g., "Showing 5 of 20 products")
  - Active filter indicator showing applied search terms and categories
  - Clear messaging format: "Showing X of Y products (filtered by search: 'term', category: Hardware)"
  - Automatic status updates as filters change
- **User Experience Enhancements**
  - "Clear Filters" button for quick reset to show all products
  - Dedicated search and filter control panel with professional styling
  - No-results messaging when filters return empty product set
  - Seamless integration with existing product management interface
- **Performance Optimizations**
  - Client-side filtering for instant response (no server requests during filtering)
  - Efficient JavaScript search algorithms for large product catalogs
  - Minimal interface disruption during filter operations

### 6. UI/UX Enhancements & Status Tracking
- **Estimate Status Tracking:** Estimates can now be assigned a status of "Draft," "Sent," or "Approved."
- **Visual Form Sections:** The estimate form is now divided into clear, visually distinct sections for improved readability and organization.
- **Enhanced Typography & Spacing:** Improved fonts, spacing, and layout for a more professional and user-friendly experience.
- **Status History:** The estimate history table now displays the current status of each estimate, with the ability to update the status directly from the history view.

## Technical Requirements

### Frontend Technologies
- **HTML5:** Semantic markup and responsive structure
- **CSS3:** Professional styling with mobile responsiveness
- **JavaScript (ES6+):** Dynamic functionality and API communication

### Backend Technologies
- **PHP 7.4+:** Server-side processing and API endpoints
- **SQLite:** Lightweight database for data persistence

### Database Schema
#### Settings Table
- Configuration storage for markups and company info
- Key-value pair structure for flexibility

#### Estimates Table
- Estimate metadata and client information
- Financial totals and project details
- Status tracking and timestamps
- Internal notes storage

#### Line Items Table
- Individual estimate line item details
- Foreign key relationship to estimates
- Category and pricing information

#### Products & Services Table
- Centralized product/service catalog
- Product name, description, and categorization
- Standard unit costs and category assignments
- Integration with estimate line items

### Security Requirements
- Password authentication (configurable)
- Session-based access control
- Local data storage (no cloud dependencies)
- Input validation and sanitization

### Performance Requirements
- Page load time under 2 seconds
- Real-time calculation updates
- Responsive design for mobile devices
- Estimate creation time under 10 minutes

## User Interface Requirements

### Design Principles
- Clean, professional appearance matching Udora Safety branding
- Intuitive navigation with clear section separation
- Form-based interface with logical field grouping
- Responsive layout for desktop and mobile use

### Navigation Structure
- **New Estimate:** Primary estimate creation interface
- **History:** Estimate viewing and management
- **Products & Services:** Product catalog management and integration
- **Settings:** Configuration and company information
- **Logout:** Secure session termination

### Visual Design
- Udora Safety color scheme (blue primary: #1e3c72)
- Professional typography and spacing
- Clear visual hierarchy and information organization
- Print-optimized estimate layout

## Data Management

### Data Storage
- Local SQLite database on company server
- No external data transmission or cloud storage
- Automatic database initialization via setup script

### Data Backup
- Manual database file backup recommended
- Export functionality for settings configuration
- Estimate data preservation through database backups

### Data Security
- Local storage eliminates external security risks
- Session-based authentication prevents unauthorized access
- No sensitive data transmitted to third parties

## Success Metrics

### Efficiency Metrics
- Estimate creation time: Target under 10 minutes
- Calculation accuracy: 100% automated markup application
- User adoption: Primary tool for all estimates

### Quality Metrics
- Professional presentation standard
- Consistent branding across all estimates
- Error-free pricing calculations

### Business Metrics
- Time savings compared to manual estimate creation
- Improved estimate consistency and professionalism
- Enhanced client presentation quality

## Implementation Phases

### Phase 1: Core Functionality (Complete)
- ✅ Database setup and initialization
- ✅ Authentication system implementation
- ✅ Basic estimate creation interface
- ✅ Line item management
- ✅ Automatic calculations

### Phase 2: Advanced Features (Complete)
- ✅ Settings management interface
- ✅ Estimate history and viewing
- ✅ Professional estimate preview
- ✅ Print functionality
- ✅ Estimate editing and updating
- ✅ Estimate deletion with safeguards
- ✅ Sales representative commission system

### Phase 3: Products & Services Management (Complete)
- ✅ Product catalog database design and implementation
- ✅ Products & Services management interface
- ✅ CRUD operations for product management
- ✅ One-click product integration with estimates
- ✅ Category-based product organization
- ✅ Real-time estimate updates from product selection

### Phase 4: Testing & Deployment (Complete)
- ✅ Cross-browser compatibility testing
- ✅ Mobile responsiveness verification
- ✅ Security testing and validation
- ✅ Production deployment

### Phase 5: CSV Import/Export Implementation (Complete)
- ✅ CSV export functionality for Products & Services catalog
- ✅ CSV import functionality with robust parsing and validation
- ✅ Custom CSV parser handling quoted values and embedded commas
- ✅ Import validation with error handling and success reporting
- ✅ User-friendly import interface with format instructions
- ✅ Backend API endpoint for bulk product import operations

### Phase 6: Advanced Product Search and Filtering (Complete)
- ✅ Real-time multi-field search functionality across name, SKU, and description
- ✅ Category-based dropdown filtering with "All Categories" option
- ✅ Combined search and category filtering with logical AND operations
- ✅ Dynamic filter status display showing filtered count and active filters
- ✅ "Clear Filters" button for quick reset functionality
- ✅ Client-side filtering for instant response and optimal performance
- ✅ Professional search and filter control panel with integrated styling
- ✅ No-results messaging and user-friendly feedback systems
- ✅ Seamless integration with existing product management interface

### Phase 7: Internal Notes and Pagination (Complete)
- ✅ Internal notes field added to estimates for non-client-facing information
- ✅ Notes saved and retrieved from the database
- ✅ Pagination for the Products & Services list for improved performance and usability

### Phase 8: UI/UX Enhancements & Status Tracking (Complete)
- ✅ Estimate status tracking (Draft, Sent, Approved)
- ✅ Visual separation of form sections for improved readability
- ✅ Enhanced typography and spacing for a more professional look
- ✅ Ability to update estimate status directly from the history page

### Short-term Enhancements
- Estimate templates for common installation types
- Client database integration for repeat customers
- Bulk product operations and batch updates

### Medium-term Enhancements
- Email integration for direct estimate delivery
- Digital signature capability for approvals
- Integration with accounting software (QuickBooks, etc.)

### Long-term Enhancements
- Mobile app development for field estimates
- Customer portal for estimate viewing and approval
- Inventory integration for real-time parts pricing

## Risk Assessment & Mitigation

### Technical Risks
- **Risk:** Server compatibility issues
- **Mitigation:** Standard PHP/SQLite requirements, broad server support

- **Risk:** Data loss from hardware failure
- **Mitigation:** Regular database backups and server maintenance

### Security Risks
- **Risk:** Unauthorized access to estimates
- **Mitigation:** Strong password policy and session management

- **Risk:** Data corruption or loss
- **Mitigation:** Database backup procedures and data validation

### Business Risks
- **Risk:** User adoption challenges
- **Mitigation:** Intuitive interface design and minimal learning curve

## Maintenance & Support

### Regular Maintenance
- Database backup verification
- Security updates for PHP and server software
- Performance monitoring and optimization

### Support Requirements
- Internal training on system usage
- Documentation maintenance and updates
- Issue resolution and bug fixes

## Conclusion

The Udora Safety Estimator successfully delivers a comprehensive, secure, and user-friendly solution for creating professional estimates. The application streamlines the estimation process while maintaining the flexibility and customization needed for Udora Safety's diverse security system installations.

The system's local deployment ensures complete data privacy and control, while the professional output enhances client presentations and business credibility. With its intuitive interface and automated calculations, the estimator significantly reduces estimate preparation time while improving accuracy and consistency.

---

**Document Version:** 1.6
**Last Updated:** August 2025  
**Next Review:** February 2026
