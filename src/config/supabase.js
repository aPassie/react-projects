import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Regular client for authenticated users
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role key for bypassing RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.error('Google Sign In Error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }

    return data;
  } catch (err) {
    console.error('Sign In Error:', err);
    throw new Error('Failed to sign in with Google. Please try again later.');
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Database functions
export const getUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        display_name,
        is_admin,
        total_points,
        completed_projects,
        current_streak,
        badges,
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error in getUser:', err);
    throw new Error('Failed to fetch user data');
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select(`
        id,
        email,
        display_name,
        is_admin,
        total_points,
        completed_projects,
        current_streak,
        badges,
        created_at,
        updated_at
      `);

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error in updateUser:', err);
    throw new Error('Failed to update user data');
  }
};

export const getProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getProject = async (projectId) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
  if (error) throw error;
  return data;
};

export const createProject = async (projectData) => {
  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateProject = async (projectId, updates) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteProject = async (projectId) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  if (error) throw error;
};

export const getProjectProgress = async (userId, projectId) => {
  const { data, error } = await supabase
    .from('project_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data;
};

export const updateProjectProgress = async (userId, projectId, updates) => {
  const { data, error } = await supabase
    .from('project_progress')
    .upsert({
      user_id: userId,
      project_id: projectId,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .select();
  if (error) throw error;
  return data[0];
};

export const getLeaderboard = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        display_name,
        email,
        total_points,
        completed_projects,
        badges,
        current_streak
      `)
      .order('total_points', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error in getLeaderboard:', err);
    throw new Error('Failed to fetch leaderboard data');
  }
};

export const getSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const updateSettings = async (updates) => {
  const { data, error } = await supabase
    .from('settings')
    .update(updates)
    .eq('id', 'global')
    .select();
  if (error) throw error;
  return data[0];
}; 