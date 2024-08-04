import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { UserContext } from '../context'; import React from 'react';
import CustomButton from '../components/CustomButton';
import icons from '@/constants/icons';
import { router } from 'expo-router';

const Saved = () => {
  const { user } = React.useContext(UserContext);
  const handleGoBack = () => {router.back()}

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <View className="flex-row items-cente pt-4">
        <TouchableOpacity onPress={handleGoBack} className="px-4 absolute pt-5">
          <Image source={icons.leftArrow} resizeMode='contain' className='w-[20px] h-[20px]' tintColor={"#2e2a72"} />
        </TouchableOpacity>
        <Text className="text-tertiary font-poppinsBold text-2xl mx-auto pb-4">Saved</Text>
      </View>
    </SafeAreaView>
  );
}

export default Saved