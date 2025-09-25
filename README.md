# Web Monitoring Clone

This is a cloned version of the web-monitoring project.

## Setup Instructions

1. **Copy environment file:**
   ```bash
   # The .env file is already configured for this clone
   ```

2. **Install dependencies:**
   ```bash
   composer install
   npm install
   ```

3. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

4. **Setup Database:**
   - Use existing database named `web_mon` in MySQL
   - Or run setup_database_clone.sql to setup the database
   - Or run migrations if available

5. **Run the application:**
   ```bash
   # Start Laravel development server on port 8001
   php artisan serve --port=8001
   ```

## Configuration Changes Made

This clone has been updated with the following changes from the original project:

### URL & Path Updates:
- All hardcoded URLs in test files updated from `/web-monitoring/` to `/web_monitoring_clone/`
- API endpoints updated to use port 8001 instead of 8000/default
- Database name uses original `web_mon`

### Core Files Updated:
- `public/api_stock_chart.php` - Updated database name
- `.env` - Updated app name, port (8001), and database name
- Routes and controllers - All working with new configuration

### Files Cleaned Up:
- Removed all test files (`test_*.php`, `test_*.html`)
- Removed all debug files (`debug_*.php`, `check_*.php`) 
- Removed analysis files (`analisa_*.php`, `comprehensive_coverage_analysis.php`)
- Removed import/verification scripts
- Project is now clean and production-ready

## Development Helper

Use the development helper script for easy setup and management:
```bash
# On Windows
.\dev-helper.bat

# This will give you options to:
# 1. Install dependencies
# 2. Generate app key  
# 3. Setup database
# 4. Run development server
# 5. Run vite dev server
```

## Important Notes

- This project runs on port 8001 to avoid conflicts with the original
- Database name is `web_mon`
- All API endpoints are configured for this cloned environment
monitoring system
