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

type PlanDraft = {
  id?: string;
  title: string;
  scheduledAt: string;
};

const emptyPlanDraft: PlanDraft = {
  title: "",
  scheduledAt: "",
};

function loadPlans(): DailyPlan[] {
  try {
    const saved = localStorage.getItem(PLAN_STORAGE_KEY);
    if (!saved) return initialPlans;
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as DailyPlan[]) : initialPlans;
  } catch {
    return initialPlans;
  }
}

export function App() {
  const [plans, setPlans] = useState<DailyPlan[]>(loadPlans);
  const [entries, setEntries] = useState(initialEntries);
  const [notes, setNotes] = useState("A steady day. Leave some room between meetings.");
  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureKind, setCaptureKind] = useState<EntryKind>("note");
  const [captureTitle, setCaptureTitle] = useState("");
  const [planEditorOpen, setPlanEditorOpen] = useState(false);
  const [planDraft, setPlanDraft] = useState<PlanDraft>(emptyPlanDraft);

  useEffect(() => {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

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
            ? {
                ...plan,
                title,
                scheduledAt: planDraft.scheduledAt.trim() || undefined,
              }
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

  function addEntry() {
    const title = captureTitle.trim();
    if (!title) return;
    setEntries((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        kind: captureKind,
        title,
        occurredAt: new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
        links: [],
      },
    ]);
    setCaptureTitle("");
    setCaptureOpen(false);
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
                    <button onClick={() => openPlanEditor(plan)} aria-label={`Edit ${plan.title}`}>
                      <Pencil />
                    </button>
                    <button
                      className="delete-plan-button"
                      onClick={() => deletePlan(plan.id)}
                      aria-label={`Delete ${plan.title}`}
                    >
                      <Trash2 />
                    </button>
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
          </div>
          <div className="timeline">
            {entries.map((entry) => (
              <article className="timeline-entry" key={entry.id}>
                <div className={`entry-dot ${entry.kind}`} />
                <div className="entry-card">
                  <div className="entry-meta">
                    <span>{entryLabels[entry.kind]}</span>
                    <time>{entry.occurredAt}</time>
                  </div>
                  <h3>{entry.title}</h3>
                  {entry.detail && <p>{entry.detail}</p>}
                  {entry.links.map((link) => <span className="link-chip" key={link.entityId}>{link.label}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <button className="quick-add" onClick={() => setCaptureOpen(true)}>
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

      {captureOpen && (
        <div className="sheet-backdrop" onMouseDown={() => setCaptureOpen(false)}>
          <section className="capture-sheet" onMouseDown={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="section-heading">
              <div>
                <p className="eyebrow">Quick capture</p>
                <h2>What happened?</h2>
              </div>
              <button className="text-button" onClick={() => setCaptureOpen(false)}>Close</button>
            </div>
            <div className="kind-grid">
              {(Object.keys(entryLabels) as EntryKind[]).map((kind) => (
                <button
                  className={captureKind === kind ? "selected" : ""}
                  key={kind}
                  onClick={() => setCaptureKind(kind)}
                >
                  {entryLabels[kind]}
                </button>
              ))}
            </div>
            <input
              autoFocus
              value={captureTitle}
              onChange={(event) => setCaptureTitle(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addEntry()}
              placeholder={`Add a ${entryLabels[captureKind].toLowerCase()}…`}
            />
            <button className="primary-button" onClick={addEntry}>Add to today</button>
          </section>
        </div>
      )}
    </div>
  );
}
