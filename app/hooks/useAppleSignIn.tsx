import { useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { auth } from '../firebase';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const useAppleSignIn = (onSuccess: () => void, onError: (error: Error) => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const addUserToDatabase = async (user: any) => {
    const date = new Date();
    const dateString = date.toLocaleString();
    const usersDocRef = doc(db, 'users', user.uid);
    await setDoc(usersDocRef, { 
      email: user.email || null, 
      timestamp: dateString 
    }, { merge: true });
  };

  const promptAsync = async () => {
    if (Platform.OS !== 'ios') {
      onError(new Error('Apple Sign-In is only available on iOS'));
      return;
    }
    setIsLoading(true);
    try {
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (appleCredential.identityToken) {
        // Create Firebase credential using Apple's identity token
        const provider = new OAuthProvider('apple.com');
        const credential = provider.credential({
          idToken: appleCredential.identityToken,
        });

        // Sign in with Firebase
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;
        
        // Add user to database
        await addUserToDatabase(user);
        
        // Sign in success
        onSuccess();
      } else {
        throw new Error('No identityToken received from Apple.');
      }
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        console.log('User canceled Apple Sign-In.');
        // Don't call onError for user cancellation
      } else {
        onError(e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    promptAsync,
    isAuthRequestLoading: isLoading,
  };
}; 