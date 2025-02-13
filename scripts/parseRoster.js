import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const ROSTER_URL = 'https://ctfantasy.worldsurfleague.com/team/1396031/roster';
const USER_ID = '47073f12-44c0-4899-bbc3-e9fce5562352';

async function parseRoster() {
  try {
    const response = await fetch(ROSTER_URL);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Find the roster sections
    const tiers = {
      A: [],
      B: [],
      C: []
    };

    // Parse each tier section
    $('.roster-section').each((i, section) => {
      const tierTitle = $(section).find('.tier-title').text().trim();
      const tier = tierTitle.charAt(0); // Get 'A', 'B', or 'C'
      
      if (tier in tiers) {
        $(section).find('.athlete-name').each((j, name) => {
          tiers[tier].push($(name).text().trim());
        });
      }
    });

    console.log('WSL Fantasy Roster for user:', USER_ID);
    console.log('Tier A:', tiers.A.join(', '));
    console.log('Tier B:', tiers.B.join(', '));
    console.log('Tier C:', tiers.C.join(', '));

    return tiers;
  } catch (error) {
    console.error('Error parsing roster:', error);
    return null;
  }
}

parseRoster();