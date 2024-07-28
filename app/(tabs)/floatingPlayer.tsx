import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';
import images from '@/constants/images';
import icons from '@/constants/icons';
import MovingText from '../components/MovingText';
import { router } from 'expo-router';

const FloatingPlayer = () => {
    const currentTrack = useActiveTrack(); const playbackState = usePlaybackState();

    if (!currentTrack) return null;
    
    const displayedTrack = currentTrack;
    // Toggle sound
    const toggleSoundInPods = async () => {
        if (playbackState.state === State.Playing) {
            await TrackPlayer.pause();
        } else {
            await TrackPlayer.play();
        }
    }
    // Skip to the Next sound
    const nextSound = async () => {
        try {
            await TrackPlayer.skipToNext();
            await TrackPlayer.play();
        } catch (error) {
            console.error('Failed to skip to next', error);
        }
    }
    // Skip to the Previous sound
    const previousSound = async () => {
        try {
            await TrackPlayer.skipToPrevious();
            await TrackPlayer.play();
        } catch (error) {
            console.error('Failed to skip to previous', error);
        }
    }

    return (
        <TouchableOpacity onPress={() => router.push("/player")}>
            <View className="absolute bottom-0 left-4 right-4 bg-secondary border-2 border-primary rounded-lg shadow-lg p-2 flex-row items-center">
                <Image source={ {uri: (displayedTrack.artwork ? displayedTrack.artwork : images.hubermanImage)}} className="w-14 h-14 rounded-full"/>

                <View className="p-2 flex-1 overflow-hidden">
                    <MovingText text={displayedTrack.title ? displayedTrack.title : ""} animationThreshold={16} style="text-lg text-tertiary font-poppinsSemiBold" />
                    <Text className="text-sm text-tertiary font-poppinsRegular">{displayedTrack.artist}</Text>
                </View>
                <TouchableOpacity className="px-1" onPress={previousSound}>
                    <Image source={icons.previous} className="w-[24px] h-[24px]" tintColor={"#2e2a72"}/>
                </TouchableOpacity>
                <TouchableOpacity className="px-1" onPress={toggleSoundInPods}>
                    <Image source={(playbackState.state === State.Playing) ? icons.pause : icons.play2} className="w-[30px] h-[30px]" tintColor={"#2e2a72"} />
                </TouchableOpacity>
                <TouchableOpacity className="px-1" onPress={nextSound}>
                    <Image source={icons.next} className="w-[24px] h-[24px]" tintColor={"#2e2a72"}/>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}

export default FloatingPlayer