import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView, KeyboardAvoidingView } from 'react-native'
import React from 'react'
import images from '@/constants/images'; import icons from '@/constants/icons'
import FormField from '../components/FormField'; import CustomButton from '../components/CustomButton'
import { Link, router } from 'expo-router'
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from "firebase/auth"; import { doc, setDoc } from 'firebase/firestore';

const SignUp = () => {
  const handleGoBack = () => {
    router.back()
  }
  const [form, setForm] = React.useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const createUser = async () => {
    setIsLoading(true)
    try {
      const response = await createUserWithEmailAndPassword(auth, form.email, form.password)
      const usersDocRef = doc(db, 'users', response.user.uid)
      try {
        setDoc(usersDocRef, { email: form.email });
        alert('Sign Up Successful')
      }
      catch (error: any) {
        console.log(error)
        alert('DataBase Input Failed: '+ error.message)
      }
    } catch (error: any) {
      console.log(error)
      alert('Sign Up Failed: '+ error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView className=' bg-secondary h-full'>
      <TouchableOpacity onPress={handleGoBack} className='p-4'>
        <Image source={icons.leftArrow} resizeMode='contain' className='w-[20px] h-[20px]' tintColor={"#2e2a72"} />
      </TouchableOpacity>
      <KeyboardAvoidingView behavior='padding' className='flex-1'>
        <ScrollView>
          <View className='flex-1 w-full justify-center px-4 my-6'>
            <Image
              source={images.logo}
              resizeMode='contain'
              className='w-[240px] h-[100px] object-center mx-auto'
            />

            <Text className="text-2xl font-semibold text-tertiary font-poppinsSemiBold">
                Sign Up to PodCuts
            </Text>

            <FormField // Email Text Field
              title='Email'
              value={form.email}
              placeholder='Enter your email'
              handleChangeText={(e) => setForm({...form, email: e})}
              otherStyles='mt-7'
              startCaps={false}
            />

            <FormField // Password Text Field
              title='Password'
              value={form.password}
              placeholder='Enter your password'
              handleChangeText={(e) => setForm({...form, password: e})}
              otherStyles='mt-7'
              startCaps={false}
            />

            <CustomButton // Login Button
              title='Sign Up'
              handlePress={createUser}
              containerStyles='mt-9'
              isLoading={isLoading}
            />

            <View className="flex justify-center pt-5 flex-row gap-2">
              <Text className="text-lg text-tertiary font-poppinsRegular">
                Have an account already?
              </Text>
              <Link
                href="/sign-in"
                className="text-lg font-poppinsSemiBold text-tertiary">
                Log In
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default SignUp