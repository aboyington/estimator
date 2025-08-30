# Technology Stack

## Frontend
- **HTML5**: Semantic markup with modern web standards
- **Tailwind CSS v4.1.12**: Utility-first CSS framework with CSS-first configuration
- **Vanilla JavaScript**: No frameworks, pure JavaScript for maximum performance
- **CSS Variables**: Modern CSS custom properties for theming

## Backend
- **PHP 7.4+**: Server-side scripting (api.php for data handling)
- **SQLite**: Lightweight database for data persistence
- **Apache**: Web server (MAMP for local development)

## Build Tools
- **@tailwindcss/cli v4.1.12**: Official Tailwind CLI for CSS compilation
- **npm**: Package management and build scripts
- **Node.js**: Required for build tools (not for runtime)

## Development Environment
- **MAMP**: Local Apache/PHP/MySQL stack running on port 80
- **macOS**: Darwin development environment
- **Modern Browsers**: Chrome 111+, Safari 16.4+, Firefox 128+

## Key Dependencies
```json
{
  "devDependencies": {
    "@tailwindcss/cli": "^4.1.12",
    "tailwindcss": "^4.1.12"
  }
}
```

## Architecture Pattern
- **SPA (Single Page Application)**: Tab-based navigation with JavaScript
- **Client-side State Management**: localStorage for data persistence
- **Component-based CSS**: Custom utility classes with Tailwind
- **Progressive Enhancement**: Works without JavaScript for core functionality