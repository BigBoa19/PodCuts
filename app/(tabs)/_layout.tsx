import React from 'react'
import { Stack } from 'expo-router'

const TabsLayout = () => {
  return (
    <Stack >
      <Stack.Screen name="pods" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ headerShown: false }} />
      <Stack.Screen name="podcut" options={{ headerShown: false}} />
      <Stack.Screen name="podcast" options={{ headerShown: false }} />
      <Stack.Screen name="player" options={{ 
          presentation: 'modal',
          gestureEnabled: true,
          gestureDirection: 'vertical',
          animationDuration: 400,
          headerShown: false,
          
          }} />
        <Stack.Screen name="floatingPlayer" options={{ headerShown: false }} />
    </Stack>
  )
}

export default TabsLayout