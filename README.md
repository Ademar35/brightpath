# BrightPath

An adaptive learning app for kids. Students work through math, reading, science,
and social studies at their own pace, with AI study buddies for help along the way.

Built with Next.js 15, Prisma, PostgreSQL, and the Anthropic SDK.

## Working on this from any computer

Open the repo on GitHub, press `.` or click **Code > Codespaces > Create codespace on main**.

Everything sets itself up: PostgreSQL starts inside the Codespace, `.env` is written,
dependencies install, and the database is created and seeded. When it finishes:

```bash
npm run dev
```

A notification offers to open the app on port 3000. Nothing needs to be installed
on your own machine, and your work is saved to the repo rather than to any one computer.

### Turning on the AI study buddies

The chat feature needs an Anthropic API key. Without one the app runs fine and the
chat shows a friendly fallback message.

To enable it, open `.env` in the Codespace and paste your key:

```
ANTHROPIC_API_KEY="sk-ant-..."
```

Get a key at [console.anthropic.com](https://console.anthropic.com). Keep it out of
version control: `.env` is gitignored on purpose, so never move the key into a file
that gets committed.

## Running locally instead

Requires Node 22+ and a PostgreSQL database.

```bash
npm install
cp .env.example .env
```

Fill in `DATABASE_URL` in `.env`, then:

```bash
npx prisma db push
npm run db:seed
npm run dev
```

## Project layout

| Path | What's in it |
| --- | --- |
| `src/app/` | Pages and API routes |
| `src/components/` | Shared UI components |
| `src/data/curriculum/` | Curriculum content per subject |
| `src/lib/` | Auth, database, adaptive logic, Claude client |
| `prisma/` | Database schema and seed script |

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:push` | Apply the schema to the database |
| `npm run db:seed` | Load starter data |
| `npm test` | Run tests |
| `npm run lint` | Lint |
