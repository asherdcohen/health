# AI Workout Adjustment App

An intelligent training platform for endurance athletes (Half Marathon, Marathon, Half Ironman, Ironman) that uses Claude AI to automatically adjust your training plan based on weekly performance.

## Features

- **Multi-Sport Training**: Support for running, cycling, and swimming workouts
- **Training Calendar**: Weekly view of planned workouts
- **Workout Logging**: Track completed workouts with detailed metrics (duration, distance, heart rate, RPE, etc.)
- **AI-Powered Adjustments**: Claude AI analyzes your weekly performance and adjusts future workouts
- **Performance Dashboard**: Visualize your progress and trends
- **User Authentication**: Secure account management

## Tech Stack

**Frontend:**
- React + TypeScript
- Tailwind CSS + shadcn/ui
- React Router
- React Query
- Recharts

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Anthropic Claude API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Anthropic API Key

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Anthropic API Key
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key

# Database (for local development without Docker)
DATABASE_URL=postgresql://health_user:health_password@localhost:5432/health_db
```

### Running with Docker (Recommended)

1. Clone the repository
2. Set up your `.env` file with required variables
3. Run the application:

```bash
docker-compose up -d
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Running Locally (Development)

#### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## How It Works

1. **Plan Your Week**: Set up your training plan with scheduled workouts
2. **Log Workouts**: After each workout, log your actual performance (time, distance, heart rate, RPE, notes)
3. **Weekly AI Adjustment**: At the end of each week, Claude AI:
   - Analyzes your completed workouts vs planned workouts
   - Evaluates your performance metrics and recovery
   - Adjusts the following week's workouts (intensity, duration, rest days)
   - Provides personalized recommendations

## Project Structure

```
health/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, validation
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic (AI, workouts)
│   │   └── utils/        # Helpers
│   ├── prisma/           # Database schema & migrations
│   └── Dockerfile
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── api/          # API client
│   │   └── lib/          # Utils
│   └── Dockerfile
└── docker-compose.yml
```

## API Endpoints

- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/workouts/calendar/:week` - Get weekly workouts
- `POST /api/workouts/log` - Log completed workout
- `POST /api/ai/adjust-plan` - Trigger AI adjustment
- `GET /api/dashboard/stats` - Get performance stats

## License

MIT
