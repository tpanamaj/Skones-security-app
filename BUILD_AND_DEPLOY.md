# 🚀 Build and Deploy Guide - Skones Security Management App

## Table of Contents
1. [Building for Different Platforms](#building-for-different-platforms)
2. [Environment Configuration](#environment-configuration)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [App Store Deployment](#app-store-deployment)
6. [Deployment Monitoring](#deployment-monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Building for Different Platforms

### Web Build

```bash
# Production build for web
pnpm run build

# Output: dist/ directory with optimized assets
# Supported environments: Node.js server, Vercel, Netlify, AWS Amplify
```

**Build Output**:
- `dist/index.js` - Server entry point
- `dist/` - Static assets

**Deployment Options**:
- Node.js server
- Serverless (AWS Lambda, Vercel Functions)
- Static hosting + API proxy

### Android Build

```bash
# Generate APK for testing
eas build --platform android --profile preview

# Generate AAB for Play Store
eas build --platform android --profile production

# Local build with Android Studio
expo prebuild --clean
cd android && ./gradlew assembleRelease
```

**Requirements**:
- Android SDK 34+
- Gradle 8.x
- Java 17+

**Output**:
- `.apk` file for direct installation
- `.aab` file for Google Play Store

### iOS Build

```bash
# Generate development build
eas build --platform ios --profile preview

# Generate production build
eas build --platform ios --profile production

# Local build with Xcode
expo prebuild --clean
cd ios && xcodebuild -scheme Skones -configuration Release
```

**Requirements**:
- macOS 13.5+
- Xcode 15.1+
- iOS 14.0+

**Output**:
- `.ipa` file for iOS App Store
- `.app` for local testing

---

## Environment Configuration

### Development Environment

```bash
# .env.development
NODE_ENV=development
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3000/api
DEBUG=true
LOG_LEVEL=debug

# Database (local)
DATABASE_URL=mysql2://dev:dev@localhost:3306/skones_db

# Encryption
ENCRYPTION_KEY=dev-key-0123456789abcdef0123456789abcdef

# Features
ENABLE_MOCK_DATA=true
ENABLE_ERROR_REPORTING=false
```

### Staging Environment

```bash
# .env.staging
NODE_ENV=production
REACT_APP_ENV=staging
REACT_APP_API_URL=https://api-staging.skones.com/api
DEBUG=false
LOG_LEVEL=info

# Database (staging)
DATABASE_URL=mysql2://user:pass@staging-db.skones.com:3306/skones_staging

# Encryption
ENCRYPTION_KEY=<your-staging-key>

# Features
ENABLE_MOCK_DATA=false
ENABLE_ERROR_REPORTING=true
SENTRY_DSN=https://your-staging-sentry-dsn
```

### Production Environment

```bash
# .env.production
NODE_ENV=production
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.skones.com/api
DEBUG=false
LOG_LEVEL=warn

# Database (production)
DATABASE_URL=mysql2://user:secure-pass@prod-db.skones.com:3306/skones_prod

# Encryption (use AWS Secrets Manager)
ENCRYPTION_KEY=<stored-in-secrets-manager>

# Features
ENABLE_MOCK_DATA=false
ENABLE_ERROR_REPORTING=true
SENTRY_DSN=https://your-production-sentry-dsn

# Security
HTTPS_ONLY=true
SECURE_COOKIES=true
HSTS_ENABLED=true
```

### Setting Environment Variables

**Option 1: GitHub Secrets (for CI/CD)**
```bash
# In GitHub: Settings → Secrets and variables → Actions
ENCRYPTION_KEY=<value>
DATABASE_URL=<value>
JWT_SECRET=<value>
```

**Option 2: Environment Files**
```bash
# Create per environment
cp .env.example .env.production
# Edit with production values
```

**Option 3: Docker Environment**
```bash
# In docker run command
docker run -e ENCRYPTION_KEY=xxx -e DATABASE_URL=yyy ...
```

---

## Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build for optimized image
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install only production dependencies
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error()})"

# Expose port
EXPOSE 3000

# Start application
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql2://skones:secure-password@db:3306/skones_prod
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - skones-network

  db:
    image: mysql:8.0-alpine
    environment:
      - MYSQL_ROOT_PASSWORD=root-password
      - MYSQL_DATABASE=skones_prod
      - MYSQL_USER=skones
      - MYSQL_PASSWORD=secure-password
    volumes:
      - db-data:/var/lib/mysql
    restart: unless-stopped
    networks:
      - skones-network

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - skones-network

volumes:
  db-data:

networks:
  skones-network:
    driver: bridge
```

### Build and Push Docker Image

```bash
# Build image
docker build -t skones-security-app:latest .

# Tag for registry
docker tag skones-security-app:latest skones-registry.azurecr.io/skones-security-app:latest

# Push to registry
docker push skones-registry.azurecr.io/skones-security-app:latest

# Run locally
docker-compose up -d
```

---

## Cloud Deployment

### Vercel (Recommended for Web)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables in Vercel dashboard
# Settings → Environment Variables → Add
```

**vercel.json**:
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "env": {
    "NODE_ENV": "production",
    "DATABASE_URL": "@database_url",
    "ENCRYPTION_KEY": "@encryption_key"
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/index.js"
    }
  ]
}
```

### Heroku (Alternative)

```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create skones-security-app

# Add database
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set ENCRYPTION_KEY=xxx
heroku config:set JWT_SECRET=yyy

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### AWS (Enterprise)

#### Option 1: EC2 + RDS

```bash
# 1. Create EC2 instance (Ubuntu 22.04)
# 2. Install Node.js and pnpm
# 3. Deploy application
git clone <repo> /opt/skones-app
cd /opt/skones-app
pnpm install
pnpm run build

# 4. Setup systemd service
sudo nano /etc/systemd/system/skones-app.service
```

**skones-app.service**:
```ini
[Unit]
Description=Skones Security App
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/skones-app
ExecStart=/usr/local/bin/node /opt/skones-app/dist/index.js
Restart=on-failure
Environment="NODE_ENV=production"
Environment="DATABASE_URL=mysql2://user:pass@rds-endpoint:3306/skones"

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable skones-app
sudo systemctl start skones-app
```

#### Option 2: ECS + RDS (Container)

```bash
# 1. Push image to ECR
aws ecr create-repository --repository-name skones-app
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag skones-app:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/skones-app:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/skones-app:latest

# 2. Create RDS MySQL instance
aws rds create-db-instance \
  --db-instance-identifier skones-prod \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password <password>

# 3. Create ECS cluster and service
# (Use AWS Console or CDK)
```

---

## App Store Deployment

### Google Play Store

```bash
# 1. Create Google Play Developer Account ($25)
# 2. Generate signing key
keytool -genkey -v -keystore skones-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias skones-key

# 3. Build signed APK
eas build --platform android --profile production

# 4. Upload to Play Store
# Console: https://play.google.com/console
# - Create app
# - Upload AAB (build artifact)
# - Fill app details
# - Submit for review
```

### Apple App Store

```bash
# 1. Create Apple Developer Account ($99/year)
# 2. Generate certificates in Apple Developer Portal
# 3. Create App ID and provisioning profile
# 4. Build production IPA
eas build --platform ios --profile production

# 5. Upload to App Store Connect
# - Open Xcode
# - Window → Organizer
# - Select build
# - Validate App
# - Upload to App Store
# - Complete TestFlight review
# - Submit for App Store review
```

---

## Deployment Monitoring

### Application Monitoring

```typescript
// server/_core/index.ts - Add monitoring
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Health Checks

```bash
# Health endpoint
GET /health
# Response: { status: "ok", timestamp: "...", uptime: 1234 }

# Database health
GET /health/db
# Response: { db: "connected", latency: "10ms" }

# API health
GET /health/api
# Response: { api: "operational", version: "1.0.0" }
```

### Metrics & Logging

```bash
# View logs (Vercel)
vercel logs --tail

# View logs (Heroku)
heroku logs --tail

# View logs (AWS CloudWatch)
aws logs tail /aws/ecs/skones-app --follow
```

### Uptime Monitoring

```bash
# Setup UptimeRobot (free service)
# Monitor: https://api.skones.com/health
# Alert to: ops@skones.local
```

---

## Rollback Procedures

### Web (Vercel)

```bash
# View deployment history
vercel deployments

# Rollback to previous version
vercel rollback <deployment-id>
```

### Docker

```bash
# Keep previous version running
docker tag skones:new skones:v1.0.0
docker tag skones:old skones:latest

# Restart with previous version
docker-compose restart app
```

### Database

```bash
# Backup before deployment
mysqldump -u user -p skones_prod > backup_$(date +%Y%m%d).sql

# Rollback if needed
mysql -u user -p skones_prod < backup_20260516.sql
```

---

## Troubleshooting

### Build Errors

**Issue**: `ERR! 404 npm ERR! 404 not found`
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Issue**: `TypeScript compilation error`
```bash
# Solution: Type check before build
pnpm run check
# Fix errors shown
pnpm run build
```

### Deployment Errors

**Issue**: `Database connection timeout`
```bash
# Solution: Check environment variables
echo $DATABASE_URL
# Verify credentials and network access
```

**Issue**: `Out of memory during build`
```bash
# Solution: Increase heap size
NODE_OPTIONS=--max-old-space-size=4096 pnpm run build
```

### Runtime Issues

**Issue**: `Application crashes on startup`
```bash
# Solution: Check logs
npm run dev # Local testing first
# Fix issues
# Then deploy
```

**Issue**: `High memory usage`
```bash
# Solution: Identify leaks
node --inspect dist/index.js
# Connect DevTools for profiling
```

---

## Deployment Checklist

Before each deployment:

- [ ] All tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm run check`)
- [ ] Linting passes (`pnpm exec expo lint`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] Environment variables configured
- [ ] Database migrations ready (`pnpm db:push`)
- [ ] Backup created
- [ ] Monitoring alerts active
- [ ] Rollback plan prepared
- [ ] Team notified of deployment

---

## Quick Deploy Commands

```bash
# Development
pnpm dev

# Build for production
pnpm run build

# Deploy to Vercel
vercel --prod

# Deploy Docker to registry
docker build -t skones:latest .
docker push skones-registry.azurecr.io/skones:latest

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Check deployment status
curl https://api.skones.com/health
```

---

**Version**: 1.0.0  
**Last Updated**: May 16, 2026  
**Status**: Ready for Deployment ✅
