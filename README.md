# TaskQuest - Gamified Task Management SaaS

A modern task management application with gamification features. Complete tasks, earn points, climb the leaderboard!

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker (for local database)

### Backend Setup
```bash
cd backend
npm install
docker compose up -d          # Start Postgres
npx prisma migrate dev        # Run migrations
npx ts-node prisma/seed.ts    # Seed sample data
npm run start:dev             # API at http://localhost:3000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev                   # App at http://localhost:3001
```

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskquest.com | admin123 |

## 📚 API Documentation

Swagger UI available at: `http://localhost:3000/api`

## 🏗 Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, Prisma, PostgreSQL
- **Auth**: JWT

## 📁 Project Structure

```
├── frontend/     # Next.js app
├── backend/      # NestJS API
└── docker-compose.yml
```

## 🌐 Deployment

- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway
- **Database**: Railway PostgreSQL or Neon/Supabase

## 📄 License

MIT
