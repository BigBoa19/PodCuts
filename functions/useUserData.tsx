import { auth, db } from '../app/firebase';
import { doc, getDoc } from 'firebase/firestore'; import { onAuthStateChanged, User } from 'firebase/auth';
import React from 'react';

export default function useUserData() {
  const [user, setUser] = React.useState<User | null>(null);
  const [username, setUsername] = React.useState<string | null>(null);

  const getUsername = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().username;
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      return null;
    }
  }


  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user && user.uid) {
        const username = await getUsername(user.uid);
        setUsername(username);
      } else {
        setUsername(null);
      }
    });
    return () => unsubscribe();
  }, [])

  return { user, username }
}