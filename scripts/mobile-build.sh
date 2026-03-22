#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Mobile Build for Capacitor..."

# 1. Rename API and Sitemap directories to hide them from Next.js static export
if [ -d "src/app/api" ]; then
    echo "📦 Temporarily hiding API routes..."
    mv src/app/api src/app/_api
fi
if [ -d "src/app/sitemap" ]; then
    echo "📦 Temporarily hiding Sitemap routes..."
    mv src/app/sitemap src/app/_sitemap
fi
if [ -f "src/app/sitemap.ts" ]; then
    mv src/app/sitemap.ts src/app/_sitemap.ts
fi
if [ -f "src/app/robots.ts" ]; then
    mv src/app/robots.ts src/app/_robots.ts
fi

# Function to restore directories even if build fails
cleanup() {
    echo "♻️ Restoring hidden routes..."
    [ -d "src/app/_api" ] && mv src/app/_api src/app/api || true
    [ -d "src/app/_sitemap" ] && mv src/app/_sitemap src/app/sitemap || true
    [ -f "src/app/_sitemap.ts" ] && mv src/app/_sitemap.ts src/app/sitemap.ts || true
    [ -f "src/app/_robots.ts" ] && mv src/app/_robots.ts src/app/robots.ts || true
}
trap cleanup EXIT

# 2. Run Next.js build (output: export is set in next.config.ts)
echo "🏗 Building static assets..."
rm -rf .next out
MOBILE_BUILD=true npm run build

# 3. Sync to Capacitor
echo "📲 Syncing to Capacitor platforms..."
npx cap sync

echo "✅ Mobile build complete! You can now open the project in Android Studio or Xcode."
echo "   Run: npm run mobile:open:android  or  npm run mobile:open:ios"
