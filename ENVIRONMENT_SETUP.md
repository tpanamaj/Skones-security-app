# Environment Variables Setup Guide

This document describes all environment variables required for the Skones Security Management App.

## Quick Start

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in the required values in `.env.local`

3. **IMPORTANT**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Environment Variables

### Encryption & Security

**ENCRYPTION_KEY** (Required)
- A 256-bit encryption key for AES-256 encryption
- Generate with: `openssl rand -hex 32`
- Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- Used for encrypting sensitive data like guard info, payroll, locations

**REACT_APP_ENCRYPTION_KEY** (Required)
- Same as ENCRYPTION_KEY for frontend access
- Must match ENCRYPTION_KEY

### API Configuration

**REACT_APP_API_URL** (Required)
- Backend API endpoint
- Example: `https://api.skones.local/v1`
- Default: `http://localhost:3000`

**REACT_APP_API_TIMEOUT** (Optional)
- API request timeout in milliseconds
- Default: `30000` (30 seconds)

### Authentication

**JWT_SECRET** (Required for Production)
- Secret key for JWT token signing
- Generate with: `openssl rand -base64 32`
- Minimum 32 characters

**JWT_EXPIRY** (Optional)
- JWT token expiration time
- Default: `7d` (7 days)
- Format: `<number><unit>` where unit is s, m, h, d

### Database

**DATABASE_URL** (Required for Server)
- PostgreSQL connection string
- Format: `postgresql://user:password@host:port/database`
- Example: `postgresql://skones:secure_password@localhost:5432/skones_db`

**DATABASE_SSL** (Optional)
- Enable SSL for database connection
- Default: `false`
- Set to `true` in production

### Location Services

**REACT_APP_GOOGLE_MAPS_API_KEY** (Required for Geo-Tracking)
- Google Maps API key for location display
- Get from: https://console.cloud.google.com/

### File Storage

**REACT_APP_STORAGE_BUCKET** (Optional)
- S3 bucket name for file uploads
- Example: `skones-security-bucket`

**REACT_APP_STORAGE_REGION** (Optional)
- AWS region for S3 bucket
- Example: `us-east-1`

**AWS_ACCESS_KEY_ID** (Optional)
- AWS access key for S3 authentication

**AWS_SECRET_ACCESS_KEY** (Optional)
- AWS secret key for S3 authentication

### Notifications

**REACT_APP_FCM_SENDER_ID** (Optional)
- Firebase Cloud Messaging sender ID

**REACT_APP_FCM_API_KEY** (Optional)
- Firebase Cloud Messaging API key

### Logging & Monitoring

**REACT_APP_SENTRY_DSN** (Optional)
- Sentry error tracking DSN
- Get from: https://sentry.io/

**REACT_APP_LOG_LEVEL** (Optional)
- Logging level: debug, info, warn, error
- Default: `info`

### App Configuration

**NODE_ENV** (Required)
- Environment: `development`, `staging`, `production`
- Default: `development`

**REACT_APP_ENVIRONMENT** (Required)
- Frontend environment: `development`, `staging`, `production`
- Should match NODE_ENV

**REACT_APP_VERSION** (Optional)
- App version
- Default: `1.0.0`

### Feature Flags

**REACT_APP_ENABLE_GEO_TRACKING** (Optional)
- Enable/disable geo-tracking feature
- Default: `true`

**REACT_APP_ENABLE_INCIDENT_REPORTING** (Optional)
- Enable/disable incident reporting
- Default: `true`

**REACT_APP_ENABLE_PAYROLL_PROCESSING** (Optional)
- Enable/disable payroll processing
- Default: `true`

**REACT_APP_ENABLE_RADIO_COMMUNICATION** (Optional)
- Enable/disable radio communication
- Default: `true`

### Security Headers

**REACT_APP_CORS_ORIGIN** (Optional)
- CORS allowed origin
- Example: `https://skones.local`

**REACT_APP_CORS_CREDENTIALS** (Optional)
- Allow credentials in CORS
- Default: `true`

### Rate Limiting

**REACT_APP_RATE_LIMIT_WINDOW_MS** (Optional)
- Rate limit window in milliseconds
- Default: `900000` (15 minutes)

**REACT_APP_RATE_LIMIT_MAX_REQUESTS** (Optional)
- Maximum requests per window
- Default: `100`

### Session Configuration

**REACT_APP_SESSION_TIMEOUT** (Optional)
- Session timeout in milliseconds
- Default: `900000` (15 minutes)

**REACT_APP_AUTO_LOGOUT** (Optional)
- Auto-logout on inactivity
- Default: `true`

## Environment-Specific Setup

### Development

```bash
NODE_ENV=development
REACT_APP_ENVIRONMENT=development
REACT_APP_API_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/skones_dev
ENCRYPTION_KEY=dev-key-change-in-production
```

### Staging

```bash
NODE_ENV=staging
REACT_APP_ENVIRONMENT=staging
REACT_APP_API_URL=https://api-staging.skones.local
DATABASE_URL=postgresql://user:password@staging-db:5432/skones_staging
DATABASE_SSL=true
ENCRYPTION_KEY=<strong-staging-key>
```

### Production

```bash
NODE_ENV=production
REACT_APP_ENVIRONMENT=production
REACT_APP_API_URL=https://api.skones.local
DATABASE_URL=postgresql://user:password@prod-db:5432/skones_prod
DATABASE_SSL=true
ENCRYPTION_KEY=<strong-production-key>
JWT_SECRET=<strong-jwt-secret>
REACT_APP_SENTRY_DSN=<sentry-dsn>
```

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong keys** - Generate with `openssl rand -hex 32`
3. **Rotate keys regularly** - Especially in production
4. **Use different keys per environment** - Dev, staging, and production should have different keys
5. **Limit access** - Only share `.env` files with authorized team members
6. **Use CI/CD secrets** - Store sensitive values in GitHub Secrets, not in code
7. **Audit access** - Log who accesses sensitive environment variables
8. **Use SSL/TLS** - Always use HTTPS in production

## Generating Secure Keys

### Encryption Key (256-bit)
```bash
openssl rand -hex 32
```

### JWT Secret
```bash
openssl rand -base64 32
```

### Random Password
```bash
openssl rand -base64 24
```

## Validation

The app will validate required environment variables on startup. If any required variables are missing, the app will log warnings and may fail to start.

To check if all variables are set:
```bash
npm run check-env
```

## Troubleshooting

### "ENCRYPTION_KEY not set" warning
- Set ENCRYPTION_KEY in `.env.local`
- App will use a default key for development (not secure)

### "Cannot decrypt data" error
- Ensure ENCRYPTION_KEY matches the key used to encrypt the data
- If you changed the key, you'll need to re-encrypt all data

### "API connection failed"
- Check REACT_APP_API_URL is correct
- Verify backend server is running
- Check network connectivity

### "Database connection error"
- Verify DATABASE_URL format
- Check database server is running
- Verify credentials are correct
- If using SSL, ensure DATABASE_SSL=true

## Support

For issues with environment setup, contact the development team or check the main README.md.
