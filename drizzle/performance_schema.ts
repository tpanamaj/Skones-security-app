// Add to drizzle/schema.ts
import {
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
} from 'drizzle-orm/mysql-core';

export const performanceMetrics = mysqlTable('performance_metrics', {
  id: int('id').autoincrement().primaryKey(),
  guardId: varchar('guardId', { length: 64 }).notNull(),
  attendance: int('attendance').default(0).notNull(),
  conduct: int('conduct').default(0).notNull(),
  training: int('training').default(0).notNull(),
  punctuality: int('punctuality').default(0).notNull(),
  efficiency: int('efficiency').default(0).notNull(),
  overallScore: int('overallScore').default(0).notNull(),
  rank: int('rank').default(0),
  badges: text('badges'),
  recordedAt: timestamp('recordedAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;
