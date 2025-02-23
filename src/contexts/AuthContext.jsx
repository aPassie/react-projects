import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signInWithGoogle as supabaseSignInWithGoogle } from '../config/supabase';

const AuthContext = createContext();

// List of admin emails
const ADMIN_EMAILS = [
  'cloud1byps@gmail.com',
  'megamohit2006@gmail.com',
  'd2055960@gmail.com',
  // Add more admin emails as needed
];

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  async function signInWithGoogle() {
    try {
      const { user, session } = await supabaseSignInWithGoogle();
      
      if (!user) throw new Error('No user data returned from Supabase');
      
      // Check if user is admin
      const isUserAdmin = ADMIN_EMAILS.includes(user.email);
      console.log('Is user admin:', isUserAdmin, 'Email:', user.email);
      
      // Get or create user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const userData = {
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        is_admin: isUserAdmin,
        updated_at: new Date().toISOString(),
      };

      if (!profile) {
        // Create new user profile
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            ...userData,
            created_at: new Date().toISOString(),
            completed_projects: [],
            total_points: 0,
            current_streak: 0
          }]);
        
        if (insertError) throw insertError;
      } else {
        // Update existing user profile
        const { error: updateError } = await supabase
          .from('users')
          .update(userData)
          .eq('id', user.id);
        
        if (updateError) throw updateError;
      }

      setIsAdmin(isUserAdmin);
      setCurrentUser({ ...user, isAdmin: isUserAdmin });
      
      return { user, session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const user = session.user;
        const isUserAdmin = ADMIN_EMAILS.includes(user.email);
        
        try {
          // Get user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          setCurrentUser({ ...user, ...profile, isAdmin: isUserAdmin });
          setIsAdmin(isUserAdmin);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const user = session.user;
        const isUserAdmin = ADMIN_EMAILS.includes(user.email);
        setCurrentUser({ ...user, isAdmin: isUserAdmin });
        setIsAdmin(isUserAdmin);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    isAdmin,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 