// @ts-check
import { supabase } from './supabase.js';

const FANTASY_SURFER_LOGIN_URL = 'https://fantasysurfer.com/surfer/login';

interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export async function loginToFantasySurfer(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(FANTASY_SURFER_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    // Log the raw response for debugging
    console.log('Login Response Status:', response.status);
    console.log('Login Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Login Response Body:', responseText);

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid response format from Fantasy Surfer');
    }

    if (data.token) {
      // Store the token in memory (you might want to store it more securely in production)
      return {
        success: true,
        token: data.token
      };
    } else {
      return {
        success: false,
        error: data.error || 'No token received'
      };
    }
  } catch (error) {
    console.error('Fantasy Surfer login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    };
  }
}

// Store the token in memory (in a real app, you'd want to use a more secure storage method)
let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
}