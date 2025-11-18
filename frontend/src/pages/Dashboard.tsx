import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TrainingPlan, WorkoutLog } from '@/types';
import { format } from 'date-fns';
import { Calendar, TrendingUp, Zap, Target } from 'lucide-react';

export function Dashboard() {
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plan, logs] = await Promise.all([
        apiClient.getActiveTrainingPlan().catch(() => null),
        apiClient.getWorkoutLogs().catch(() => []),
      ]);
      setTrainingPlan(plan);
      setRecentWorkouts(logs.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPlan = async () => {
    if (!trainingPlan) return;

    if (confirm('This will trigger AI to analyze your recent workouts and adjust next week\'s plan. Continue?')) {
      try {
        await apiClient.adjustWeeklyPlan(trainingPlan.currentWeek);
        alert('Your training plan has been adjusted based on AI analysis!');
        loadData();
      } catch (error: any) {
        alert('Failed to adjust plan: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!trainingPlan) {
    return (
      <Layout>
        <Card className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Active Training Plan
          </h2>
          <p className="text-gray-600 mb-6">
            Create a training plan to start your AI-powered training journey
          </p>
          <Link to="/setup">
            <Button>Create Training Plan</Button>
          </Link>
        </Card>
      </Layout>
    );
  }

  const weeksRemaining = trainingPlan.totalWeeks - trainingPlan.currentWeek + 1;
  const daysUntilRace = Math.ceil(
    (new Date(trainingPlan.raceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Training for {trainingPlan.goal.replace(/_/g, ' ')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Week</p>
                <p className="text-3xl font-bold text-gray-900">
                  {trainingPlan.currentWeek}
                </p>
                <p className="text-sm text-gray-500">of {trainingPlan.totalWeeks}</p>
              </div>
              <Calendar className="h-12 w-12 text-primary-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Days Until Race</p>
                <p className="text-3xl font-bold text-gray-900">{daysUntilRace}</p>
                <p className="text-sm text-gray-500">{weeksRemaining} weeks</p>
              </div>
              <Target className="h-12 w-12 text-green-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Workouts Logged</p>
                <p className="text-3xl font-bold text-gray-900">
                  {recentWorkouts.length}
                </p>
                <p className="text-sm text-gray-500">this week</p>
              </div>
              <Zap className="h-12 w-12 text-yellow-600" />
            </div>
          </Card>
        </div>

        <Card title="AI Training Adjustment">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-700 mb-2">
                Let AI analyze your week {trainingPlan.currentWeek} performance and adjust next week's workouts
              </p>
              <p className="text-sm text-gray-500">
                AI will review your completion rate, RPE, and performance metrics
              </p>
            </div>
            <Button onClick={handleAdjustPlan} className="ml-4">
              <TrendingUp className="h-4 w-4 mr-2" />
              Adjust Plan
            </Button>
          </div>
        </Card>

        <Card title="Recent Workouts">
          {recentWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No workouts logged yet</p>
              <Link to="/log">
                <Button className="mt-4">Log Your First Workout</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                        {workout.sportType}
                      </span>
                      <span className="font-medium text-gray-900">
                        {workout.workoutType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {format(new Date(workout.completedDate), 'MMM d, yyyy')} •{' '}
                      {workout.actualDuration} min
                      {workout.actualDistance && ` • ${workout.actualDistance} km`}
                      {workout.rpe && ` • RPE ${workout.rpe}/10`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/calendar">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">View Calendar</h3>
                <p className="text-sm text-gray-600 mt-1">
                  See your weekly training schedule
                </p>
              </div>
            </Card>
          </Link>
          <Link to="/log">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center py-6">
                <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">Log Workout</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Record your completed workout
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
