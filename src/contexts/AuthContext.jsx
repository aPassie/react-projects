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
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user is admin
      const isUserAdmin = ADMIN_EMAILS.includes(result.user.email);
      console.log('Is user admin:', isUserAdmin, 'Email:', result.user.email); // Debug log
      
      // Create or update user document in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      const userData = {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        isAdmin: isUserAdmin,
        updatedAt: new Date().toISOString(),
      };

      if (!userSnap.exists()) {
        // New user - set all fields
        await setDoc(userRef, {
          ...userData,
          createdAt: new Date().toISOString(),
          completedProjects: [],
          projectProgress: {},
          points: 0,
          badges: []
        });
      } else {
        // Existing user - update fields
        await setDoc(userRef, userData, { merge: true });
      }

      // Set admin status in state
      setIsAdmin(isUserAdmin);
      console.log('Admin status set to:', isUserAdmin); // Debug log
      
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
        // Check if user is admin
        const isUserAdmin = ADMIN_EMAILS.includes(user.email);
        console.log('Auth state changed - Is admin:', isUserAdmin, 'Email:', user.email); // Debug log
        
        try {
          // Get user data from Firestore
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            // Always use the current admin status based on email
            const updatedUser = {
              ...user,
              ...userData,
              isAdmin: isUserAdmin
            };
            
            // Update Firestore if admin status changed
            if (userData.isAdmin !== isUserAdmin) {
              await setDoc(userRef, { isAdmin: isUserAdmin }, { merge: true });
            }
            
            setCurrentUser(updatedUser);
          } else {
            setCurrentUser({ ...user, isAdmin: isUserAdmin });
          }
          
          setIsAdmin(isUserAdmin);
        } catch (error) {
          console.error('Error fetching user data:', error);
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