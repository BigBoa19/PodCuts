import React from 'react'; import { UserContext } from '../context';
import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import images from '@/constants/images'; 
import FormField from '../components/FormField'; import CustomButton from '../components/CustomButton'
import { router } from 'expo-router'
import * as Google from 'expo-auth-session/providers/google';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, User } from "firebase/auth";
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAppleSignIn } from '../hooks/useAppleSignIn';

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
        router.replace('/pods')
      }).catch((error) => {
        console.log('Error: ', error)
      });
    }
  }, [response]);
  
  const [form, setForm] = React.useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const { promptAsync: promptAppleSignIn, isAuthRequestLoading: isAppleLoading } = useAppleSignIn(
    () => router.replace('/pods'),
    (error) => console.log('Sign In Failed: '+ error.message)
  );

  const login = async () => {
    setIsLoading(true)
    try {
      const response = await signInWithEmailAndPassword(auth, form.email, form.password)
      router.replace('/pods')
    } catch (error: any) {
      console.log('Sign In Failed: '+ error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const navigateSignUp = () => {
    router.replace('/sign-up')
  }

  return (
    <SafeAreaView className=' bg-secondary h-full'>
      <ScrollView>
        <View className='flex-1 w-full justify-center h-full px-4 my-6'>
          <Image
            source={images.logo}
            resizeMode='contain'
            className='w-[240px] h-[100px] object-center mx-auto'
          />

          <Text className="text-4xl font-semibold text-tertiary font-poppinsBold">
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
            <TouchableOpacity onPress={navigateSignUp}>
              <Text className="text-lg font-poppinsSemiBold text-tertiary">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex justify-center pt-5 gap-3">
            <TouchableOpacity onPress={() => promptAsync()} className="flex-row items-center justify-center bg-white p-2 rounded-lg mt-2">
              <Text className="text-tertiary font-poppinsSemiBold text-lg ml-2">
                Continue with Google
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => promptAppleSignIn()} 
              disabled={isAppleLoading}
              className="flex-row items-center justify-center bg-black p-2 rounded-lg mt-2"
            >
              <Text className="text-white font-poppinsSemiBold text-lg ml-2">
                {isAppleLoading ? 'Signing in...' : 'Continue with Apple'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn