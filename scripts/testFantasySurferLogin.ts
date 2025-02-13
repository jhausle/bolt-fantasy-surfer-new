// @ts-check
import { loginToFantasySurfer } from '../src/lib/fantasySurferAuth.js';

async function testLogin() {
  const email = process.env.FANTASY_SURFER_EMAIL;
  const password = process.env.FANTASY_SURFER_PASSWORD;

  if (!email || !password) {
    console.error('Please provide FANTASY_SURFER_EMAIL and FANTASY_SURFER_PASSWORD environment variables');
    process.exit(1);
  }

  console.log('Attempting to login to Fantasy Surfer...');
  const result = await loginToFantasySurfer(email, password);

  if (result.success) {
    console.log('Login successful!');
    console.log('Token:', result.token);
  } else {
    console.error('Login failed:', result.error);
  }
}

testLogin().catch(console.error);