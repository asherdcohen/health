import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { createTrainingPlanSchema } from '../utils/validation';

const prisma = new PrismaClient();

export async function createTrainingPlan(req: AuthRequest, res: Response) {
  try {
    const validatedData = createTrainingPlanSchema.parse(req.body);
    const userId = req.user!.userId;

    // Deactivate any existing active plans
    await prisma.trainingPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Calculate total weeks
    const startDate = new Date(validatedData.startDate);
    const raceDate = new Date(validatedData.raceDate);
    const totalWeeks = Math.ceil(
      (raceDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    // Create new training plan
    const trainingPlan = await prisma.trainingPlan.create({
      data: {
        userId,
        goal: validatedData.goal,
        startDate,
        raceDate,
        totalWeeks,
      },
    });

    // Generate initial workout plan based on goal
    await generateInitialWorkouts(trainingPlan.id, validatedData.goal, startDate, totalWeeks);

    res.status(201).json(trainingPlan);
  } catch (error: any) {
    console.error('Create training plan error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create training plan' });
  }
}

export async function getActiveTrainingPlan(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const trainingPlan = await prisma.trainingPlan.findFirst({
      where: { userId, isActive: true },
      include: {
        plannedWorkouts: {
          orderBy: { scheduledDate: 'asc' },
        },
      },
    });

    if (!trainingPlan) {
      return res.status(404).json({ error: 'No active training plan found' });
    }

    res.json(trainingPlan);
  } catch (error) {
    console.error('Get training plan error:', error);
    res.status(500).json({ error: 'Failed to fetch training plan' });
  }
}

export async function getWeeklyWorkouts(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const weekNumber = parseInt(req.params.week);

    const trainingPlan = await prisma.trainingPlan.findFirst({
      where: { userId, isActive: true },
    });

    if (!trainingPlan) {
      return res.status(404).json({ error: 'No active training plan found' });
    }

    const plannedWorkouts = await prisma.plannedWorkout.findMany({
      where: {
        trainingPlanId: trainingPlan.id,
        weekNumber,
      },
      include: {
        workoutLog: true,
      },
      orderBy: { dayOfWeek: 'asc' },
    });

    res.json({
      trainingPlan: {
        id: trainingPlan.id,
        goal: trainingPlan.goal,
        currentWeek: trainingPlan.currentWeek,
        totalWeeks: trainingPlan.totalWeeks,
      },
      workouts: plannedWorkouts,
    });
  } catch (error) {
    console.error('Get weekly workouts error:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
}

// Helper function to generate initial workouts based on goal
async function generateInitialWorkouts(
  trainingPlanId: string,
  goal: string,
  startDate: Date,
  totalWeeks: number
) {
  const workouts = [];

  // Generate a basic template for the first 4 weeks
  // This is a simplified version - you could expand this based on the goal
  for (let week = 1; week <= Math.min(4, totalWeeks); week++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (week - 1) * 7);

    if (goal === 'HALF_MARATHON' || goal === 'MARATHON') {
      // Running-focused plan
      workouts.push(
        // Tuesday: Easy Run
        {
          trainingPlanId,
          weekNumber: week,
          dayOfWeek: 2,
          scheduledDate: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000),
          sportType: 'RUN',
          workoutType: 'EASY_RUN',
          targetDuration: 45,
          targetDistance: 8,
          intensityZone: 'ZONE_2',
          description: 'Easy aerobic run',
        },
        // Thursday: Tempo or Intervals
        {
          trainingPlanId,
          weekNumber: week,
          dayOfWeek: 4,
          scheduledDate: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000),
          sportType: 'RUN',
          workoutType: week % 2 === 0 ? 'TEMPO_RUN' : 'INTERVAL_RUN',
          targetDuration: 60,
          targetDistance: 10,
          intensityZone: 'ZONE_4',
          description: week % 2 === 0 ? 'Tempo run at threshold pace' : 'Interval session',
        },
        // Saturday: Long Run
        {
          trainingPlanId,
          weekNumber: week,
          dayOfWeek: 6,
          scheduledDate: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
          sportType: 'RUN',
          workoutType: 'LONG_RUN',
          targetDuration: 90 + week * 10,
          targetDistance: 15 + week * 2,
          intensityZone: 'ZONE_2',
          description: 'Long endurance run',
        }
      );
    } else {
      // Triathlon plan (HALF_IRONMAN or IRONMAN)
      workouts.push(
        // Monday: Swim
        {
          trainingPlanId,
          weekNumber: week,
          dayOfWeek: 1,
          scheduledDate: new Date(weekStart.getTime() + 1 * 24 * 60 * 60 * 1000),
          sportType: 'SWIM',
          workoutType: 'EASY_SWIM',
          targetDuration: 45,
          targetDistance: 2,
          intensityZone: 'ZONE_2',
          description: 'Technique and endurance swim',
        },
        // Tuesday: Run
        {
          trainingPlanId,
          weekNumber: week,
          dayOfWeek: 2,
          scheduledDate: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000),
          sportType: 'RUN',
          workoutType: 'EASY_RUN',
          targetDuration: 45,
          targetDistance: 8,
          intensityZone: 'ZONE_2',
          description: 'Easy run',
        },
        // Wednesday: Bike
        {
          trainingPlanId,
          weekNumber: week,
          dayOfWeek: 3,
          scheduledDate: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000),
          sportType: 'BIKE',
          workoutType: 'TEMPO_RIDE',
          targetDuration: 90,
          targetDistance: 40,
          intensityZone: 'ZONE_3',
          description: 'Tempo bike ride',
        },
        // Thursday: Swim
        {
          trainingPlanId,
          weekNumber: week,
          dayOfWeek: 4,
          scheduledDate: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000),
          sportType: 'SWIM',
          workoutType: 'INTERVAL_SWIM',
          targetDuration: 60,
          targetDistance: 2.5,
          intensityZone: 'ZONE_4',
          description: 'Interval swim session',
        },
        // Saturday: Long Bike
        {
          trainingPlanId,
          weekNumber: week,
          dayOfWeek: 6,
          scheduledDate: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
          sportType: 'BIKE',
          workoutType: 'LONG_RIDE',
          targetDuration: 150 + week * 15,
          targetDistance: 60 + week * 10,
          intensityZone: 'ZONE_2',
          description: 'Long endurance ride',
        },
        // Sunday: Long Run
        {
          trainingPlanId,
          weekNumber: week,
          dayOfWeek: 0,
          scheduledDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
          sportType: 'RUN',
          workoutType: 'LONG_RUN',
          targetDuration: 75 + week * 10,
          targetDistance: 12 + week * 2,
          intensityZone: 'ZONE_2',
          description: 'Long endurance run',
        }
      );
    }
  }

  await prisma.plannedWorkout.createMany({ data: workouts });
}
