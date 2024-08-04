import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import icons from '@/constants/icons';
import TrackPlayer, { useProgress, useActiveTrack, usePlaybackState, State, AddTrack } from 'react-native-track-player';
import Slider from '@react-native-community/slider';

const Player = () => {
    const { position, duration } = useProgress();
    const playbackState = usePlaybackState(); const currentTrack = useActiveTrack();
    // List of tracks
    const [tracks, setTracks] = React.useState<AddTrack[]>([]);

    const getTracks = async () => {
        const tracks = await TrackPlayer.getQueue();
        setTracks(tracks);
    }

    React.useEffect(() => {getTracks();},[]);


    const toggleSound = async () => {
        if (currentTrack) {
            if (playbackState.state === State.Playing) {
                await TrackPlayer.pause();
            } else {
                await TrackPlayer.play();
            }
        } else {
            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            await TrackPlayer.play();
        }
    }

    const seekSound = async (seconds: number) => {
        try {
            TrackPlayer.seekTo(seconds);
        } catch (error) {
            console.error('Failed to seek sound', error);
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
    // Skip to a specific track
    const skipToTrack = (id: number) => async () => {
        try {
            await TrackPlayer.skip(id);
            await TrackPlayer.play();
        } catch (error) {
            console.error('Failed to skip to track', error);
        }
    }
    // Convert seconds to MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <SafeAreaView className='bg-secondary h-full flex-1'>

            <View className='flex-1 items-center'>
                <Text className='text-lg font-poppinsSemiBold text-tertiary mt-2'>{currentTrack?.artist}</Text>
                <Image source={{ uri: currentTrack?.artwork }} className="w-[150px] h-[150px] rounded-lg mx-auto mt-6"/>
                <Text className='text-2xl font-poppinsBold text-tertiary mt-4' numberOfLines={1} ellipsizeMode="tail">{currentTrack?.title}</Text>
                
                <Slider
                    style={{width: 350, height: 40}} value={position} minimumValue={0}
                    maximumValue={duration} minimumTrackTintColor="#2e2a72"
                    maximumTrackTintColor="#735DA5" onSlidingComplete={seekSound}
                />
                <View className='flex-row justify-between w-[350px]'>
                    <Text className='text-tertiary font-poppinsMedium'>{formatTime(position)}</Text>
                    <Text className='text-tertiary font-poppinsMedium'>{formatTime(duration)}</Text>
                </View>
                <View className='flex-row items-center'>
                    <TouchableOpacity onPress={previousSound} className='p-3'>
                        <Image source={icons.previous} resizeMode='contain' className='w-[50px] h-[50px]' tintColor={"#2e2a72"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleSound} className='p-3'>
                        <Image source={(playbackState.state === State.Playing) ? icons.pause : icons.play} resizeMode='contain' className='w-[70px] h-[70px]' tintColor={"#2e2a72"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={nextSound} className='p-3'>
                        <Image source={icons.next} resizeMode='contain' className='w-[50px] h-[50px]' tintColor={"#2e2a72"} />
                    </TouchableOpacity>
                </View>
                <ScrollView className='w-full px-5'>
                    {tracks.map((track) => (
                        <TouchableOpacity key={track.id} className="my-1 p-0.5 border-2 border-gray-400 rounded-lg bg-secondary shadow-lg"
                        onPress={skipToTrack(track.id)}>
                            <View className='flex-row items-center justify-between w-full'>
                            <Text className="text-base font-poppinsSemiBold flex-shrink text-tertiary p-2" numberOfLines={1} ellipsizeMode='tail'>{track.title}</Text>
                            <Text className="text-sm font-poppinsRegular text-tertiary p-2">{formatTime(track.duration ? track.duration : 0)}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default Player