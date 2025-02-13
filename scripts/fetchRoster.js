import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const ROSTER_URL = 'https://ctfantasy.worldsurfleague.com/team/1396031/roster';

async function fetchRoster() {
  try {
    console.log('Fetching roster from:', ROSTER_URL);
    const response = await fetch(ROSTER_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    console.log('Received HTML length:', html.length);
    console.log('\nRaw HTML:\n', html.substring(0, 500) + '...');

    const $ = cheerio.load(html);
    
    // Find all athlete rows
    $('tr').each((i, row) => {
      console.log('\nRow', i + 1, 'classes:', $(row).attr('class'));
      console.log('Row', i + 1, 'content:', $(row).text().trim());
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

fetchRoster();