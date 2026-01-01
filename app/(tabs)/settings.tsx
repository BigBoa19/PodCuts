import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, Alert, Linking } from 'react-native';
import { UserContext } from '../context'; import React from 'react';
import { auth, db } from '../firebase'; import { signOut, deleteUser } from 'firebase/auth';
import { doc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import CustomButton from '../components/CustomButton';
import { router } from 'expo-router';
import TrackPlayer from 'react-native-track-player';
import { AntDesign } from '@expo/vector-icons';

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

  const deleteAccount = async () => {
    if (!user) {
      Alert.alert("Error", "No user found");
      return;
    }

    try {
      const usersDocRef = doc(db, 'users', user.uid);
      const episodesCollectionRef = collection(usersDocRef, 'episodes');
      const episodesSnapshot = await getDocs(episodesCollectionRef);
      
      const deletePromises = episodesSnapshot.docs.map((episodeDoc) => 
        deleteDoc(doc(episodesCollectionRef, episodeDoc.id))
      );
      await Promise.all(deletePromises);

      await deleteDoc(usersDocRef);

      await deleteUser(user);

      TrackPlayer.reset();

      router.replace('/sign-in');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      Alert.alert(
        "Error",
        error.message || "Failed to delete account. Please try again.",
        [{ text: "OK" }]
      );
    }
  }

  const showDeleteAccountAlert = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: deleteAccount,
          style: "destructive"
        }
      ]
    );
  }

  const handleContactUs = () => {
    const email = 'ncdev1919@gmail.com'; // Replace with your actual support email
    const subject = 'PodCuts Support Request';
    const body = `Hello PodCuts Team,\n\n`; // Pre-filled body text
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch((err) => {
      Alert.alert(
        "Unable to open email",
        "Please send an email to support@podcuts.com",
        [{ text: "OK" }]
      );
    });
  }


  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <View className="flex-row items-cente pt-4">
        <TouchableOpacity onPress={handleGoBack} className="px-4 absolute pt-5">
          <AntDesign name="arrowleft" size={24} color="#2e2a72" />
        </TouchableOpacity>
        <Text className="text-tertiary font-poppinsBold text-2xl mx-auto pb-4">Settings</Text>
      </View>
      <ScrollView className="flex-1 mt-4">
      {/* <CustomButton title="Get Unlimited PodCuts" handlePress={() => {}} containerStyles='p-3 mx-2 bg-[#b35ad6]' textStyles='text-2xl font-poppinsBold text-tertiary'/> */}
      <Text className="text-tertiary font-poppinsBold text-2xl py-2 mx-auto">Account</Text>
      <Text className="text-tertiary font-poppinsBold text-base mx-auto">Email:  {user?.email}</Text>
      <View className="flex-row justify-center">
        <CustomButton title="Sign Out" handlePress={showSignOutAlert} containerStyles='p-3 mx-2' textStyles='text-base'/>
        <CustomButton title="Delete Account" handlePress={showDeleteAccountAlert} containerStyles='p-3' textStyles='text-base'/>
      </View>
      <Text className="text-tertiary font-poppinsBold text-2xl pb-2 pt-8 mx-auto">Support Us</Text>
      <Text className="text-tertiary font-poppinsBold text-base mx-auto">Rate Us</Text>
      <Text className="text-tertiary font-poppinsBold text-2xl pb-2 pt-8 mx-auto">General</Text>
      <TouchableOpacity onPress={handleContactUs} className="py-2">
        <Text className="text-tertiary font-poppinsBold text-base mx-auto">Contact Us</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Settings