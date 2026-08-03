# Skones Security App - API Testing Suite

## Test Structure
```
tests/
├── unit/
│   ├── services/
│   │   ├── BiometricAuthService.test.ts
│   │   ├── CommunicationService.test.ts
│   │   ├── ExternalAPIService.test.ts
│   │   └── OfflineSyncManager.test.ts
│   └── utils/
│       └── validation.test.ts
├── integration/
│   ├── api/
│   │   ├── incidents.test.ts
│   │   ├── performance.test.ts
│   │   ├── payroll.test.ts
│   │   ├── shifts.test.ts
│   │   └── notifications.test.ts
│   └── workflows/
│       ├── payroll-workflow.test.ts
│       └── incident-workflow.test.ts
└── e2e/
    ├── mobile/
    │   ├── incident-dashboard.e2e.ts
    │   └── payroll-processing.e2e.ts
    └── api/
        └── full-stack.e2e.ts
```

## Running Tests

### Unit Tests
```bash
pnpm test:unit
```

### Integration Tests
```bash
pnpm test:integration
```

### E2E Tests
```bash
pnpm test:e2e
```

### Coverage Report
```bash
pnpm test:coverage
```

---

## Test Scenarios

### 1. Incidents API

**POST /api/incidents/create**
```typescript
describe('Incidents API', () => {
  it('should create an incident with valid data', async () => {
    const incident = {
      title: 'Unauthorized Access',
      description: 'Breach attempt at Zone A',
      severity: 'critical',
      location: 'Zone A - Building 1',
      reportedBy: 'Guard123'
    };

    const response = await trpc.incidents.create.mutate(incident);
    expect(response).toHaveProperty('id');
    expect(response.severity).toBe('critical');
    expect(response.status).toBe('open');
  });

  it('should reject invalid severity level', async () => {
    const incident = {
      title: 'Test',
      description: 'Test',
      severity: 'invalid',
      location: 'Test',
      reportedBy: 'Guard123'
    };

    await expect(trpc.incidents.create.mutate(incident))
      .rejects.toThrow('Invalid severity');
  });
});
```

### 2. Payroll API

**POST /api/payroll/process**
```typescript
describe('Payroll Processing', () => {
  it('should process payroll batch successfully', async () => {
    const cycleId = 'CYCLE-202408';
    
    const response = await trpc.payroll.processBatch.mutate({ cycleId });
    
    expect(response.status).toBe('paid');
    expect(response.processedCount).toBeGreaterThan(0);
    expect(response.totalAmount).toBeGreaterThan(0);
  });

  it('should calculate deductions correctly', async () => {
    const deductions = await trpc.payroll.calculateDeductions.query({
      guardId: 'GUARD-001',
      baseSalary: 2000
    });

    const expectedTax = 2000 * 0.13; // 13% tax
    expect(deductions.tax).toBeCloseTo(expectedTax, 2);
    expect(deductions.total).toBeLessThan(2000);
  });
});
```

### 3. Performance Analytics API

**GET /api/performance/metrics**
```typescript
describe('Performance Analytics', () => {
  it('should calculate overall score correctly', async () => {
    const metrics = await trpc.performance.getGuardMetrics.query({
      guardId: 'GUARD-001',
      timeRange: 'month'
    });

    const expectedScore = 
      (metrics.attendance * 0.25) +
      (metrics.conduct * 0.25) +
      (metrics.training * 0.2) +
      (metrics.punctuality * 0.2) +
      (metrics.efficiency * 0.1);

    expect(metrics.overallScore).toBeCloseTo(expectedScore, 0);
  });

  it('should return correct leaderboard ranking', async () => {
    const leaderboard = await trpc.performance.getLeaderboard.query({
      limit: 10
    });

    expect(leaderboard).toHaveLength(10);
    expect(leaderboard[0].score).toBeGreaterThanOrEqual(leaderboard[1].score);
  });
});
```

### 4. Shift Scheduling API

**POST /api/shifts/create**
```typescript
describe('Shift Scheduling', () => {
  it('should create shift without conflicts', async () => {
    const shift = {
      guardId: 'GUARD-001',
      postId: 'POST-A1',
      startDate: new Date('2024-08-05 08:00'),
      endDate: new Date('2024-08-05 16:00'),
      type: 'day'
    };

    const response = await trpc.shifts.createShift.mutate(shift);
    expect(response).toHaveProperty('id');
    expect(response.status).toBe('scheduled');
  });

  it('should prevent overlapping shifts', async () => {
    const conflictingShift = {
      guardId: 'GUARD-001',
      postId: 'POST-A2',
      startDate: new Date('2024-08-05 15:00'),
      endDate: new Date('2024-08-05 23:00'),
      type: 'night'
    };

    await expect(trpc.shifts.createShift.mutate(conflictingShift))
      .rejects.toThrow('Shift conflict detected');
  });
});
```

### 5. Notifications API

**POST /api/notifications/send**
```typescript
describe('Notifications', () => {
  it('should send local notification', async () => {
    const { sendLocalNotification } = useNotifications();
    
    await sendLocalNotification({
      type: 'incident',
      title: 'Critical Alert',
      body: 'Security breach detected',
      priority: 'high'
    });

    // Verify notification was queued
    expect(Notifications.getLastNotificationAsync).toBeDefined();
  });

  it('should respect notification preferences', async () => {
    await trpc.notifications.updatePreferences.mutate({
      incidents: false,
      payroll: true
    });

    const prefs = await trpc.notifications.getPreferences.query();
    expect(prefs.incidents).toBe(false);
    expect(prefs.payroll).toBe(true);
  });
});
```

### 6. Audit Trail API

**GET /api/audit/logs**
```typescript
describe('Audit Trail', () => {
  it('should log user actions', async () => {
    // Perform action
    await trpc.incidents.create.mutate(testIncident);

    // Check audit log
    const logs = await trpc.audit.getLogs.query({ filters: {} });
    
    expect(logs).toContainEqual(
      expect.objectContaining({
        action: 'create',
        module: 'incidents',
        status: 'success'
      })
    );
  });

  it('should track failed operations', async () => {
    try {
      await trpc.incidents.create.mutate(invalidIncident);
    } catch (e) {
      // Expected error
    }

    const logs = await trpc.audit.getLogs.query({ filters: {} });
    
    expect(logs).toContainEqual(
      expect.objectContaining({
        status: 'failure'
      })
    );
  });
});
```

### 7. Location Services API

**GET /api/external/weather**
```typescript
describe('Location Services', () => {
  it('should get weather at location', async () => {
    const weather = await trpc.externalApis.getWeather.query({
      latitude: 5.6037,
      longitude: -0.187
    });

    expect(weather).toHaveProperty('temperature');
    expect(weather).toHaveProperty('condition');
    expect(weather).toHaveProperty('humidity');
  });

  it('should track guard location', async () => {
    await trpc.externalApis.trackGuardLocation.mutate({
      guardId: 'GUARD-001',
      latitude: 5.6037,
      longitude: -0.187
    });

    const history = await trpc.externalApis.getGuardTrackingHistory.query({
      guardId: 'GUARD-001',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString()
    });

    expect(history).toHaveLength(1);
    expect(history[0].guardId).toBe('GUARD-001');
  });
});
```

### 8. Biometric Authentication

```typescript
describe('Biometric Auth', () => {
  it('should authenticate with biometric', async () => {
    const result = await useBiometricAuth().authenticate();
    expect(result).toBe(true);
  });

  it('should enable biometric for user', async () => {
    const { enableBiometric } = useBiometricAuth();
    const result = await enableBiometric('USER-001');
    expect(result).toBe(true);
  });
});
```

### 9. Offline Sync Manager

```typescript
describe('Offline Sync', () => {
  it('should queue actions when offline', async () => {
    const { addToQueue } = useOfflineSync();
    
    await addToQueue('create', 'incidents', {
      title: 'Test',
      description: 'Test'
    });

    expect(useOfflineSync().queueSize).toBe(1);
  });

  it('should sync when online', async () => {
    const { sync, queueSize } = useOfflineSync();
    
    // Go online
    simulateOnline();
    
    await sync();
    
    expect(queueSize).toBe(0);
  });
});
```

### 10. Report Export

```typescript
describe('Report Export', () => {
  it('should generate PDF report', async () => {
    const report = await trpc.reports.generatePayrollReport.query({
      cycleId: 'CYCLE-202408',
      format: 'pdf'
    });

    expect(report.pdf).toBeDefined();
    expect(report.pdf.length).toBeGreaterThan(0);
  });

  it('should generate Excel report', async () => {
    const report = await trpc.reports.generateIncidentReport.query({
      startDate: '2024-08-01',
      endDate: '2024-08-31',
      format: 'excel'
    });

    expect(report.excel).toBeDefined();
  });
});
```

---

## Performance Tests

```bash
# Load testing with k6
k6 run tests/performance/load-test.js

# Expected metrics:
# - Throughput: > 1000 req/s
# - P95 Response Time: < 200ms
# - Error Rate: < 0.1%
```

---

## Test Coverage Goals

- Unit Tests: 85%+
- Integration Tests: 75%+
- E2E Tests: Critical paths
- Overall Coverage: 80%+

---

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v2
```
