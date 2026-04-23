# Database Connection Guide

## Quick Start

If you're getting database connection errors, try this first:

```bash
# 1. Diagnose the problem
node diagnose-db.js

# 2. Start MySQL (if using Docker)
docker-compose up -d

# 3. Initialize the database
node setup-templates.js
node src/lib/seed.js
```

## Common Error Messages

### ❌ "Cannot connect to MySQL at localhost:3306 - Make sure MySQL/Docker is running!"

**Cause:** MySQL service is not running.

**Fix:**
```bash
# If using Docker Compose
docker-compose up -d

# Or start MySQL manually
mysql.server start    # macOS
sudo systemctl start mysql  # Linux
```

### ❌ "Cannot find MySQL host: [hostname]"

**Cause:** The hostname in `.env.local` is incorrect or not resolvable.

**Fix:**
1. Check your `.env.local` file:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=chabad_db
   ```

2. If using Docker, verify the service name:
   ```
   docker-compose ps
   ```

### ❌ "Database access denied - check DB_USER and password"

**Cause:** Wrong username or password.

**Fix:**
1. Verify credentials in `.env.local`
2. Test connection manually:
   ```bash
   mysql -h localhost -u root -p
   ```
3. When prompted, enter the password from `.env.local`

### ❌ "Database 'chabad_db' does not exist"

**Cause:** The database hasn't been created yet.

**Fix:**
1. Create the database:
   ```bash
   mysql -h localhost -u root -p
   SOURCE src/lib/schema.sql;
   ```
2. Or run the setup script:
   ```bash
   node setup-templates.js
   ```

### ❌ "Missing required environment variables: DB_HOST, DB_USER, DB_NAME"

**Cause:** `.env.local` file is missing or incomplete.

**Fix:**
1. Create `.env.local` in the project root:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=chabad_db
   ```

2. If using Docker Compose, use:
   ```
   DB_HOST=db
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=rootpassword
   DB_NAME=chabad_db
   ```

## Using the Diagnostic Tool

Run this to check everything:

```bash
node diagnose-db.js
```

This will:
- ✅ Verify all environment variables are set
- ✅ Test the MySQL connection
- ✅ Provide specific troubleshooting steps if something fails

## Docker Setup

If you're using Docker Compose:

```bash
# Start services in the background
docker-compose up -d

# View logs
docker-compose logs db

# Stop services
docker-compose down

# Restart services
docker-compose restart db
```

## Manual MySQL Setup

For local MySQL (not Docker):

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS chabad_db;"

# Run schema
mysql -u root -p chabad_db < src/lib/schema.sql

# Run seed scripts
node src/lib/seed.js
```

## Testing After Setup

Once the database is running:

```bash
# Check connection
node diagnose-db.js

# Initialize tables and admin user
node setup-templates.js
node src/lib/seed.js

# Start the app
npm run dev
```

The app homepage should now load without database errors!
