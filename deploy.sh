
#!/bin/bash

# CentOS Deployment Script for Support App

echo "Starting deployment on CentOS..."

# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install MySQL
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx
sudo yum install -y nginx
sudo systemctl enable nginx

# Create application directory
sudo mkdir -p /var/www/support-app
sudo chown $USER:$USER /var/www/support-app

echo "Deployment setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy your application files to /var/www/support-app"
echo "2. Set up MySQL database using backend/database.sql"
echo "3. Configure environment variables in backend/.env"
echo "4. Install backend dependencies: cd backend && npm install"
echo "5. Build frontend: npm run build"
echo "6. Start backend with PM2: pm2 start backend/server.js --name support-app"
echo "7. Configure nginx with provided config"
echo "8. Import your lead data using scripts/import-leads.js"
