import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { UserContext } from '../context'; import React from 'react';
import { auth } from '../firebase'; import { signOut } from 'firebase/auth';
import CustomButton from '../components/CustomButton';
import icons from '@/constants/icons';
import { router } from 'expo-router';
import TrackPlayer from 'react-native-track-player';

const Settings = () => {
  const { user } = React.useContext(UserContext);
  const handleGoBack = () => {router.back()}

  const SignOut = async () => {
    try {
      await signOut(auth);
      TrackPlayer.reset();
      router.replace('/sign-in');
    } catch (error: any) {
      console.log(error);
    }
  }

  const showSignOutAlert = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "Sign Out", onPress: SignOut }
      ]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <View className="flex-row items-cente pt-4">
        <TouchableOpacity onPress={handleGoBack} className="px-4 absolute pt-5">
          <Image source={icons.leftArrow} resizeMode='contain' className='w-[20px] h-[20px]' tintColor={"#2e2a72"} />
        </TouchableOpacity>
        <Text className="text-tertiary font-poppinsBold text-2xl mx-auto pb-4">Settings</Text>
      </View>
      <ScrollView className="flex-1 mt-4">
      <CustomButton title="Get Unlimited PodCuts" handlePress={() => {}} containerStyles='p-3 mx-2 bg-[#b35ad6]' textStyles='text-2xl font-poppinsBold text-tertiary'/>
      <Text className="text-tertiary font-poppinsBold text-2xl py-2 mx-auto">Account</Text>
      <Text className="text-tertiary font-poppinsBold text-base mx-auto">Email:  {user?.email}</Text>
      <Text className="text-tertiary font-poppinsBold text-base mx-auto">Name:  {user?.displayName}</Text>
      <View className="flex-row justify-center">
        <CustomButton title="Sign Out" handlePress={showSignOutAlert} containerStyles='p-3 mx-2' textStyles='text-base'/>
        <CustomButton title="Delete Account" handlePress={() => {}} containerStyles='p-3' textStyles='text-base'/>
      </View>
      <Text className="text-tertiary font-poppinsBold text-2xl pb-2 pt-8 mx-auto">Support Us</Text>
      <Text className="text-tertiary font-poppinsBold text-base mx-auto">Rate Us</Text>
      <Text className="text-tertiary font-poppinsBold text-base mx-auto">Invite a Friend</Text>
      <Text className="text-tertiary font-poppinsBold text-2xl pb-2 pt-8 mx-auto">General</Text>
      <Text className="text-tertiary font-poppinsBold text-base mx-auto">Privacy Policy</Text>
      <Text className="text-tertiary font-poppinsBold text-base mx-auto">Terms of Service</Text>
      <Text className="text-tertiary font-poppinsBold text-base mx-auto">Contact Us</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Settings