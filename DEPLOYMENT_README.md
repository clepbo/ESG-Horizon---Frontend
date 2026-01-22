# ESG Horizon Frontend Deployment Guide

## 🎯 For Existing CI/CD Setup

**You already have a sophisticated GitHub Actions CI/CD pipeline!** The files in this directory complement your existing setup:

- **`nginx.conf`** - Reference template (you already have nginx configured)
- **`ecosystem.config.js`** - Updated for your main/staging setup
- **`deploy.sh`** - Manual deployment alternative
- **`health-check.sh`** - Diagnostic tool for any deployment issues
- **`DEPLOYMENT_README.md`** - This troubleshooting guide

## 🚨 Current Issue: Chunk Loading Errors

Your application is experiencing 404 errors for Next.js static chunks and CSS files. This is a common deployment issue where the web server is not properly configured to serve Next.js static assets.

## 🔄 Integration with Your Existing CI/CD

Your GitHub Actions workflow (`.github/workflows/frontend-ci.yml`) is well-structured and handles:

✅ **Multi-environment deployment** (main → port 3001, staging → port 3002)  
✅ **Next.js standalone builds**  
✅ **PM2 process management**  
✅ **Static asset handling**  

The key fix needed is ensuring your **existing nginx configuration** properly proxies `/_next/static/` requests to the correct ports.

## 🔧 Quick Fixes

### 1. Fix PM2 Configuration

The PM2 config was pointing to `./server.js` but Next.js standalone build creates `.next/standalone/server.js`:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: "esg-frontend-prod",
    script: "./.next/standalone/server.js", // ← Fixed path
    // ... rest of config
  }],
};
```

### 2. Configure Nginx Properly

Create `/etc/nginx/sites-available/staging.esghorizon.africa`:

```nginx
server {
    listen 80;
    server_name staging.esghorizon.africa;

    # Critical: Handle Next.js static assets
    location /_next/static/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache static assets
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle all other requests
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/staging.esghorizon.africa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🚀 Deployment Steps

### Option 1: Manual Deployment (Recommended)

1. **Build locally and deploy:**
   ```bash
   # On your local machine
   npm run build

   # Copy the .next folder and other files to server
   scp -r .next/* user@server:/var/www/staging.esghorizon.africa/
   scp package*.json user@server:/var/www/staging.esghorizon.africa/
   scp ecosystem.config.js user@server:/var/www/staging.esghorizon.africa/
   ```

2. **On the server:**
   ```bash
   cd /var/www/staging.esghorizon.africa

   # Install production dependencies
   npm ci --only=production

   # Start with PM2
   pm2 stop esg-frontend-prod || true
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

### Option 2: Use Deployment Script

1. **Copy the deployment script to your server**
2. **Make it executable and run:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## 🔍 Troubleshooting

### Check PM2 Status
```bash
pm2 status
pm2 logs esg-frontend-prod --lines 50
```

### Verify File Structure
```bash
ls -la /var/www/staging.esghorizon.africa/.next/
# Should contain: server.js, static/, standalone/, etc.
```

### Check Nginx Configuration
```bash
sudo nginx -t
sudo systemctl status nginx
```

### Test Direct Access
```bash
# Test if Next.js is running directly
curl http://localhost:3001

# Test static assets
curl http://localhost:3001/_next/static/chunks/main.js
```

### Browser Network Tab Debugging
1. Open browser dev tools
2. Go to Network tab
3. Navigate to a failing page
4. Look for 404 errors on CSS/JS files
5. Check if they're trying to load from the correct domain

## 🐛 Common Issues & Solutions

### Issue: `ChunkLoadError` or 404 on static files
**Solution:** Nginx not configured to serve `/_next/static/` path. Use the nginx config above.

### Issue: PM2 process crashes immediately
**Solution:** Check logs with `pm2 logs esg-frontend-prod`. Common issues:
- Missing dependencies
- Port already in use
- File permission issues

### Issue: Build fails on server
**Solution:** Build locally and deploy the built files, or ensure the server has sufficient memory for the build process.

### Issue: Only some pages fail
**Solution:** Code splitting issue. The failing pages likely have dynamic imports that aren't being served correctly.

### Issue: Your CI/CD is sophisticated but still getting chunk errors
**Solution:** Your nginx config might be missing the `/_next/static/` proxy rule. Check your existing nginx configuration and ensure it includes:

```nginx
# For main app (port 3001)
location /_next/static/ {
    proxy_pass http://localhost:3001;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# For staging app (port 3002)
location /_next/static/ {
    proxy_pass http://localhost:3002;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 📝 Environment Variables

Ensure these environment variables are set in your PM2 ecosystem config or `.env.local`:

```javascript
env: {
  NODE_ENV: "production",
  PORT: 3001,
  // Add your other env vars here
},
```

## 🔄 Rollback Procedure

If deployment fails:

```bash
# Stop current process
pm2 stop esg-frontend-prod

# Restore from backup
cp -r /var/www/backups/backup_20240122_143000/* /var/www/staging.esghorizon.africa/

# Restart
pm2 start ecosystem.config.js --env production
```

## 📞 Support

If issues persist:
1. Check PM2 logs: `pm2 logs esg-frontend-prod`
2. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify file permissions: `ls -la /var/www/staging.esghorizon.africa/.next/`
4. Test network connectivity between nginx and Next.js app