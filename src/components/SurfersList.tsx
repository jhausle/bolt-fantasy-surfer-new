import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Surfer = Database['public']['Tables']['surfers']['Row']

const SurfersList: React.FC = () => {
  const [surfers, setSurfers] = useState<Surfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchSurfers() {
      try {
        const { data, error } = await supabase
          .from('surfers')
          .select('*')
          .order('last_name')

        if (error) {
          throw error
        }

        setSurfers(data || [])
      } catch (err) {
        console.error('Error fetching surfers:', err)
        setError(err instanceof Error ? err.message : 'Failed to load surfers')
      } finally {
        setLoading(false)
      }
    }

    fetchSurfers()
  }, [])

  const filteredSurfers = surfers.filter(surfer =>
    `${surfer.first_name} ${surfer.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Loading surfers...</div>
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">WSL Men's Championship Tour Surfers</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search surfers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSurfers.map((surfer) => (
          <div
            key={surfer.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {surfer.first_name} {surfer.last_name}
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{surfer.country || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stance</p>
                  <p className="font-medium capitalize">{surfer.stance || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SurfersList