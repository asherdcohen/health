import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SportType } from '@/types';

const WORKOUT_TYPES_BY_SPORT: Record<SportType, string[]> = {
  [SportType.RUN]: ['EASY_RUN', 'TEMPO_RUN', 'INTERVAL_RUN', 'LONG_RUN', 'RECOVERY_RUN', 'RACE_PACE_RUN'],
  [SportType.BIKE]: ['EASY_RIDE', 'TEMPO_RIDE', 'INTERVAL_RIDE', 'LONG_RIDE', 'RECOVERY_RIDE'],
  [SportType.SWIM]: ['EASY_SWIM', 'TEMPO_SWIM', 'INTERVAL_SWIM', 'LONG_SWIM', 'TECHNIQUE_SWIM'],
  [SportType.STRENGTH]: ['STRENGTH_TRAINING'],
  [SportType.REST]: ['REST_DAY'],
};

export function LogWorkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [sportType, setSportType] = useState<SportType>(SportType.RUN);
  const [workoutType, setWorkoutType] = useState('EASY_RUN');
  const [completedDate, setCompletedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [actualDuration, setActualDuration] = useState('');
  const [actualDistance, setActualDistance] = useState('');
  const [actualPace, setActualPace] = useState('');
  const [avgHeartRate, setAvgHeartRate] = useState('');
  const [maxHeartRate, setMaxHeartRate] = useState('');
  const [rpe, setRpe] = useState('');
  const [feeling, setFeeling] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Update workout type when sport changes
    const types = WORKOUT_TYPES_BY_SPORT[sportType];
    if (types.length > 0) {
      setWorkoutType(types[0]);
    }
  }, [sportType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.logWorkout({
        completedDate: new Date(completedDate).toISOString(),
        sportType,
        workoutType,
        actualDuration: parseInt(actualDuration),
        actualDistance: actualDistance ? parseFloat(actualDistance) : undefined,
        actualPace: actualPace || undefined,
        avgHeartRate: avgHeartRate ? parseInt(avgHeartRate) : undefined,
        maxHeartRate: maxHeartRate ? parseInt(maxHeartRate) : undefined,
        rpe: rpe ? parseInt(rpe) : undefined,
        feeling: feeling || undefined,
        notes: notes || undefined,
      });

      alert('Workout logged successfully!');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to log workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card title="Log Workout">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport Type *
                </label>
                <select
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value as SportType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value={SportType.RUN}>Run</option>
                  <option value={SportType.BIKE}>Bike</option>
                  <option value={SportType.SWIM}>Swim</option>
                  <option value={SportType.STRENGTH}>Strength</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Type *
                </label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {WORKOUT_TYPES_BY_SPORT[sportType].map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date *"
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                required
              />
              <Input
                label="Duration (minutes) *"
                type="number"
                value={actualDuration}
                onChange={(e) => setActualDuration(e.target.value)}
                required
                min="1"
                placeholder="60"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Distance (km)"
                type="number"
                step="0.1"
                value={actualDistance}
                onChange={(e) => setActualDistance(e.target.value)}
                placeholder="10.5"
              />
              <Input
                label="Pace (e.g., 5:30/km)"
                type="text"
                value={actualPace}
                onChange={(e) => setActualPace(e.target.value)}
                placeholder="5:30/km"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Average Heart Rate (bpm)"
                type="number"
                value={avgHeartRate}
                onChange={(e) => setAvgHeartRate(e.target.value)}
                placeholder="150"
              />
              <Input
                label="Max Heart Rate (bpm)"
                type="number"
                value={maxHeartRate}
                onChange={(e) => setMaxHeartRate(e.target.value)}
                placeholder="175"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RPE (Rate of Perceived Exertion)
                </label>
                <select
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select RPE</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} - {n <= 3 ? 'Easy' : n <= 6 ? 'Moderate' : n <= 8 ? 'Hard' : 'Max Effort'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did you feel?
                </label>
                <select
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select feeling</option>
                  <option value="great">Great</option>
                  <option value="good">Good</option>
                  <option value="okay">Okay</option>
                  <option value="tired">Tired</option>
                  <option value="terrible">Terrible</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="How was the workout? Any observations?"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Logging...' : 'Log Workout'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
