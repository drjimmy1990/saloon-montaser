cd /www/wwwroot/salon-dashboard
git pull origin main
npm install
npm run build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
pm2 restart salon-dashboard

pm2 save

# Enable PM2 startup on boot
pm2 startup

rm -rf /www/server/nginx/proxy_cache_dir/*