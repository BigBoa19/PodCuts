import { Redirect } from "expo-router";
import React from "react";
import { View, SafeAreaView, Text } from "react-native";
import TrackPlayer, {Capability} from 'react-native-track-player';

const Welcome = () => { 
  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious
        ],
      });
    } catch (error) { console.log(error); }
  }; 

  React.useEffect(() => {setupPlayer();}, []);
  
  return (
    <SafeAreaView className="bg-secondary">
      <Text>Splash Screen</Text>
      <Redirect href='/sign-in'/>
    </SafeAreaView>
  );
};

export default Welcome;


