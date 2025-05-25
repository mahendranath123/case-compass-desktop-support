
# Support App Deployment Guide for CentOS

## Prerequisites
- CentOS 7/8 server
- MySQL installed and running
- Node.js 18+ installed
- Domain name or IP address

## Deployment Steps

### 1. System Setup
```bash
# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

### 2. Database Setup
```bash
# Log into MySQL as root
mysql -u root -p

# Run the database setup
source backend/database.sql

# Create a new MySQL user for the app (optional but recommended)
CREATE USER 'support_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON support_app.* TO 'support_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Application Setup
```bash
# Navigate to application directory
cd /var/www/support-app

# Install backend dependencies
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Install frontend dependencies and build
cd ..
npm install
npm run build
```

### 4. Import Your Lead Data
```bash
# Copy your lead CSV file to the scripts directory
cp your-lead-file.csv scripts/

# Edit scripts/import-leads.js to match your CSV structure
# Then run the import
cd scripts
npm install csv-parser
node import-leads.js
```

### 5. Start the Application
```bash
# Start backend with PM2
pm2 start backend/server.js --name support-app-backend

# Configure PM2 to start on boot
pm2 startup
pm2 save
```

### 6. Configure Nginx
```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/conf.d/support-app.conf

# Edit the configuration to match your domain
sudo vi /etc/nginx/conf.d/support-app.conf

# Test nginx configuration
sudo nginx -t

# Start nginx
sudo systemctl start nginx
sudo systemctl reload nginx
```

### 7. Firewall Configuration
```bash
# Open necessary ports
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

## Default Login Credentials
- Username: admin
- Password: admin123

**Important:** Change the default password immediately after first login!

## Importing Your Existing Lead Database

### If you have a CSV file:
1. Place your CSV file in the `scripts/` directory
2. Edit `scripts/import-leads.js` to match your CSV column structure
3. Run the import script

### If you have a MySQL dump:
```bash
mysql -u root -p support_app < your-lead-dump.sql
```

### If you have another database format:
Export your data to CSV format and use the CSV import method above.

## Monitoring and Maintenance

### Check application status:
```bash
pm2 status
pm2 logs support-app-backend
```

### Restart application:
```bash
pm2 restart support-app-backend
```

### Update application:
```bash
# Pull new code
git pull origin main

# Rebuild frontend
npm run build

# Restart backend
pm2 restart support-app-backend

# Reload nginx
sudo systemctl reload nginx
```

## Troubleshooting

### Common Issues:

1. **Database connection errors:**
   - Check MySQL service: `sudo systemctl status mysqld`
   - Verify credentials in backend/.env
   - Check firewall settings

2. **Frontend not loading:**
   - Check nginx configuration
   - Verify build was successful
   - Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

3. **API not responding:**
   - Check PM2 logs: `pm2 logs support-app-backend`
   - Verify backend is running: `pm2 status`
   - Check port 3001 is not blocked

4. **Search not working:**
   - Verify lead data was imported correctly
   - Check database table structure matches application expectations
