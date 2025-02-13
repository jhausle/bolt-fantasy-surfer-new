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

// Simulated roster data since we can't scrape Fantasy Surfer directly
const DEFAULT_ROSTER = [
  'John John Florence',
  'Gabriel Medina',
  'Filipe Toledo',
  'Griffin Colapinto',
  'Ethan Ewing',
  'Jack Robinson',
  'Italo Ferreira',
  'Kanoa Igarashi'
];

async function getFantasySurferRoster(userId: string) {
  try {
    // For now, return the default roster
    // In production, this would need to be replaced with actual data from Fantasy Surfer
    return DEFAULT_ROSTER;
  } catch (error) {
    console.error('Error getting Fantasy Surfer roster:', error);
    return null;
  }
}

async function updateUserFantasySurferRoster(user: User, contest_id: string) {
  if (!user.fantasy_surfer_id) {
    console.error('No Fantasy Surfer ID for user:', user.email);
    return false;
  }

  const surferNames = await getFantasySurferRoster(user.fantasy_surfer_id);
  if (!surferNames || surferNames.length < 8) {
    console.error('Not enough surfers found in Fantasy Surfer roster');
    return false;
  }

  const surferPromises = surferNames.map(async (fullName) => {
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');
    return {
      name: fullName,
      id: await getSurferByName(firstName, lastName)
    };
  });

  const surfers = await Promise.all(surferPromises);
  const validSurfers = surfers.filter(s => s.id !== null);

  if (validSurfers.length < 8) {
    console.error('Not enough valid surfers found for Fantasy Surfer roster');
    return false;
  }

  const { error } = await supabase
    .from('fantasy_surfer_rosters')
    .upsert({
      user_id: user.id,
      contest_id,
      surfer_1_id: validSurfers[0].id!,
      surfer_1_price: 0,
      surfer_2_id: validSurfers[1].id!,
      surfer_2_price: 0,
      surfer_3_id: validSurfers[2].id!,
      surfer_3_price: 0,
      surfer_4_id: validSurfers[3].id!,
      surfer_4_price: 0,
      surfer_5_id: validSurfers[4].id!,
      surfer_5_price: 0,
      surfer_6_id: validSurfers[5].id!,
      surfer_6_price: 0,
      surfer_7_id: validSurfers[6].id!,
      surfer_7_price: 0,
      surfer_8_id: validSurfers[7].id!,
      surfer_8_price: 0
    }, {
      onConflict: 'user_id,contest_id'
    });

  if (error) {
    console.error('Error updating Fantasy Surfer roster:', error);
    return false;
  }

  return true;
}

export async function updateAllFantasySurferRosters(contest_id: string) {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .not('fantasy_surfer_id', 'is', null);

  if (error || !users) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      message: 'Failed to fetch users'
    };
  }

  const results = await Promise.all(
    users.map(async (user) => {
      const success = await updateUserFantasySurferRoster(user, contest_id);
      return {
        user: user.email,
        success
      };
    })
  );

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    success: true,
    message: `Updated ${successful} Fantasy Surfer rosters, ${failed} failed`,
    details: results
  };
}