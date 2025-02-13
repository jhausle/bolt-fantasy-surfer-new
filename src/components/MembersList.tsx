import React, { useEffect, useState } from 'react';
import { Crown, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import MemberRoster from './MemberRoster';

type User = Database['public']['Tables']['users']['Row'];
type Contest = Database['public']['Tables']['contests']['Row'];

const MembersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('email');

        if (usersError) {
          throw usersError;
        }

        setUsers(usersData || []);

        // Fetch active contest or most recent contest
        const { data: contestData, error: contestError } = await supabase
          .from('contests')
          .select('*')
          .or('is_active.eq.true,end_date.lt.now()')
          .order('end_date', { ascending: false })
          .limit(1)
          .single();

        if (contestError && contestError.code !== 'PGRST116') {
          throw contestError;
        }

        if (contestData) {
          setSelectedContest(contestData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Loading users...</div>
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">League Members</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
            onClick={() => setSelectedUser(user)}
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${user.first_name || ''} ${user.last_name || ''}`
                  )}&background=random`}
                  alt={user.email}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
                  {user.first_name} {user.last_name}
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <User size={16} className="mr-1" />
                  <span>Member since {new Date(user.created_at).getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedUser && selectedContest && (
        <MemberRoster
          user={selectedUser}
          contest={selectedContest}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default MembersList;