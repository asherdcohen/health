import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Layout } from '@/components/Layout';
import { TrainingGoal } from '@/types';

export function Setup() {
  const [goal, setGoal] = useState<TrainingGoal>(TrainingGoal.HALF_MARATHON);
  const [startDate, setStartDate] = useState('');
  const [raceDate, setRaceDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.createTrainingPlan({
        goal,
        startDate: new Date(startDate).toISOString(),
        raceDate: new Date(raceDate).toISOString(),
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create training plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card title="Set Up Your Training Plan">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as TrainingGoal)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={TrainingGoal.HALF_MARATHON}>Half Marathon</option>
                <option value={TrainingGoal.MARATHON}>Marathon</option>
                <option value={TrainingGoal.HALF_IRONMAN}>Half Ironman</option>
                <option value={TrainingGoal.IRONMAN}>Ironman</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Race Date
              </label>
              <input
                type="date"
                value={raceDate}
                onChange={(e) => setRaceDate(e.target.value)}
                required
                min={startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating plan...' : 'Create Training Plan'}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
