import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { load } from 'https://esm.sh/cheerio@1.0.0-rc.12'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Surfer {
  name: string;
  ownership: string;
  points: number;
  rank: string;
  cost: string;
}

interface ContestHistory {
  name: string;
  totalPoints: number;
  rank: string;
  totalSpent: string;
  surfers: Surfer[];
}

interface TeamRoster {
  userId: string;
  fantasyId: string;
  contests: ContestHistory[];
}

class CookieJar {
  private cookies: Map<string, string> = new Map();

  setCookie(cookieHeader: string) {
    console.log('Raw Set-Cookie header:', cookieHeader);
    const cookies = cookieHeader.split(',').map(c => c.trim());
    console.log('Split cookies:', cookies);
    
    for (const cookie of cookies) {
      console.log('Processing cookie:', cookie);
      const [cookieMain] = cookie.split(';');
      console.log('Cookie main part:', cookieMain);
      const [key, value] = cookieMain.split('=');
      console.log(`Setting cookie: ${key} = ${value}`);
      this.cookies.set(key, value);
    }

    console.log('Current cookie jar contents:', this.cookies);
  }

  getCookieHeader(): string {
    const header = Array.from(this.cookies.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    console.log('Generated cookie header:', header);
    return header;
  }

  get(name: string): string | undefined {
    const value = this.cookies.get(name);
    console.log(`Getting cookie ${name}:`, value);
    return value;
  }
}

async function loginToFantasySurfer(): Promise<CookieJar> {
  console.log('\nAttempting to login to Fantasy Surfer...');
  
  const jar = new CookieJar();
  const formBody = new URLSearchParams({
    'password': '8c03a203fa67e8cfb35c9ff32b5f46cb09c90562',
    'username': 'jthausle11@yahoo.com',
    'legacy_password': 'Mbenga28',
    'persistent': 'on',
    'submit': 'Login'
  }).toString();

  console.log('Login request body:', formBody);

  const response = await fetch('https://fantasy.surfer.com/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    body: formBody,
    redirect: 'manual' // Don't follow redirects automatically
  });

  console.log('\nLogin response status:', response.status);
  console.log('Login response headers:', Object.fromEntries(response.headers.entries()));

  // Get Set-Cookie header
  const setCookie = response.headers.get('set-cookie');
  console.log('Login Set-Cookie header:', setCookie);
  
  if (setCookie) {
    jar.setCookie(setCookie);
  } else {
    console.warn('No Set-Cookie header in login response');
  }

  const sessionId = jar.get('PHPSESSID');
  if (!sessionId) {
    throw new Error('PHPSESSID not found in cookies');
  }

  console.log('Extracted PHPSESSID:', sessionId);
  
  // Follow redirect with cookies if needed
  if (response.status === 302 || response.status === 301) {
    const location = response.headers.get('location');
    console.log('\nFollowing redirect to:', location);
    
    if (location) {
      const redirectResponse = await fetch(location, {
        headers: {
          'Cookie': jar.getCookieHeader(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      console.log('Redirect response status:', redirectResponse.status);
      console.log('Redirect response headers:', Object.fromEntries(redirectResponse.headers.entries()));

      const redirectSetCookie = redirectResponse.headers.get('set-cookie');
      console.log('Redirect Set-Cookie header:', redirectSetCookie);
      
      if (redirectSetCookie) {
        jar.setCookie(redirectSetCookie);
      } else {
        console.warn('No Set-Cookie header in redirect response');
      }
    }
  }

  return jar;
}

async function fetchRoster(fantasyId: string, jar: CookieJar): Promise<{ contests: ContestHistory[] }> {
  console.log(`\nFetching Fantasy Surfer roster for ID: ${fantasyId}`);
  console.log('Using cookies:', jar.getCookieHeader());
  
  const response = await fetch(`https://fantasy.surfer.com/team/mens/?user=${fantasyId}`, {
    method: 'GET',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Cookie': jar.getCookieHeader()
    }
  });

  console.log('Roster fetch response status:', response.status);
  console.log('Roster fetch response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const html = await response.text();
  console.log('Received HTML length:', html.length);

  const $ = load(html);
  const contests: ContestHistory[] = [];

  // Find the history section
  const historySection = $('#History');
  console.log(`Found history section: ${historySection.length > 0 ? 'yes' : 'no'}`);

  // Process each history row
  historySection.find('.history-row').each((_, row) => {
    const $row = $(row);
    
    // Skip header row
    if ($row.hasClass('dark')) return;

    const contest: ContestHistory = {
      name: $row.find('.history-event b').text().trim(),
      totalPoints: parseInt($row.find('.history-score span').text().trim(), 10) || 0,
      rank: $row.find('.history-rank span').text().trim(),
      totalSpent: $row.find('.history-date span').text().trim(),
      surfers: []
    };

    // Process surfers in this contest
    $row.find('.module-inner-contrast .history-drop').each((i, surferRow) => {
      const $surferRow = $(surferRow);
      
      // Skip header row
      if ($surferRow.find('.header-heading').length > 0) return;

      const surferName = $surferRow.find('.history-surfer span').text().trim();
      if (!surferName) return;

      // Extract name and ownership percentage
      const match = surferName.match(/^(.+?)\s*\((\d+)%\)$/);
      if (!match) return;

      contest.surfers.push({
        name: match[1],
        ownership: match[2] + '%',
        points: parseInt($surferRow.find('.history-price span').text().trim(), 10) || 0,
        rank: $surferRow.find('.history-place span').text().trim(),
        cost: $surferRow.find('.history-points span').text().trim()
      });
    });

    if (contest.name) {
      contests.push(contest);
    }
  });

  return { contests };
}

async function getSurferId(supabase: any, firstName: string, lastName: string): Promise<string | null> {
  try {
    // Normalize names by removing special characters and converting to lowercase
    const normalizeText = (text: string) => 
      text.toLowerCase()
         .replace(/['']/g, '') // Remove apostrophes
         .replace(/\s+/g, ' ')  // Normalize spaces
         .trim();

    const normalizedFirstName = normalizeText(firstName);
    const normalizedLastName = normalizeText(lastName);

    // Handle special cases first
    const specialCases: Record<string, [string, string]> = {
      'john florence': ['John', 'John Florence'],
      'leo fioravanti': ['Leonardo', 'Fioravanti'],
      'liam obrien': ['Liam', "O'Brien"],
      'connor oleary': ['Connor', "O'Leary"]
    };

    // Check both the full name and first name for special cases
    const fullName = `${normalizedFirstName} ${normalizedLastName}`;
    const firstNameOnly = normalizedFirstName;

    // Try special case match for full name first
    if (specialCases[fullName]) {
      const [mappedFirst, mappedLast] = specialCases[fullName];
      console.log(`Special case match (full name): "${fullName}" -> "${mappedFirst} ${mappedLast}"`);
      
      const { data: specialMatch, error: specialError } = await supabase
        .from('surfers')
        .select('id')
        .eq('first_name', mappedFirst)
        .eq('last_name', mappedLast)
        .limit(1);

      if (!specialError && specialMatch?.length > 0) {
        return specialMatch[0].id;
      }
    }

    // Try special case match for first name only
    if (specialCases[firstNameOnly]) {
      const [mappedFirst, mappedLast] = specialCases[firstNameOnly];
      console.log(`Special case match (first name): "${firstNameOnly}" -> "${mappedFirst} ${mappedLast}"`);
      
      const { data: specialMatch, error: specialError } = await supabase
        .from('surfers')
        .select('id')
        .eq('first_name', mappedFirst)
        .eq('last_name', mappedLast)
        .limit(1);

      if (!specialError && specialMatch?.length > 0) {
        return specialMatch[0].id;
      }
    }

    // Try exact match
    const { data: exactMatch, error: exactError } = await supabase
      .from('surfers')
      .select('id')
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .limit(1);

    if (!exactError && exactMatch?.length > 0) {
      return exactMatch[0].id;
    }

    // Try case-insensitive match
    const { data: fuzzyMatch, error: fuzzyError } = await supabase
      .from('surfers')
      .select('id, first_name, last_name')
      .or(`first_name.ilike.${firstName},first_name.ilike.${normalizedFirstName}`)
      .or(`last_name.ilike.${lastName},last_name.ilike.${normalizedLastName}`)
      .limit(1);

    if (!fuzzyError && fuzzyMatch?.length > 0) {
      console.log(`Fuzzy match: "${firstName} ${lastName}" -> "${fuzzyMatch[0].first_name} ${fuzzyMatch[0].last_name}"`);
      return fuzzyMatch[0].id;
    }

    // Handle compound first names
    if (firstName.includes(' ')) {
      const [first, ...rest] = firstName.split(' ');
      const newFirstName = first;
      const newLastName = [...rest, lastName].join(' ');

      console.log(`Trying compound name: "${newFirstName} ${newLastName}"`);

      const { data: compoundMatch, error: compoundError } = await supabase
        .from('surfers')
        .select('id, first_name, last_name')
        .or(`first_name.ilike.${newFirstName}`)
        .or(`last_name.ilike.${newLastName}`)
        .limit(1);

      if (!compoundError && compoundMatch?.length > 0) {
        console.log(`Compound match: "${firstName} ${lastName}" -> "${compoundMatch[0].first_name} ${compoundMatch[0].last_name}"`);
        return compoundMatch[0].id;
      }
    }

    console.error('No surfer found for:', firstName, lastName);
    return null;
  } catch (error) {
    console.error('Error finding surfer:', firstName, lastName, error);
    return null;
  }
}

async function updateFantasySurferData(
  supabase: any,
  userId: string,
  contestId: string,
  contest: ContestHistory
): Promise<boolean> {
  try {
    console.log(`\nUpdating Fantasy Surfer data for user ${userId}, contest ${contestId}`);

    // Convert surfer names to IDs
    const surferPromises = contest.surfers.map(async (surfer) => {
      const [firstName, ...lastNameParts] = surfer.name.split(' ');
      const lastName = lastNameParts.join(' ');
      const id = await getSurferId(supabase, firstName, lastName);
      return { ...surfer, id };
    });

    const surfers = await Promise.all(surferPromises);
    const validSurfers = surfers.filter(s => s.id !== null);

    // Check for minimum required surfers (1)
    if (validSurfers.length < 1) {
      throw new Error(`No valid surfers found in roster`);
    }

    // Parse costs to integers (remove $ and M)
    const parseCost = (cost: string) => parseInt(cost.replace(/[\$,M]/g, ''), 10) || 0;

    // Create base roster object with first surfer
    const rosterData: Record<string, any> = {
      user_id: userId,
      contest_id: contestId,
      surfer_1_id: validSurfers[0].id,
      surfer_1_price: parseCost(validSurfers[0].cost)
    };

    // Add additional surfers if available
    for (let i = 1; i < 8; i++) {
      if (validSurfers[i]) {
        rosterData[`surfer_${i + 1}_id`] = validSurfers[i].id;
        rosterData[`surfer_${i + 1}_price`] = parseCost(validSurfers[i].cost);
      }
    }

    // Insert or update roster
    const { error: rosterError } = await supabase
      .from('fantasy_surfer_rosters')
      .upsert(rosterData, {
        onConflict: 'user_id,contest_id'
      });

    if (rosterError) throw rosterError;

    // Update surfer points only for valid surfers
    const pointsPromises = validSurfers.map(surfer =>
      supabase
        .from('surfer_points')
        .upsert({
          surfer_id: surfer.id,
          contest_id: contestId,
          league_type: 'fantasy_surfer',
          points: surfer.points
        }, {
          onConflict: 'surfer_id,contest_id,league_type'
        })
    );

    await Promise.all(pointsPromises);

    // Update contest standings
    const { error: standingsError } = await supabase
      .from('contest_standings')
      .upsert({
        user_id: userId,
        contest_id: contestId,
        league_type: 'fantasy_surfer',
        points: contest.totalPoints
      }, {
        onConflict: 'user_id,contest_id,league_type'
      });

    if (standingsError) throw standingsError;

    return true;
  } catch (error) {
    console.error('Error updating Fantasy Surfer data:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // First, login to get cookie jar
    const jar = await loginToFantasySurfer();
    console.log('Successfully logged in with session ID:', jar.get('PHPSESSID'));

    // Get request body
    const { contestId } = await req.json();
    
    if (!contestId) {
      throw new Error('Missing contestId in request body');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users with Fantasy Surfer IDs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, fantasy_surfer_id, first_name, last_name')
      .not('fantasy_surfer_id', 'is', null);

    if (usersError) throw usersError;
    if (!users?.length) throw new Error('No users found with Fantasy Surfer IDs');

    console.log(`Found ${users.length} users with Fantasy Surfer IDs`);

    // Fetch roster for each user
    const results: TeamRoster[] = [];
    let successfulFetches = 0;
    let failedFetches = 0;

    for (const user of users) {
      try {
        console.log(`\nProcessing user ${user.first_name} ${user.last_name} (ID: ${user.id}, Fantasy ID: ${user.fantasy_surfer_id})`);
        const { contests } = await fetchRoster(user.fantasy_surfer_id!, jar);
        
        results.push({
          userId: user.id,
          fantasyId: user.fantasy_surfer_id!,
          contests
        });
        successfulFetches++;
      } catch (error) {
        console.error(`Error processing user ${user.first_name} ${user.last_name}:`, error);
        failedFetches++;
      }

      // Add a small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // After fetching rosters, update database
    for (const result of results) {
      for (const contest of result.contests) {
        try {
          const success = await updateFantasySurferData(
            supabase,
            result.userId,
            contestId,
            contest
          );
          
          if (!success) {
            console.error(`Failed to update database for user ${result.userId}`);
          }
        } catch (error) {
          console.error(`Error updating database for user ${result.userId}:`, error);
        }
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