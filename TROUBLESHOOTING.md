
# FinPlanner Troubleshooting Guide

This guide helps you resolve common issues you might encounter while setting up or using FinPlanner.

## 🚀 Installation Issues

### Database Connection Issues

**Problem**: Cannot connect to PostgreSQL database
```
Error: getaddrinfo ENOTFOUND localhost
```

**Solutions**:
1. **Check PostgreSQL Service**:
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   
   # Start PostgreSQL if not running
   sudo systemctl start postgresql
   ```

2. **Verify Database URL**:
   ```bash
   # Check your .env file
   cat .env | grep DATABASE_URL
   
   # Test connection manually
   psql "postgresql://username:password@localhost:5432/finplanner"
   ```

3. **Docker Issues**:
   ```bash
   # Check if PostgreSQL container is running
   docker ps | grep postgres
   
   # Restart PostgreSQL container
   docker-compose restart postgres
   ```

### Prisma Issues

**Problem**: Prisma client not generated
```
Error: @prisma/client did not initialize yet
```

**Solutions**:
```bash
# Generate Prisma client
npx prisma generate

# Reset database and regenerate
npx prisma migrate reset
npx prisma generate
```

**Problem**: Migration issues
```
Error: Migration failed to apply cleanly to the shadow database
```

**Solutions**:
```bash
# Reset migrations
npx prisma migrate reset

# Deploy migrations
npx prisma migrate deploy

# If in development, create new migration
npx prisma migrate dev --name init
```

### Node.js and Dependencies

**Problem**: Node version compatibility
```
Error: The engine "node" is incompatible with this module
```

**Solutions**:
```bash
# Check Node version
node --version

# Install correct Node version (18 or higher)
nvm install 18
nvm use 18

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Package installation fails
```
Error: ERESOLVE unable to resolve dependency tree
```

**Solutions**:
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Or use yarn
yarn install

# Clear cache and retry
npm cache clean --force
rm -rf node_modules
npm install
```

## 🏃‍♂️ Runtime Issues

### Application Won't Start

**Problem**: Port already in use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**Problem**: Environment variables not loaded
```
Error: Environment variable not found
```

**Solutions**:
1. Check `.env` file exists and has correct variables
2. Restart the application
3. Verify file permissions:
   ```bash
   chmod 600 .env
   ```

### Database Runtime Issues

**Problem**: Database queries failing
```
Error: Invalid `prisma.transaction.findMany()` invocation
```

**Solutions**:
```bash
# Check database connection
npx prisma db pull

# Regenerate client
npx prisma generate

# Check database schema
npx prisma studio
```

**Problem**: Slow database queries
**Solutions**:
1. Check database indexes
2. Optimize queries
3. Monitor database performance:
   ```bash
   # Check PostgreSQL logs
   sudo tail -f /var/log/postgresql/postgresql-*.log
   ```

### Frontend Issues

**Problem**: Page not loading or blank screen
**Solutions**:
1. Check browser console for errors
2. Clear browser cache
3. Check if API endpoints are responding:
   ```bash
   curl http://localhost:3000/api/categories
   ```

**Problem**: Charts not rendering
**Solutions**:
1. Check if chart libraries are installed
2. Verify data format
3. Check browser console for errors
4. Ensure components are client-side:
   ```javascript
   'use client';
   ```

## 🐳 Docker Issues

### Container Issues

**Problem**: Docker containers won't start
```
Error: Cannot start service postgres: driver failed programming external connectivity
```

**Solutions**:
```bash
# Check if ports are available
netstat -tulpn | grep :5432

# Stop conflicting services
sudo systemctl stop postgresql

# Restart Docker
sudo systemctl restart docker
docker-compose up -d
```

**Problem**: Volume mounting issues
```
Error: invalid mount config for type "bind"
```

**Solutions**:
```bash
# Check file permissions
ls -la ./data

# Fix permissions
sudo chown -R $USER:$USER ./data

# Use absolute paths in docker-compose.yml
```

### Build Issues

**Problem**: Docker build fails
```
Error: failed to solve with frontend dockerfile.v0
```

**Solutions**:
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -t finplanner .
```

## 🌐 Production Issues

### Performance Issues

**Problem**: Slow application response
**Solutions**:
1. **Check server resources**:
   ```bash
   htop
   df -h
   free -m
   ```

2. **Optimize database**:
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC;
   ```

3. **Enable caching**:
   - Configure Redis for session storage
   - Enable Next.js caching
   - Use CDN for static assets

### SSL/HTTPS Issues

**Problem**: SSL certificate errors
**Solutions**:
1. **Check certificate validity**:
   ```bash
   openssl x509 -in certificate.crt -text -noout
   ```

2. **Renew Let's Encrypt certificates**:
   ```bash
   sudo certbot renew
   sudo systemctl reload nginx
   ```

3. **Check Nginx configuration**:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### Memory Issues

**Problem**: Out of memory errors
```
Error: JavaScript heap out of memory
```

**Solutions**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Monitor memory usage
pm2 monit

# Restart application
pm2 restart finplanner
```

## 🔧 API Issues

### Authentication Issues

**Problem**: Session not persisting
**Solutions**:
1. Check NEXTAUTH_SECRET is set
2. Verify NEXTAUTH_URL matches your domain
3. Check cookie settings in browser

**Problem**: API endpoints returning 404
**Solutions**:
1. Check API route files exist
2. Verify file naming convention
3. Check Next.js routing configuration

### Data Issues

**Problem**: Data not saving
**Solutions**:
1. Check form validation
2. Verify API endpoint logic
3. Check database constraints
4. Monitor network requests in browser dev tools

**Problem**: Incorrect data format
**Solutions**:
1. Validate input data types
2. Check Prisma schema matches database
3. Verify API response format

## 📱 Browser Issues

### Compatibility Issues

**Problem**: Features not working in specific browsers
**Solutions**:
1. Check browser compatibility
2. Update browser to latest version
3. Clear browser cache and cookies
4. Disable browser extensions

### Mobile Issues

**Problem**: Responsive design issues
**Solutions**:
1. Test on different screen sizes
2. Check CSS media queries
3. Verify touch interactions
4. Test on actual devices

## 🔍 Debugging Tips

### Enable Debug Mode

```bash
# Enable Next.js debug mode
DEBUG=* npm run dev

# Enable Prisma debug mode
DEBUG="prisma:*" npm run dev

# Check application logs
tail -f logs/combined.log
```

### Common Log Locations

```bash
# Application logs
./logs/
/var/log/finplanner/

# Nginx logs
/var/log/nginx/access.log
/var/log/nginx/error.log

# PostgreSQL logs
/var/log/postgresql/

# PM2 logs
~/.pm2/logs/
```

### Health Checks

```bash
# Check application health
curl http://localhost:3000/health

# Check database connection
npx prisma db pull

# Check all services
docker-compose ps
```

## 🆘 Getting Help

If you're still experiencing issues:

1. **Check the logs** for detailed error messages
2. **Search existing issues** in the project repository
3. **Create a new issue** with:
   - Detailed error description
   - Steps to reproduce
   - Environment information
   - Log files (remove sensitive data)

### Environment Information Template

```bash
# System information
uname -a
node --version
npm --version
docker --version
psql --version

# Application information
cat package.json | grep version
git rev-parse HEAD
```

### Log Collection Script

```bash
#!/bin/bash
# Collect logs for troubleshooting
mkdir -p debug-logs
cp .env.example debug-logs/
docker-compose logs > debug-logs/docker-logs.txt
pm2 logs --lines 100 > debug-logs/pm2-logs.txt
tail -100 /var/log/nginx/error.log > debug-logs/nginx-logs.txt
tar -czf debug-logs.tar.gz debug-logs/
echo "Debug logs collected in debug-logs.tar.gz"
```

Remember to remove sensitive information (passwords, API keys) before sharing logs or debug information.
