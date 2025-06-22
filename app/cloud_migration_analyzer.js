#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

class CloudMigrationAnalyzer {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      appName: 'FinPlanner AI',
      cloudReadiness: {}
    };
  }

  executeCommand(command, description) {
    try {
      console.log(`🔍 ${description}...`);
      const output = execSync(command, { encoding: 'utf8', timeout: 30000 });
      return output.trim();
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  analyzeCloudRequirements() {
    console.log('\n☁️ ANALYZING CLOUD REQUIREMENTS...');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    this.report.cloudReadiness.runtime = {
      nodeVersion: this.executeCommand('node --version', 'Node.js version'),
      npmVersion: this.executeCommand('npm --version', 'npm version'),
      requiredNodeVersion: packageJson.engines?.node || 'Not specified',
      buildCommand: packageJson.scripts?.build || 'Not defined',
      startCommand: packageJson.scripts?.start || 'Not defined',
      devCommand: packageJson.scripts?.dev || 'Not defined'
    };
  }

  analyzeEnvironmentVariables() {
    console.log('\n🔐 ANALYZING ENVIRONMENT VARIABLES...');
    
    const envFiles = ['.env.example', '.env.local.example', '.env'];
    const envVars = new Set();
    
    envFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(/^[A-Z_][A-Z0-9_]*=/gm);
        if (matches) {
          matches.forEach(match => envVars.add(match.replace('=', '')));
        }
      }
    });

    // Also check for env vars in code
    const codeEnvVars = this.executeCommand(
      'grep -r "process.env" app lib components --include="*.ts" --include="*.tsx" --include="*.js" | grep -o "process\\.env\\.[A-Z_][A-Z0-9_]*" | sort | uniq',
      'Environment variables in code'
    );

    this.report.cloudReadiness.environmentVariables = {
      requiredVars: Array.from(envVars),
      codeReferences: codeEnvVars.split('\n').filter(v => v.trim()),
      criticalVars: {
        DATABASE_URL: envVars.has('DATABASE_URL'),
        NEXTAUTH_SECRET: envVars.has('NEXTAUTH_SECRET'),
        NEXTAUTH_URL: envVars.has('NEXTAUTH_URL'),
        OPENAI_API_KEY: envVars.has('OPENAI_API_KEY'),
        NODE_ENV: envVars.has('NODE_ENV')
      }
    };
  }

  analyzeDatabaseRequirements() {
    console.log('\n🗄️ ANALYZING DATABASE REQUIREMENTS...');
    
    const prismaSchema = fs.existsSync('prisma/schema.prisma') ? 
      fs.readFileSync('prisma/schema.prisma', 'utf8') : '';
    
    const dbProvider = prismaSchema.match(/provider\s*=\s*"([^"]+)"/)?.[1] || 'unknown';
    const dbUrl = prismaSchema.match(/url\s*=\s*env\("([^"]+)"\)/)?.[1] || 'unknown';
    
    const migrations = fs.existsSync('prisma/migrations') ? 
      fs.readdirSync('prisma/migrations').length : 0;

    this.report.cloudReadiness.database = {
      provider: dbProvider,
      urlEnvVar: dbUrl,
      hasMigrations: migrations > 0,
      migrationCount: migrations,
      seedFile: fs.existsSync('prisma/seed.ts') || fs.existsSync('prisma/seed.js'),
      models: (prismaSchema.match(/model\s+\w+/g) || []).length
    };
  }

  analyzeStaticAssets() {
    console.log('\n📁 ANALYZING STATIC ASSETS...');
    
    const publicFiles = fs.existsSync('public') ? 
      this.executeCommand('find public -type f | wc -l', 'Public files count') : '0';
    
    const publicSize = fs.existsSync('public') ? 
      this.executeCommand('du -sh public 2>/dev/null || echo "0B"', 'Public directory size') : '0B';

    this.report.cloudReadiness.staticAssets = {
      hasPublicDir: fs.existsSync('public'),
      fileCount: parseInt(publicFiles) || 0,
      totalSize: publicSize,
      hasImages: fs.existsSync('public') && 
        this.executeCommand('find public -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" | wc -l', 'Image count') > 0
    };
  }

  analyzeBuildRequirements() {
    console.log('\n🔨 ANALYZING BUILD REQUIREMENTS...');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = Object.keys(packageJson.dependencies || {});
    const devDeps = Object.keys(packageJson.devDependencies || {});
    
    // Check for build-time dependencies that might be needed in production
    const buildTimeDeps = devDeps.filter(dep => 
      ['prisma', 'typescript', '@types/', 'tailwindcss', 'postcss', 'autoprefixer'].some(pattern => 
        dep.includes(pattern)
      )
    );

    this.report.cloudReadiness.build = {
      hasBuildScript: !!packageJson.scripts?.build,
      hasPostBuildScript: !!packageJson.scripts?.postbuild,
      buildTimeDependencies: buildTimeDeps,
      totalDependencies: deps.length,
      totalDevDependencies: devDeps.length,
      hasTypeScript: deps.includes('typescript') || devDeps.includes('typescript'),
      hasTailwind: deps.includes('tailwindcss') || devDeps.includes('tailwindcss'),
      hasPrisma: deps.includes('prisma') || devDeps.includes('prisma')
    };
  }

  generateCloudProviderConfigs() {
    console.log('\n☁️ GENERATING CLOUD PROVIDER CONFIGS...');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const nodeVersion = this.report.cloudReadiness.runtime.nodeVersion.replace('v', '');
    
    // Vercel config
    const vercelConfig = {
      version: 2,
      builds: [
        {
          src: "package.json",
          use: "@vercel/next"
        }
      ],
      env: Object.fromEntries(
        this.report.cloudReadiness.environmentVariables.requiredVars.map(v => [v, `@${v.toLowerCase()}`])
      )
    };

    // Netlify config
    const netlifyConfig = `[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "${nodeVersion}"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  node_bundler = "esbuild"
`;

    // Railway config
    const railwayConfig = {
      build: {
        builder: "NIXPACKS"
      },
      deploy: {
        startCommand: "npm start",
        restartPolicyType: "ON_FAILURE",
        restartPolicyMaxRetries: 10
      }
    };

    // Render config
    const renderConfig = {
      services: [
        {
          type: "web",
          name: "finplanner-ai",
          env: "node",
          buildCommand: "npm install && npm run build",
          startCommand: "npm start",
          envVars: this.report.cloudReadiness.environmentVariables.requiredVars.map(v => ({
            key: v,
            sync: false
          }))
        }
      ]
    };

    // Docker config
    const dockerfile = `FROM node:${nodeVersion}-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
`;

    this.report.cloudReadiness.deploymentConfigs = {
      vercel: vercelConfig,
      netlify: netlifyConfig,
      railway: railwayConfig,
      render: renderConfig,
      dockerfile: dockerfile
    };
  }

  generateMigrationGuide() {
    console.log('\n📋 GENERATING MIGRATION GUIDE...');
    
    const guide = `# ☁️ FinPlanner AI - Cloud Migration Guide

## 🎯 Recommended Cloud Providers (Ranked by Ease)

### 1. **Vercel** (Easiest - Next.js Optimized)
- ✅ **Best for:** Next.js apps (zero config)
- ✅ **Database:** Use Vercel Postgres or external
- ✅ **Deployment:** Git-based, automatic
- ⚠️ **Limitations:** Function timeout limits

### 2. **Railway** (Good Balance)
- ✅ **Best for:** Full-stack apps with database
- ✅ **Database:** Built-in PostgreSQL
- ✅ **Deployment:** Git-based, Docker support
- ⚠️ **Cost:** Pay-per-usage

### 3. **Render** (Good Alternative)
- ✅ **Best for:** Full-stack apps
- ✅ **Database:** Built-in PostgreSQL
- ✅ **Deployment:** Git-based
- ⚠️ **Performance:** Slower cold starts

### 4. **Netlify** (Frontend Focus)
- ✅ **Best for:** Static sites with functions
- ⚠️ **Database:** Need external service
- ⚠️ **Limitations:** Function limitations for complex apps

## 🚀 Step-by-Step Migration

### Phase 1: Prepare Your App
\`\`\`bash
# 1. Ensure all dependencies are in package.json
npm install

# 2. Test build locally
npm run build

# 3. Test production mode
npm start

# 4. Run database migrations
npx prisma migrate deploy
\`\`\`

### Phase 2: Environment Variables Setup
Required variables for cloud deployment:
${this.report.cloudReadiness.environmentVariables.requiredVars.map(v => `- ${v}`).join('\n')}

### Phase 3: Database Setup
- **Provider:** ${this.report.cloudReadiness.database.provider}
- **Migrations:** ${this.report.cloudReadiness.database.migrationCount} migrations to apply
- **Models:** ${this.report.cloudReadiness.database.models} database models

### Phase 4: Deploy
Choose your preferred provider and follow their specific guide below.

## 📁 Generated Config Files
- \`vercel.json\` - Vercel configuration
- \`netlify.toml\` - Netlify configuration  
- \`railway.json\` - Railway configuration
- \`render.yaml\` - Render configuration
- \`Dockerfile\` - Docker configuration

## ⚠️ Common Issues & Solutions

### Build Failures
- Ensure all build dependencies are in \`dependencies\` not \`devDependencies\`
- Add Prisma generate to build process
- Check Node.js version compatibility

### Database Connection Issues
- Use connection pooling for production
- Set proper DATABASE_URL format
- Run migrations in deployment pipeline

### Environment Variables
- Never commit secrets to git
- Use platform-specific secret management
- Test all required variables are set

---
**Generated:** ${new Date().toISOString()}
`;

    fs.writeFileSync('CLOUD_MIGRATION_GUIDE.md', guide);
  }

  writeConfigFiles() {
    console.log('\n📝 WRITING CONFIG FILES...');
    
    const configs = this.report.cloudReadiness.deploymentConfigs;
    
    // Write config files
    fs.writeFileSync('vercel.json', JSON.stringify(configs.vercel, null, 2));
    fs.writeFileSync('netlify.toml', configs.netlify);
    fs.writeFileSync('railway.json', JSON.stringify(configs.railway, null, 2));
    fs.writeFileSync('render.yaml', JSON.stringify(configs.render, null, 2));
    fs.writeFileSync('Dockerfile', configs.dockerfile);
    
    // Write environment template
    const envTemplate = this.report.cloudReadiness.environmentVariables.requiredVars
      .map(v => `${v}=your_value_here`)
      .join('\n');
    fs.writeFileSync('.env.production.template', envTemplate);
  }

  async generateReport() {
    console.log('☁️ FINPLANNER AI - CLOUD MIGRATION ANALYZER');
    console.log('===========================================');
    
    this.analyzeCloudRequirements();
    this.analyzeEnvironmentVariables();
    this.analyzeDatabaseRequirements();
    this.analyzeStaticAssets();
    this.analyzeBuildRequirements();
    this.generateCloudProviderConfigs();
    this.generateMigrationGuide();
    this.writeConfigFiles();

    // Write complete report
    const reportFile = `cloud_migration_report_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(this.report, null, 2));

    console.log('\n✅ CLOUD MIGRATION ANALYSIS COMPLETE!');
    console.log('📄 Files generated:');
    console.log('  - cloud_migration_report_*.json (detailed analysis)');
    console.log('  - CLOUD_MIGRATION_GUIDE.md (step-by-step guide)');
    console.log('  - vercel.json (Vercel config)');
    console.log('  - netlify.toml (Netlify config)');
    console.log('  - railway.json (Railway config)');
    console.log('  - render.yaml (Render config)');
    console.log('  - Dockerfile (Docker config)');
    console.log('  - .env.production.template (Environment variables)');
    
    console.log('\n🎯 RECOMMENDATION:');
    console.log('  For FinPlanner AI, I recommend VERCEL or RAILWAY');
    console.log('  - Vercel: Easiest for Next.js + external database');
    console.log('  - Railway: Best for full-stack with built-in database');
    
    return this.report;
  }
}

// Run the analyzer
const analyzer = new CloudMigrationAnalyzer();
analyzer.generateReport().then(() => {
  console.log('\n🚀 Ready for cloud deployment!');
}).catch(error => {
  console.error('❌ Error during analysis:', error);
});
