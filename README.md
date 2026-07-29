# Tapestry

A connected record of life, built for memory, reflection, and better decisions.

Tapestry is a mobile-first web application centered on a durable Daily Record. It preserves both what was planned and what actually happened, while making entries linkable across the rest of life.

## Foundation

- React, Vite, and TypeScript client
- Express, Node, and TypeScript API
- MongoDB-ready persistence layer
- npm workspaces for one-command development
- Shared TypeScript contracts

## Run locally

```bash
pnpm install
cp server/.env.example server/.env
pnpm dev
```

The client runs at `http://localhost:5173` and the API at `http://localhost:4000`.

The first scaffold works without MongoDB: the Today experience uses sample state in the browser while the API and persistence boundary are established. Add `MONGODB_URI` when a database is available.

## Commands

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
```

## Structure

```text
client/   Mobile-first React application
server/   Express API and MongoDB connection
shared/   Domain contracts shared by client and server
docs/     Product and technical decisions
```
