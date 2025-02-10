import { db, collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy } from './firebase';

// Collection References
const usersRef = collection(db, 'users');
const projectProgressRef = collection(db, 'projectProgress');
const streaksRef = collection(db, 'streaks');

// User Functions
export const createUserDocument = async (userId, userData) => {
    try {
        await setDoc(doc(db, 'users', userId), {
            displayName: userData.displayName || '',
            email: userData.email,
            isAdmin: false,
            totalHoursSpent: 0,
            completedProjects: [],
            currentStreak: 0,
            totalPoints: 0,
            lastActive: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
};

// Project Progress Functions
export const updateProjectProgress = async (userId, projectId, progressData) => {
    try {
        const progressRef = doc(db, 'projectProgress', `${userId}_${projectId}`);
        await setDoc(progressRef, {
            userId,
            projectId,
            status: progressData.status,
            completedAt: progressData.status === 'completed' ? new Date() : null,
            timeSpent: progressData.timeSpent || 0,
            points: progressData.points || 0,
            updatedAt: new Date()
        }, { merge: true });

        // Update user stats if project is completed
        if (progressData.status === 'completed') {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();

            await updateDoc(userRef, {
                completedProjects: [...(userData.completedProjects || []), projectId],
                totalPoints: (userData.totalPoints || 0) + (progressData.points || 0),
                totalHoursSpent: (userData.totalHoursSpent || 0) + (progressData.timeSpent || 0),
                updatedAt: new Date()
            });
        }
    } catch (error) {
        console.error('Error updating project progress:', error);
        throw error;
    }
};

// Streak Functions
export const updateUserStreak = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const streakRef = doc(db, 'streaks', userId);
        const today = new Date();

        const streakDoc = await getDoc(streakRef);
        const streakData = streakDoc.data() || { currentStreak: 0, lastActiveDate: null };

        const lastActive = streakData.lastActiveDate?.toDate() || today;
        const daysSinceLastActive = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

        let newStreak = streakData.currentStreak;
        if (daysSinceLastActive <= 1) {
            newStreak += 1;
        } else {
            newStreak = 1;
        }

        await updateDoc(streakRef, {
            currentStreak: newStreak,
            lastActiveDate: today,
            longestStreak: Math.max(newStreak, streakData.longestStreak || 0),
            streakHistory: [
                ...(streakData.streakHistory || []),
                { date: today.toISOString().split('T')[0], completed: true }
            ]
        });

        await updateDoc(userRef, {
            currentStreak: newStreak,
            lastActive: today
        });

        return newStreak;
    } catch (error) {
        console.error('Error updating user streak:', error);
        throw error;
    }
};

// Leaderboard Functions
export const calculateUserRank = async (userId) => {
    try {
        const usersQuery = query(
            collection(db, 'users'),
            where('isAdmin', '==', false),
            orderBy('completedProjects', 'desc'),
            orderBy('totalPoints', 'desc')
        );
        
        const snapshot = await getDocs(usersQuery);
        const users = snapshot.docs;
        
        const userRank = users.findIndex(doc => doc.id === userId) + 1;
        const totalUsers = users.length;
        
        return { rank: userRank, totalUsers };
    } catch (error) {
        console.error('Error calculating user rank:', error);
        throw error;
    }
};

export const getUserStats = async (userId) => {
    try {
        // Get user document
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            throw new Error('User not found');
        }
        const userData = userDoc.data();

        // Get project completions
        const completionsQuery = query(
            collection(db, 'projectCompletions'),
            where('userId', '==', userId),
            where('status', '==', 'completed')
        );
        const completionsSnapshot = await getDocs(completionsQuery);

        // Calculate rank
        const rankData = await calculateUserRank(userId);

        return {
            hoursSpent: userData.totalHoursSpent || 0,
            projectsDone: completionsSnapshot.size,
            currentStreak: userData.currentStreak || 0,
            leaderboardRank: rankData.rank
        };
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw error;
    }
}; 