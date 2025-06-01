
#!/bin/bash

# FinPlanner Quick Setup Script
# This script helps you get FinPlanner up and running quickly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

print_header "🚀 FinPlanner Quick Setup"
echo "This script will help you set up FinPlanner for development or production."
echo

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_status "✓ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_status "✓ npm $(npm --version) found"

# Ask for setup type
echo
print_header "Setup Options:"
echo "1. Development setup (local PostgreSQL required)"
echo "2. Development with Docker (Docker required)"
echo "3. Production setup (for server deployment)"
echo

read -p "Choose setup type (1-3): " SETUP_TYPE

case $SETUP_TYPE in
    1)
        print_header "🔧 Setting up for local development..."
        
        # Check PostgreSQL
        if ! command -v psql &> /dev/null; then
            print_error "PostgreSQL is not installed. Please install PostgreSQL first."
            print_status "Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
            print_status "macOS: brew install postgresql"
            exit 1
        fi
        
        print_status "✓ PostgreSQL found"
        
        # Setup environment
        if [ ! -f ".env.local" ]; then
            print_status "Creating .env.local file..."
            cp .env.local.example .env.local
            print_warning "Please edit .env.local with your database credentials"
        fi
        
        # Install dependencies
        print_status "Installing dependencies..."
        cd app
        npm install
        
        # Setup database
        print_status "Setting up database..."
        npm run db:generate
        
        echo
        print_status "🎉 Development setup complete!"
        print_status "Next steps:"
        echo "1. Edit .env.local with your database URL"
        echo "2. Run: npm run db:migrate"
        echo "3. Run: npm run db:seed (optional)"
        echo "4. Run: npm run dev"
        ;;
        
    2)
        print_header "🐳 Setting up with Docker..."
        
        # Check Docker
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed. Please install Docker first."
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            print_error "Docker Compose is not installed. Please install Docker Compose first."
            exit 1
        fi
        
        print_status "✓ Docker found"
        print_status "✓ Docker Compose found"
        
        # Start development services
        print_status "Starting development services..."
        docker-compose -f docker-compose.dev.yml up -d
        
        # Setup environment
        if [ ! -f "app/.env.local" ]; then
            print_status "Creating .env.local file..."
            cp .env.local.example app/.env.local
        fi
        
        # Install dependencies
        print_status "Installing dependencies..."
        cd app
        npm install
        
        # Setup database
        print_status "Setting up database..."
        npm run db:generate
        npm run db:migrate
        npm run db:seed
        
        echo
        print_status "🎉 Docker development setup complete!"
        print_status "Next steps:"
        echo "1. Run: npm run dev"
        echo "2. Open: http://localhost:3000"
        ;;
        
    3)
        print_header "🚀 Setting up for production..."
        
        # Setup environment
        if [ ! -f ".env" ]; then
            print_status "Creating .env file..."
            cp .env.production.example .env
            print_warning "Please edit .env with your production settings"
        fi
        
        # Install dependencies
        print_status "Installing dependencies..."
        cd app
        npm ci --production
        
        # Build application
        print_status "Building application..."
        npm run build
        
        echo
        print_status "🎉 Production setup complete!"
        print_status "Next steps:"
        echo "1. Edit .env with your production database URL and secrets"
        echo "2. Run: npm run db:migrate:deploy"
        echo "3. Start with PM2: pm2 start ../ecosystem.config.js --env production"
        echo "4. Or use Docker: docker-compose up -d"
        ;;
        
    *)
        print_error "Invalid option. Please choose 1, 2, or 3."
        exit 1
        ;;
esac

echo
print_header "📚 Useful Commands:"
echo "• npm run dev          - Start development server"
echo "• npm run build        - Build for production"
echo "• npm run db:studio    - Open database admin"
echo "• npm run db:migrate   - Run database migrations"
echo "• npm run db:seed      - Seed database with sample data"
echo "• docker-compose up -d - Start with Docker"
echo

print_header "📖 Documentation:"
echo "• README.md            - Complete setup guide"
echo "• API_DOCUMENTATION.md - API reference"
echo "• FEATURES.md          - Feature overview"
echo "• TROUBLESHOOTING.md   - Common issues and solutions"
echo

print_status "Setup completed! Happy coding! 🎉"
