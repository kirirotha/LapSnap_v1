import { createClient } from '@supabase/supabase-js';
import type { Lap } from '../types/lap';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const lapApi = {
  getAll: async (): Promise<Lap[]> => {
    const { data, error } = await supabase
      .from('laps')
      .select('id, athleteId, athleteName, plateNumber, lapTime, startTime, status')
      .in('status', ['IN_PROGRESS', 'COMPLETED'])
      .order('id', { ascending: false});

    if (error) {
      console.error('Error fetching laps:', error);
      throw error;
    }

    // Map startTime to timestamp for our interface
    const laps = (data || []).map((lap: any) => ({
      ...lap,
      timestamp: lap.startTime,
    }));

    return laps;
  },
};
