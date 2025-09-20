# 🚀 Complete Setup & Deployment Guide

## Netflix Clone with CRM & Anti-Bot Protection

This guide will walk you through setting up and deploying your Netflix clone with admin CRM system, step by step.

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- ✅ **Git** - [Download here](https://git-scm.com/)
- ✅ **A code editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)
- ✅ **MongoDB Atlas account** (free) - [Sign up here](https://www.mongodb.com/atlas)

---

## 🔧 Step 1: Initial Setup

### 1.1 Download and Install Dependencies

```bash
# Navigate to your project folder
cd nt

# Install all required packages
npm install
```

### 1.2 Environment Variables Setup

Create a file named `.env.local` in your project root:

```bash
# Create the environment file
touch .env.local
```

Add the following content to `.env.local`:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://najarkamran555_db_user:XfpVllAyrurYO31I@cluster0.mjtrx2i.mongodb.net/

# Admin Login Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here-make-it-long-and-random
NEXTAUTH_URL=http://localhost:3000
```

**⚠️ Important Security Notes:**

- Change `ADMIN_USERNAME` and `ADMIN_PASSWORD` to something secure
- Generate a random `NEXTAUTH_SECRET` (you can use [this generator](https://generate-secret.vercel.app/32))
- Keep your `.env.local` file private and never commit it to Git

### 1.3 Test Your Setup

```bash
# Start the development server
npm run dev
```

Open your browser and go to:

- **Main site**: http://localhost:3000
- **Admin login**: http://localhost:3000/admin/login
- **CRM dashboard**: http://localhost:3000/admin/crm (after login)

---

## 🌐 Step 2: Deployment Options

Choose one of the following deployment methods:

---

## 🏢 Option 1: Deploy on cPanel (Shared Hosting)

### 2.1 Prepare Your Project

```bash
# Build the project for production
npm run build

# This creates a .next folder with optimized files
```

### 2.2 Upload to cPanel

1. **Access your cPanel**

   - Login to your hosting provider's cPanel
   - Go to "File Manager"

2. **Navigate to public_html**

   - Open the `public_html` folder
   - Delete any existing files (if this is a new site)

3. **Upload your project**

   - Compress your entire project folder into a ZIP file
   - Upload the ZIP file to `public_html`
   - Extract the ZIP file in `public_html`

4. **Set up Node.js App**

   - In cPanel, find "Node.js Selector" or "Node.js Apps"
   - Click "Create Application"
   - Set these values:
     - **Node.js Version**: 18.x or higher
     - **Application Mode**: Production
     - **Application Root**: `/public_html`
     - **Application URL**: Your domain name
     - **Application Startup File**: `server.js`

5. **Create server.js file**
   Create a `server.js` file in your `public_html` folder:

```javascript
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = false;
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

6. **Install dependencies on server**

   - In cPanel Node.js App, go to "NPM Install"
   - Click "Install" to install all dependencies

7. **Set Environment Variables**

   - In cPanel Node.js App, go to "Environment Variables"
   - Add all variables from your `.env.local` file:
     ```
     MONGODB_URI=mongodb+srv://najarkamran555_db_user:XfpVllAyrurYO31I@cluster0.mjtrx2i.mongodb.net/
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=admin123
     NEXTAUTH_SECRET=your-secret-key-here
     NEXTAUTH_URL=https://yourdomain.com
     ```

8. **Start the Application**
   - In cPanel Node.js App, click "Start App"
   - Your site should now be live!

### 2.3 cPanel Troubleshooting

**Common Issues:**

- **Port conflicts**: Make sure port 3000 is available
- **Memory limits**: Contact hosting provider to increase Node.js memory limit
- **File permissions**: Set proper permissions (755 for folders, 644 for files)

---

## ☁️ Option 2: Deploy on Vercel (Recommended for Beginners)

### 2.1 Prepare Your Project

1. **Create a GitHub repository**

   - Go to [GitHub.com](https://github.com) and create a new repository
   - Upload your project files to GitHub

2. **Connect to Vercel**
   - Go to [Vercel.com](https://vercel.com)
   - Sign up with your GitHub account
   - Click "New Project"
   - Import your GitHub repository

### 2.2 Configure Environment Variables

In Vercel dashboard:

1. Go to your project
2. Click "Settings" → "Environment Variables"
3. Add these variables:

```
MONGODB_URI = mongodb+srv://najarkamran555_db_user:XfpVllAyrurYO31I@cluster0.mjtrx2i.mongodb.net/
ADMIN_USERNAME = admin
ADMIN_PASSWORD = admin123
NEXTAUTH_SECRET = your-secret-key-here
NEXTAUTH_URL = https://your-project-name.vercel.app
```

### 2.3 Deploy

1. Click "Deploy" button
2. Wait for deployment to complete (usually 2-3 minutes)
3. Your site will be live at `https://your-project-name.vercel.app`

### 2.4 Vercel Advantages

- ✅ **Automatic deployments** when you push to GitHub
- ✅ **Free SSL certificate**
- ✅ **Global CDN**
- ✅ **Easy environment variable management**
- ✅ **Automatic scaling**

---

## 🖥️ Option 3: Deploy on VPS (Virtual Private Server)

### 2.1 Set Up Your VPS

**Recommended VPS Providers:**

- **DigitalOcean** ($5/month) - [Sign up here](https://www.digitalocean.com/)
- **Linode** ($5/month) - [Sign up here](https://www.linode.com/)
- **Vultr** ($3.50/month) - [Sign up here](https://www.vultr.com/)

**Minimum Requirements:**

- 1GB RAM
- 1 CPU Core
- 25GB SSD Storage
- Ubuntu 20.04 or 22.04

### 2.2 Connect to Your VPS

```bash
# Connect via SSH (replace with your VPS IP)
ssh root@YOUR_VPS_IP_ADDRESS
```

### 2.3 Install Required Software

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (web server)
apt install nginx -y

# Install Git
apt install git -y
```

### 2.4 Deploy Your Application

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Install dependencies
npm install

# Build the application
npm run build

# Create environment file
nano .env.local
```

Add your environment variables to `.env.local`:

```env
MONGODB_URI=mongodb+srv://najarkamran555_db_user:XfpVllAyrurYO31I@cluster0.mjtrx2i.mongodb.net/
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://YOUR_VPS_IP:3000
```

### 2.5 Configure PM2

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add this content:

```javascript
module.exports = {
  apps: [
    {
      name: "netflix-clone",
      script: "npm",
      args: "start",
      cwd: "/root/YOUR_REPO_NAME",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 2.6 Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/netflix-clone
```

Add this content:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_NAME.com www.YOUR_DOMAIN_NAME.com;

    location / {
        proxy_pass http://localhost:3000;
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

```bash
# Enable the site
ln -s /etc/nginx/sites-available/netflix-clone /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 2.7 Set Up SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d YOUR_DOMAIN_NAME.com -d www.YOUR_DOMAIN_NAME.com
```

### 2.8 VPS Management Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs netflix-clone

# Restart application
pm2 restart netflix-clone

# Stop application
pm2 stop netflix-clone

# Check Nginx status
systemctl status nginx

# Restart Nginx
systemctl restart nginx
```

---

## 🔒 Step 3: Security Configuration

### 3.1 Change Default Admin Credentials

**IMPORTANT**: Change these immediately after deployment!

```env
# In your .env.local file, change these:
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_very_secure_password_123!
```

### 3.2 MongoDB Security

1. **Enable IP Whitelist**

   - Go to MongoDB Atlas → Network Access
   - Add your server's IP address
   - Or add `0.0.0.0/0` for all IPs (less secure)

2. **Create Database User**
   - Go to Database Access
   - Create a new user with read/write permissions
   - Use this user in your `MONGODB_URI`

### 3.3 Environment Variables Security

- ✅ Never commit `.env.local` to Git
- ✅ Use strong, unique passwords
- ✅ Rotate secrets regularly
- ✅ Use different credentials for production

---

## 🧪 Step 4: Testing Your Deployment

### 4.1 Test Main Features

1. **Main Site** (`https://yourdomain.com`)

   - ✅ Netflix homepage loads
   - ✅ Email/password form works
   - ✅ Provider-specific pages work
   - ✅ OTP verification works
   - ✅ Payment form works

2. **Admin Panel** (`https://yourdomain.com/admin/login`)

   - ✅ Login with admin credentials
   - ✅ Redirects to CRM dashboard
   - ✅ Shows user sessions
   - ✅ Admin actions work
   - ✅ Export functionality works

3. **Anti-Bot Protection**
   - ✅ Real users can access normally
   - ✅ Obvious bots are blocked
   - ✅ No testing mode banner shows

### 4.2 Performance Testing

```bash
# Test page load speeds
curl -w "@curl-format.txt" -o /dev/null -s "https://yourdomain.com"

# Check MongoDB connection
# Look for connection logs in your application
```

---

## 🚨 Step 5: Troubleshooting

### 5.1 Common Issues

**Issue**: "Cannot connect to MongoDB"

```bash
# Check MongoDB URI format
# Ensure IP is whitelisted in MongoDB Atlas
# Verify username/password are correct
```

**Issue**: "Admin login not working"

```bash
# Check ADMIN_USERNAME and ADMIN_PASSWORD in .env.local
# Ensure environment variables are loaded
# Check browser console for errors
```

**Issue**: "Site not loading"

```bash
# Check if application is running (pm2 status)
# Check Nginx configuration (nginx -t)
# Check firewall settings
# Check domain DNS settings
```

**Issue**: "Build errors"

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check Node.js version (should be 18+)
node --version
```

### 5.2 Logs and Monitoring

```bash
# View application logs
pm2 logs netflix-clone

# View Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Check system resources
htop
df -h
```

---

## 📱 Step 6: Mobile Optimization

Your site is already mobile-responsive, but you can enhance it:

1. **Test on different devices**
2. **Check Google PageSpeed Insights**
3. **Optimize images** (already done with Next.js Image component)
4. **Enable compression** (Nginx handles this automatically)

---

## 🔄 Step 7: Maintenance

### 7.1 Regular Updates

```bash
# Update dependencies
npm update

# Update system packages (VPS only)
apt update && apt upgrade -y

# Restart application
pm2 restart netflix-clone
```

### 7.2 Backup Strategy

```bash
# Backup your application
tar -czf backup-$(date +%Y%m%d).tar.gz /root/YOUR_REPO_NAME

# Backup MongoDB (if using self-hosted)
mongodump --uri="mongodb://localhost:27017/your-database"
```

### 7.3 Monitoring

- ✅ Set up uptime monitoring (UptimeRobot, Pingdom)
- ✅ Monitor server resources
- ✅ Check application logs regularly
- ✅ Monitor MongoDB Atlas metrics

---

## 🎉 Congratulations!

You've successfully deployed your Netflix clone with:

- ✅ **Multi-step authentication flow**
- ✅ **Admin CRM dashboard**
- ✅ **MongoDB integration**
- ✅ **Anti-bot protection**
- ✅ **Export functionality**
- ✅ **Mobile responsiveness**

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all environment variables are set correctly
4. Verify MongoDB connection and permissions

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)

---

**Happy Deploying! 🚀**


