import React from 'react'; import { UserContext } from '../context';
import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import images from '@/constants/images'; import icons from '@/constants/icons'
import FormField from '../components/FormField'; import CustomButton from '../components/CustomButton'
import { Link, router } from 'expo-router'
import * as Google from 'expo-auth-session/providers/google';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, User } from "firebase/auth";
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const SignIn = () => {
  const userData = React.useContext(UserContext);
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '460321896686-ttu39rq7iq33jcjc667fijdnb1dheda8.apps.googleusercontent.com'
  });

  const addUserToDatabase = async (user: User) => {
    const date = new Date();
    const dateString = date.toLocaleString();
    const usersDocRef = doc(db, 'users', user.uid);
    await setDoc(usersDocRef, { email: user.email, timestamp: dateString}, { merge: true } );
  }

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).then((userCredential) => {
        const user = userCredential.user;
        addUserToDatabase(user)
        router.push('/pods')
      }).catch((error) => {
        console.log('Error: ', error)
      });
    }
  }, [response]);

  React.useEffect(() => {
    if(userData.user) {
      router.push('/pods')
    }
  }, [userData.user])
  
  const handleGoBack = () => {
    router.back()
  }
  const [form, setForm] = React.useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const login = async () => {
    setIsLoading(true)
    try {
      const response = await signInWithEmailAndPassword(auth, form.email, form.password)
      router.push('/pods')
    } catch (error: any) {
      // console.log(error)
      alert('Sign In Failed: '+ error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView className=' bg-secondary h-full'>
      <TouchableOpacity onPress={handleGoBack} className='p-4'>
        <Image source={icons.leftArrow} resizeMode='contain' className='w-[20px] h-[20px]' tintColor={"#2e2a72"} />
      </TouchableOpacity>
      <ScrollView>
        <View className='flex-1 w-full justify-center h-full px-4 my-6'>
          <Image
            source={images.logo}
            resizeMode='contain'
            className='w-[240px] h-[100px] object-center mx-auto'
          />

          <Text className="text-2xl font-semibold text-tertiary font-poppinsSemiBold">
              Log In to PodCuts
          </Text>
          {/* Email Text Field */}
          <FormField
            title='Email'
            value={form.email}
            placeholder='Enter your email'
            handleChangeText={(e) => setForm({...form, email: e})}
            otherStyles='mt-7'
            startCaps={false}
          />
          {/* Password Text Field */}
          <FormField
            title='Password'
            value={form.password}
            placeholder='Enter your password'
            handleChangeText={(e) => setForm({...form, password: e})}
            otherStyles='mt-7'
            startCaps={false}
          />
          {/* Login Button */}
          <CustomButton
            title='Login'
            handlePress={login}
            containerStyles='mt-9'
            isLoading={isLoading}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-tertiary font-poppinsRegular">
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-poppinsSemiBold text-tertiary"
            >
              Sign Up
            </Link>
          </View>
          <View className="flex justify-center pt-5">
            <TouchableOpacity onPress={() => promptAsync()} className="flex-row items-center justify-center bg-white p-2 rounded-lg mt-2">
              <Text className="text-tertiary font-poppinsSemiBold text-lg ml-2">
                Continue with Google
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn