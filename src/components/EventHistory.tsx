import React, { useState, useEffect } from 'react';
import { Calendar, Award, MapPin, BarChart as ChartBar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import ContestStandings from './ContestStandings';
import SurferStats from './SurferStats';

type Contest = Database['public']['Tables']['contests']['Row'];

const EventHistory: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [showSurferStats, setShowSurferStats] = useState(false);

  useEffect(() => {
    async function fetchContests() {
      try {
        const { data, error } = await supabase
          .from('contests')
          .select('*')
          .order('start_date', { ascending: true });

        if (error) {
          throw error;
        }

        setContests(data || []);
      } catch (err) {
        console.error('Error fetching contests:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contests');
      } finally {
        setLoading(false);
      }
    }

    fetchContests();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (selectedContest) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSelectedContest(null)}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to Events
          </button>
          <button
            onClick={() => setShowSurferStats(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ChartBar className="w-4 h-4" />
            Surfer Statistics
          </button>
        </div>
        <ContestStandings contest={selectedContest} />
        {showSurferStats && (
          <SurferStats
            contest={selectedContest}
            onClose={() => setShowSurferStats(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">2025 Championship Tour Events</h2>
      <div className="grid gap-6">
        {contests.map((contest) => {
          const startDate = new Date(contest.start_date);
          const endDate = new Date(contest.end_date);
          const isUpcoming = new Date() < startDate;
          const isActive = contest.is_active;
          const isCompleted = contest.is_completed;

          return (
            <button
              key={contest.id}
              onClick={() => setSelectedContest(contest)}
              className={`w-full text-left bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 ${
                isActive ? 'border-green-500' : 
                isCompleted ? 'border-blue-500' : 
                'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {contest.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {startDate.toLocaleDateString('en-US', { 
                      month: 'long',
                      day: 'numeric'
                    })} - {endDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    {contest.country}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <Award className={`w-6 h-6 ${
                      isCompleted ? 'text-blue-500' :
                      isActive ? 'text-green-500' :
                      'text-gray-300'
                    }`} />
                    <p className="mt-1 text-sm font-medium text-gray-600">
                      {isCompleted ? 'Completed' :
                       isActive ? 'Active' :
                       'Upcoming'}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default EventHistory;