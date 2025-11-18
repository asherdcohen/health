import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { logWorkoutSchema } from '../utils/validation';

const prisma = new PrismaClient();

export async function logWorkout(req: AuthRequest, res: Response) {
  try {
    const validatedData = logWorkoutSchema.parse(req.body);
    const userId = req.user!.userId;

    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId,
        plannedWorkoutId: validatedData.plannedWorkoutId,
        completedDate: new Date(validatedData.completedDate),
        sportType: validatedData.sportType,
        workoutType: validatedData.workoutType as any,
        actualDuration: validatedData.actualDuration,
        actualDistance: validatedData.actualDistance,
        actualPace: validatedData.actualPace,
        avgHeartRate: validatedData.avgHeartRate,
        maxHeartRate: validatedData.maxHeartRate,
        calories: validatedData.calories,
        elevationGain: validatedData.elevationGain,
        rpe: validatedData.rpe,
        feeling: validatedData.feeling,
        weatherConditions: validatedData.weatherConditions,
        notes: validatedData.notes,
      },
    });

    res.status(201).json(workoutLog);
  } catch (error: any) {
    console.error('Log workout error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to log workout' });
  }
}

export async function getWorkoutLogs(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate } = req.query;

    const where: any = { userId };

    if (startDate && endDate) {
      where.completedDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const workoutLogs = await prisma.workoutLog.findMany({
      where,
      include: {
        plannedWorkout: true,
      },
      orderBy: { completedDate: 'desc' },
    });

    res.json(workoutLogs);
  } catch (error) {
    console.error('Get workout logs error:', error);
    res.status(500).json({ error: 'Failed to fetch workout logs' });
  }
}

export async function updateWorkoutLog(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Verify ownership
    const existingLog = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!existingLog || existingLog.userId !== userId) {
      return res.status(404).json({ error: 'Workout log not found' });
    }

    const workoutLog = await prisma.workoutLog.update({
      where: { id },
      data: req.body,
    });

    res.json(workoutLog);
  } catch (error) {
    console.error('Update workout log error:', error);
    res.status(500).json({ error: 'Failed to update workout log' });
  }
}

export async function deleteWorkoutLog(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Verify ownership
    const existingLog = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!existingLog || existingLog.userId !== userId) {
      return res.status(404).json({ error: 'Workout log not found' });
    }

    await prisma.workoutLog.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete workout log error:', error);
    res.status(500).json({ error: 'Failed to delete workout log' });
  }
}
