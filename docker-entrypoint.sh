#!/bin/sh
set -e

# Run migrations
echo "Running database migrations..."
npx prisma@5.22.0 migrate deploy

# Execute the main command
exec "$@"
