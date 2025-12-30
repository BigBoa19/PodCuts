import { Redirect } from "expo-router";
import React from "react";
import { View, SafeAreaView, Image, ActivityIndicator } from "react-native";
import TrackPlayer, { Capability } from 'react-native-track-player';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import images from '@/constants/images';

const Welcome = () => { 
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = React.useState(false);
  const [isPlayerReady, setIsPlayerReady] = React.useState(false);

  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.JumpForward,
          Capability.JumpBackward
        ],
      });
      setIsPlayerReady(true);
    } catch (error) { 
      console.log(error);
      setIsPlayerReady(true);
    }
  }; 

  React.useEffect(() => {
    setupPlayer();
  }, []);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);
  
  // Wait for player setup and auth state to be determined
  if (!isPlayerReady || !isAuthChecked) {
    return (
      <SafeAreaView className="bg-secondary flex-1 justify-center items-center">
        <Image
          source={images.logo}
          resizeMode='contain'
          className='w-[240px] h-[100px]'
        />
        <ActivityIndicator size="large" color="#2e2a72" className='mt-4' />
      </SafeAreaView>
    );
  }
  if (user) {
    return <Redirect href='/pods'/>;
  } else {
    return <Redirect href='/sign-in'/>;
  }
};

export default Welcome;


