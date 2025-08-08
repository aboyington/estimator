# White-Label Estimator - Code Style and Conventions

## PHP Coding Standards

### General Style
- **Opening Tags**: Always use `<?php` (never short tags)
- **Indentation**: 4 spaces (no tabs)
- **Variable Naming**: camelCase for local variables (`$estimateNumber`, `$lineItems`)
- **Array Format**: Short array syntax `[]` preferred over `array()`
- **String Concatenation**: Use `.` operator with spaces (`$var . ' text'`)

### Database Conventions
- **PDO Usage**: Always use prepared statements for security
- **Error Handling**: Use `PDO::ERRMODE_EXCEPTION` for proper error handling
- **SQL Style**: Uppercase SQL keywords (`SELECT`, `INSERT`, `UPDATE`)
- **Table Names**: Snake_case (`line_items`, `products_services`)
- **Column Names**: Snake_case (`setting_name`, `unit_cost`)

### API Design
- **Response Format**: Always JSON responses
- **Action-based Routing**: Use `$_REQUEST['action']` parameter
- **Error Responses**: Include `error` key in JSON with descriptive messages
- **Success Responses**: Include `success` key with boolean value
- **HTTP Status Codes**: Use appropriate codes (401 for unauthorized, etc.)

## JavaScript Conventions

### General Style
- **ES6+ Features**: Use modern JavaScript (const/let, arrow functions, template literals)
- **Function Naming**: camelCase (`updateEstimate`, `calculateTotal`)
- **Variable Naming**: camelCase with descriptive names
- **API Calls**: Use `fetch()` with async/await pattern
- **DOM Manipulation**: Use `querySelector`/`querySelectorAll`

### Form Handling
- **Data Collection**: Use `FormData` or object literals
- **Validation**: Client-side validation with server-side backup
- **User Feedback**: Toast notifications for all user actions
- **Error Handling**: Try/catch blocks for API calls

## HTML/CSS Standards

### HTML Structure
- **Semantic HTML**: Use proper semantic elements (`<section>`, `<header>`, `<main>`)
- **Accessibility**: Include proper ARIA labels and roles
- **Form Structure**: Logical grouping with fieldsets and labels
- **ID Naming**: kebab-case (`page-title`, `header-title`)

### CSS Organization
- **Custom Properties**: No CSS frameworks (vanilla CSS only)
- **Responsive Design**: Mobile-first approach with media queries
- **Color Scheme**: Consistent use of brand colors (#1e3c72 primary blue)
- **Typography**: System font stack with fallbacks
- **Layout**: Flexbox and Grid for modern layouts

## Database Schema Conventions

### Table Design
- **Primary Keys**: Always `id INTEGER PRIMARY KEY AUTOINCREMENT`
- **Timestamps**: Include `created_at` and `updated_at` with `CURRENT_TIMESTAMP`
- **Foreign Keys**: Use proper FOREIGN KEY constraints with CASCADE
- **Data Types**: Use appropriate types (`DECIMAL(10,2)` for currency)

### Column Naming
- **Consistent Naming**: Snake_case throughout
- **Descriptive Names**: Self-documenting column names
- **Standard Suffixes**: `_at` for timestamps, `_id` for foreign keys

## Security Practices

### Input Validation
- **Prepared Statements**: Always use for database queries
- **Input Sanitization**: Validate all user inputs
- **Session Management**: Proper session handling with timeouts
- **Password Storage**: Simple password authentication (configurable)

### Data Privacy
- **Local Storage**: No external data transmission
- **File Permissions**: Secure database file permissions
- **Session Security**: Regenerate session IDs on login