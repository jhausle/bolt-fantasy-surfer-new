import { supabase } from './supabase';
import type { Database } from './database.types';

type User = Database['public']['Tables']['users']['Row'];

async function getSurferByName(firstName: string, lastName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('surfers')
    .select('id')
    .eq('first_name', firstName)
    .eq('last_name', lastName)
    .single();

  if (error || !data) {
    console.error('Error finding surfer:', firstName, lastName, error);
    return null;
  }

  return data.id;
}

export async function updateAllRosters(contest_id: string) {
  try {
    // Get all users with WSL IDs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .not('wsl_id', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      throw new Error('No users found with WSL IDs');
    }

    console.log(`Found ${users.length} users with WSL IDs`);

    // Call the fetch-wsl-roster function
    const { data, error } = await supabase.functions.invoke('fetch-wsl-roster', {
      body: { contestId: contest_id }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Failed to fetch rosters: ${error.message}`);
    }

    if (!data?.rosters) {
      throw new Error('No roster data received');
    }

    return {
      success: true,
      message: `Fetched ${data.successfulFetches} rosters, ${data.failedFetches} failed`,
      details: data.rosters.map(roster => ({
        user: roster.userId,
        success: true
      }))
    };

  } catch (error) {
    console.error('Error updating rosters:', error);
    throw error;
  }
}