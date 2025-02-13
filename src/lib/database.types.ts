export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      surfers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          country: string | null
          birth_date: string | null
          stance: 'regular' | 'goofy' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          country?: string | null
          birth_date?: string | null
          stance?: 'regular' | 'goofy' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          country?: string | null
          birth_date?: string | null
          stance?: 'regular' | 'goofy' | null
          created_at?: string
          updated_at?: string
        }
      }
      contests: {
        Row: {
          id: string
          name: string
          description: string | null
          year: number
          country: string | null
          start_date: string
          end_date: string
          is_active: boolean
          is_completed: boolean
          last_updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          year: number
          country?: string | null
          start_date: string
          end_date: string
          is_active?: boolean
          is_completed?: boolean
          last_updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          year?: number
          country?: string | null
          start_date?: string
          end_date?: string
          is_active?: boolean
          is_completed?: boolean
          last_updated_at?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          secondary_email: string | null
          first_name: string | null
          last_name: string | null
          wsl_name: string | null
          wsl_id: string | null
          fantasy_surfer_name: string | null
          fantasy_surfer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          secondary_email?: string | null
          first_name?: string | null
          last_name?: string | null
          wsl_name?: string | null
          wsl_id?: string | null
          fantasy_surfer_name?: string | null
          fantasy_surfer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          secondary_email?: string | null
          first_name?: string | null
          last_name?: string | null
          wsl_name?: string | null
          wsl_id?: string | null
          fantasy_surfer_name?: string | null
          fantasy_surfer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      fantasy_surfer_rosters: {
        Row: {
          id: string
          user_id: string
          contest_id: string
          surfer_1_id: string
          surfer_1_price: number
          surfer_2_id: string
          surfer_2_price: number
          surfer_3_id: string
          surfer_3_price: number
          surfer_4_id: string
          surfer_4_price: number
          surfer_5_id: string
          surfer_5_price: number
          surfer_6_id: string
          surfer_6_price: number
          surfer_7_id: string
          surfer_7_price: number
          surfer_8_id: string
          surfer_8_price: number
          surfer_alt_id: string | null
          surfer_alt_price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contest_id: string
          surfer_1_id: string
          surfer_1_price: number
          surfer_2_id: string
          surfer_2_price: number
          surfer_3_id: string
          surfer_3_price: number
          surfer_4_id: string
          surfer_4_price: number
          surfer_5_id: string
          surfer_5_price: number
          surfer_6_id: string
          surfer_6_price: number
          surfer_7_id: string
          surfer_7_price: number
          surfer_8_id: string
          surfer_8_price: number
          surfer_alt_id?: string | null
          surfer_alt_price?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contest_id?: string
          surfer_1_id?: string
          surfer_1_price?: number
          surfer_2_id?: string
          surfer_2_price?: number
          surfer_3_id?: string
          surfer_3_price?: number
          surfer_4_id?: string
          surfer_4_price?: number
          surfer_5_id?: string
          surfer_5_price?: number
          surfer_6_id?: string
          surfer_6_price?: number
          surfer_7_id?: string
          surfer_7_price?: number
          surfer_8_id?: string
          surfer_8_price?: number
          surfer_alt_id?: string | null
          surfer_alt_price?: number | null
          created_at?: string
        }
      }
      world_surf_league_rosters: {
        Row: {
          id: string
          user_id: string
          contest_id: string
          surfer_a1_id: string
          surfer_a2_id: string
          surfer_b1_id: string
          surfer_b2_id: string
          surfer_b3_id: string
          surfer_b4_id: string
          surfer_c1_id: string
          surfer_c2_id: string
          power_surfer_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contest_id: string
          surfer_a1_id: string
          surfer_a2_id: string
          surfer_b1_id: string
          surfer_b2_id: string
          surfer_b3_id: string
          surfer_b4_id: string
          surfer_c1_id: string
          surfer_c2_id: string
          power_surfer_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contest_id?: string
          surfer_a1_id?: string
          surfer_a2_id?: string
          surfer_b1_id?: string
          surfer_b2_id?: string
          surfer_b3_id?: string
          surfer_b4_id?: string
          surfer_c1_id?: string
          surfer_c2_id?: string
          power_surfer_id?: string
          created_at?: string
        }
      }
      surfer_points: {
        Row: {
          id: string
          surfer_id: string
          contest_id: string
          league_type: 'wsl' | 'fantasy_surfer' | 'total'
          points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          surfer_id: string
          contest_id: string
          league_type: 'wsl' | 'fantasy_surfer' | 'total'
          points: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          surfer_id?: string
          contest_id?: string
          league_type?: 'wsl' | 'fantasy_surfer' | 'total'
          points?: number
          created_at?: string
          updated_at?: string
        }
      }
      contest_standings: {
        Row: {
          id: string
          user_id: string
          contest_id: string
          league_type: 'wsl' | 'fantasy_surfer' | 'total'
          points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contest_id: string
          league_type: 'wsl' | 'fantasy_surfer' | 'total'
          points: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contest_id?: string
          league_type?: 'wsl' | 'fantasy_surfer' | 'total'
          points?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Enums: {
      league_type: 'wsl' | 'fantasy_surfer' | 'total'
      stance_type: 'regular' | 'goofy'
    }
  }
}