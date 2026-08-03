# 🚀 Skones Security App - Deployment Guide

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] API keys secured in vault
- [ ] Backups configured
- [ ] Monitoring setup complete

---

## Development Environment Setup

### Prerequisites
```bash
Node.js >= 16.x
npm or pnpm >= 7.x
MySQL >= 8.0
Expo CLI >= 5.x
```

### Installation

1. **Clone and Setup**
```bash
git clone https://github.com/tpanamaj/Skones-security-app.git
cd Skones-security-app
pnpm install
```

2. **Environment Configuration**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Database Setup**
```bash
pnpm db:generate
pnpm db:push
pnpm db:seed  # (optional) Load sample data
```

4. **Start Development Server**
```bash
# Backend
pnpm dev:server

# Mobile app
pnpm dev:mobile
```

---

## Staging Deployment

### 1. Backend Deployment (Node.js + Express)

**Using Docker:**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --prod
COPY . .
EXPOSE 3000
CMD ["pnpm", "start"]
```

**Deploy Command:**
```bash
docker build -t skones-backend:latest .
docker run -d \
  --name skones-backend \
  -p 3000:3000 \
  -e NODE_ENV=staging \
  -e DATABASE_URL=$DATABASE_URL \
  skones-backend:latest
```

### 2. Database Migration

```bash
# Connect to staging database
DATABASE_URL=mysql://user:pass@staging-db:3306/skones_staging

# Run migrations
pnpm db:push --env staging
```

### 3. Mobile App (Expo)

```bash
# Build EAS
eas build --platform ios --profile staging
eas build --platform android --profile staging

# Submit to TestFlight/Google Play (internal testing)
eas submit --platform ios --profile staging
eas submit --platform android --profile staging
```

---

## Production Deployment

### 1. Backend Infrastructure

**Using AWS ECS:**
```bash
# Create task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster skones-prod \
  --service-name skones-backend \
  --task-definition skones-backend:1 \
  --desired-count 3
```

**Using Heroku:**
```bash
heroku create skones-api-prod
heroku addons:create cleardb:premium
heroku config:set NODE_ENV=production
git push heroku main
```

### 2. Database

**MySQL Setup (AWS RDS):**
```bash
aws rds create-db-instance \
  --db-instance-identifier skones-prod \
  --db-instance-class db.t3.medium \
  --engine mysql \
  --master-username admin \
  --allocated-storage 100
```

**Backup Configuration:**
```bash
# Enable automated backups (35 days)
aws rds modify-db-instance \
  --db-instance-identifier skones-prod \
  --backup-retention-period 35 \
  --backup-window "03:00-04:00" \
  --apply-immediately
```

### 3. SSL/TLS Certificates

**Using Let's Encrypt + Certbot:**
```bash
certbot certonly --standalone \
  -d api.skones-security.com \
  -d app.skones-security.com

# Configure in nginx
nginx -s reload
```

### 4. API Gateway & Load Balancing

**Nginx Configuration:**
```nginx
upstream skones_backend {
  least_conn;
  server backend-1:3000;
  server backend-2:3000;
  server backend-3:3000;
}

server {
  listen 443 ssl http2;
  server_name api.skones-security.com;

  ssl_certificate /etc/letsencrypt/live/api.skones-security.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.skones-security.com/privkey.pem;

  location / {
    proxy_pass http://skones_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### 5. Mobile App Production Build

```bash
# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production

# Create app release
eas submit --platform ios --profile production
eas submit --platform android --profile production

# Publish to App Store
eas submit --platform ios --id <build-id>
```

---

## Monitoring & Logging

### Application Monitoring

**Using Sentry:**
```bash
npm install @sentry/react @sentry/trpc

# Initialize in app
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Using DataDog:**
```bash
npm install dd-trace

# Initialize
const tracer = require('dd-trace').init()
```

### Logging

**Winston Logger Configuration:**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Health Checks

```typescript
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'UP',
    timestamp: new Date(),
    database: checkDatabaseConnection(),
    externalApis: checkExternalApis(),
  };
  res.json(healthStatus);
});
```

---

## Security Hardening

### 1. CORS Configuration
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

### 2. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Input Validation
```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const validatedData = schema.parse(input);
```

### 4. Secrets Management
```bash
# Using AWS Secrets Manager
aws secretsmanager create-secret \
  --name skones/prod/db-password \
  --secret-string $(pwgen 32 1)
```

---

## Rollback Procedures

### Database Rollback
```bash
# Create backup before deployment
mysqldump -u $USER -p $DB > backup-$(date +%Y%m%d).sql

# Restore if needed
mysql -u $USER -p $DB < backup-20240803.sql
```

### Application Rollback
```bash
# Using Docker
docker stop skones-backend
docker run -d --name skones-backend skones-backend:previous-version

# Using ECS
aws ecs update-service \
  --cluster skones-prod \
  --service skones-backend \
  --task-definition skones-backend:previous-revision
```

---

## Performance Optimization

### 1. Caching Strategy
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

app.get('/api/incidents/stats', async (req, res) => {
  const cached = await redis.get('incidents:stats');
  if (cached) return res.json(JSON.parse(cached));
  
  const stats = await db.getIncidentStats();
  await redis.setex('incidents:stats', 3600, JSON.stringify(stats));
  res.json(stats);
});
```

### 2. Database Optimization
```sql
-- Add indexes
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_performance_guardId ON performance_metrics(guardId);

-- Analyze query performance
EXPLAIN SELECT * FROM incidents WHERE severity = 'critical';
```

### 3. API Response Compression
```typescript
import compression from 'compression';
app.use(compression());
```

---

## Disaster Recovery

### 1. Backup Strategy
- Daily automated database backups
- Weekly full application backups
- Monthly off-site backup replication
- RTO: 1 hour
- RPO: 15 minutes

### 2. Recovery Procedures
```bash
# Test restore from backup monthly
mysql -u $USER -p $DB < backup.sql
pnpm db:migrate --env recovery-test
pnpm test:integration
```

---

## Performance Benchmarks

### Expected Metrics
- API Response Time: < 200ms (p95)
- Database Query Time: < 50ms (p95)
- Mobile App Start Time: < 3 seconds
- Notification Delivery: < 5 seconds
- Offline Sync: < 30 seconds

---

## Support & Troubleshooting

For deployment issues, refer to logs:
```bash
# Application logs
kubectl logs -f deployment/skones-backend

# Database logs
kubectl logs -f statefulset/mysql

# Nginx logs
tail -f /var/log/nginx/error.log
```

---

## Post-Deployment Checklist

- [ ] All services running and healthy
- [ ] Database migrations successful
- [ ] SSL certificates installed
- [ ] Monitoring and logging active
- [ ] Backups configured and tested
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Team notified of deployment
