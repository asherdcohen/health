import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { generateWorkoutAdjustments, WeeklyWorkoutData } from '../services/ai.service';

const prisma = new PrismaClient();

export async function adjustWeeklyPlan(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { weekNumber } = req.body;

    // Get active training plan
    const trainingPlan = await prisma.trainingPlan.findFirst({
      where: { userId, isActive: true },
    });

    if (!trainingPlan) {
      return res.status(404).json({ error: 'No active training plan found' });
    }

    // Validate week number
    const targetWeek = weekNumber || trainingPlan.currentWeek;

    if (targetWeek < 1 || targetWeek > trainingPlan.totalWeeks) {
      return res.status(400).json({ error: 'Invalid week number' });
    }

    // Get planned workouts for the week
    const plannedWorkouts = await prisma.plannedWorkout.findMany({
      where: {
        trainingPlanId: trainingPlan.id,
        weekNumber: targetWeek,
      },
      include: {
        workoutLog: true,
      },
    });

    // Calculate week start and end dates
    const weekStart = new Date(trainingPlan.startDate);
    weekStart.setDate(weekStart.getDate() + (targetWeek - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Get all workout logs for the week (including unplanned workouts)
    const completedWorkouts = await prisma.workoutLog.findMany({
      where: {
        userId,
        completedDate: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
    });

    // Calculate metrics
    const completionRate = plannedWorkouts.length > 0
      ? (plannedWorkouts.filter(w => w.workoutLog).length / plannedWorkouts.length) * 100
      : 0;

    const avgRpe = completedWorkouts.length > 0
      ? completedWorkouts
          .filter(w => w.rpe !== null)
          .reduce((sum, w) => sum + (w.rpe || 0), 0) / completedWorkouts.filter(w => w.rpe !== null).length
      : undefined;

    const totalDistance = completedWorkouts
      .reduce((sum, w) => sum + (w.actualDistance || 0), 0);

    const totalDuration = completedWorkouts
      .reduce((sum, w) => sum + w.actualDuration, 0);

    // Prepare data for AI
    const weeklyData: WeeklyWorkoutData = {
      planned: plannedWorkouts.map(w => ({
        day: w.dayOfWeek,
        sportType: w.sportType,
        workoutType: w.workoutType,
        targetDuration: w.targetDuration,
        targetDistance: w.targetDistance,
        intensityZone: w.intensityZone,
        completed: !!w.workoutLog,
      })),
      completed: completedWorkouts.map(w => ({
        sportType: w.sportType,
        workoutType: w.workoutType,
        actualDuration: w.actualDuration,
        actualDistance: w.actualDistance,
        avgHeartRate: w.avgHeartRate,
        rpe: w.rpe,
        feeling: w.feeling,
      })),
      completionRate,
      avgRpe,
      totalDistance,
      totalDuration,
      goal: trainingPlan.goal,
      weekNumber: targetWeek,
      totalWeeks: trainingPlan.totalWeeks,
    };

    // Call AI service
    const aiResponse = await generateWorkoutAdjustments(weeklyData);

    // Save AI adjustment
    const aiAdjustment = await prisma.aIAdjustment.create({
      data: {
        userId,
        trainingPlanId: trainingPlan.id,
        weekNumber: targetWeek,
        analysisPrompt: JSON.stringify(weeklyData),
        aiResponse: JSON.stringify(aiResponse),
        adjustments: aiResponse.adjustments as any,
        completionRate,
        avgRpe,
        totalDistance,
        totalDuration,
      },
    });

    // Apply adjustments to next week's workouts
    await applyAdjustments(trainingPlan.id, aiResponse.adjustments, trainingPlan.startDate);

    // Update current week
    await prisma.trainingPlan.update({
      where: { id: trainingPlan.id },
      data: { currentWeek: targetWeek + 1 },
    });

    res.json({
      adjustment: aiAdjustment,
      analysis: aiResponse,
    });
  } catch (error) {
    console.error('AI adjustment error:', error);
    res.status(500).json({ error: 'Failed to generate workout adjustments' });
  }
}

export async function getAdjustmentHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const adjustments = await prisma.aIAdjustment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json(adjustments);
  } catch (error) {
    console.error('Get adjustment history error:', error);
    res.status(500).json({ error: 'Failed to fetch adjustment history' });
  }
}

// Helper function to apply AI-generated adjustments
async function applyAdjustments(
  trainingPlanId: string,
  adjustments: any,
  planStartDate: Date
) {
  const { weekNumber, modifications } = adjustments;

  for (const mod of modifications) {
    const scheduledDate = new Date(planStartDate);
    scheduledDate.setDate(scheduledDate.getDate() + (weekNumber - 1) * 7 + mod.day);

    if (mod.action === 'add') {
      await prisma.plannedWorkout.create({
        data: {
          trainingPlanId,
          weekNumber,
          dayOfWeek: mod.day,
          scheduledDate,
          sportType: mod.workout.sportType,
          workoutType: mod.workout.workoutType,
          targetDuration: mod.workout.targetDuration,
          targetDistance: mod.workout.targetDistance,
          intensityZone: mod.workout.intensityZone,
          description: mod.workout.description,
          notes: `AI Adjustment: ${mod.reason}`,
        },
      });
    } else if (mod.action === 'modify') {
      // Find existing workout for this day
      const existing = await prisma.plannedWorkout.findFirst({
        where: {
          trainingPlanId,
          weekNumber,
          dayOfWeek: mod.day,
        },
      });

      if (existing) {
        await prisma.plannedWorkout.update({
          where: { id: existing.id },
          data: {
            sportType: mod.workout.sportType,
            workoutType: mod.workout.workoutType,
            targetDuration: mod.workout.targetDuration,
            targetDistance: mod.workout.targetDistance,
            intensityZone: mod.workout.intensityZone,
            description: mod.workout.description,
            notes: `AI Adjustment: ${mod.reason}`,
          },
        });
      }
    } else if (mod.action === 'remove') {
      await prisma.plannedWorkout.deleteMany({
        where: {
          trainingPlanId,
          weekNumber,
          dayOfWeek: mod.day,
        },
      });
    }
  }
}
