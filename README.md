
# 💰 FinPlanner - Comprehensive Personal Finance Management System

<div align="center">

![FinPlanner Logo](https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)

**A modern, comprehensive personal finance management application built with Next.js 14, React 18, and PostgreSQL**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Assessment](#-application-assessment) • [Documentation](#-documentation) • [Deployment](#-deployment) • [Contributing](#-contributing)

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Application Assessment](#-application-assessment)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Installation Methods](#-installation-methods)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## 🌟 Overview

FinPlanner is a state-of-the-art personal finance management application designed to provide individuals with complete control over their financial life. Built with modern web technologies and featuring an intuitive, responsive interface, FinPlanner offers comprehensive tools for expense tracking, budget management, investment monitoring, loan tracking, and financial goal achievement.

### Why Choose FinPlanner?

- **🔒 Privacy-First Design**: Your financial data remains secure and private with local database storage
- **📊 Comprehensive Financial Tracking**: Complete coverage of income, expenses, bills, goals, loans, and investments
- **📱 Responsive & Modern UI**: Beautiful, intuitive interface that works seamlessly across all devices
- **🎯 Goal-Oriented Planning**: Set, track, and achieve financial objectives with visual progress monitoring
- **📈 Advanced Investment Management**: Complete portfolio tracking with multi-asset class support
- **🔄 Automated Features**: Recurring bills, SIP management, and intelligent transaction categorization
- **🎨 Customizable Experience**: Dark/light themes, custom categories, and personalized dashboard layouts
- **⚡ Real-Time Updates**: Live data synchronization and instant financial insights

## ✨ Key Features

### 💰 Core Financial Management
- **Advanced Transaction Tracking**: Record, categorize, and analyze all financial transactions with detailed merchant tracking
- **Intelligent Bill Management**: Automated recurring bill tracking with payment reminders and calendar integration
- **Smart Budget Planning**: Set and monitor budgets across categories with variance analysis
- **Financial Goal Achievement**: Create, track, and achieve multiple financial objectives with progress visualization

### 📈 Investment & Portfolio Management
- **Comprehensive Portfolio Tracking**: Monitor stocks, mutual funds, crypto, real estate, and 14+ asset classes
- **SIP Management System**: Automate systematic investment plans with performance tracking
- **Advanced Analytics**: Real-time portfolio valuation, gain/loss analysis, and asset allocation insights
- **Goal-Linked Investments**: Connect investments to specific financial goals with allocation tracking
- **Multi-Platform Support**: Integration with 10+ investment platforms including Zerodha, Groww, Angel One

### 🏦 Loan & Debt Management
- **Complete Loan Tracking**: Monitor all loan types including home, personal, car, education, and credit cards
- **EMI Calculator & Scheduler**: Calculate payments and track loan schedules with prepayment analysis
- **Payment History**: Comprehensive payment tracking with principal/interest breakdown
- **Payoff Planning**: Visualize loan payoff strategies and optimize payment schedules

### 📊 Advanced Analytics & Insights
- **Expense Pattern Analysis**: Detailed spending trends and category-wise breakdowns
- **Interactive Visualizations**: Dynamic charts, graphs, and financial dashboards
- **Cash Flow Monitoring**: Track money flow with income vs expense analysis
- **Financial Health Scoring**: Overall financial wellness indicators and recommendations

### 🔧 Financial Tools & Calculators
- **EMI Calculator**: Loan payment calculations with amortization schedules
- **Goal Calculator**: Savings requirement planning with timeline analysis
- **Investment Calculator**: Return projections and compound interest calculations
- **SIP Calculator**: Systematic investment planning with goal alignment

### 🎨 Enhanced User Experience
- **Boxed Dashboard Layout**: Modern, organized tile-based interface for better data visualization
- **Responsive Grid System**: 12-column responsive layout optimizing space across all devices
- **Real-Time Data Updates**: Live synchronization of financial data across all components
- **Advanced Filtering**: Sophisticated search and filter capabilities across all modules
- **Bulk Operations**: Efficient management of multiple records simultaneously

For a complete feature breakdown, see [FEATURES.md](FEATURES.md).

## 📊 Application Assessment

FinPlanner is a **large-scale, enterprise-grade personal finance management platform** with substantial complexity and comprehensive feature coverage.

### Scale & Complexity Metrics

| Metric | Value | Industry Classification |
|--------|-------|------------------------|
| **Total Lines of Code** | 205,848+ | Enterprise-level application |
| **Total Files** | 442 | Large-scale codebase |
| **React Components** | 105+ | Complex UI architecture |
| **API Endpoints** | 134+ | Comprehensive backend |
| **Database Tables** | 12+ | Full-featured data model |
| **Feature Modules** | 8+ | Multi-domain platform |

### Development Characteristics

- **🏢 Enterprise-Scale Architecture**: Robust, production-ready design suitable for large-scale deployment
- **⚡ Modern Technology Stack**: Built with Next.js 14, React 18, TypeScript 5, and PostgreSQL 15
- **🔧 Professional Development Practices**: Comprehensive documentation, type safety, and modular architecture
- **📈 Comprehensive Feature Coverage**: Complete personal finance management across 8+ major domains
- **🚀 Production-Ready Infrastructure**: Docker containerization, PM2 process management, and Nginx configuration

### Technical Assessment Summary

FinPlanner demonstrates the complexity and feature richness typically found in enterprise-grade financial applications. The codebase size (200K+ LOC) and architectural sophistication place it in the category of large-scale software projects, comparable to commercial personal finance platforms.

**📋 For detailed metrics, technical analysis, and industry comparisons, see [APPLICATION_ASSESSMENT.md](APPLICATION_ASSESSMENT.md)**

## 🛠 Technology Stack

### Frontend Architecture
- **Next.js 14** - React framework with App Router and server-side rendering
- **React 18** - Modern UI library with hooks, context, and concurrent features
- **TypeScript 5** - Type-safe JavaScript with strict mode enabled
- **Tailwind CSS 3** - Utility-first CSS framework with custom design system
- **Framer Motion** - Advanced animations and transitions
- **Radix UI** - Accessible, unstyled component primitives
- **Chart.js & React-ChartJS-2** - Interactive data visualization
- **Lucide React** - Beautiful, customizable icon library

### Backend & Database
- **Next.js API Routes** - Serverless API endpoints with middleware support
- **Prisma 6** - Type-safe database ORM with advanced query capabilities
- **PostgreSQL 15** - Robust relational database with ACID compliance
- **NextAuth.js** - Flexible authentication system (optional)

### Development & DevOps
- **Docker & Docker Compose** - Containerization and orchestration
- **Nginx** - Reverse proxy and load balancer
- **PM2** - Advanced process management
- **ESLint & Prettier** - Code quality and formatting
- **Husky** - Git hooks for quality assurance

### Additional Libraries
- **React Hook Form** - Performant form management
- **Zod** - Schema validation and type safety
- **Date-fns** - Modern date utility library
- **React Query** - Server state management
- **Zustand** - Lightweight state management

## 📋 Prerequisites

Ensure you have the following installed before starting:

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **PostgreSQL** (v13 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

### Optional (for Docker deployment)
- **Docker** (v20.0.0 or higher) - [Download](https://www.docker.com/)
- **Docker Compose** (v2.0.0 or higher)

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: Minimum 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

## 🚀 Quick Start

Get FinPlanner running locally in under 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/finplanner.git
cd finplanner

# 2. Navigate to the app directory
cd app

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp ../.env.local.example .env.local
# Edit .env.local with your database URL and settings

# 5. Set up the database
npm run db:migrate
npm run db:seed

# 6. Start the development server
npm run dev
```

🎉 Open [http://localhost:3000](http://localhost:3000) to see FinPlanner in action!

## 📦 Installation Methods

### Method 1: Local Development Setup (Recommended for Development)

#### Step 1: Clone and Setup
```bash
git clone https://github.com/yourusername/finplanner.git
cd finplanner/app
npm install
```

#### Step 2: Database Setup
```bash
# Start PostgreSQL service
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS

# Create database
createdb finplanner_dev

# Configure environment
cp ../.env.local.example .env.local
```

#### Step 3: Environment Configuration
Edit `.env.local` with your settings:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/finplanner_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret-key"
NODE_ENV="development"
```

#### Step 4: Initialize Database
```bash
npm run db:migrate
npm run db:seed
```

#### Step 5: Start Development Server
```bash
npm run dev
```

### Method 2: Docker Development Environment

#### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/finplanner.git
cd finplanner
```

#### Step 2: Start Services
```bash
# Start database services
docker-compose -f docker-compose.dev.yml up -d

# Install dependencies and setup
cd app
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### Method 3: Full Docker Production Deployment

#### Step 1: Clone and Configure
```bash
git clone https://github.com/yourusername/finplanner.git
cd finplanner

# Copy and customize environment
cp .env.example .env
# Edit .env with your production settings
```

#### Step 2: Deploy with Docker Compose
```bash
docker-compose up -d
```

This starts:
- PostgreSQL database with persistent storage
- FinPlanner application with optimized build
- Nginx reverse proxy with SSL support
- Redis for session storage and caching

## ⚙️ Environment Configuration

### Development Environment
```bash
cp .env.local.example .env.local
```

### Production Environment
```bash
cp .env.production.example .env.production
```

### Required Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/finplanner` | ✅ |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` | ✅ |
| `NEXTAUTH_SECRET` | Secret for session encryption | `your-secret-key-here` | ✅ |
| `NODE_ENV` | Environment mode | `development` or `production` | ✅ |

### Optional Environment Variables

| Variable | Description | Default | Purpose |
|----------|-------------|---------|---------|
| `PORT` | Application port | `3000` | Custom port configuration |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` | Privacy |
| `POSTGRES_USER` | Database username | `postgres` | Docker setup |
| `POSTGRES_PASSWORD` | Database password | `password` | Docker setup |
| `POSTGRES_DB` | Database name | `finplanner` | Docker setup |

### Environment File Templates

#### Development (.env.local)
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/finplanner_dev"

# Application Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production"
NODE_ENV="development"

# Optional Development Settings
PORT=3000
NEXT_TELEMETRY_DISABLED=1
```

#### Production (.env)
```env
# Database Configuration
DATABASE_URL="postgresql://finplanner_user:secure_password@postgres:5432/finplanner_prod"

# Application Configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="super-secure-production-secret-key"
NODE_ENV="production"

# Docker Configuration
POSTGRES_USER=finplanner_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=finplanner_prod
```

## 🗄️ Database Setup

### Local PostgreSQL Installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

### Database Creation and Configuration

#### Create Database and User
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE finplanner;
CREATE USER finplanner WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE finplanner TO finplanner;
ALTER USER finplanner CREATEDB;  -- For running tests
\q
```

#### Run Database Migrations
```bash
cd app
npm run db:migrate
```

#### Seed Database with Sample Data
```bash
npm run db:seed
```

### Docker PostgreSQL Setup

#### Development Environment
```bash
docker-compose -f docker-compose.dev.yml up -d postgres-dev
```

#### Production Environment
```bash
docker-compose up -d postgres
```

### Database Management Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply new migration
npm run db:migrate

# Deploy migrations to production
npm run db:migrate:deploy

# Reset database (development only)
npm run db:migrate:reset

# Push schema changes without migration
npm run db:push

# Pull schema from existing database
npm run db:pull

# Open Prisma Studio for database management
npm run db:studio

# Create database backup
npm run db:backup

# Health check database connection
npm run health-check
```

### Database Schema Overview

FinPlanner uses a comprehensive PostgreSQL schema with the following main entities:

- **Categories**: Organize transactions, bills, goals, loans, and investments
- **Transactions**: Record all financial activities with detailed metadata
- **Bills**: Manage recurring payments with automated instance generation
- **Financial Goals**: Track progress toward financial objectives
- **Loans**: Monitor debt and EMI payments with amortization
- **Investments**: Portfolio management across multiple asset classes
- **SIPs**: Systematic Investment Plan automation
- **Investment Transactions**: Detailed investment activity tracking

For detailed schema information, see `app/prisma/schema.prisma`.

## 🔧 Development

### Development Server

```bash
cd app
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000) with hot reload enabled.

### Available Scripts

#### Development Commands
```bash
npm run dev              # Start development server with hot reload
npm run build            # Build production application
npm run start            # Start production server
npm run lint             # Run ESLint for code quality
npm run lint:fix         # Fix ESLint issues automatically
npm run type-check       # Run TypeScript type checking
```

#### Database Commands
```bash
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create and apply migration
npm run db:migrate:deploy # Deploy migrations (production)
npm run db:migrate:reset # Reset database (development)
npm run db:push          # Push schema changes
npm run db:pull          # Pull schema from database
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio
npm run db:backup        # Create database backup
```

#### Docker Commands
```bash
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
npm run docker:up        # Start Docker Compose services
npm run docker:down      # Stop Docker Compose services
npm run docker:logs      # View Docker logs
```

#### Deployment Commands
```bash
npm run deploy:prod      # Deploy to production
npm run deploy:staging   # Deploy to staging
npm run health-check     # Check application health
npm run clean            # Clean build artifacts
npm run analyze          # Analyze bundle size
```

### Development Workflow

#### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
npm run dev
npm run type-check
npm run lint

# Commit changes
git add .
git commit -m "feat: add new feature"
```

#### 2. Database Changes
```bash
# Modify schema in prisma/schema.prisma
# Create migration
npm run db:migrate

# Test migration
npm run db:migrate:reset
npm run db:seed
```

#### 3. Testing
```bash
# Type checking
npm run type-check

# Linting
npm run lint:fix

# Build test
npm run build

# Health check
npm run health-check
```

### Code Quality Standards

#### TypeScript Configuration
- Strict mode enabled
- No implicit any types
- Proper type definitions for all functions
- Interface definitions for complex objects

#### ESLint Rules
- Next.js recommended rules
- React hooks rules
- TypeScript specific rules
- Custom rules for consistency

#### Code Formatting
- Prettier for consistent formatting
- 2-space indentation
- Single quotes for strings
- Trailing commas where valid

## 🚀 Deployment

### Production Deployment Options

#### Option 1: Docker Deployment (Recommended)

##### Prerequisites
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

##### Deployment Steps
```bash
# 1. Clone repository
git clone https://github.com/yourusername/finplanner.git
cd finplanner

# 2. Configure environment
cp .env.production.example .env
# Edit .env with your production settings

# 3. Deploy services
docker-compose up -d

# 4. Check deployment status
docker-compose ps
docker-compose logs -f finplanner
```

##### Docker Services
- **PostgreSQL**: Database with persistent storage
- **FinPlanner**: Application server with optimized build
- **Nginx**: Reverse proxy with SSL termination
- **Redis**: Session storage and caching

#### Option 2: Traditional Server Deployment

##### Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx
```

##### Application Deployment
```bash
# 1. Clone and setup
git clone https://github.com/yourusername/finplanner.git
cd finplanner/app
npm ci --production

# 2. Configure environment
cp ../.env.production.example .env
# Edit .env with production settings

# 3. Build application
npm run build

# 4. Setup database
npm run db:migrate:deploy

# 5. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Option 3: Cloud Platform Deployment

##### Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd app
vercel --prod

# Configure environment variables in Vercel dashboard
# Add DATABASE_URL, NEXTAUTH_SECRET, etc.
```

##### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

##### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `cd app && npm run build`
   - Run Command: `cd app && npm start`
3. Add environment variables
4. Deploy automatically

### Environment-Specific Configurations

#### Staging Environment
```bash
# Deploy to staging
npm run deploy:staging

# Or with Docker
docker-compose -f docker-compose.staging.yml up -d
```

#### Production Environment
```bash
# Deploy to production
npm run deploy:prod

# Or with Docker
docker-compose up -d
```

### SSL/HTTPS Setup

#### Using Let's Encrypt with Nginx
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

#### Nginx Configuration Example
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

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

### Performance Optimization

#### Production Build Optimizations
```bash
# Enable production optimizations
NODE_ENV=production npm run build

# Analyze bundle size
npm run analyze

# Enable compression
# Add to next.config.js:
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}
```

#### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_bills_next_due_date ON bills(next_due_date);
CREATE INDEX idx_investments_asset_class ON investments(asset_class);
```

#### Nginx Performance Configuration
```nginx
# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Enable caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Monitoring and Logging

#### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# View application logs
pm2 logs finplanner

# Docker monitoring
docker-compose logs -f
docker stats
```

#### Health Checks
```bash
# Application health check
curl -f http://localhost:3000/api/health

# Database health check
npm run health-check

# Automated health monitoring
# Add to crontab:
*/5 * * * * curl -f http://localhost:3000/api/health || echo "FinPlanner health check failed" | mail -s "Alert" admin@yourdomain.com
```

### Backup and Recovery

#### Database Backup Strategy
```bash
# Manual backup
npm run db:backup

# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/finplanner"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/db_backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/db_backup_$DATE.sql"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

#### Application Backup
```bash
# Backup application files
tar -czf finplanner-app-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  /path/to/finplanner

# Docker volume backup
docker run --rm \
  -v finplanner_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres-data-backup.tar.gz /data
```

#### Recovery Procedures
```bash
# Database recovery
gunzip -c db_backup_YYYYMMDD_HHMMSS.sql.gz | psql $DATABASE_URL

# Application recovery
tar -xzf finplanner-app-backup-YYYYMMDD.tar.gz
cd finplanner/app
npm install
npm run build
npm run db:migrate:deploy
```

## 📚 API Documentation

FinPlanner provides a comprehensive REST API built with Next.js API routes. The API supports all financial operations with proper authentication, validation, and error handling.

### API Base URLs
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

### Authentication
The API uses session-based authentication with NextAuth.js. Include session cookies in requests for authenticated endpoints.

### Core API Endpoints

#### Categories Management
```bash
GET    /api/categories              # List all categories
POST   /api/categories              # Create new category
PUT    /api/categories/[id]         # Update category
DELETE /api/categories/[id]         # Delete category
```

#### Transaction Management
```bash
GET    /api/transactions            # List transactions (paginated)
POST   /api/transactions            # Create new transaction
PUT    /api/transactions/[id]       # Update transaction
DELETE /api/transactions/[id]       # Delete transaction
GET    /api/transactions/stats      # Transaction statistics
```

#### Bill Management
```bash
GET    /api/bills                   # List all bills
POST   /api/bills                   # Create new bill
PUT    /api/bills/[id]              # Update bill
DELETE /api/bills/[id]              # Delete bill
GET    /api/bills/upcoming          # Get upcoming bills
POST   /api/bills/[id]/pay          # Mark bill as paid
```

#### Financial Goals
```bash
GET    /api/goals                   # List all goals
POST   /api/goals                   # Create new goal
PUT    /api/goals/[id]              # Update goal
DELETE /api/goals/[id]              # Delete goal
POST   /api/goals/[id]/contribute   # Add goal contribution
```

#### Loan Management
```bash
GET    /api/loans                   # List all loans
POST   /api/loans                   # Create new loan
PUT    /api/loans/[id]              # Update loan
DELETE /api/loans/[id]              # Delete loan
POST   /api/loans/[id]/payment      # Record loan payment
```

#### Investment Portfolio
```bash
GET    /api/investments             # List all investments
POST   /api/investments             # Create new investment
PUT    /api/investments/[id]        # Update investment
DELETE /api/investments/[id]        # Delete investment
GET    /api/investments/portfolio   # Portfolio summary
POST   /api/investments/[id]/sip    # Setup SIP
```

#### Dashboard Analytics
```bash
GET    /api/dashboard               # Dashboard overview data
GET    /api/dashboard/charts        # Chart data for dashboard
GET    /api/dashboard/stats         # Financial statistics
```

### API Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  }
}
```

#### Paginated Response
```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Query Parameters

#### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

#### Filtering
- `startDate`: Filter from date (ISO format)
- `endDate`: Filter to date (ISO format)
- `categoryId`: Filter by category
- `type`: Filter by type (varies by endpoint)
- `status`: Filter by status

#### Sorting
- `sort`: Sort field (e.g., `date`, `amount`, `name`)
- `order`: Sort order (`asc` or `desc`)

### Example API Usage

#### Create Transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500.00,
    "type": "EXPENSE",
    "description": "Grocery shopping",
    "merchant": "SuperMart",
    "categoryId": "category-id",
    "date": "2024-01-15T10:30:00Z"
  }'
```

#### Get Transactions with Filters
```bash
curl "http://localhost:3000/api/transactions?page=1&limit=20&type=EXPENSE&startDate=2024-01-01&endDate=2024-01-31&sort=date&order=desc"
```

#### Create Financial Goal
```bash
curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emergency Fund",
    "description": "6 months of expenses",
    "goalType": "EMERGENCY_FUND",
    "targetAmount": 100000.00,
    "targetDate": "2024-12-31T00:00:00Z",
    "categoryId": "savings-category-id"
  }'
```

For complete API documentation with all endpoints, request/response schemas, and examples, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## 📁 Project Structure

```
finplanner/
├── app/                              # Next.js application directory
│   ├── app/                          # App Router pages and layouts
│   │   ├── api/                      # API routes
│   │   │   ├── bills/                # Bill management endpoints
│   │   │   ├── categories/           # Category management endpoints
│   │   │   ├── dashboard/            # Dashboard data endpoints
│   │   │   ├── goals/                # Financial goals endpoints
│   │   │   ├── health/               # Health check endpoint
│   │   │   ├── investments/          # Investment management endpoints
│   │   │   ├── loans/                # Loan management endpoints
│   │   │   └── transactions/         # Transaction management endpoints
│   │   ├── bills/                    # Bills management page
│   │   ├── goals/                    # Financial goals pages
│   │   ├── investments/              # Investment portfolio page
│   │   ├── loans/                    # Loan management page
│   │   ├── transactions/             # Transaction management page
│   │   ├── globals.css               # Global styles and Tailwind imports
│   │   ├── layout.tsx                # Root layout component
│   │   └── page.tsx                  # Dashboard home page
│   ├── components/                   # React components
│   │   ├── ui/                       # Reusable UI components (Radix UI based)
│   │   │   ├── button.tsx            # Button component
│   │   │   ├── card.tsx              # Card component
│   │   │   ├── dialog.tsx            # Dialog/Modal component
│   │   │   ├── form.tsx              # Form components
│   │   │   ├── input.tsx             # Input component
│   │   │   ├── select.tsx            # Select component
│   │   │   ├── table.tsx             # Table component
│   │   │   └── ...                   # Other UI components
│   │   ├── financial-overview-cards.tsx    # Dashboard financial cards
│   │   ├── category-breakdown-widget.tsx   # Category analysis widget
│   │   ├── goals-progress-widget.tsx       # Goals progress widget
│   │   ├── loans-status-widget.tsx         # Loans status widget
│   │   ├── investment-snapshot-widget.tsx  # Investment summary widget
│   │   ├── upcoming-items-widget.tsx       # Upcoming bills/payments widget
│   │   ├── quick-actions-bar.tsx           # Quick action buttons
│   │   ├── transaction-list.tsx            # Transaction listing component
│   │   ├── bill-list.tsx                   # Bill listing component
│   │   ├── goal-list.tsx                   # Goals listing component
│   │   ├── loan-list.tsx                   # Loans listing component
│   │   ├── investment-list.tsx             # Investment listing component
│   │   ├── add-transaction-dialog.tsx      # Transaction creation modal
│   │   ├── add-bill-dialog.tsx             # Bill creation modal
│   │   ├── add-goal-dialog.tsx             # Goal creation modal
│   │   ├── add-loan-dialog.tsx             # Loan creation modal
│   │   ├── add-investment-dialog.tsx       # Investment creation modal
│   │   ├── dashboard-charts.tsx            # Dashboard chart components
│   │   ├── expense-chart.tsx               # Expense analysis charts
│   │   ├── investment-performance-chart.tsx # Investment performance charts
│   │   ├── emi-calculator.tsx              # EMI calculation component
│   │   ├── goal-calculator.tsx             # Goal planning calculator
│   │   ├── investment-calculators.tsx      # Investment calculators
│   │   ├── header.tsx                      # Application header
│   │   ├── theme-provider.tsx              # Theme context provider
│   │   └── ...                             # Other feature components
│   ├── lib/                          # Utility libraries and configurations
│   │   ├── db.ts                     # Database connection and utilities
│   │   ├── types.ts                  # TypeScript type definitions
│   │   ├── utils.ts                  # General utility functions
│   │   ├── categories.ts             # Category management utilities
│   │   ├── currency.ts               # Currency formatting utilities
│   │   ├── chart-config.ts           # Chart.js configuration
│   │   ├── transaction-parser.ts     # SMS/Email transaction parsing
│   │   └── db/                       # Database-specific utilities
│   ├── hooks/                        # Custom React hooks
│   │   └── use-toast.ts              # Toast notification hook
│   ├── prisma/                       # Database schema and migrations
│   │   ├── schema.prisma             # Prisma database schema
│   │   ├── seed.ts                   # Database seeding script
│   │   └── migrations/               # Database migration files
│   ├── package.json                  # App dependencies and scripts
│   ├── next.config.js                # Next.js configuration
│   ├── tailwind.config.ts            # Tailwind CSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── postcss.config.js             # PostCSS configuration
│   └── components.json               # Shadcn/ui component configuration
├── docs/                             # Documentation files
├── docker-compose.yml                # Production Docker Compose configuration
├── docker-compose.dev.yml            # Development Docker Compose configuration
├── Dockerfile                        # Docker build instructions
├── nginx.conf.example                # Nginx configuration template
├── ecosystem.config.js               # PM2 process configuration
├── .env.example                      # Environment variables template
├── .env.local.example                # Local development environment template
├── .env.production.example           # Production environment template
├── README.md                         # This file
├── FEATURES.md                       # Detailed feature documentation
├── API_DOCUMENTATION.md              # Complete API reference
├── CHANGELOG.md                      # Version history and changes
├── TROUBLESHOOTING.md                # Common issues and solutions
├── LICENSE                           # MIT license
├── package.json                      # Workspace package configuration
└── yarn.lock                         # Dependency lock file
```

### Key Directories Explained

#### `/app/app/` - Next.js App Router
Contains all pages and API routes using Next.js 14 App Router structure.

#### `/app/components/` - React Components
- **`ui/`**: Reusable UI components built with Radix UI primitives
- **Feature components**: Specific components for financial management features
- **Dialog components**: Modal forms for creating/editing records
- **Chart components**: Data visualization components using Chart.js
- **Calculator components**: Financial calculation tools

#### `/app/lib/` - Utilities and Configuration
- **Database utilities**: Prisma client configuration and helpers
- **Type definitions**: TypeScript interfaces and types
- **Business logic**: Financial calculations and data processing
- **Configuration**: Chart settings, categories, and app constants

#### `/app/prisma/` - Database Management
- **Schema definition**: Complete database schema with relationships
- **Migrations**: Database version control and schema changes
- **Seeding**: Sample data for development and testing

### Component Architecture

#### UI Component Hierarchy
```
App Layout (layout.tsx)
├── Header (header.tsx)
├── Theme Provider (theme-provider.tsx)
└── Page Content
    ├── Dashboard (page.tsx)
    │   ├── Financial Overview Cards
    │   ├── Quick Actions Bar
    │   ├── Goals Progress Widget
    │   ├── Loans Status Widget
    │   ├── Investment Snapshot Widget
    │   ├── Upcoming Items Widget
    │   └── Category Breakdown Widget
    ├── Transactions Page
    │   ├── Transaction Summary Cards
    │   ├── Transaction Filters
    │   ├── Transaction List
    │   └── Add Transaction Dialog
    ├── Bills Page
    │   ├── Bill Analytics
    │   ├── Bill Calendar
    │   ├── Bill List
    │   └── Add Bill Dialog
    ├── Goals Page
    │   ├── Goals Summary
    │   ├── Goal Progress Chart
    │   ├── Goal List
    │   └── Add Goal Dialog
    ├── Loans Page
    │   ├── Loan Analytics
    │   ├── EMI Calculator
    │   ├── Loan List
    │   └── Add Loan Dialog
    └── Investments Page
        ├── Portfolio Summary
        ├── Asset Allocation Chart
        ├── Investment Performance Chart
        ├── Investment List
        └── Add Investment Dialog
```

#### State Management
- **React Context**: Theme management and global app state
- **React Hook Form**: Form state management with validation
- **Local State**: Component-specific state with useState and useEffect
- **Server State**: API data fetching and caching with SWR/React Query

#### Data Flow
```
User Interaction → Component → API Route → Prisma → PostgreSQL
                                    ↓
Database Response ← Prisma ← API Route ← Component Update
```

## 🤝 Contributing

We welcome contributions to FinPlanner! Whether you're fixing bugs, adding features, improving documentation, or enhancing the user experience, your contributions are valuable.

### Getting Started

#### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/yourusername/finplanner.git
cd finplanner
```

#### 2. Set Up Development Environment
```bash
cd app
npm install
cp ../.env.local.example .env.local
# Edit .env.local with your settings
npm run db:migrate
npm run db:seed
```

#### 3. Create Feature Branch
```bash
git checkout -b feature/amazing-feature
# or
git checkout -b bugfix/fix-issue-123
# or
git checkout -b docs/improve-readme
```

#### 4. Make Your Changes
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure TypeScript types are properly defined

#### 5. Test Your Changes
```bash
# Type checking
npm run type-check

# Linting
npm run lint:fix

# Build test
npm run build

# Manual testing
npm run dev
```

#### 6. Commit and Push
```bash
git add .
git commit -m "feat: add amazing new feature"
git push origin feature/amazing-feature
```

#### 7. Create Pull Request
- Open a pull request on GitHub
- Provide a clear description of your changes
- Link any related issues
- Wait for review and address feedback

### Development Guidelines

#### Code Style Standards
- **TypeScript**: Use strict typing, avoid `any` types
- **React**: Use functional components with hooks
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add comments for complex business logic
- **File Organization**: Keep files focused and well-organized

#### Component Guidelines
```typescript
// Good component structure
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  title: string;
  data: DataType[];
  onAction: (id: string) => void;
}

export function MyComponent({ title, data, onAction }: ComponentProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Effect logic
  }, []);

  const handleClick = (id: string) => {
    setLoading(true);
    onAction(id);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
}
```

#### API Route Guidelines
```typescript
// Good API route structure
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
});

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.model.findMany();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSchema.parse(body);
    
    const result = await prisma.model.create({
      data: validatedData,
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Database Guidelines
- Use Prisma schema for all database changes
- Create migrations for schema changes
- Use proper relationships and constraints
- Add indexes for performance-critical queries
- Follow naming conventions (snake_case for database, camelCase for TypeScript)

#### Commit Message Convention
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(transactions): add bulk import functionality
fix(dashboard): resolve chart rendering issue
docs(api): update endpoint documentation
style(components): improve button component styling
refactor(utils): optimize currency formatting function
test(goals): add unit tests for goal calculations
chore(deps): update dependencies to latest versions
```

### Areas for Contribution

#### 🐛 Bug Fixes
- Fix reported issues from GitHub Issues
- Improve error handling and edge cases
- Resolve performance bottlenecks
- Fix responsive design issues

#### ✨ New Features
- **Mobile App**: React Native or Flutter implementation
- **AI Insights**: Machine learning for financial recommendations
- **Bank Integration**: API connections with banks
- **Advanced Analytics**: More sophisticated financial analysis
- **Multi-currency**: Support for multiple currencies
- **Budgeting**: Advanced budget planning and monitoring
- **Tax Planning**: Tax optimization features
- **Social Features**: Sharing goals and achievements

#### 📚 Documentation
- Improve setup and installation guides
- Add more code examples and tutorials
- Create video tutorials
- Translate documentation to other languages
- Improve API documentation with more examples

#### 🎨 UI/UX Improvements
- Enhance mobile responsiveness
- Improve accessibility (WCAG compliance)
- Add new themes and customization options
- Optimize user workflows
- Add animations and micro-interactions

#### 🔧 Performance Optimization
- Database query optimization
- Frontend bundle size reduction
- Implement caching strategies
- Improve loading times
- Add progressive web app features

#### 🌐 Internationalization
- Add support for multiple languages
- Implement locale-specific formatting
- Add RTL language support
- Create translation management system

#### 🧪 Testing
- Add unit tests for components
- Implement integration tests
- Add end-to-end testing
- Improve test coverage
- Add performance testing

### Code Review Process

#### For Contributors
1. Ensure your code follows the style guidelines
2. Add appropriate tests for new features
3. Update documentation as needed
4. Ensure all checks pass (linting, type checking, build)
5. Provide a clear pull request description

#### For Reviewers
1. Check code quality and adherence to guidelines
2. Verify functionality works as expected
3. Review test coverage and quality
4. Ensure documentation is updated
5. Provide constructive feedback

### Community Guidelines

#### Be Respectful
- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community

#### Be Collaborative
- Help others learn and grow
- Share knowledge and best practices
- Provide helpful feedback
- Celebrate others' contributions

#### Be Professional
- Keep discussions focused and on-topic
- Avoid personal attacks or harassment
- Report inappropriate behavior
- Maintain a professional tone

### Getting Help

#### Development Questions
- Check existing documentation first
- Search GitHub Issues for similar questions
- Ask questions in GitHub Discussions
- Join our community chat (if available)

#### Reporting Issues
When reporting bugs, please include:
- **Environment details**: OS, Node.js version, browser
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Error logs**: Console errors or server logs

#### Feature Requests
When requesting features, please include:
- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Other ways to solve the problem
- **Additional context**: Any other relevant information

### Recognition

Contributors will be recognized in:
- **README.md**: Contributors section
- **CHANGELOG.md**: Feature and fix attributions
- **GitHub**: Contributor graphs and statistics
- **Release notes**: Major contribution highlights

Thank you for contributing to FinPlanner! Your efforts help make personal finance management accessible and powerful for everyone.

## 🔧 Troubleshooting

### Quick Troubleshooting Checklist

#### Application Won't Start
1. **Check Node.js version**: Ensure you have Node.js 18+ installed
2. **Verify dependencies**: Run `npm install` to ensure all packages are installed
3. **Check environment variables**: Ensure `.env.local` exists with correct values
4. **Database connection**: Verify PostgreSQL is running and accessible
5. **Port conflicts**: Ensure port 3000 is available or use a different port

#### Database Issues
1. **Connection errors**: Check DATABASE_URL format and credentials
2. **Migration errors**: Run `npm run db:migrate:reset` to reset database
3. **Prisma client**: Run `npm run db:generate` to regenerate client
4. **Permissions**: Ensure database user has proper permissions

#### Build Errors
1. **TypeScript errors**: Run `npm run type-check` to identify issues
2. **Linting errors**: Run `npm run lint:fix` to auto-fix issues
3. **Missing dependencies**: Check if all required packages are installed
4. **Cache issues**: Run `npm run clean` to clear build cache

### Common Issues and Solutions

#### Issue: "Cannot connect to database"
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL if stopped
sudo systemctl start postgresql

# Test connection manually
psql "postgresql://username:password@localhost:5432/finplanner"
```

#### Issue: "Prisma client not found"
```bash
# Generate Prisma client
npm run db:generate

# If still failing, reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run db:generate
```

#### Issue: "Port 3000 already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### Issue: "Environment variables not loaded"
```bash
# Check if .env.local exists
ls -la .env.local

# Verify file contents
cat .env.local

# Ensure proper format (no spaces around =)
DATABASE_URL="postgresql://..."
```

#### Issue: "Charts not rendering"
```bash
# Ensure chart components are client-side
# Add 'use client' directive at top of component

# Check browser console for errors
# Verify Chart.js dependencies are installed
npm list chart.js react-chartjs-2
```

### Docker Troubleshooting

#### Issue: "Docker containers won't start"
```bash
# Check Docker status
sudo systemctl status docker

# Check container logs
docker-compose logs

# Restart Docker service
sudo systemctl restart docker

# Rebuild containers
docker-compose down
docker-compose up --build -d
```

#### Issue: "Database container fails to start"
```bash
# Check if port 5432 is available
netstat -tulpn | grep :5432

# Stop conflicting PostgreSQL service
sudo systemctl stop postgresql

# Remove existing volumes if needed
docker-compose down -v
docker-compose up -d
```

### Performance Issues

#### Issue: "Slow application response"
```bash
# Check system resources
htop
df -h
free -m

# Monitor database performance
npm run db:studio

# Check for slow queries
# Add to PostgreSQL config: log_min_duration_statement = 1000

# Optimize database
VACUUM ANALYZE;
```

#### Issue: "High memory usage"
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Monitor memory usage
pm2 monit

# Check for memory leaks in browser dev tools
```

### Production Issues

#### Issue: "SSL certificate errors"
```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/domain.com/fullchain.pem -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew

# Restart Nginx
sudo systemctl reload nginx
```

#### Issue: "502 Bad Gateway"
```bash
# Check if application is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart finplanner
sudo systemctl restart nginx
```

### Development Issues

#### Issue: "Hot reload not working"
```bash
# Check if using correct development command
npm run dev

# Clear Next.js cache
rm -rf .next

# Check file watchers limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### Issue: "TypeScript errors in IDE"
```bash
# Restart TypeScript server in VS Code
# Ctrl+Shift+P -> "TypeScript: Restart TS Server"

# Check TypeScript configuration
cat tsconfig.json

# Ensure Prisma client is generated
npm run db:generate
```

### Browser Issues

#### Issue: "Page not loading"
1. **Clear browser cache**: Ctrl+Shift+R (hard refresh)
2. **Check browser console**: F12 -> Console tab
3. **Disable browser extensions**: Test in incognito mode
4. **Check network requests**: F12 -> Network tab

#### Issue: "Features not working on mobile"
1. **Test responsive design**: Use browser dev tools device simulation
2. **Check touch events**: Ensure proper touch event handling
3. **Verify viewport meta tag**: Check if properly configured
4. **Test on actual devices**: Different browsers and screen sizes

### Debugging Tips

#### Enable Debug Mode
```bash
# Enable Next.js debug mode
DEBUG=* npm run dev

# Enable Prisma debug mode
DEBUG="prisma:*" npm run dev

# Enable specific debug categories
DEBUG="prisma:query" npm run dev
```

#### Logging and Monitoring
```bash
# Application logs
tail -f logs/combined.log

# PM2 logs
pm2 logs finplanner

# Docker logs
docker-compose logs -f finplanner

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### Health Checks
```bash
# Application health
curl http://localhost:3000/api/health

# Database health
npm run health-check

# All services status
docker-compose ps
pm2 status
sudo systemctl status nginx postgresql
```

### Getting Additional Help

#### Before Seeking Help
1. **Check this troubleshooting guide** thoroughly
2. **Search existing GitHub Issues** for similar problems
3. **Review the documentation** for relevant sections
4. **Try the suggested solutions** step by step

#### When Reporting Issues
Include the following information:

**System Information:**
```bash
# Collect system info
uname -a
node --version
npm --version
docker --version
psql --version
```

**Application Information:**
```bash
# Application version
cat package.json | grep version
git rev-parse HEAD

# Environment details
echo $NODE_ENV
cat .env.local | grep -v PASSWORD | grep -v SECRET
```

**Error Logs:**
```bash
# Collect relevant logs
npm run dev 2>&1 | tee debug.log
docker-compose logs > docker-debug.log
pm2 logs --lines 50 > pm2-debug.log
```

#### Support Channels
- 📖 **Documentation**: Check README, FEATURES, and API docs
- 🐛 **GitHub Issues**: Report bugs and technical issues
- 💬 **GitHub Discussions**: Ask questions and get community help
- 📧 **Email**: Contact maintainers for urgent issues

#### Community Resources
- **Stack Overflow**: Tag questions with `finplanner`
- **Discord/Slack**: Join community chat (if available)
- **Reddit**: r/personalfinance for general finance discussions

Remember: The more detailed information you provide, the faster we can help resolve your issue!

For comprehensive troubleshooting information, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

```
MIT License

Copyright (c) 2024 FinPlanner Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### What This Means

✅ **You can:**
- Use the software for any purpose (personal, commercial, etc.)
- Modify the source code
- Distribute the software
- Distribute your modifications
- Use the software privately

❗ **You must:**
- Include the original license and copyright notice
- Include the license when distributing the software

❌ **You cannot:**
- Hold the authors liable for damages
- Use the authors' names to promote your derivative works
- Expect any warranty or guarantee

### Third-Party Licenses

FinPlanner uses several open-source libraries, each with their own licenses:

- **Next.js**: MIT License
- **React**: MIT License
- **Prisma**: Apache License 2.0
- **Tailwind CSS**: MIT License
- **Radix UI**: MIT License
- **Chart.js**: MIT License
- **PostgreSQL**: PostgreSQL License (similar to MIT)

All dependencies maintain compatibility with the MIT License.

## 🙏 Acknowledgments

### Core Technologies
- **[Next.js Team](https://nextjs.org/)** for the incredible React framework
- **[Prisma Team](https://www.prisma.io/)** for the excellent database toolkit
- **[Vercel](https://vercel.com/)** for hosting and deployment platform
- **[Tailwind CSS](https://tailwindcss.com/)** for the utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** for accessible component primitives

### Design and UI
- **[Lucide](https://lucide.dev/)** for beautiful, consistent icons
- **[Unsplash](https://unsplash.com/)** for high-quality stock photography
- **[Chart.js](https://www.chartjs.org/)** for powerful data visualization
- **[Framer Motion](https://www.framer.com/motion/)** for smooth animations

### Development Tools
- **[TypeScript](https://www.typescriptlang.org/)** for type safety and developer experience
- **[ESLint](https://eslint.org/)** and **[Prettier](https://prettier.io/)** for code quality
- **[Docker](https://www.docker.com/)** for containerization and deployment
- **[PostgreSQL](https://www.postgresql.org/)** for robust data storage

### Community and Inspiration
- **Personal finance community** for insights and feature ideas
- **Open source contributors** who make projects like this possible
- **Early users and testers** who provided valuable feedback
- **Financial planning experts** who guided feature development

### Special Thanks
- All contributors who have helped improve FinPlanner
- The open source community for creating amazing tools and libraries
- Users who provide feedback and help make FinPlanner better
- Financial advisors and experts who provided domain knowledge

## 🔗 Links and Resources

### Project Links
- **🌐 Live Demo**: [https://finplanner-demo.vercel.app](https://finplanner-demo.vercel.app)
- **📚 Documentation**: [https://docs.finplanner.app](https://docs.finplanner.app)
- **🐛 Issues**: [GitHub Issues](https://github.com/yourusername/finplanner/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/yourusername/finplanner/discussions)
- **📦 Releases**: [GitHub Releases](https://github.com/yourusername/finplanner/releases)

### Documentation
- **[FEATURES.md](FEATURES.md)** - Comprehensive feature overview
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[LICENSE](LICENSE)** - MIT license details

### Technology Documentation
- **[Next.js Documentation](https://nextjs.org/docs)**
- **[React Documentation](https://react.dev/)**
- **[Prisma Documentation](https://www.prisma.io/docs)**
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)**
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)**

### Deployment Guides
- **[Vercel Deployment](https://vercel.com/docs)**
- **[Docker Documentation](https://docs.docker.com/)**
- **[DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)**
- **[Railway Deployment](https://docs.railway.app/)**

### Financial Resources
- **[Personal Finance Subreddit](https://www.reddit.com/r/personalfinance/)**
- **[Investopedia](https://www.investopedia.com/)** - Financial education
- **[Mint](https://mint.intuit.com/)** - Personal finance inspiration
- **[YNAB](https://www.youneedabudget.com/)** - Budgeting methodology

---

<div align="center">

**Made with ❤️ by the FinPlanner Team**

[⭐ Star this repository](https://github.com/yourusername/finplanner) if you find it helpful!

**Take control of your financial future with FinPlanner** 🚀

</div>
