import { auth } from '../app/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import React from 'react';

export default function useUserData() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [])

  return { user };
}