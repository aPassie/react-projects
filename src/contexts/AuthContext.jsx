import { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  getDoc
} from '../config/firebase';

const AuthContext = createContext();

// List of admin emails
const ADMIN_EMAILS = [
  'cloud1byps@gmail.com',  // Replace with your admin email
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
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user is admin
      const isUserAdmin = ADMIN_EMAILS.includes(result.user.email);
      
      // Create or update user document in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString(),
          isAdmin: isUserAdmin,
          completedProjects: [],
          projectProgress: {},
          points: 0,
          badges: []
        });
      }

      setIsAdmin(isUserAdmin);
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setIsAdmin(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isUserAdmin = ADMIN_EMAILS.includes(user.email);
        setIsAdmin(isUserAdmin);
        
        // Get user data from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCurrentUser({ ...user, ...userSnap.data() });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
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