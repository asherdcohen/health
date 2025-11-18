export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export enum TrainingGoal {
  HALF_MARATHON = 'HALF_MARATHON',
  MARATHON = 'MARATHON',
  HALF_IRONMAN = 'HALF_IRONMAN',
  IRONMAN = 'IRONMAN',
}

export enum SportType {
  RUN = 'RUN',
  BIKE = 'BIKE',
  SWIM = 'SWIM',
  STRENGTH = 'STRENGTH',
  REST = 'REST',
}

export enum IntensityZone {
  ZONE_1 = 'ZONE_1',
  ZONE_2 = 'ZONE_2',
  ZONE_3 = 'ZONE_3',
  ZONE_4 = 'ZONE_4',
  ZONE_5 = 'ZONE_5',
}

export interface TrainingPlan {
  id: string;
  userId: string;
  goal: TrainingGoal;
  startDate: string;
  raceDate: string;
  currentWeek: number;
  totalWeeks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlannedWorkout {
  id: string;
  trainingPlanId: string;
  weekNumber: number;
  dayOfWeek: number;
  scheduledDate: string;
  sportType: SportType;
  workoutType: string;
  targetDuration?: number;
  targetDistance?: number;
  targetPace?: string;
  intensityZone?: IntensityZone;
  description?: string;
  notes?: string;
  workoutLog?: WorkoutLog;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  plannedWorkoutId?: string;
  completedDate: string;
  sportType: SportType;
  workoutType: string;
  actualDuration: number;
  actualDistance?: number;
  actualPace?: string;
  avgHeartRate?: number;
  maxHeartRate?: number;
  calories?: number;
  elevationGain?: number;
  rpe?: number;
  feeling?: 'great' | 'good' | 'okay' | 'tired' | 'terrible';
  weatherConditions?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAdjustment {
  id: string;
  userId: string;
  trainingPlanId: string;
  weekNumber: number;
  analysisPrompt: string;
  aiResponse: string;
  adjustments: any;
  completionRate: number;
  avgRpe?: number;
  totalDistance?: number;
  totalDuration?: number;
  createdAt: string;
}
