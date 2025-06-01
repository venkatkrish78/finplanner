
# 💰 FinPlanner - Personal Finance Management System

<div align="center">

![FinPlanner Logo](https://i.pinimg.com/originals/62/05/25/62052578234eb829fa8d34b7170c5cfe.png)

**A comprehensive personal finance management application built with Next.js, React, and PostgreSQL**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment) • [Contributing](#-contributing)

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Installation Methods](#-installation-methods)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## 🌟 Overview

FinPlanner is a modern, comprehensive personal finance management application designed to help individuals take control of their financial life. Built with cutting-edge technologies, it provides an intuitive interface for tracking expenses, managing budgets, monitoring investments, and achieving financial goals.

### Why FinPlanner?

- **🔒 Privacy First**: Your financial data stays secure and private
- **📊 Comprehensive Tracking**: Income, expenses, bills, goals, loans, and investments
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **🎯 Goal-Oriented**: Set and track financial objectives with visual progress
- **📈 Investment Management**: Complete portfolio tracking and analysis
- **🔄 Automated Features**: Recurring bills, SIP management, and smart categorization
- **🎨 Modern UI**: Beautiful, intuitive interface with dark/light themes

## ✨ Features

### 💰 Core Financial Management
- **Transaction Tracking**: Record and categorize all income and expenses
- **Bill Management**: Track recurring bills with payment reminders
- **Budget Planning**: Set and monitor budgets across categories
- **Financial Goals**: Create and track progress towards financial objectives

### 📈 Investment & Portfolio
- **Portfolio Management**: Track stocks, mutual funds, crypto, and other assets
- **SIP Management**: Automate systematic investment plans
- **Performance Analytics**: Monitor gains, losses, and portfolio allocation
- **Goal-Linked Investments**: Connect investments to specific financial goals

### 🏦 Loan & Debt Management
- **Loan Tracking**: Monitor all types of loans and debts
- **EMI Calculator**: Calculate and track loan payments
- **Payoff Planning**: Visualize loan payoff schedules and strategies

### 📊 Analytics & Insights
- **Expense Analysis**: Detailed spending patterns and trends
- **Visual Reports**: Interactive charts and graphs
- **Cash Flow Tracking**: Monitor money in and out
- **Financial Health Score**: Overall financial wellness indicator

### 🔧 Tools & Calculators
- **EMI Calculator**: Loan payment calculations
- **Goal Calculator**: Savings requirement planning
- **Investment Calculator**: Return projections
- **SIP Calculator**: Systematic investment planning

For a complete list of features, see [FEATURES.md](FEATURES.md).

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks and context
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Radix UI** - Accessible component primitives
- **Chart.js** - Data visualization
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **NextAuth.js** - Authentication (optional)

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancer
- **PM2** - Process management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn**
- **PostgreSQL** (v13 or higher)
- **Git**

### Optional (for Docker deployment):
- **Docker** (v20.0.0 or higher)
- **Docker Compose** (v2.0.0 or higher)

## 🚀 Quick Start

Get FinPlanner running locally in under 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/finplanner.git
cd finplanner

# 2. Install dependencies
cd app
npm install

# 3. Set up environment variables
cp ../.env.local.example .env.local
# Edit .env.local with your database URL and other settings

# 4. Set up the database
npm run db:migrate
npm run db:seed

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see FinPlanner in action! 🎉

## 📦 Installation Methods

### Method 1: Local Development Setup

#### 1. Clone and Setup
```bash
git clone https://github.com/yourusername/finplanner.git
cd finplanner
cd app
npm install
```

#### 2. Database Setup
```bash
# Start PostgreSQL (if not running)
sudo systemctl start postgresql

# Create database
createdb finplanner_dev

# Set up environment
cp ../.env.local.example .env.local
```

#### 3. Configure Environment
Edit `.env.local`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/finplanner_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret"
```

#### 4. Initialize Database
```bash
npm run db:migrate
npm run db:seed
```

#### 5. Start Development Server
```bash
npm run dev
```

### Method 2: Docker Development

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/finplanner.git
cd finplanner
```

#### 2. Start Development Environment
```bash
# Start database services
docker-compose -f docker-compose.dev.yml up -d

# Install dependencies and start app
cd app
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### Method 3: Full Docker Deployment

#### 1. Clone and Configure
```bash
git clone https://github.com/yourusername/finplanner.git
cd finplanner

# Copy and edit environment file
cp .env.example .env
# Edit .env with your production settings
```

#### 2. Deploy with Docker Compose
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- FinPlanner application
- Nginx reverse proxy
- Redis (for caching)

## ⚙️ Environment Configuration

FinPlanner uses environment variables for configuration. Copy the appropriate example file and customize:

### Development
```bash
cp .env.local.example .env.local
```

### Production
```bash
cp .env.production.example .env.production
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/finplanner` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for session encryption | `your-secret-key` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |

For a complete list of environment variables, see the `.env.example` file.

## 🗄️ Database Setup

### Local PostgreSQL Setup

#### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download and install from https://www.postgresql.org/download/windows/
```

#### 2. Create Database and User
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE finplanner;
CREATE USER finplanner WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE finplanner TO finplanner;
\q
```

#### 3. Run Migrations
```bash
cd app
npm run db:migrate
```

#### 4. Seed Database (Optional)
```bash
npm run db:seed
```

### Docker PostgreSQL Setup

Use the provided Docker Compose configuration:

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Production
docker-compose up -d postgres
```

### Database Management Commands

```bash
# Generate Prisma client
npm run db:generate

# Create and apply migration
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Reset database
npm run db:migrate:reset

# Push schema changes
npm run db:push

# Open Prisma Studio
npm run db:studio

# Backup database
npm run db:backup
```

## 🔧 Development

### Development Server

```bash
cd app
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Development Commands

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Database operations
npm run db:studio          # Open Prisma Studio
npm run db:migrate         # Create and apply migration
npm run db:seed           # Seed database with sample data

# Clean build artifacts
npm run clean
```

### Project Structure

```
finplanner/
├── app/                          # Next.js application
│   ├── app/                      # App router pages
│   │   ├── api/                  # API routes
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   ├── components/               # React components
│   │   ├── ui/                   # UI components
│   │   └── ...                   # Feature components
│   ├── lib/                      # Utility libraries
│   ├── prisma/                   # Database schema and migrations
│   └── package.json              # Dependencies and scripts
├── docs/                         # Documentation
├── docker-compose.yml            # Docker configuration
├── Dockerfile                    # Docker build instructions
└── README.md                     # This file
```

### Code Style and Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

## 🚀 Deployment

### Production Deployment Options

#### Option 1: Docker Deployment (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/finplanner.git
cd finplanner

# 2. Configure environment
cp .env.production.example .env
# Edit .env with your production settings

# 3. Deploy
docker-compose up -d

# 4. Check status
docker-compose ps
docker-compose logs -f finplanner
```

#### Option 2: Traditional Server Deployment

```bash
# 1. Prepare server
sudo apt update
sudo apt install nodejs npm postgresql nginx

# 2. Clone and setup
git clone https://github.com/yourusername/finplanner.git
cd finplanner/app
npm ci --production

# 3. Build application
npm run build

# 4. Setup database
npm run db:migrate:deploy

# 5. Start with PM2
npm install -g pm2
pm2 start ecosystem.config.js --env production
```

#### Option 3: Cloud Platform Deployment

**Vercel** (Recommended for Next.js):
```bash
npm install -g vercel
vercel --prod
```

**Railway**:
```bash
npm install -g @railway/cli
railway login
railway deploy
```

**DigitalOcean App Platform**:
- Connect your GitHub repository
- Configure environment variables
- Deploy automatically

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
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Using Cloudflare

1. Point your domain to Cloudflare
2. Enable SSL/TLS encryption
3. Configure origin certificates

### Performance Optimization

#### Production Optimizations

```bash
# Enable production optimizations
NODE_ENV=production npm run build

# Analyze bundle size
npm run analyze

# Enable compression in Nginx
# Add to nginx.conf:
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

#### Monitoring and Logging

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs finplanner

# Docker logs
docker-compose logs -f
```

### Backup and Recovery

#### Database Backup

```bash
# Manual backup
npm run db:backup

# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/finplanner"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "$BACKUP_DIR/backup_$DATE.sql"
```

#### Application Backup

```bash
# Backup application files
tar -czf finplanner-backup-$(date +%Y%m%d).tar.gz /var/www/finplanner

# Backup with Docker volumes
docker run --rm -v finplanner_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

## 📚 API Documentation

FinPlanner provides a comprehensive REST API for all financial operations. The API is built with Next.js API routes and provides endpoints for:

- **Categories**: Manage expense and income categories
- **Transactions**: Record and retrieve financial transactions
- **Bills**: Manage recurring bills and payments
- **Goals**: Track financial goals and progress
- **Loans**: Monitor loans and EMI payments
- **Investments**: Manage investment portfolio

### API Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

### Quick API Examples

```bash
# Get all categories
curl http://localhost:3000/api/categories

# Create a transaction
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "type": "EXPENSE", "description": "Groceries", "categoryId": "category-id"}'

# Get transactions with pagination
curl "http://localhost:3000/api/transactions?page=1&limit=10"
```

For complete API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## 🤝 Contributing

We welcome contributions to FinPlanner! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/finplanner.git
   cd finplanner
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes**
5. **Test your changes**:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```
6. **Commit your changes**:
   ```bash
   git commit -m "Add amazing feature"
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Create a Pull Request**

### Development Guidelines

- **Code Style**: Follow the existing code style and use ESLint/Prettier
- **TypeScript**: Use proper typing, avoid `any` types
- **Testing**: Add tests for new features
- **Documentation**: Update documentation for new features
- **Commits**: Use conventional commit messages

### Areas for Contribution

- 🐛 **Bug Fixes**: Help fix reported issues
- ✨ **New Features**: Add new financial management features
- 📚 **Documentation**: Improve documentation and guides
- 🎨 **UI/UX**: Enhance user interface and experience
- 🔧 **Performance**: Optimize application performance
- 🌐 **Internationalization**: Add support for multiple languages
- 📱 **Mobile**: Improve mobile responsiveness

### Reporting Issues

When reporting issues, please include:

- **Environment details** (OS, Node.js version, browser)
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Error logs**

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql "postgresql://username:password@localhost:5432/finplanner"
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### Prisma Issues
```bash
# Regenerate Prisma client
npm run db:generate

# Reset database
npm run db:migrate:reset
```

#### Docker Issues
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs finplanner

# Restart services
docker-compose restart
```

For comprehensive troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

### Getting Help

- 📖 **Documentation**: Check the docs in this repository
- 🐛 **Issues**: Report bugs on GitHub Issues
- 💬 **Discussions**: Join GitHub Discussions for questions
- 📧 **Email**: Contact the maintainers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing React framework
- **Prisma Team** for the excellent database toolkit
- **Vercel** for hosting and deployment platform
- **Tailwind CSS** for the utility-first CSS framework
- **Radix UI** for accessible component primitives
- **All Contributors** who help make FinPlanner better

## 🔗 Links

- **Live Demo**: [https://finplanner-demo.vercel.app](https://finplanner-demo.vercel.app)
- **Documentation**: [https://docs.finplanner.app](https://docs.finplanner.app)
- **API Reference**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Feature List**: [FEATURES.md](FEATURES.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

<div align="center">

**Made with ❤️ by the FinPlanner Team**

[⭐ Star this repository](https://github.com/yourusername/finplanner) if you find it helpful!

</div>
