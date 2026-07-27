import {
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';

export const incidents = mysqlTable('incidents', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  severity: mysqlEnum('severity', ['critical', 'high', 'medium', 'low']).notNull(),
  status: mysqlEnum('status', ['open', 'in_progress', 'resolved', 'closed']).default('open').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  reportedBy: varchar('reportedBy', { length: 255 }).notNull(),
  reportedAt: timestamp('reportedAt').notNull(),
  assignedTo: varchar('assignedTo', { length: 255 }),
  resolvedAt: timestamp('resolvedAt'),
  responseTime: int('responseTime'),
  resolution: text('resolution'),
  createdBy: int('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;
