import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

console.log('Ralli: Initializing Supabase with URL:', supabaseUrl.substring(0, 15) + '...');

export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey
)
