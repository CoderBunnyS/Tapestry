export type EntryKind =
  | "task"
  | "meal"
  | "health"
  | "expense"
  | "interaction"
  | "note";

export type PlanOutcome = "pending" | "completed" | "changed" | "skipped";

export interface LifeLink {
  entityId: string;
  entityType: "person" | "place" | "project" | "food" | "account" | "lifeArea";
  label: string;
}

export interface DailyEntry {
  id: string;
  kind: EntryKind;
  title: string;
  detail?: string;
  occurredAt?: string;
  links: LifeLink[];
}

export interface DailyPlan {
  id: string;
  title: string;
  scheduledAt?: string;
  outcome: PlanOutcome;
  actualEntryId?: string;
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
