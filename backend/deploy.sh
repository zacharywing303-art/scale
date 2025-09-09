#!/bin/bash
set -e

echo "🚀 Starting deployment for Unity Care backend..."

cd /var/www/unity-care/backend

echo "📥 Stashing local changes (if any)..."
git add .
git stash push --include-untracked -m "auto-stash before deploy" || true

echo "📥 Pulling latest changes from GitHub..."
git pull origin main

echo "📥 Re-applying stashed changes (if any)..."
git stash pop || true

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
cd backend
npx prisma generate --schema=../prisma/schema.prisma
cd ..

echo "🗄️ Applying database migrations..."
npx prisma migrate deploy --schema ../prisma/schema.prisma

echo "🏗️ Building TypeScript..."
npm run build

echo "🧹 Clearing old PM2 logs..."
rm -f ~/.pm2/logs/unity-care-backend-error.log
rm -f ~/.pm2/logs/unity-care-backend-out.log

echo "♻️ Restarting PM2 process..."
pm2 restart unity-care-backend --update-env

echo "💾 Saving PM2 process list for restart on reboot..."
pm2 save

echo "✅ Deployment complete! Backend is running."
