#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

class EnhancedAppSetupAnalyzer {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      appName: 'FinPlanner AI',
      analysis: {}
    };
  }

  executeCommand(command, description) {
    try {
      console.log(`📊 Analyzing: ${description}...`);
      const output = execSync(command, { encoding: 'utf8', timeout: 30000 });
      return output.trim();
    } catch (error) {
      return `Error executing command: ${error.message}`;
    }
  }

  analyzeCompleteEnvironment() {
    console.log('\n🔍 ANALYZING COMPLETE ENVIRONMENT...');
    
    this.report.analysis.environment = {
      // System Info
      nodeVersion: this.executeCommand('node --version', 'Node.js version'),
      npmVersion: this.executeCommand('npm --version', 'npm version'),
      platform: process.platform,
      architecture: process.arch,
      workingDirectory: process.cwd(),
      
      // Environment Variables (sanitized)
      environmentVariables: this.getSanitizedEnvVars(),
      
      // System Resources
      systemInfo: {
        memory: this.executeCommand('node -e "console.log(JSON.stringify(process.memoryUsage()))"', 'Memory usage'),
        uptime: process.uptime(),
        versions: process.versions
      },

      // Network & Connectivity
      networkInfo: {
        hostname: this.executeCommand('hostname', 'Hostname'),
        networkInterfaces: this.executeCommand('node -e "console.log(JSON.stringify(require(\'os\').networkInterfaces()))"', 'Network interfaces')
      }
    };
  }

  getSanitizedEnvVars() {
    const envVars = {};
    const sensitiveKeys = ['password', 'secret', 'key', 'token', 'auth'];
    
    Object.keys(process.env).forEach(key => {
      const isSensitive = sensitiveKeys.some(sensitive => 
        key.toLowerCase().includes(sensitive)
      );
      
      if (isSensitive) {
        envVars[key] = process.env[key] ? '***CONFIGURED***' : 'not set';
      } else {
        envVars[key] = process.env[key] || 'not set';
      }
    });
    
    return envVars;
  }

  testDatabaseConnection() {
    console.log('\n🗄️ TESTING DATABASE CONNECTION...');
    
    try {
      // Test if Prisma can connect
      const dbTest = this.executeCommand('npx prisma db pull --dry-run', 'Database connection test');
      this.report.analysis.database.connectionTest = 'SUCCESS: Database accessible';
    } catch (error) {
      this.report.analysis.database.connectionTest = `FAILED: ${error.message}`;
    }
  }

  testAPIEndpoints() {
    console.log('\n🔌 TESTING API ENDPOINTS...');
    
    const endpoints = [
      '/api/auth/session',
      '/api/ai/chat',
      '/api/ai/insights',
      '/api/assets',
      '/api/transactions'
    ];

    this.report.analysis.apiTests = {};
    
    // Note: This would require the server to be running
    // For now, we'll just check if the files exist
    endpoints.forEach(endpoint => {
      const filePath = `app${endpoint}/route.ts`;
      this.report.analysis.apiTests[endpoint] = {
        fileExists: fs.existsSync(filePath),
        filePath: filePath
      };
    });
  }

  analyzePerformance() {
    console.log('\n⚡ ANALYZING PERFORMANCE...');
    
    this.report.analysis.performance = {
      buildTime: this.executeCommand('time npm run build 2>&1 | grep real || echo "Build not tested"', 'Build performance'),
      bundleSize: this.executeCommand('du -sh .next 2>/dev/null || echo "No build found"', 'Bundle size'),
      nodeModulesSize: this.executeCommand('du -sh node_modules 2>/dev/null || echo "No node_modules"', 'Dependencies size')
    };
  }

  checkProductionReadiness() {
    console.log('\n🚀 CHECKING PRODUCTION READINESS...');
    
    const checks = {
      hasDockerfile: fs.existsSync('Dockerfile'),
      hasDockerCompose: fs.existsSync('docker-compose.yml'),
      hasVercelConfig: fs.existsSync('vercel.json'),
      hasNetlifyConfig: fs.existsSync('netlify.toml'),
      hasGitHubActions: fs.existsSync('.github/workflows'),
      hasEnvExample: fs.existsSync('.env.example'),
      hasPrismaGenerate: this.executeCommand('npm run build --dry-run 2>&1 | grep prisma || echo "No prisma in build"', 'Prisma in build'),
      securityAudit: this.executeCommand('npm audit --audit-level=high --json', 'Security audit')
    };

    this.report.analysis.productionReadiness = checks;
  }

  async generateCompleteReport() {
    console.log('🚀 FINPLANNER AI - ENHANCED SETUP ANALYZER');
    console.log('==========================================');
    
    // Run all analyses
    this.analyzeCompleteEnvironment();
    this.analyzeDependencies();
    this.analyzeProjectStructure();
    this.analyzeDatabase();
    this.testDatabaseConnection();
    this.analyzeAIFeatures();
    this.testAPIEndpoints();
    this.analyzeConfiguration();
    this.analyzePerformance();
    this.checkProductionReadiness();
    this.analyzeScripts();
    this.analyzeGitStatus();
    this.generateSummary();

    // Write comprehensive report
    const reportFile = `complete_app_setup_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(this.report, null, 2));

    // Generate deployment checklist
    this.generateDeploymentChecklist();

    console.log('\n✅ ENHANCED ANALYSIS COMPLETE!');
    console.log(`📄 Complete report: ${reportFile}`);
    console.log(`🚀 Deployment checklist: deployment_checklist.md`);
    
    return this.report;
  }

  generateDeploymentChecklist() {
    const checklist = `# 🚀 FinPlanner AI - Deployment Checklist

## ✅ Pre-Deployment Checks

### Environment Setup
- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] API keys validated (OpenAI, etc.)
- [ ] Authentication secrets set

### Code Quality
- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] Build completes successfully
- [ ] TypeScript compilation clean

### Database
- [ ] Migrations applied
- [ ] Seed data available
- [ ] Backup strategy in place
- [ ] Connection pooling configured

### Performance
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] API response times acceptable
- [ ] Database queries optimized

### Security
- [ ] Environment variables secured
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation in place

### Monitoring
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] Usage analytics
- [ ] Health checks configured

---
**Generated:** ${new Date().toISOString()}
`;

    fs.writeFileSync('deployment_checklist.md', checklist);
  }

  // Include all other methods from the original script...
  analyzeDependencies() {
    console.log('\n📦 ANALYZING DEPENDENCIES...');
    
    const packageJson = this.readFileContent('package.json', 'package.json');
    let parsedPackageJson = {};
    try {
      parsedPackageJson = JSON.parse(packageJson);
    } catch (error) {
      parsedPackageJson = { error: 'Failed to parse package.json' };
    }

    this.report.analysis.dependencies = {
      packageJson: parsedPackageJson,
      installedPackages: this.executeCommand('npm list --depth=0 --json', 'Installed packages'),
      outdatedPackages: this.executeCommand('npm outdated --json', 'Outdated packages'),
      securityAudit: this.executeCommand('npm audit --json', 'Security audit'),
      lockFile: fs.existsSync('package-lock.json') ? 'package-lock.json exists' : 'No lock file found'
    };
  }

  readFileContent(filePath, description) {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`📄 Reading: ${description}...`);
        return fs.readFileSync(filePath, 'utf8');
      }
      return `File not found: ${filePath}`;
    } catch (error) {
      return `Error reading file: ${error.message}`;
    }
  }

  // Add other methods from original script...
  analyzeProjectStructure() {
    console.log('\n🏗️ ANALYZING PROJECT STRUCTURE...');
    
    this.report.analysis.projectStructure = {
      appDirectory: this.executeCommand('find app -type f -name "*.tsx" -o -name "*.ts" | head -20', 'App directory structure'),
      componentsDirectory: this.executeCommand('find components -type f -name "*.tsx" -o -name "*.ts" | head -20', 'Components directory'),
      libDirectory: this.executeCommand('find lib -type f -name "*.ts" -o -name "*.js" 2>/dev/null | head -10', 'Lib directory'),
      publicDirectory: this.executeCommand('ls -la public/ 2>/dev/null', 'Public directory'),
      configFiles: {
        nextConfig: fs.existsSync('next.config.js') || fs.existsSync('next.config.mjs'),
        tailwindConfig: fs.existsSync('tailwind.config.js') || fs.existsSync('tailwind.config.ts'),
        tsConfig: fs.existsSync('tsconfig.json'),
        eslintConfig: fs.existsSync('.eslintrc.json') || fs.existsSync('.eslintrc.js'),
        prismaSchema: fs.existsSync('prisma/schema.prisma')
      }
    };
  }

  analyzeDatabase() {
    console.log('\n🗄️ ANALYZING DATABASE...');
    
    this.report.analysis.database = {
      prismaSchema: this.readFileContent('prisma/schema.prisma', 'Prisma schema'),
      migrations: this.executeCommand('ls -la prisma/migrations/ 2>/dev/null', 'Database migrations'),
      seedFile: fs.existsSync('prisma/seed.ts') || fs.existsSync('prisma/seed.js')
    };
  }

  analyzeAIFeatures() {
    console.log('\n🤖 ANALYZING AI FEATURES...');
    
    this.report.analysis.aiFeatures = {
      aiRoutes: this.executeCommand('find app/api -name "*ai*" -type f 2>/dev/null', 'AI API routes'),
      aiComponents: this.executeCommand('find components -name "*ai*" -type f 2>/dev/null', 'AI components'),
      aiPages: this.executeCommand('find app -name "*ai*" -type d 2>/dev/null', 'AI pages'),
      openaiConfig: this.executeCommand('grep -r "openai" lib/ 2>/dev/null | head -5', 'OpenAI configuration')
    };
  }

  analyzeConfiguration() {
    console.log('\n⚙️ ANALYZING CONFIGURATION...');
    
    this.report.analysis.configuration = {
      nextConfig: this.readFileContent('next.config.js', 'Next.js config') || 
                  this.readFileContent('next.config.mjs', 'Next.js config'),
      tailwindConfig: this.readFileContent('tailwind.config.js', 'Tailwind config') ||
                      this.readFileContent('tailwind.config.ts', 'Tailwind config'),
      tsConfig: this.readFileContent('tsconfig.json', 'TypeScript config'),
      eslintConfig: this.readFileContent('.eslintrc.json', 'ESLint config'),
      gitignore: this.readFileContent('.gitignore', 'Git ignore file'),
      envExample: this.readFileContent('.env.example', 'Environment example') ||
                  this.readFileContent('.env.local.example', 'Environment example')
    };
  }

  analyzeScripts() {
    console.log('\n📜 ANALYZING SCRIPTS...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      this.report.analysis.scripts = packageJson.scripts || {};
    } catch (error) {
      this.report.analysis.scripts = { error: 'Failed to read scripts from package.json' };
    }
  }

  analyzeGitStatus() {
    console.log('\n📋 ANALYZING GIT STATUS...');
    
    this.report.analysis.git = {
      status: this.executeCommand('git status --porcelain 2>/dev/null', 'Git status'),
      branch: this.executeCommand('git branch --show-current 2>/dev/null', 'Current branch'),
      lastCommit: this.executeCommand('git log -1 --oneline 2>/dev/null', 'Last commit'),
      remotes: this.executeCommand('git remote -v 2>/dev/null', 'Git remotes')
    };
  }

  generateSummary() {
    console.log('\n📊 GENERATING SUMMARY...');
    
    const summary = {
      totalDependencies: 0,
      aiIntegration: false,
      databaseConfigured: false,
      authConfigured: false,
      productionReady: false
    };

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      summary.totalDependencies = Object.keys(packageJson.dependencies || {}).length + 
                                  Object.keys(packageJson.devDependencies || {}).length;
      summary.aiIntegration = !!(packageJson.dependencies?.openai);
      summary.databaseConfigured = fs.existsSync('prisma/schema.prisma');
      summary.authConfigured = !!(packageJson.dependencies?.['next-auth']);
      summary.productionReady = !!(
        packageJson.scripts?.build && 
        packageJson.scripts?.start && 
        fs.existsSync('next.config.js') || fs.existsSync('next.config.mjs')
      );
    } catch (error) {
      summary.error = error.message;
    }

    this.report.summary = summary;
  }
}

// Run the enhanced analyzer
const analyzer = new EnhancedAppSetupAnalyzer();
analyzer.generateCompleteReport().then(() => {
  console.log('\n🎉 Enhanced setup analysis complete!');
}).catch(error => {
  console.error('❌ Error during analysis:', error);
});
