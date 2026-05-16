# Security Documentation - Skones Security Management App

This document outlines the security measures, best practices, and guidelines for the Skones Security Management App.

## Table of Contents

1. [Security Overview](#security-overview)
2. [Encryption](#encryption)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Protection](#data-protection)
5. [API Security](#api-security)
6. [Secure Storage](#secure-storage)
7. [Input Validation](#input-validation)
8. [Secrets Management](#secrets-management)
9. [Incident Response](#incident-response)
10. [Security Checklist](#security-checklist)

---

## Security Overview

The Skones Security Management App implements multiple layers of security to protect sensitive guard, payroll, and location data:

- **AES-256 Encryption** for sensitive data at rest
- **HTTPS/TLS** for data in transit
- **Role-Based Access Control (RBAC)** for authorization
- **Secure token storage** using platform-specific keychains
- **Input validation & sanitization** to prevent injection attacks
- **Rate limiting** to prevent brute force attacks
- **Audit logging** for compliance and forensics

---

## Encryption

### Data Encryption at Rest

All sensitive data is encrypted using **AES-256** encryption:

**Encrypted Fields:**
- Guard personal information (name, ID, contact)
- Payroll data (amounts, bank details)
- Location coordinates (latitude, longitude)
- Incident details
- Contact information

### Encryption Key Management

**Key Generation:**
```bash
# Generate a 256-bit encryption key
openssl rand -hex 32
```

**Key Storage:**
- Store in environment variable: `ENCRYPTION_KEY`
- Never commit keys to version control
- Use different keys for dev, staging, and production
- Rotate keys periodically (annually minimum)

**Key Rotation Process:**
1. Generate new encryption key
2. Decrypt all data with old key
3. Re-encrypt with new key
4. Update ENCRYPTION_KEY environment variable
5. Verify all data is accessible
6. Archive old key securely

### Encryption Usage

```typescript
import { encryptData, decryptData } from '@/lib/encryption';

// Encrypt sensitive data
const encrypted = encryptData(sensitiveData);

// Decrypt when needed
const decrypted = decryptData(encrypted);

// Encrypt specific fields in an object
const guardData = { name: 'John', salary: 5000 };
const encrypted = encryptObjectFields(guardData, ['name', 'salary']);
```

---

## Authentication & Authorization

### User Roles

Three user roles with specific permissions:

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, user management, system settings |
| **Accounts** | Payroll management, financial reports, payment processing |
| **Operations** | Guard management, deployment tracking, incident reporting |

### Authentication Flow

1. User enters credentials (email + password)
2. Credentials validated against backend
3. JWT token issued on success
4. Token stored in secure storage
5. Token included in all API requests
6. Token validated on each request
7. Auto-logout on token expiration

### Session Management

- **Session Timeout:** 15 minutes of inactivity
- **Token Expiration:** 7 days
- **Auto-Logout:** Enabled by default
- **Secure Token Storage:** Platform keychain/keystore

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## Data Protection

### Sensitive Data Classification

**Level 1 - Highly Sensitive:**
- Passwords, API keys, encryption keys
- Bank account details
- Personal identification numbers
- Biometric data

**Level 2 - Sensitive:**
- Guard personal information
- Payroll amounts
- Location coordinates
- Incident details

**Level 3 - Internal:**
- Guard performance metrics
- Deployment schedules
- General reports

### Data Retention Policy

| Data Type | Retention Period | Deletion Method |
|-----------|-----------------|-----------------|
| User Sessions | 7 days | Automatic |
| Guard Records | 7 years | Secure wipe |
| Payroll Data | 7 years | Encrypted archive |
| Incident Reports | 5 years | Secure wipe |
| Audit Logs | 2 years | Secure wipe |
| Location Data | 90 days | Automatic deletion |

### Data Deletion

When deleting sensitive data:
```typescript
import { clearAllData, clearData } from '@/lib/secure-storage';

// Clear all data
await clearAllData();

// Clear specific data
await clearData('@skones_guard_data');
```

---

## API Security

### Request/Response Security

**HTTPS Only:**
- All API requests use HTTPS/TLS
- No unencrypted HTTP allowed
- SSL certificate validation required

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
X-Request-ID: <unique-request-id>
X-CSRF-Token: <csrf-token>
```

**Response Headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

### Rate Limiting

- **API Rate Limit:** 100 requests per 15 minutes
- **Login Rate Limit:** 5 attempts per 15 minutes
- **Password Reset Rate Limit:** 3 attempts per hour

### API Versioning

- Current version: `v1`
- Endpoint format: `/api/v1/resource`
- Version in URL for easy migration

---

## Secure Storage

### Local Storage

**AsyncStorage (Encrypted):**
- Guard data
- Payroll data
- Location data
- Incident data
- App settings

**Secure Store (Platform Keychain):**
- Authentication tokens
- API keys
- Encryption keys

### Storage Usage

```typescript
import { 
  storeEncryptedData, 
  getEncryptedData,
  storeSecureData,
  getSecureData 
} from '@/lib/secure-storage';

// Store encrypted data
await storeEncryptedData('@skones_guard_data', guardData);

// Retrieve encrypted data
const guardData = await getEncryptedData('@skones_guard_data');

// Store highly sensitive data
await storeSecureData('@skones_auth_token', token);

// Retrieve from secure store
const token = await getSecureData('@skones_auth_token');
```

---

## Input Validation

### Validation Functions

```typescript
import { 
  isValidEmail,
  isValidPhone,
  validatePasswordStrength,
  sanitizeInput,
  validateUserInput,
  hasSQLInjectionPatterns
} from '@/lib/security';

// Validate email
if (!isValidEmail(email)) {
  throw new Error('Invalid email format');
}

// Validate phone
if (!isValidPhone(phone)) {
  throw new Error('Invalid phone number');
}

// Check password strength
const { isStrong, feedback } = validatePasswordStrength(password);
if (!isStrong) {
  console.log('Password feedback:', feedback);
}

// Sanitize user input
const safe = sanitizeInput(userInput);

// Validate user input
const { isValid, errors } = validateUserInput(userInput);

// Check for SQL injection
if (hasSQLInjectionPatterns(input)) {
  throw new Error('Potentially malicious input detected');
}
```

### Common Injection Attacks Prevented

- **SQL Injection:** Parameterized queries, input validation
- **XSS (Cross-Site Scripting):** Input sanitization, output encoding
- **Command Injection:** Input validation, restricted commands
- **LDAP Injection:** Input validation, escaping

---

## Secrets Management

### Environment Variables

All sensitive configuration stored in environment variables:

```bash
# Encryption
ENCRYPTION_KEY=<256-bit-hex-key>

# Authentication
JWT_SECRET=<jwt-secret>

# Database
DATABASE_URL=postgresql://user:pass@host/db

# API
REACT_APP_API_URL=https://api.skones.local

# Third-party services
REACT_APP_GOOGLE_MAPS_API_KEY=<api-key>
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
```

### GitHub Secrets

For CI/CD pipelines, store secrets in GitHub:

1. Go to: **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add each secret:
   - `ENCRYPTION_KEY`
   - `JWT_SECRET`
   - `DATABASE_URL`
   - etc.

### Secret Rotation

- Rotate encryption keys: Annually
- Rotate JWT secrets: Quarterly
- Rotate API keys: Quarterly
- Rotate database passwords: Semi-annually

---

## Incident Response

### Security Incident Types

1. **Data Breach:** Unauthorized access to sensitive data
2. **Unauthorized Access:** Someone accessing account without permission
3. **Malware:** Malicious code in the app
4. **DDoS:** Denial of service attack
5. **Credential Compromise:** Passwords or tokens stolen

### Incident Response Steps

1. **Detect:** Monitor logs and alerts
2. **Contain:** Isolate affected systems
3. **Investigate:** Determine scope and impact
4. **Eradicate:** Remove the threat
5. **Recover:** Restore normal operations
6. **Document:** Record all actions taken
7. **Notify:** Inform affected users if necessary

### Reporting a Security Issue

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead:
1. Email: `security@skones.local`
2. Include: Description, steps to reproduce, impact
3. Allow: 48 hours for initial response
4. Follow: Responsible disclosure policy

---

## Security Checklist

### Before Deployment

- [ ] All environment variables set correctly
- [ ] Encryption keys generated and stored securely
- [ ] SSL/TLS certificates valid
- [ ] Database backups configured
- [ ] Audit logging enabled
- [ ] Rate limiting configured
- [ ] CORS settings restricted
- [ ] Security headers configured
- [ ] Input validation enabled
- [ ] Output encoding enabled
- [ ] Authentication working
- [ ] Authorization rules enforced
- [ ] Secrets not in version control
- [ ] Dependencies up to date
- [ ] Security tests passing
- [ ] Penetration testing completed

### Regular Maintenance

- [ ] Weekly: Review security logs
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Rotate secrets
- [ ] Quarterly: Security audit
- [ ] Annually: Penetration testing
- [ ] Annually: Rotate encryption keys

### Code Review Checklist

- [ ] No hardcoded secrets
- [ ] Input properly validated
- [ ] Output properly encoded
- [ ] Authentication checks present
- [ ] Authorization checks present
- [ ] Error messages don't leak info
- [ ] Sensitive data encrypted
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities
- [ ] Rate limiting applied
- [ ] Logging appropriate

---

## Security Best Practices

### For Developers

1. **Never commit secrets** - Use environment variables
2. **Validate all input** - Don't trust user data
3. **Encode output** - Prevent XSS attacks
4. **Use HTTPS** - Always encrypt in transit
5. **Encrypt sensitive data** - Use AES-256
6. **Log security events** - For audit trail
7. **Keep dependencies updated** - Patch vulnerabilities
8. **Review code** - Catch security issues early
9. **Test security** - Include security in tests
10. **Document security** - Help team understand

### For Operations

1. **Monitor logs** - Watch for suspicious activity
2. **Backup data** - Regular backups required
3. **Update systems** - Keep servers patched
4. **Rotate secrets** - Regular key rotation
5. **Audit access** - Who accessed what and when
6. **Incident response** - Have a plan
7. **Disaster recovery** - Be prepared
8. **Security training** - Keep team informed
9. **Compliance** - Follow regulations
10. **Communication** - Inform users of issues

---

## Compliance

### Standards & Regulations

- **GDPR:** General Data Protection Regulation (EU)
- **CCPA:** California Consumer Privacy Act
- **PCI DSS:** Payment Card Industry Data Security Standard
- **ISO 27001:** Information Security Management

### Audit Trail

All security-relevant events are logged:
- User login/logout
- Data access
- Data modification
- Permission changes
- Failed authentication attempts
- Security configuration changes

---

## Support & Questions

For security questions or concerns:
1. Contact: `security@skones.local`
2. Response time: 24 hours
3. Confidentiality: All reports treated confidentially

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-15 | Initial security documentation |

---

**Last Updated:** May 15, 2026

**Next Review:** August 15, 2026
