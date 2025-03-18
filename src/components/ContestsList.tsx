import React, { useState, useEffect } from 'react'
import { Calendar, Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import RosterUpdater from './RosterUpdater'

type Contest = Database['public']['Tables']['contests']['Row']

const ContestsList: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContestId, setSelectedContestId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContests() {
      try {
        const { data, error } = await supabase
          .from('contests')
          .select('*')
          .order('start_date', { ascending: false })

        if (error) {
          throw error
        }

        setContests(data || [])
      } catch (err) {
        console.error('Error fetching contests:', err)
        setError(err instanceof Error ? err.message : 'Failed to load contests')
      } finally {
        setLoading(false)
      }
    }

    fetchContests()
  }, [])

  useEffect(() => {
    console.log('Selected Contest ID changed:', selectedContestId)
  }, [selectedContestId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Loading contests...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Contests</h2>
      <RosterUpdater selectedContestId={selectedContestId || undefined} />
      <div className="space-y-4">
        {contests.map((contest) => (
          <div
            key={contest.id}
            className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer ${
              selectedContestId === contest.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => {
              console.log('Clicking contest:', contest.id)
              setSelectedContestId(prevId => {
                const newId = prevId === contest.id ? null : contest.id
                console.log('Setting new ID:', newId)
                return newId
              })
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {contest.name}
                </h3>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(contest.start_date).toLocaleDateString()} - {new Date(contest.end_date).toLocaleDateString()}
                </div>
                <p className="mt-1 text-sm text-gray-500">{contest.country}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <Trophy className={`w-6 h-6 ${contest.is_completed ? 'text-yellow-500' : 'text-gray-300'}`} />
                  <p className="mt-1 text-sm font-medium">
                    {contest.is_completed ? 'Completed' : contest.is_active ? 'Active' : 'Upcoming'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}