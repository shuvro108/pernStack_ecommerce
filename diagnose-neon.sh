#!/bin/bash
# Neon connection diagnostic script

echo "====== NEON CONNECTION DIAGNOSTIC ======"
echo ""

# Extract connection details from .env
DB_URL=$(grep DATABASE_URL .env | cut -d'"' -f2)
echo "Current DATABASE_URL in .env:"
echo "$DB_URL"
echo ""

# Parse connection string
if [[ $DB_URL =~ postgresql://([^:]+):([^@]+)@([^/]+)/(.+) ]]; then
  USER="${BASH_REMATCH[1]}"
  PASS="${BASH_REMATCH[2]}"
  HOST="${BASH_REMATCH[3]}"
  DBNAME="${BASH_REMATCH[4]%\?*}"
  
  echo "✓ Parsed connection details:"
  echo "  - User: $USER"
  echo "  - Host: $HOST"
  echo "  - Database: $DBNAME"
  echo ""
else
  echo "✗ Failed to parse connection string"
  exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo "⚠ psql not found - skipping direct connection test"
  echo "  To install: apt-get install postgresql-client"
  echo ""
else
  echo "Testing direct PostgreSQL connection..."
  echo "(This will timeout if Neon is unreachable or credentials are wrong)"
  echo ""
  
  timeout 5 psql "$DB_URL" -c "SELECT 1 as connection_test;" 2>&1 | head -20
  
  if [ $? -eq 0 ]; then
    echo "✓ Connection successful!"
  else
    echo "✗ Connection failed - check credentials and Neon status"
  fi
fi

echo ""
echo "====== NEXT STEPS ======"
echo "1. Go to https://console.neon.tech"
echo "2. Check if your project is ACTIVE (not paused)"
echo "3. Verify the connection string hasn't changed"
echo "4. If credentials changed, update .env with the new connection string"
echo "5. Restart the dev server: npm run dev"
echo ""
