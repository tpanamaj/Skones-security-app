import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Guard,
  DeploymentPost,
  Incident,
  PayrollEntry,
  MeritScore,
  Message,
  GuardLocation,
} from './types';
import {
  mockGuards,
  mockDeploymentPosts,
  mockIncidents,
  mockPayrollEntries,
  mockMeritScores,
  mockCompanyInfo,
} from './mock-data';

interface AppContextType {
  // Guards
  guards: Guard[];
  addGuard: (guard: Guard) => void;
  updateGuard: (guardId: string, updates: Partial<Guard>) => void;
  getGuardById: (guardId: string) => Guard | undefined;

  // Deployment Posts
  deploymentPosts: DeploymentPost[];
  addDeploymentPost: (post: DeploymentPost) => void;
  updateDeploymentPost: (postId: string, updates: Partial<DeploymentPost>) => void;
  getDeploymentPostById: (postId: string) => DeploymentPost | undefined;

  // Incidents
  incidents: Incident[];
  addIncident: (incident: Incident) => void;
  updateIncident: (incidentId: string, updates: Partial<Incident>) => void;
  getIncidentById: (incidentId: string) => Incident | undefined;

  // Payroll
  payrollEntries: PayrollEntry[];
  addPayrollEntry: (entry: PayrollEntry) => void;
  updatePayrollEntry: (entryId: string, updates: Partial<PayrollEntry>) => void;
  getPayrollEntriesByPeriod: (period: string) => PayrollEntry[];

  // Merit Scores
  meritScores: MeritScore[];
  getMeritScoreByGuardId: (guardId: string) => MeritScore | undefined;
  updateMeritScore: (guardId: string, updates: Partial<MeritScore>) => void;

  // Messages
  messages: Message[];
  addMessage: (message: Message) => void;
  getMessagesByRecipient: (recipientId: string) => Message[];

  // Locations
  guardLocations: GuardLocation[];
  updateGuardLocation: (location: GuardLocation) => void;
  getGuardLocationHistory: (guardId: string) => GuardLocation[];

  // Company Info
  companyInfo: typeof mockCompanyInfo;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [guards, setGuards] = useState<Guard[]>(mockGuards);
  const [deploymentPosts, setDeploymentPosts] = useState<DeploymentPost[]>(mockDeploymentPosts);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>(mockPayrollEntries);
  const [meritScores, setMeritScores] = useState<MeritScore[]>(mockMeritScores);
  const [messages, setMessages] = useState<Message[]>([]);
  const [guardLocations, setGuardLocations] = useState<GuardLocation[]>([]);

  // Guard operations
  const addGuard = (guard: Guard) => {
    setGuards((prev) => [...prev, guard]);
  };

  const updateGuard = (guardId: string, updates: Partial<Guard>) => {
    setGuards((prev) =>
      prev.map((g) => (g.id === guardId ? { ...g, ...updates } : g))
    );
  };

  const getGuardById = (guardId: string) => {
    return guards.find((g) => g.id === guardId);
  };

  // Deployment Post operations
  const addDeploymentPost = (post: DeploymentPost) => {
    setDeploymentPosts((prev) => [...prev, post]);
  };

  const updateDeploymentPost = (postId: string, updates: Partial<DeploymentPost>) => {
    setDeploymentPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...updates } : p))
    );
  };

  const getDeploymentPostById = (postId: string) => {
    return deploymentPosts.find((p) => p.id === postId);
  };

  // Incident operations
  const addIncident = (incident: Incident) => {
    setIncidents((prev) => [...prev, incident]);
  };

  const updateIncident = (incidentId: string, updates: Partial<Incident>) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, ...updates } : i))
    );
  };

  const getIncidentById = (incidentId: string) => {
    return incidents.find((i) => i.id === incidentId);
  };

  // Payroll operations
  const addPayrollEntry = (entry: PayrollEntry) => {
    setPayrollEntries((prev) => [...prev, entry]);
  };

  const updatePayrollEntry = (entryId: string, updates: Partial<PayrollEntry>) => {
    setPayrollEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, ...updates } : e))
    );
  };

  const getPayrollEntriesByPeriod = (period: string) => {
    return payrollEntries.filter((e) => e.period === period);
  };

  // Merit Score operations
  const getMeritScoreByGuardId = (guardId: string) => {
    return meritScores.find((m) => m.guardId === guardId);
  };

  const updateMeritScore = (guardId: string, updates: Partial<MeritScore>) => {
    setMeritScores((prev) =>
      prev.map((m) =>
        m.guardId === guardId ? { ...m, ...updates } : m
      )
    );
  };

  // Message operations
  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const getMessagesByRecipient = (recipientId: string) => {
    return messages.filter((m) => m.recipientId === recipientId || m.recipientIds?.includes(recipientId));
  };

  // Location operations
  const updateGuardLocation = (location: GuardLocation) => {
    setGuardLocations((prev) => {
      const existing = prev.findIndex((l) => l.guardId === location.guardId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = location;
        return updated;
      }
      return [...prev, location];
    });
  };

  const getGuardLocationHistory = (guardId: string) => {
    return guardLocations.filter((l) => l.guardId === guardId);
  };

  const value: AppContextType = {
    guards,
    addGuard,
    updateGuard,
    getGuardById,
    deploymentPosts,
    addDeploymentPost,
    updateDeploymentPost,
    getDeploymentPostById,
    incidents,
    addIncident,
    updateIncident,
    getIncidentById,
    payrollEntries,
    addPayrollEntry,
    updatePayrollEntry,
    getPayrollEntriesByPeriod,
    meritScores,
    getMeritScoreByGuardId,
    updateMeritScore,
    messages,
    addMessage,
    getMessagesByRecipient,
    guardLocations,
    updateGuardLocation,
    getGuardLocationHistory,
    companyInfo: mockCompanyInfo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppProvider');
  }
  return context;
}
