import { Redirect } from "expo-router";
import React from "react";
import { View, SafeAreaView, Image, ActivityIndicator } from "react-native";
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const Index = () => { 
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);
  
  if (!isAuthChecked) {
    return (
      <SafeAreaView className="bg-secondary flex-1 justify-center items-center">
        
      </SafeAreaView>
    );
  }
  if (user) {
    return <Redirect href='/pods'/>;
  } else {
    return <Redirect href='/sign-in'/>;
  }
};

export default Index;