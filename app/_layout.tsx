import React from 'react';
import { SplashScreen, Stack } from 'expo-router'; import { useFonts } from 'expo-font';
import useUserData from '../services/useUserData'; import { UserContext } from './context';
import TrackPlayer, { Event } from 'react-native-track-player';

SplashScreen.preventAutoHideAsync();

TrackPlayer.registerPlaybackService(() => async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteJumpForward, async () => {
    try {
      const position = await TrackPlayer.getPosition();
      const duration = await TrackPlayer.getDuration();
      const newPosition = Math.min(position + 15, duration);
      await TrackPlayer.seekTo(newPosition);
    } catch (error) {
      console.error('Failed to seek forward', error);
    }
  });
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async () => {
    try {
      const position = await TrackPlayer.getPosition();
      const newPosition = Math.max(position - 15, 0);
      await TrackPlayer.seekTo(newPosition);
    } catch (error) {
      console.error('Failed to seek backward', error);
    }
  });
});

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
  
  React.useEffect(() => {
    if(error) throw error;
    if(fontsLoaded) SplashScreen.hideAsync();
  }
  , [fontsLoaded,error])
  if (!fontsLoaded && !error) return null;
  
  
  return (
    <UserContext.Provider value={{ user: userData.user }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </UserContext.Provider>
  )
}

export default RootLayout