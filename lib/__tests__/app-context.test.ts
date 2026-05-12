import { describe, it, expect } from 'vitest';
import { Guard, DeploymentPost, Incident, PayrollEntry, MeritScore } from '../types';

describe('App Data Context', () => {
  describe('Guard Data Model', () => {
    it('should validate guard structure', () => {
      const guard: Guard = {
        id: 'guard-1',
        name: 'John Doe',
        idNumber: 'SK001',
        email: 'john@skones.com',
        phone: '+233501234567',
        dateOfHire: '2023-01-15',
        status: 'on_duty',
        currentDeploymentPostId: 'post-1',
        meritScore: 85,
        lastCheckIn: '2026-05-12T10:30:00Z',
        certifications: ['Security Level 1', 'First Aid'],
      };

      expect(guard.id).toBeDefined();
      expect(guard.name).toBeTruthy();
      expect(guard.status).toMatch(/on_duty|off_duty|on_leave|sick|suspended/);
      expect(guard.meritScore).toBeGreaterThanOrEqual(0);
      expect(guard.meritScore).toBeLessThanOrEqual(100);
    });

    it('should validate guard status transitions', () => {
      const validStatuses = ['on_duty', 'off_duty', 'on_leave', 'sick', 'suspended'];
      const testGuard = { status: 'on_duty' };

      expect(validStatuses).toContain(testGuard.status);
    });
  });

  describe('Deployment Post Data Model', () => {
    it('should validate deployment post structure', () => {
      const post: DeploymentPost = {
        id: 'post-1',
        name: 'Accra Business District - Main Office',
        location: 'Accra',
        address: '123 Main Street, Accra',
        latitude: 5.6037,
        longitude: -0.187,
        status: 'active',
        shiftStart: '08:00',
        shiftEnd: '16:00',
        guardsRequired: 3,
        assignedGuards: ['guard-1', 'guard-2'],
        clientName: 'ABC Corporation',
        clientContact: 'John Smith',
        clientEmail: 'contact@abc.com',
        createdDate: '2026-01-01',
      };

      expect(post.id).toBeDefined();
      expect(post.guardsRequired).toBeGreaterThan(0);
      expect(post.assignedGuards.length).toBeLessThanOrEqual(post.guardsRequired);
      expect(post.status).toMatch(/active|inactive|on_alert|closed/);
    });

    it('should validate shift times', () => {
      const post = {
        shiftStart: '08:00',
        shiftEnd: '16:00',
      };

      const startHour = parseInt(post.shiftStart.split(':')[0]);
      const endHour = parseInt(post.shiftEnd.split(':')[0]);

      expect(startHour).toBeLessThan(endHour);
    });
  });

  describe('Incident Data Model', () => {
    it('should validate incident structure', () => {
      const incident: Incident = {
        id: 'incident-1',
        type: 'breach',
        location: 'Main Gate - Accra Business District',
        description: 'Unauthorized access attempt detected',
        severity: 'high',
        status: 'reported',
        dateTime: '2026-05-12T14:30:00Z',
        reportedBy: 'Guard Name',
        guardIds: ['guard-1', 'guard-2'],
        photos: [],
        attachments: [],
        timeline: [
          {
            status: 'reported',
            timestamp: '2026-05-12T14:30:00Z',
            updatedBy: 'Guard Name',
            notes: 'Incident reported',
          },
        ],
        resolutionNotes: undefined,
        resolvedDate: undefined,
      };

      expect(incident.id).toBeDefined();
      expect(incident.severity).toMatch(/low|medium|high|critical/);
      expect(incident.status).toMatch(/reported|investigating|resolved|closed/);
      expect(incident.timeline.length).toBeGreaterThan(0);
    });
  });

  describe('Payroll Data Model', () => {
    it('should validate payroll entry structure', () => {
      const payroll: PayrollEntry = {
        id: 'payroll-1',
        guardId: 'guard-1',
        guardName: 'John Doe',
        period: 'May 2026',
        daysWorked: 20,
        hoursWorked: 160,
        hourlyRate: 50,
        overtimeHours: 10,
        overtimeRate: 75,
        deductions: 100,
        totalAmount: 8150,
        status: 'pending',
        approvedBy: undefined,
        approvalDate: undefined,
        paidDate: undefined,
      };

      expect(payroll.id).toBeDefined();
      expect(payroll.hoursWorked).toBeGreaterThan(0);
      expect(payroll.totalAmount).toBeGreaterThan(0);
      expect(payroll.status).toMatch(/pending|approved|paid|rejected/);
    });

    it('should calculate payroll correctly', () => {
      const payroll = {
        hoursWorked: 160,
        hourlyRate: 50,
        overtimeHours: 10,
        overtimeRate: 75,
        deductions: 100,
      };

      const regularPay = payroll.hoursWorked * payroll.hourlyRate;
      const overtimePay = payroll.overtimeHours * payroll.overtimeRate;
      const totalAmount = regularPay + overtimePay - payroll.deductions;

      expect(regularPay).toBe(8000);
      expect(overtimePay).toBe(750);
      expect(totalAmount).toBe(8650);
    });
  });

  describe('Merit Score Data Model', () => {
    it('should validate merit score structure', () => {
      const meritScore: MeritScore = {
        guardId: 'guard-1',
        attendance: 95,
        performance: 88,
        conduct: 92,
        trainingCompletion: 85,
        overall: 90,
        lastUpdated: '2026-05-12T10:00:00Z',
        history: [],
      };

      expect(meritScore.guardId).toBeDefined();
      expect(meritScore.attendance).toBeGreaterThanOrEqual(0);
      expect(meritScore.attendance).toBeLessThanOrEqual(100);
      expect(meritScore.overall).toBeLessThanOrEqual(100);
    });

    it('should calculate overall score correctly', () => {
      const scores = {
        attendance: 95,
        performance: 88,
        conduct: 92,
        trainingCompletion: 85,
      };

      const overall = Math.round(
        (scores.attendance +
          scores.performance +
          scores.conduct +
          scores.trainingCompletion) /
          4
      );

      expect(overall).toBe(90);
      expect(overall).toBeGreaterThanOrEqual(0);
      expect(overall).toBeLessThanOrEqual(100);
    });
  });

  describe('Data Filtering and Search', () => {
    it('should filter guards by status', () => {
      const guards: Guard[] = [
        {
          id: '1',
          name: 'Guard 1',
          status: 'on_duty',
          email: 'guard1@test.com',
          phone: '123456',
          idNumber: 'G001',
          dateOfHire: '2023-01-01',
          meritScore: 85,
          certifications: [],
        },
        {
          id: '2',
          name: 'Guard 2',
          status: 'off_duty',
          email: 'guard2@test.com',
          phone: '123457',
          idNumber: 'G002',
          dateOfHire: '2023-01-02',
          meritScore: 80,
          certifications: [],
        },
        {
          id: '3',
          name: 'Guard 3',
          status: 'on_duty',
          email: 'guard3@test.com',
          phone: '123458',
          idNumber: 'G003',
          dateOfHire: '2023-01-03',
          meritScore: 90,
          certifications: [],
        },
      ];

      const onDutyGuards = guards.filter((g) => g.status === 'on_duty');
      expect(onDutyGuards.length).toBe(2);
    });

    it('should search guards by name', () => {
      const guards: Guard[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@test.com',
          phone: '123456',
          idNumber: 'G001',
          dateOfHire: '2023-01-01',
          status: 'on_duty',
          meritScore: 85,
          certifications: [],
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@test.com',
          phone: '123457',
          idNumber: 'G002',
          dateOfHire: '2023-01-02',
          status: 'on_duty',
          meritScore: 80,
          certifications: [],
        },
        {
          id: '3',
          name: 'John Smith',
          email: 'johnsmith@test.com',
          phone: '123458',
          idNumber: 'G003',
          dateOfHire: '2023-01-03',
          status: 'on_duty',
          meritScore: 90,
          certifications: [],
        },
      ];

      const searchResults = guards.filter((g) =>
        g.name.toLowerCase().includes('john')
      );
      expect(searchResults.length).toBe(2);
    });
  });
});
