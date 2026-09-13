import mongoose, { Schema } from "mongoose";
import type { DailyEntry, DailyPlan, DailyRecord, LifeLink, PlanOutcome } from "@tapestry/shared";

const lifeLinkSchema = new Schema({ entityId: String, entityType: { type: String, enum: ["person", "place", "project", "food", "account", "lifeArea"] }, label: String }, { _id: false });
const planSnapshotSchema = new Schema({ title: String, scheduledAt: String, estimatedMinutes: Number }, { _id: false });
const dailyPlanSchema = new Schema({ id: String, title: String, scheduledAt: String, estimatedMinutes: Number, actualMinutes: Number, outcome: { type: String, enum: ["pending", "completed", "changed", "skipped"], default: "pending" }, actualEntryId: String, original: planSnapshotSchema }, { _id: false });
const dailyEntrySchema = new Schema({ id: String, kind: { type: String, enum: ["task", "meal", "health", "expense", "interaction", "note"] }, title: String, detail: String, occurredAt: String, durationMinutes: Number, planId: String, links: { type: [lifeLinkSchema], default: [] } }, { _id: false });
const dailyRecordSchema = new Schema({ date: { type: String, required: true, unique: true, index: true }, notes: { type: String, default: "" }, plans: { type: [dailyPlanSchema], default: [] }, entries: { type: [dailyEntrySchema], default: [] }, reflection: String, mood: Number, energy: Number }, { timestamps: true, versionKey: false });

export const DailyRecordModel = mongoose.models.DailyRecord ?? mongoose.model("DailyRecord", dailyRecordSchema);

export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function blankDailyRecord(date: string): DailyRecord {
  return { id: `daily-${date}`, date, notes: "", plans: [], entries: [] };
}

function optionalText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}
function optionalMinutes(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.round(value) : undefined;
}
function optionalScore(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const rounded = Math.round(value);
  return rounded >= 1 && rounded <= 10 ? rounded : undefined;
}
function normalizeLinks(value: unknown): LifeLink[] {
  if (!Array.isArray(value)) return [];
  const validTypes: LifeLink["entityType"][] = ["person", "place", "project", "food", "account", "lifeArea"];
  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const link = candidate as Partial<LifeLink>;
    const entityId = optionalText(link.entityId);
    const label = optionalText(link.label);
    if (!entityId || !label || !validTypes.includes(link.entityType as LifeLink["entityType"])) return [];
    return [{ entityId, label, entityType: link.entityType as LifeLink["entityType"] }];
  });
}
function normalizePlans(value: unknown): DailyPlan[] {
  if (!Array.isArray(value)) return [];
  const validOutcomes: PlanOutcome[] = ["pending", "completed", "changed", "skipped"];
  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const plan = candidate as Partial<DailyPlan>;
    const id = optionalText(plan.id), title = optionalText(plan.title);
    if (!id || !title) return [];
    return [{ id, title, scheduledAt: optionalText(plan.scheduledAt), estimatedMinutes: optionalMinutes(plan.estimatedMinutes), actualMinutes: optionalMinutes(plan.actualMinutes), outcome: validOutcomes.includes(plan.outcome as PlanOutcome) ? plan.outcome as PlanOutcome : "pending", actualEntryId: optionalText(plan.actualEntryId), original: plan.original ? { title: optionalText(plan.original.title) ?? title, scheduledAt: optionalText(plan.original.scheduledAt), estimatedMinutes: optionalMinutes(plan.original.estimatedMinutes) } : undefined }];
  });
}
function normalizeEntries(value: unknown): DailyEntry[] {
  if (!Array.isArray(value)) return [];
  const validKinds: DailyEntry["kind"][] = ["task", "meal", "health", "expense", "interaction", "note"];
  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const entry = candidate as Partial<DailyEntry>;
    const id = optionalText(entry.id), title = optionalText(entry.title);
    if (!id || !title || !validKinds.includes(entry.kind as DailyEntry["kind"])) return [];
    return [{ id, kind: entry.kind as DailyEntry["kind"], title, detail: optionalText(entry.detail), occurredAt: optionalText(entry.occurredAt), durationMinutes: optionalMinutes(entry.durationMinutes), planId: optionalText(entry.planId), links: normalizeLinks(entry.links) }];
  });
}
export function normalizeDailyRecord(date: string, value: unknown): DailyRecord {
  const input = value && typeof value === "object" ? value as Partial<DailyRecord> : {};
  return { id: `daily-${date}`, date, notes: typeof input.notes === "string" ? input.notes : "", plans: normalizePlans(input.plans), entries: normalizeEntries(input.entries), reflection: typeof input.reflection === "string" ? input.reflection : undefined, mood: optionalScore(input.mood), energy: optionalScore(input.energy) };
}
export async function getDailyRecord(date: string): Promise<DailyRecord> {
  const document = await DailyRecordModel.findOne({ date }).lean();
  return document ? normalizeDailyRecord(date, document) : blankDailyRecord(date);
}
export async function saveDailyRecord(date: string, value: unknown): Promise<DailyRecord> {
  const record = normalizeDailyRecord(date, value);
  const { id: _id, date: _date, ...persisted } = record;
  const document = await DailyRecordModel.findOneAndUpdate({ date }, { $set: { ...persisted, date } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
  return normalizeDailyRecord(date, document);
}
