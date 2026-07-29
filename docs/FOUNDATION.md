# Tapestry foundation

## Product direction

Tapestry is a connected record of life for memory, reflection, and better decisions.

The initial vertical slice is the Daily Record:

- the day is durable, editable, and revisitable;
- plans and actual events are preserved separately;
- changes and skipped plans are meaningful history;
- entries can link to people, places, projects, food, accounts, and user-defined life areas;
- the primary interface is designed for phone-sized screens and touch input.

## Current scaffold boundary

The first scaffold deliberately includes:

- shared domain contracts for a daily record, plans, entries, and entity links;
- a usable Today screen with editable notes, plan completion, a timeline, and quick capture;
- an Express API health boundary;
- an optional MongoDB connection that does not block local UI work.

It deliberately does not yet include authentication, permanent Daily Record endpoints, or a finalized MongoDB schema. Those will be implemented against the working interaction instead of guessed in advance.
