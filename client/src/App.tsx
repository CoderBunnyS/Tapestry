import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Circle,
  HeartHandshake,
  Home,
  NotebookPen,
  Plus,
  Sparkles,
} from "lucide-react";
import type { DailyEntry, DailyPlan, EntryKind } from "@tapestry/shared";

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

export function App() {
  const [plans, setPlans] = useState(initialPlans);
  const [entries, setEntries] = useState(initialEntries);
  const [notes, setNotes] = useState("A steady day. Leave some room between meetings.");
  const [captureOpen, setCaptureOpen] = useState(false);
  const [captureKind, setCaptureKind] = useState<EntryKind>("note");
  const [captureTitle, setCaptureTitle] = useState("");

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  function togglePlan(id: string) {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === id
          ? { ...plan, outcome: plan.outcome === "completed" ? "pending" : "completed" }
          : plan,
      ),
    );
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
            <span>{plans.filter((plan) => plan.outcome === "completed").length}/{plans.length}</span>
          </div>
          <div className="plan-list">
            {plans.map((plan) => (
              <button className={`plan-row ${plan.outcome}`} key={plan.id} onClick={() => togglePlan(plan.id)}>
                <span className="check">{plan.outcome === "completed" ? <Check /> : <Circle />}</span>
                <span className="plan-copy">
                  <strong>{plan.title}</strong>
                  <small>{plan.scheduledAt ?? "Anytime"}</small>
                </span>
              </button>
            ))}
          </div>
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
