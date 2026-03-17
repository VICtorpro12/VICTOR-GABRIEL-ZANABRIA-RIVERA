import { auth, db } from './firebase';
import { 
  GoogleAuthProvider,
  signInWithPopup, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  increment
} from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;
  
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);
  
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
      createdAt: new Date().toISOString()
    });
  }

  return {
    id: user.uid,
    email: user.email!,
    displayName: user.displayName || user.email!.split('@')[0]
  };
};

export const logout = async () => {
  await signOut(auth);
};

export const getMe = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve({
          id: user.uid,
          email: user.email!,
          displayName: user.displayName || user.email!.split('@')[0]
        });
      } else {
        resolve(null);
      }
    });
  });
};

export const getProgress = async () => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  
  const q = query(collection(db, 'progress'), where('userId', '==', auth.currentUser.uid));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data());
};

export const saveProgress = async (branch: string, topic: string, correctAnswers: number, exercisesCompleted: number) => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  
  const progressId = `${auth.currentUser.uid}_${branch}_${topic}`;
  const progressRef = doc(db, 'progress', progressId);
  
  const docSnap = await getDoc(progressRef);
  
  if (docSnap.exists()) {
    await setDoc(progressRef, {
      correctAnswers: increment(correctAnswers),
      exercisesCompleted: increment(exercisesCompleted),
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } else {
    await setDoc(progressRef, {
      userId: auth.currentUser.uid,
      branch,
      topic,
      correctAnswers,
      exercisesCompleted,
      lastUpdated: new Date().toISOString()
    });
  }
  
  return { success: true };
};
