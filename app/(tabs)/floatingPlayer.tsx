import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';
import images from '@/constants/images';
import icons from '@/constants/icons';
import MovingText from '../components/MovingText';
import { router } from 'expo-router';

const FloatingPlayer = () => {
    const currentTrack = useActiveTrack(); const playbackState = usePlaybackState();
    
    const displayedTrack = currentTrack;
    // Toggle sound
    const toggleSoundInPods = async () => {
        if (playbackState.state === State.Playing) {
            await TrackPlayer.pause();
        } else {
            await TrackPlayer.play();
        }
    }

    const nextSound = async () => {
        try {
            await TrackPlayer.skipToNext();
            await TrackPlayer.play();
        } catch (error) {
            console.error('Failed to skip to next', error);
        }
    }

    const previousSound = async () => {
        try {
            await TrackPlayer.skipToPrevious();
            await TrackPlayer.play();
        } catch (error) {
            console.error('Failed to skip to previous', error);
        }
    }

    return (
        <TouchableOpacity className='absolute bottom-4 left-2 right-2 h-[80px]' onPress={() => router.push("/player")}>
            <View className="bg-secondary border-2 border-primary rounded-2xl shadow-lg p-0.5 flex-row items-center">
                <Image source={ {uri: (displayedTrack ? displayedTrack.artwork : "https://fastly.picsum.photos/id/524/200/300.jpg?hmac=_0B_jkz8dRd5eIQz0xIlicLaZZnzpRdAH72crtCVvOU")}} className="w-14 h-14 rounded-full"/>
                <View className="p-2 flex-1 overflow-hidden">
                    <MovingText text={displayedTrack ? displayedTrack.title || "" : "Not Playing"} animationThreshold={16} style="text-lg text-tertiary font-poppinsSemiBold" />
                    <Text numberOfLines={1} className="text-sm text-tertiary font-poppinsRegular">{displayedTrack ? displayedTrack.artist : "Not Playing"}</Text>
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