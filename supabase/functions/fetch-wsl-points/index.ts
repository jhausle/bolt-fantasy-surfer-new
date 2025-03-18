// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @deno-types="https://esm.sh/cheerio@1.0.0-rc.12"
import { load } from 'https://esm.sh/cheerio@1.0.0-rc.12'
// @deno-types="https://esm.sh/@supabase/supabase-js@2"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SurferPoints {
  name: string;
  country: string;
  tier: string;
  points: number;
  status: 'OUT' | 'INJ' | 'active';
}

async function updateSurferPoints(supabase: any, contestId: string, surferPoints: SurferPoints[]) {
  try {
    for (const surfer of surferPoints) {
      // Split name into first and last name
      const [firstName, ...lastNameParts] = surfer.name.split(' ');
      const lastName = lastNameParts.join(' ');

      // Get surfer ID
      const { data: surferData, error: surferError } = await supabase
        .from('surfers')
        .select('id')
        .eq('first_name', firstName)
        .eq('last_name', lastName)
        .limit(1);

      if (surferError) throw surferError;
      if (!surferData?.length) {
        console.error(`No surfer found for: ${surfer.name}`);
        continue;
      }

      // Update points
      const { error: pointsError } = await supabase
        .from('surfer_points')
        .upsert({
          surfer_id: surferData[0].id,
          contest_id: contestId,
          league_type: 'wsl',
          points: surfer.points
        }, {
          onConflict: 'surfer_id,contest_id,league_type'
        });

      if (pointsError) throw pointsError;
    }

    return true;
  } catch (error) {
    console.error('Error updating surfer points:', error);
    throw error;
  }
}

async function fetchPoints(stopNumber: number): Promise<SurferPoints[]> {
  const response = await fetch(`https://ctfantasy.worldsurfleague.com/athletes?gameStopNumber=${stopNumber}`, {
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
  const $ = load(html);
  const surferPoints: SurferPoints[] = [];

  // Find all rows in the table body
  $('tbody tr').each((_, row) => {
    const $row = $(row);
    
    // Get name and status from the athlete-name span
    const nameEl = $row.find('.athlete-name');
    const name = nameEl.text().trim();
    if (!name) return;

    // Get country from the athlete-country-name span
    const country = $row.find('.athlete-country-name').text().trim();
    
    // Get tier from the tier cell
    const tier = $row.find('.athleteFantasyEventTier.tier').text().trim();
    
    // Get total points from the last column
    const pointsText = $row.find('.total-points.last').text().trim();
    const points = parseFloat(pointsText) || 0;

    // Check for OUT/INJ status
    let status: 'OUT' | 'INJ' | 'active' = 'active';
    const statusEl = $row.find('.status span');
    if (statusEl.length) {
      const statusText = statusEl.text().trim();
      if (statusText === 'OUT') status = 'OUT';
      if (statusText === 'INJ') status = 'INJ';
    }

    surferPoints.push({
      name,
      country,
      tier,
      points,
      status
    });
  });

  return surferPoints;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const { contestId, stopNumber } = await req.json();
    
    if (!contestId) {
      throw new Error('Missing contestId in request body');
    }

    if (!stopNumber) {
      throw new Error('Missing stopNumber in request body');
    }

    const points = await fetchPoints(stopNumber);
    await updateSurferPoints(supabase, contestId, points);

    return new Response(
      JSON.stringify({ 
        success: true,
        surfers: points.length,
        points 
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
        error: 'Failed to fetch/parse points',
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