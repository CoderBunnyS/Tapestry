export type EntryKind =
  | "task"
  | "meal"
  | "health"
  | "expense"
  | "interaction"
  | "note";

export type PlanOutcome = "pending" | "completed" | "changed" | "skipped";
export type ThemePreference = "system" | "light" | "dark";

export interface LifeLink {
  entityId: string;
  entityType: "person" | "place" | "project" | "food" | "account" | "lifeArea";
  label: string;
}

export interface DailyPlanSnapshot {
  title: string;
  scheduledAt?: string;
  estimatedMinutes?: number;
}

export interface DailyEntry {
  id: string;
  kind: EntryKind;
  title: string;
  detail?: string;
  occurredAt?: string;
  durationMinutes?: number;
  planId?: string;
  links: LifeLink[];
}

export interface DailyPlan {
  id: string;
  title: string;
  scheduledAt?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  outcome: PlanOutcome;
  actualEntryId?: string;
  original?: DailyPlanSnapshot;
}

export interface DailyRecord {
  id: string;
  date: string;
  notes: string;
  plans: DailyPlan[];
  entries: DailyEntry[];
  reflection?: string;
  mood?: number;
  energy?: number;
}

export interface ApiHealth {
  status: "ok";
  service: "tapestry-api";
  database: "connected" | "disconnected";
}
