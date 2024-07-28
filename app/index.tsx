import { Redirect } from "expo-router";
import React from "react";
import { View } from "react-native";
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
  React.useEffect(() => {
      setupPlayer();
  }, []);
  
  return (
    <View className="bg-secondary">
      <Redirect href='/sign-in'/>
    </View>
    
    
    // <SafeAreaView className="bg-primary h-full">
    //   <ScrollView contentContainerStyle={{height: "100%"}}>
    //     <View className="w-full flex justify-center items-center h-full px-4">
    //       <Image source={images.logo} className="w-[300px] h-[140px]" resizeMode="contain" />
    //       <View className="relative mt-5">
    //         <Text className="text-3xl text-secondary font-bold text-center font-poppinsExtraBold">
    //           Cut Through{"\n"}
    //           the Clutter{" "}
    //           <Text className="text-secondary-200"></Text>
    //         </Text>
    //       </View>
    //       <CustomButton title="Get Started" handlePress={() => {router.push('/sign-in')}} containerStyles='w-full mt-7'  />
    //     </View>
    //   </ScrollView>
    //   <StatusBar backgroundColor="#161622" style="light" />
    // </SafeAreaView>
  );
};

export default Welcome;


