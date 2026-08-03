# 🔒 Skones Security Management App - Comprehensive Feature Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Feature Implementations](#feature-implementations)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Configuration](#configuration)
7. [Deployment](#deployment)

---

## Overview

Skones Security Management App is an enterprise-grade security operations platform built with React Native (mobile), tRPC (backend), and modern cloud services. It provides comprehensive incident management, payroll automation, performance tracking, and real-time location services.

### Key Statistics
- **13 Major Features**
- **50+ API Endpoints**
- **6 Backend Services**
- **Multiple External Integrations**
- **Full Offline Sync Support**

---

## Architecture

### Tech Stack
```
Frontend: React Native (Expo)
Backend: Node.js + Express
Database: MySQL with Drizzle ORM
API: tRPC with TypeScript
Authentication: JWT + Biometric
Real-time: Expo Notifications
Storage: AsyncStorage (Mobile) + MySQL (Server)
```

### System Components

```
┌─────────────────────────────────────────────────────┐
│                  Mobile App (React Native)          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  Incidents   │  │ Performance  │  │ Payroll  │  │
│  │  Dashboard   │  │  Analytics   │  │ System   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   Shifts     │  │   Audit      │  │Location  │  │
│  │ Scheduling   │  │   Tracking   │  │Services  │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
          │
          ▼ (tRPC + HTTP)
┌─────────────────────────────────────────────────────┐
│           Backend Services (Node.js)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  API Layer   │  │   Services   │  │Database  │  │
│  │  (tRPC)      │  │              │  │  (MySQL) │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│          External APIs & Services                   │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌─────┐  │
│  │OpenWeather   │  │Google│  │Twilio│  │SendGrid  │
│  └──────┘  └──────┘  └──────┘  └──────┘  └─────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Feature Implementations

### 1. Real-time Incident Dashboard
**File:** `app/incidents/dashboard.tsx`

**Features:**
- Real-time incident tracking with severity levels (critical, high, medium, low)
- Filterable by severity and status
- Response time tracking
- Location-based incident reporting
- Incident status management (open, in_progress, resolved, closed)

**API Endpoints:**
```typescript
GET  /api/incidents/list          - Get all incidents
GET  /api/incidents/stats         - Get incident statistics
POST /api/incidents/create        - Create new incident
PUT  /api/incidents/update        - Update incident status
GET  /api/incidents/:id           - Get incident details
```

**Database Tables:**
- `incidents` - Main incident records
- Columns: id, title, description, severity, status, location, reportedBy, reportedAt, assignedTo, resolvedAt, responseTime, resolution, createdBy, timestamps

**Example API Call:**
```typescript
const { data: incidents } = trpc.incidents.list.useQuery();
const createIncident = trpc.incidents.create.useMutation({
  title: "Unauthorized Access Attempt",
  description: "Attempted breach at Zone A",
  severity: "critical",
  location: "Zone A - Building 1",
  reportedBy: "Guard123"
});
```

---

### 2. Guard Performance Analytics
**File:** `app/performance/analytics.tsx`

**Features:**
- Performance metrics: Attendance, Conduct, Training, Punctuality, Efficiency
- Overall score calculation
- Leaderboard ranking
- Achievement badges
- Trend analysis (weekly, monthly, quarterly, yearly)
- Visual charts and graphs

**API Endpoints:**
```typescript
GET  /api/performance/metrics    - Get guard metrics
GET  /api/performance/leaderboard - Get performance leaderboard
GET  /api/performance/trends     - Get performance trends
PUT  /api/performance/update     - Update performance metrics
```

**Metrics Calculation:**
```
Overall Score = (Attendance × 0.25) + (Conduct × 0.25) + 
                (Training × 0.2) + (Punctuality × 0.2) + 
                (Efficiency × 0.1)
```

---

### 3. Advanced Payroll Automation
**File:** `app/payroll/processing.tsx`

**Features:**
- Payroll cycle management
- Automated deduction calculations (taxes, insurance, loans)
- Batch payment processing
- Multi-stage approval workflow
- Payment status tracking
- Net pay calculations

**API Endpoints:**
```typescript
GET  /api/payroll/cycles         - Get all payroll cycles
GET  /api/payroll/batch          - Get payroll batch for cycle
POST /api/payroll/approve        - Approve payroll cycle
POST /api/payroll/process        - Process batch payments
GET  /api/payroll/deductions     - Calculate deductions
```

**Deduction Logic:**
```typescript
Deductions = TaxAmount + InsurancePremium + LoanRepayment + OtherDeductions
NetPay = (BaseSalary + Allowances) - Deductions
```

---

### 4. Audit Trail & Compliance
**File:** `app/admin/audit-trail.tsx`

**Features:**
- Complete action logging (create, read, update, delete)
- User activity tracking
- IP address logging
- Timestamp recording
- Action success/failure status
- Compliance reporting

**API Endpoints:**
```typescript
GET  /api/audit/logs             - Get audit logs
GET  /api/audit/summary          - Get audit summary
POST /api/audit/log              - Create audit log entry
```

**Logged Actions:**
- User login/logout
- Incident creation/modification
- Payroll processing
- Guard assignment
- Report generation
- System access

---

### 5. Shift Scheduling System
**File:** `app/shifts/scheduling.tsx`

**Features:**
- Weekly shift planning
- Guard availability management
- Post coverage planning
- Shift type management (day, night, rotating)
- Conflict detection
- Schedule optimization

**API Endpoints:**
```typescript
GET  /api/shifts/schedule        - Get weekly schedule
GET  /api/shifts/available-guards - Get available guards
GET  /api/shifts/posts           - Get deployment posts
POST /api/shifts/create          - Create new shift
PUT  /api/shifts/update          - Update shift status
```

---

### 6. Push Notifications
**File:** `lib/notifications/NotificationService.ts`

**Features:**
- Real-time notifications
- Local and remote notifications
- Notification preferences
- Badge management
- Sound and vibration control

**Notification Types:**
- Incident alerts (critical/high priority)
- Payroll notifications
- Shift assignments
- Approval requests

**Example:**
```typescript
const { sendLocalNotification } = useNotifications();
await sendLocalNotification({
  type: 'incident',
  title: 'CRITICAL Incident',
  body: 'Unauthorized access detected',
  data: { incidentId: '123', severity: 'critical' },
  priority: 'high'
});
```

---

### 7. Offline Sync Manager
**File:** `lib/sync/OfflineSyncManager.ts`

**Features:**
- Automatic offline action queueing
- Background sync when online
- Retry logic with exponential backoff
- Conflict resolution
- Queue persistence

**Sync Configuration:**
```typescript
const SYNC_QUEUE_KEY = '@skones_sync_queue';
const MAX_RETRIES = 3;
const SYNC_INTERVAL = 30000; // 30 seconds
```

---

### 8. Mobile Dashboard
**File:** `app/(tabs)/dashboard.tsx`

**Features:**
- Key metrics overview
- Active incidents count
- Guards on duty display
- Performance score
- Quick action widgets
- Upcoming tasks
- Alert notifications

---

### 9. SMS/Email Notifications
**File:** `server/services/CommunicationService.ts`

**Integrations:**
- **Twilio:** SMS sending
- **SendGrid:** Email service

**API Endpoints:**
```typescript
POST /api/communication/send           - Send notification
GET  /api/communication/preferences    - Get preferences
PUT  /api/communication/preferences    - Update preferences
```

**Example Templates:**
```
Incident Alert SMS:
"INCIDENT ALERT [CRITICAL]: Unauthorized Access at Zone A - Response required immediately"

Payroll Email:
Subject: "Payroll Statement - August 2026"
Body: Detailed breakdown with net pay amount
```

---

### 10. Report Export
**File:** `server/services/ReportExportService.ts`

**Supported Formats:**
- PDF (pdfkit)
- Excel (ExcelJS)
- Both formats simultaneously

**Report Types:**
- Payroll Reports
- Incident Reports
- Performance Reports
- Compliance Reports

**API Endpoints:**
```typescript
GET  /api/reports/payroll              - Generate payroll report
GET  /api/reports/incidents            - Generate incident report
GET  /api/reports/performance          - Generate performance report
```

---

### 11. Biometric Authentication
**File:** `lib/auth/BiometricAuthService.ts`

**Features:**
- Fingerprint authentication
- Face recognition (if supported)
- Biometric status checking
- Secure token storage
- Fallback to PIN/password

**Supported Platforms:**
- iOS (Face ID, Touch ID)
- Android (Fingerprint, Face Unlock)

**Example:**
```typescript
const { authenticate, enableBiometric } = useBiometricAuth();
const success = await authenticate();
if (success) {
  // User authenticated with biometric
}
```

---

### 12. External API Integrations
**File:** `server/services/ExternalAPIService.ts`

**Integrated Services:**
1. **OpenWeather API** - Weather data and conditions
2. **Google Maps API** - Geolocation, routing, distance matrix
3. **Twilio API** - SMS communications
4. **SendGrid API** - Email services

**API Endpoints:**
```typescript
GET  /api/external/weather             - Get weather conditions
GET  /api/external/traffic             - Get traffic data
GET  /api/external/geolocation         - Reverse geocode location
GET  /api/external/distance            - Calculate distance matrix
POST /api/external/track-location      - Track guard location
```

---

### 13. Location Services
**File:** `app/location/tracking.tsx`

**Features:**
- Real-time GPS tracking
- Guard location history
- Location-based weather display
- Nearby guards detection
- Accuracy reporting
- Location permissions handling

**API Endpoints:**
```typescript
GET  /api/location/current             - Get current location
GET  /api/location/history             - Get location history
GET  /api/location/nearby-guards       - Get guards within radius
POST /api/location/track-guard         - Record guard location
GET  /api/location/weather-at-location - Get weather at location
```

---

## API Documentation

### Authentication
All API endpoints require JWT bearer token in headers:
```
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null
}
```

### Error Responses
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

---

## Database Schema

### Core Tables

#### incidents
```sql
CREATE TABLE incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  location VARCHAR(255) NOT NULL,
  reportedBy VARCHAR(255) NOT NULL,
  reportedAt TIMESTAMP NOT NULL,
  assignedTo VARCHAR(255),
  resolvedAt TIMESTAMP,
  responseTime INT,
  resolution TEXT,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### performance_metrics
```sql
CREATE TABLE performance_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guardId VARCHAR(64) NOT NULL,
  attendance INT DEFAULT 0,
  conduct INT DEFAULT 0,
  training INT DEFAULT 0,
  punctuality INT DEFAULT 0,
  efficiency INT DEFAULT 0,
  overallScore INT DEFAULT 0,
  rank INT,
  badges TEXT,
  recordedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### payroll_cycles
```sql
CREATE TABLE payroll_cycles (
  id VARCHAR(64) PRIMARY KEY,
  period VARCHAR(50) NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  status ENUM('draft', 'submitted', 'approved', 'paid') DEFAULT 'draft',
  totalAmount DECIMAL(10, 2),
  guardCount INT,
  deductions DECIMAL(10, 2),
  taxes DECIMAL(10, 2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  userId INT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details TEXT,
  status ENUM('success', 'failure') NOT NULL,
  ipAddress VARCHAR(45)
);
```

---

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/skones_db

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h

# External APIs
WEATHER_API_KEY=your_openweather_key
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Communication Services
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@skones.com

# Notifications
EXPO_PROJECT_ID=your_expo_project_id

# Server
NODE_ENV=production
PORT=3000
CLIENT_URL=https://your-app-domain.com
```

---

## Deployment

See `DEPLOYMENT.md` for comprehensive deployment guide.

---

## Support & Contribution

For issues or contributions, please refer to the project documentation and contribution guidelines.
