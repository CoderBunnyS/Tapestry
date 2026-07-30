import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Circle,
  Clock3,
  HeartHandshake,
  Home,
  NotebookPen,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { DailyEntry, DailyPlan, EntryKind } from "@tapestry/shared";
import "./agenda.css";
import "./timeline.css";

const initialPlans: DailyPlan[] = [
  { id: "plan-1", title: "Morning walk", scheduledAt: "8:00 AM", outcome: "completed" },
  { id: "plan-2", title: "Prepare demo notes", scheduledAt: "10:30 AM", outcome: "pending" },
  { id: "plan-3", title: "Spanish practice", scheduledAt: "4:00 PM", outcome: "pending" },
];

const initialEntries: DailyEntry[] = [
  {
    id: "entry-1",
    kind: "interaction",
    title: "Coffee with Maya",
    detail: "Her studio opening is next month—ask about the signage.",
    occurredAt: "9:15 AM",
    links: [{ entityId: "maya", entityType: "person", label: "Maya" }],
  },
  {
    id: "entry-2",
    kind: "meal",
    title: "Yogurt, berries, and granola",
    occurredAt: "9:50 AM",
    links: [],
  },
];

const entryLabels: Record<EntryKind, string> = {
  task: "Task",
  meal: "Meal",
  health: "Health",
  expense: "Expense",
  interaction: "Person",
  note: "Note",
};

const PLAN_STORAGE_KEY = "tapestry:today-plans";
const ENTRY_STORAGE_KEY = "tapestry:today-entries";
const NOTES_STORAGE_KEY = "tapestry:today-notes";
const DEFAULT_NOTES = "A steady day. Leave some room between meetings.";

type PlanDraft = {
  id?: string;
  title: string;
  scheduledAt: string;
};

type EntryDraft = {
  id?: string;
  kind: EntryKind;
  title: string;
  detail: string;
  occurredAt: string;
};

const emptyPlanDraft: PlanDraft = {
  title: "",
  scheduledAt: "",
};

const emptyEntryDraft: EntryDraft = {
  kind: "note",
  title: "",
  detail: "",
  occurredAt: "",
};

function loadArray<T>(key: string, fallback: T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function loadNotes() {
  return localStorage.getItem(NOTES_STORAGE_KEY) ?? DEFAULT_NOTES;
}

function currentTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

export function App() {
  const [plans, setPlans] = useState<DailyPlan[]>(() => loadArray(PLAN_STORAGE_KEY, initialPlans));
  const [entries, setEntries] = useState<DailyEntry[]>(() => loadArray(ENTRY_STORAGE_KEY, initialEntries));
  const [notes, setNotes] = useState(loadNotes);
  const [planEditorOpen, setPlanEditorOpen] = useState(false);
  const [planDraft, setPlanDraft] = useState<PlanDraft>(emptyPlanDraft);
  const [entryEditorOpen, setEntryEditorOpen] = useState(false);
  const [entryDraft, setEntryDraft] = useState<EntryDraft>(emptyEntryDraft);

  useEffect(() => {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(ENTRY_STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, notes);
  }, [notes]);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  const completedPlanCount = plans.filter((plan) => plan.outcome === "completed").length;

  function togglePlan(id: string) {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === id
          ? { ...plan, outcome: plan.outcome === "completed" ? "pending" : "completed" }
          : plan,
      ),
    );
  }

  function openNewPlan() {
    setPlanDraft(emptyPlanDraft);
    setPlanEditorOpen(true);
  }

  function openPlanEditor(plan: DailyPlan) {
    setPlanDraft({
      id: plan.id,
      title: plan.title,
      scheduledAt: plan.scheduledAt ?? "",
    });
    setPlanEditorOpen(true);
  }

  function savePlan() {
    const title = planDraft.title.trim();
    if (!title) return;

    if (planDraft.id) {
      setPlans((current) =>
        current.map((plan) =>
          plan.id === planDraft.id
            ? { ...plan, title, scheduledAt: planDraft.scheduledAt.trim() || undefined }
            : plan,
        ),
      );
    } else {
      setPlans((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          title,
          scheduledAt: planDraft.scheduledAt.trim() || undefined,
          outcome: "pending",
        },
      ]);
    }

    setPlanEditorOpen(false);
    setPlanDraft(emptyPlanDraft);
  }

  function deletePlan(id: string) {
    setPlans((current) => current.filter((plan) => plan.id !== id));
  }

  function openNewEntry(kind: EntryKind = "note") {
    setEntryDraft({ ...emptyEntryDraft, kind, occurredAt: currentTime() });
    setEntryEditorOpen(true);
  }

  function openEntryEditor(entry: DailyEntry) {
    setEntryDraft({
      id: entry.id,
      kind: entry.kind,
      title: entry.title,
      detail: entry.detail ?? "",
      occurredAt: entry.occurredAt ?? "",
    });
    setEntryEditorOpen(true);
  }

  function saveEntry() {
    const title = entryDraft.title.trim();
    if (!title) return;

    if (entryDraft.id) {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === entryDraft.id
            ? {
                ...entry,
                kind: entryDraft.kind,
                title,
                detail: entryDraft.detail.trim() || undefined,
                occurredAt: entryDraft.occurredAt.trim() || undefined,
              }
            : entry,
        ),
      );
    } else {
      setEntries((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          kind: entryDraft.kind,
          title,
          detail: entryDraft.detail.trim() || undefined,
          occurredAt: entryDraft.occurredAt.trim() || currentTime(),
          links: [],
        },
      ]);
    }

    setEntryEditorOpen(false);
    setEntryDraft(emptyEntryDraft);
  }

  function deleteEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return (
    <div className="app-shell">
      <aside className="desktop-rail" aria-label="Primary navigation">
        <div className="brand-mark">T</div>
        <button className="rail-button active" aria-label="Today"><Home /></button>
        <button className="rail-button" aria-label="Calendar"><CalendarDays /></button>
        <button className="rail-button" aria-label="Journal"><NotebookPen /></button>
      </aside>

      <main className="today-page">
        <header className="page-header">
          <div>
            <p className="eyebrow">Today</p>
            <h1>{dateLabel}</h1>
          </div>
          <button className="avatar" aria-label="Profile">B</button>
        </header>

        <section className="welcome-card">
          <Sparkles aria-hidden="true" />
          <div>
            <strong>Good morning, Bunny.</strong>
            <p>Here’s the shape of your day. You can change it anytime.</p>
          </div>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">My plan</p>
              <h2>Agenda</h2>
            </div>
            <div className="agenda-heading-actions">
              <span className="plan-count">{completedPlanCount}/{plans.length}</span>
              <button className="small-action-button" onClick={openNewPlan}>
                <Plus /> Add plan
              </button>
            </div>
          </div>

          {plans.length > 0 ? (
            <div className="plan-list">
              {plans.map((plan) => (
                <div className={`plan-row ${plan.outcome}`} key={plan.id}>
                  <button
                    className="plan-check-button"
                    onClick={() => togglePlan(plan.id)}
                    aria-label={plan.outcome === "completed" ? `Mark ${plan.title} incomplete` : `Complete ${plan.title}`}
                  >
                    <span className="check">{plan.outcome === "completed" ? <Check /> : <Circle />}</span>
                  </button>

                  <button className="plan-copy" onClick={() => openPlanEditor(plan)}>
                    <strong>{plan.title}</strong>
                    <small>{plan.scheduledAt ?? "Anytime"}</small>
                  </button>

                  <div className="plan-row-actions">
                    <button onClick={() => openPlanEditor(plan)} aria-label={`Edit ${plan.title}`}><Pencil /></button>
                    <button className="delete-plan-button" onClick={() => deletePlan(plan.id)} aria-label={`Delete ${plan.title}`}><Trash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="plan-empty-state">
              <p>Nothing is planned yet. The day has room to breathe.</p>
              <button onClick={openNewPlan}>Add the first plan</button>
            </div>
          )}
        </section>

        <section className="content-card notes-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Editable</p>
              <h2>Notes for today</h2>
            </div>
          </div>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} aria-label="Notes for today" />
        </section>

        <section className="timeline-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Actual</p>
              <h2>What happened</h2>
            </div>
            <div className="timeline-heading-actions">
              <button className="small-action-button" onClick={() => openNewEntry()}>
                <Plus /> <span>Add entry</span>
              </button>
            </div>
          </div>

          {entries.length > 0 ? (
            <div className="timeline">
              {entries.map((entry) => (
                <article className="timeline-entry" key={entry.id}>
                  <div className={`entry-dot ${entry.kind}`} />
                  <div className="entry-card">
                    <div className="entry-card-header">
                      <div className="entry-meta">
                        <span>{entryLabels[entry.kind]}</span>
                        <time>{entry.occurredAt}</time>
                      </div>
                      <div className="entry-card-actions">
                        <button onClick={() => openEntryEditor(entry)} aria-label={`Edit ${entry.title}`}><Pencil /></button>
                        <button className="delete-entry-button" onClick={() => deleteEntry(entry.id)} aria-label={`Delete ${entry.title}`}><Trash2 /></button>
                      </div>
                    </div>
                    <h3>{entry.title}</h3>
                    {entry.detail && <p>{entry.detail}</p>}
                    {entry.links.map((link) => <span className="link-chip" key={link.entityId}>{link.label}</span>)}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="timeline-empty-state">
              <p>Nothing has been captured yet.</p>
              <button onClick={() => openNewEntry()}>Record the first thing</button>
            </div>
          )}
        </section>
      </main>

      <button className="quick-add" onClick={() => openNewEntry()}>
        <Plus /> <span>Capture</span>
      </button>

      <nav className="mobile-nav" aria-label="Primary navigation">
        <button className="active"><Home /><span>Today</span></button>
        <button><CalendarDays /><span>Plan</span></button>
        <button><HeartHandshake /><span>Care</span></button>
        <button><NotebookPen /><span>Journal</span></button>
      </nav>

      {planEditorOpen && (
        <div className="sheet-backdrop" onMouseDown={() => setPlanEditorOpen(false)}>
          <section className="capture-sheet" onMouseDown={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="section-heading">
              <div>
                <p className="eyebrow">{planDraft.id ? "Edit plan" : "Add to agenda"}</p>
                <h2>{planDraft.id ? "Adjust this plan" : "What needs a place today?"}</h2>
              </div>
              <button className="text-button" onClick={() => setPlanEditorOpen(false)}>Close</button>
            </div>

            <div className="plan-editor-form">
              <label>
                <span>Plan</span>
                <input
                  autoFocus
                  value={planDraft.title}
                  onChange={(event) => setPlanDraft((current) => ({ ...current, title: event.target.value }))}
                  onKeyDown={(event) => event.key === "Enter" && savePlan()}
                  placeholder="What do you want to do?"
                />
              </label>

              <label>
                <span>Time <small>optional</small></span>
                <div className="time-input-wrap">
                  <Clock3 />
                  <input
                    value={planDraft.scheduledAt}
                    onChange={(event) => setPlanDraft((current) => ({ ...current, scheduledAt: event.target.value }))}
                    onKeyDown={(event) => event.key === "Enter" && savePlan()}
                    placeholder="Anytime, 4:00 PM, after work…"
                  />
                </div>
              </label>
            </div>

            <button className="primary-button" onClick={savePlan} disabled={!planDraft.title.trim()}>
              {planDraft.id ? "Save changes" : "Add to agenda"}
            </button>
          </section>
        </div>
      )}

      {entryEditorOpen && (
        <div className="sheet-backdrop" onMouseDown={() => setEntryEditorOpen(false)}>
          <section className="capture-sheet" onMouseDown={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="section-heading">
              <div>
                <p className="eyebrow">{entryDraft.id ? "Edit entry" : "Quick capture"}</p>
                <h2>{entryDraft.id ? "Adjust what happened" : "What happened?"}</h2>
              </div>
              <button className="text-button" onClick={() => setEntryEditorOpen(false)}>Close</button>
            </div>

            <div className="kind-grid">
              {(Object.keys(entryLabels) as EntryKind[]).map((kind) => (
                <button
                  className={entryDraft.kind === kind ? "selected" : ""}
                  key={kind}
                  onClick={() => setEntryDraft((current) => ({ ...current, kind }))}
                >
                  {entryLabels[kind]}
                </button>
              ))}
            </div>

            <div className="entry-editor-form">
              <label>
                <span>Title</span>
                <input
                  autoFocus
                  value={entryDraft.title}
                  onChange={(event) => setEntryDraft((current) => ({ ...current, title: event.target.value }))}
                  onKeyDown={(event) => event.key === "Enter" && saveEntry()}
                  placeholder={`Add a ${entryLabels[entryDraft.kind].toLowerCase()}…`}
                />
              </label>

              <label>
                <span>Details <small>optional</small></span>
                <textarea
                  value={entryDraft.detail}
                  onChange={(event) => setEntryDraft((current) => ({ ...current, detail: event.target.value }))}
                  placeholder="Anything worth remembering?"
                />
              </label>

              <label>
                <span>Time <small>optional</small></span>
                <div className="entry-time-wrap">
                  <Clock3 />
                  <input
                    value={entryDraft.occurredAt}
                    onChange={(event) => setEntryDraft((current) => ({ ...current, occurredAt: event.target.value }))}
                    onKeyDown={(event) => event.key === "Enter" && saveEntry()}
                    placeholder="Now, 9:30 AM, after lunch…"
                  />
                </div>
              </label>
            </div>

            <button className="primary-button" onClick={saveEntry} disabled={!entryDraft.title.trim()}>
              {entryDraft.id ? "Save changes" : "Add to today"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
