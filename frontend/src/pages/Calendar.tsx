import { useEffect, useState } from 'react';
import { apiClient } from '@/api/client';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { PlannedWorkout } from '@/types';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function Calendar() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [workouts, setWorkouts] = useState<PlannedWorkout[]>([]);
  const [trainingPlan, setTrainingPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeek();
  }, [currentWeek]);

  const loadWeek = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getWeeklyWorkouts(currentWeek);
      setTrainingPlan(data.trainingPlan);
      setWorkouts(data.workouts);
    } catch (error) {
      console.error('Failed to load week:', error);
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = trainingPlan && currentWeek < trainingPlan.totalWeeks;
  const canGoPrev = currentWeek > 1;

  const getWorkoutForDay = (dayOfWeek: number) => {
    return workouts.find((w) => w.dayOfWeek === dayOfWeek);
  };

  const getIntensityColor = (zone?: string) => {
    switch (zone) {
      case 'ZONE_1':
        return 'bg-green-100 text-green-700';
      case 'ZONE_2':
        return 'bg-blue-100 text-blue-700';
      case 'ZONE_3':
        return 'bg-yellow-100 text-yellow-700';
      case 'ZONE_4':
        return 'bg-orange-100 text-orange-700';
      case 'ZONE_5':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training Calendar</h1>
            {trainingPlan && (
              <p className="text-gray-600 mt-1">
                Week {currentWeek} of {trainingPlan.totalWeeks} •{' '}
                {trainingPlan.goal.replace(/_/g, ' ')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentWeek(currentWeek - 1)}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-4">Week {currentWeek}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentWeek(currentWeek + 1)}
              disabled={!canGoNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DAYS.map((day, index) => {
            const workout = getWorkoutForDay(index);
            const isCompleted = workout?.workoutLog;

            return (
              <Card key={day} className="relative">
                <div className="absolute top-4 right-4">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-3">{day}</h3>

                {workout ? (
                  <div className="space-y-3">
                    <div>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${getIntensityColor(
                          workout.intensityZone
                        )}`}
                      >
                        {workout.sportType}
                      </span>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">
                        {workout.workoutType.replace(/_/g, ' ')}
                      </p>
                      {workout.description && (
                        <p className="text-sm text-gray-600 mt-1">{workout.description}</p>
                      )}
                    </div>

                    <div className="text-sm text-gray-700 space-y-1">
                      {workout.targetDuration && (
                        <div>Duration: {workout.targetDuration} min</div>
                      )}
                      {workout.targetDistance && (
                        <div>Distance: {workout.targetDistance} km</div>
                      )}
                      {workout.targetPace && <div>Pace: {workout.targetPace}</div>}
                      {workout.intensityZone && (
                        <div>Intensity: {workout.intensityZone.replace('_', ' ')}</div>
                      )}
                    </div>

                    {workout.notes && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 italic">{workout.notes}</p>
                      </div>
                    )}

                    {isCompleted && workout.workoutLog && (
                      <div className="pt-2 border-t border-green-200 bg-green-50 -mx-6 -mb-6 px-6 py-3 rounded-b-lg">
                        <p className="text-sm font-medium text-green-900">Completed</p>
                        <p className="text-xs text-green-700 mt-1">
                          {workout.workoutLog.actualDuration} min
                          {workout.workoutLog.actualDistance &&
                            ` • ${workout.workoutLog.actualDistance} km`}
                          {workout.workoutLog.rpe && ` • RPE ${workout.workoutLog.rpe}/10`}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">Rest Day</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
