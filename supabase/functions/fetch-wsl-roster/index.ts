// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @deno-types="https://esm.sh/cheerio@1.0.0-rc.12"
import { load } from 'https://esm.sh/cheerio@1.0.0-rc.12'
// @deno-types="https://esm.sh/@supabase/supabase-js@2"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Surfer {
  name: string;
  country: string;
  isPowerSurfer: boolean;
}

interface Roster {
  A: Surfer[];
  B: Surfer[];
  C: Surfer[];
}

interface TeamRoster {
  userId: string;
  wslId: string;
  roster: Roster;
}

async function getSurferId(supabase: any, firstName: string, lastName: string): Promise<string | null> {
  try {
    // First try exact match
    const { data: exactMatch, error: exactError } = await supabase
      .from('surfers')
      .select('id')
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .limit(1);

    if (!exactError && exactMatch?.length > 0) {
      return exactMatch[0].id;
    }

    // If no exact match, try case-insensitive match
    const { data: fuzzyMatch, error: fuzzyError } = await supabase
      .from('surfers')
      .select('id')
      .ilike('first_name', firstName)
      .ilike('last_name', lastName)
      .limit(1);

    if (!fuzzyError && fuzzyMatch?.length > 0) {
      return fuzzyMatch[0].id;
    }

    // Special case for names with spaces
    if (firstName.includes(' ')) {
      const [first, ...rest] = firstName.split(' ');
      const newFirstName = first;
      const newLastName = [...rest, lastName].join(' ');

      const { data: spaceMatch, error: spaceError } = await supabase
        .from('surfers')
        .select('id')
        .eq('first_name', newFirstName)
        .eq('last_name', newLastName)
        .limit(1);

      if (!spaceError && spaceMatch?.length > 0) {
        return spaceMatch[0].id;
      }
    }

    console.error('No surfer found for:', firstName, lastName);
    return null;
  } catch (error) {
    console.error('Error finding surfer:', firstName, lastName, error);
    return null;
  }
}

const parseSurferRow = (row: cheerio.Element): Surfer | null => {
  const $ = load(row)
  const name = $row.find('.athlete-name').text().trim();
  const country = $row.find('.athlete-country-name').text().trim();
  
  console.log(`Parsing row for ${name || 'unknown'} from ${country || 'unknown country'}`);
  
  // Check for power surfer icon/indicator
  const isPowerSurfer = $row.find('.power-athlete').length > 0;
  console.log(`Is power surfer: ${isPowerSurfer}`);

  return name ? { name, country, isPowerSurfer } : null;
};

async function updateRosterInDatabase(supabase: any, userId: string, contestId: string, roster: Roster) {
  try {
    // Convert surfer names to IDs
    const surferPromises = Object.entries(roster).flatMap(([tier, surfers]) =>
      surfers.map(async (surfer) => {
        const [firstName, ...lastNameParts] = surfer.name.split(' ');
        const lastName = lastNameParts.join(' ');
        const id = await getSurferId(supabase, firstName, lastName);
        return { tier, surfer, id };
      })
    );

    const surfers = await Promise.all(surferPromises);
    const validSurfers = surfers.filter(s => s.id !== null);

    if (validSurfers.length < 8) {
      throw new Error(`Not enough valid surfers found in roster (found ${validSurfers.length}, need 8)`);
    }

    // Get surfers by tier
    const tierA = validSurfers.filter(s => s.tier === 'A');
    const tierB = validSurfers.filter(s => s.tier === 'B');
    const tierC = validSurfers.filter(s => s.tier === 'C');

    if (tierA.length < 2 || tierB.length < 4 || tierC.length < 2) {
      throw new Error(`Invalid roster structure: A(${tierA.length}/2), B(${tierB.length}/4), C(${tierC.length}/2)`);
    }

    // Find power surfer
    const powerSurfer = validSurfers.find(s => s.surfer.isPowerSurfer);
    if (!powerSurfer) {
      throw new Error('No power surfer found in roster');
    }

    // Create roster object
    const rosterData = {
      user_id: userId,
      contest_id: contestId,
      surfer_a1_id: tierA[0].id,
      surfer_a2_id: tierA[1].id,
      surfer_b1_id: tierB[0].id,
      surfer_b2_id: tierB[1].id,
      surfer_b3_id: tierB[2].id,
      surfer_b4_id: tierB[3].id,
      surfer_c1_id: tierC[0].id,
      surfer_c2_id: tierC[1].id,
      power_surfer_id: powerSurfer.id
    };

    // Insert or update roster
    const { error: rosterError } = await supabase
      .from('world_surf_league_rosters')
      .upsert(rosterData, {
        onConflict: 'user_id,contest_id'
      });

    if (rosterError) throw rosterError;

    return true;
  } catch (error) {
    console.error('Error updating database:', error);
    throw error;
  }
}

const fetchRoster = async (userId: string, stopNumber: number): Promise<Roster> => {
  console.log(`\nFetching roster for WSL ID: ${userId}`);
  
  const response = await fetch(`https://ctfantasy.worldsurfleague.com/team/${userId}/roster?gameStopNumber=${stopNumber}`, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const html = await response.text();
  console.log('Received HTML length:', html.length);

  const $ = load(html);
  const roster: Roster = {
    A: [],
    B: [],
    C: []
  };

  // Find all team roster sections
  const allSections = $('.team-roster');
  console.log(`Found ${allSections.length} team roster sections`);

  // Find the men's championship tour section
  const mensSections = allSections.filter((_, section) => {
    const tourName = $(section).find('.tour-name').text();
    console.log('Found section with tour name:', tourName);
    return tourName.includes("Men's Championship Tour");
  });
  console.log(`Found ${mensSections.length} men's sections`);

  const mensSection = mensSections.first();
  if (!mensSection.length) {
    throw new Error("Could not find men's championship tour section");
  }

  // Parse each tier
  ['A', 'B', 'C'].forEach((tier) => {
    console.log(`\nProcessing Tier ${tier}:`);
    
    // Find rows for this tier using class selector
    const tierSelector = `[class*="teamRosterSlot-${tier}"]`;
    console.log(`Looking for rows with selector: ${tierSelector}`);
    
    const rows = mensSection.find(tierSelector);
    console.log(`Found ${rows.length} rows for Tier ${tier}`);

    rows.each((index, row) => {
      console.log(`\nProcessing Tier ${tier} Row ${index + 1}:`);
      const surfer = parseSurferRow(row);
      if (surfer) {
        console.log(`Successfully parsed surfer:`, surfer);
        roster[tier].push(surfer);
      } else {
        console.log('Failed to parse surfer from row');
      }
    });

    console.log(`Total surfers in Tier ${tier}: ${roster[tier].length}`);
  });

  // Validate roster
  console.log('\nFinal roster counts:', {
    'Tier A': roster.A.length,
    'Tier B': roster.B.length,
    'Tier C': roster.C.length
  });

  if (roster.A.length !== 2 || roster.B.length !== 4 || roster.C.length !== 2) {
    console.error('Invalid roster structure:', JSON.stringify(roster, null, 2));
    throw new Error(`Failed to parse roster - incorrect number of surfers: A(${roster.A.length}/2), B(${roster.B.length}/4), C(${roster.C.length}/2)`);
  }

  return roster;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const { contestId } = await req.json();
    
    if (!contestId) {
      throw new Error('Missing contestId in request body');
    }

    // Get all users with WSL IDs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, wsl_id')
      .not('wsl_id', 'is', null);

    if (usersError) throw usersError;
    if (!users?.length) throw new Error('No users found with WSL IDs');

    console.log(`Processing ${users.length} users`);

    // Fetch rosters for each user
    const results: TeamRoster[] = [];
    let successfulFetches = 0;
    let failedFetches = 0;

    for (const user of users) {
      try {
        console.log(`\nProcessing user ${user.id} (WSL ID: ${user.wsl_id})`);
        const roster = await fetchRoster(user.wsl_id!, 1);
        
        // Update database with roster information
        await updateRosterInDatabase(supabase, user.id, contestId, roster);
        
        results.push({
          userId: user.id,
          wslId: user.wsl_id!,
          roster
        });
        successfulFetches++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        failedFetches++;
      }
    }

    return new Response(
      JSON.stringify({
        rosters: results,
        totalTeams: users.length,
        successfulFetches,
        failedFetches
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch/parse rosters',
        details: error.message
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});