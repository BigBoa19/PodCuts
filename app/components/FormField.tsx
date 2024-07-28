import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import icons from '@/constants/icons';


type FormFieldProps = {
    title?: string;
    value: string;
    placeholder: string;
    handleChangeText: (text: string) => void;
    otherStyles?: string;
    startCaps?: boolean;
    titleStyles?: string;
}

const FormField: React.FC<FormFieldProps> = ({title, value, placeholder, handleChangeText, otherStyles, ...props}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      {title && <Text className={`text-base text-tertiary ml-2 font-poppinsSemiBold text ${props.titleStyles}`}>{title}</Text>}
      <View className='w-full h-16 px-4 bg-slate-400 rounded-2xl border-2 border-[#2e2a72] flex flex-row items-center '>
        <TextInput
          value={value}
          placeholder={placeholder}
          onChangeText={handleChangeText}
          placeholderTextColor='#2e2a72'
          autoCapitalize={props.startCaps ? 'sentences' : 'none'}
          className='flex-1 font-psemibold text-base text-tertiary'
          secureTextEntry={title === 'Password' && !showPassword}
        />
        {title === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className='flex-row items-center '>
              <Image source={!showPassword ? icons.eye : icons.eyeHide} resizeMode='contain' className='w-6 h-6' />
          </TouchableOpacity>
        )}
        
      </View>
      

    </View>
  )
}

export default FormField