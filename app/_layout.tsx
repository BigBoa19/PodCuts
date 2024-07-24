import React, { useEffect } from 'react';
import { SplashScreen, Stack } from 'expo-router'; import { useFonts } from 'expo-font';
import useUserData from '../functions/useUserData'; import { UserContext } from './context';
import TrackPlayer from 'react-native-track-player';

SplashScreen.preventAutoHideAsync();

TrackPlayer.registerPlaybackService(() => require('./service'));

const RootLayout = () => {
  const userData = useUserData();

  const [fontsLoaded,error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin" : require("../assets/fonts/Poppins-Thin.ttf"),
  })
  
  useEffect(() => {
    if(error) throw error;
    if(fontsLoaded) SplashScreen.hideAsync();
  }
  , [fontsLoaded,error])
  if (!fontsLoaded && !error) return null;
  
  
  return (
    <UserContext.Provider value={{ user: userData.user, username: userData.username }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </UserContext.Provider>
  )
}

export default RootLayout