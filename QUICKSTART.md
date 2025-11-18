# Quick Start Guide

Get your AI Workout Trainer running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Setup Steps

### 1. Clone and Configure

```bash
cd health
cp .env.example .env
```

### 2. Add Your API Key

Edit `.env` and add your Anthropic API key:

```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

### 3. Start the Application

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend app on port 3000

### 4. Open the App

Visit http://localhost:3000 in your browser

### 5. Create an Account

1. Click "Sign up"
2. Enter your details
3. Create your training plan

## Usage Flow

### Initial Setup
1. **Sign Up** - Create your account
2. **Set Up Plan** - Choose your goal (Half Marathon, Marathon, Half Ironman, Ironman)
3. **View Calendar** - See your AI-generated weekly workouts

### Weekly Routine
1. **Complete Workouts** - Follow your training plan
2. **Log Workouts** - Record your actual performance (duration, distance, heart rate, RPE)
3. **AI Adjustment** - At the end of each week, click "Adjust Plan" on the dashboard
4. **Review Changes** - Claude AI analyzes your week and adjusts next week's workouts

### What Gets Adjusted?

The AI considers:
- **Completion Rate**: Did you complete all planned workouts?
- **RPE (Rate of Perceived Exertion)**: How hard did the workouts feel?
- **Performance Metrics**: Heart rate, pace, distance
- **Recovery**: Are you showing signs of overtraining?

Based on this analysis, it will:
- Increase or decrease workout intensity
- Adjust volume (duration/distance)
- Add or remove rest days
- Modify workout types

## Stopping the Application

```bash
docker-compose down
```

To also remove database data:

```bash
docker-compose down -v
```

## Development Mode (Without Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit VITE_API_URL if needed
npm run dev
```

## Troubleshooting

**Port already in use?**
Edit `docker-compose.yml` to change the port mappings.

**Database connection issues?**
Make sure PostgreSQL container is healthy: `docker-compose ps`

**AI adjustments not working?**
Verify your Anthropic API key is correctly set in `.env`

## Example Training Cycle

Week 1:
- Complete 3 runs as planned
- Log all workouts with RPE 5-6 (moderate)
- 100% completion rate

AI Analysis:
- "Great start! Performance metrics look good. Slightly increasing intensity for next week."

Week 2:
- Modified plan includes one additional tempo run
- Long run distance increased by 1km
- Recovery runs remain the same

This iterative process continues, adapting to YOUR unique performance!

## Support

For issues or questions, refer to README.md or open an issue on GitHub.

Enjoy your AI-powered training! 🏃‍♂️🚴‍♀️🏊‍♂️
