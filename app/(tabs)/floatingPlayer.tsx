import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import TrackPlayer, { useActiveTrack, usePlaybackState, State, useProgress } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import { AntDesign, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import MovingText from '../components/MovingText';
import { router } from 'expo-router';

const FloatingPlayer = () => {
    const currentTrack = useActiveTrack(); const playbackState = usePlaybackState();
    const { position, duration } = useProgress();
    
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
            const newPosition = Math.min(position + 15, duration);
            await TrackPlayer.seekTo(newPosition);
        } catch (error) {
            console.error('Failed to seek forward', error);
        }
    }

    const previousSound = async () => {
        try {
            const newPosition = Math.max(position - 15, 0);
            await TrackPlayer.seekTo(newPosition);
        } catch (error) {
            console.error('Failed to seek backward', error);
        }
    }

    const seekSound = async (seconds: number) => {
        try {
            TrackPlayer.seekTo(seconds);
        } catch (error) {
            console.error('Failed to seek sound', error);
        }
    }

    // Convert seconds to MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View className='absolute bottom-4 left-2 right-2'>
            <View className="bg-secondary border-2 border-primary rounded-2xl shadow-lg p-2">
                {/* Top Section: Artwork + Track Info + Controls (Horizontally aligned) */}
                <View className="flex-row items-center mb-1.5">
                    <TouchableOpacity 
                        className="flex-row items-center flex-1" 
                        onPress={() => router.push("/player")}
                        activeOpacity={0.7}
                    >
                        {displayedTrack && displayedTrack.artwork && (
                            <Image source={{uri: displayedTrack.artwork}} className="w-10 h-10 rounded-lg mr-2"/>
                        )}
                        <View className="flex-1 overflow-hidden">
                            <MovingText 
                                text={displayedTrack ? displayedTrack.title || "" : "Not Playing"} 
                                animationThreshold={16} 
                                style="text-sm text-tertiary font-poppinsSemiBold" 
                            />
                            <Text numberOfLines={1} className="text-xs text-tertiary font-poppinsRegular">
                                {displayedTrack ? displayedTrack.artist : "Not Playing"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    
                    {/* Controls aligned with text */}
                    <View className="flex-row items-center">
                        <TouchableOpacity className="px-1.5" onPress={previousSound}>
                            <FontAwesome5 name="backward" size={16} color="#2e2a72" />
                        </TouchableOpacity>
                        <TouchableOpacity className="px-2" onPress={toggleSoundInPods}>
                            {(playbackState.state === State.Playing) ? 
                                <FontAwesome name="pause" size={20} color="#2e2a72" /> : 
                                <FontAwesome name="play" size={20} color="#2e2a72" />
                            }
                        </TouchableOpacity>
                        <TouchableOpacity className="px-1.5" onPress={nextSound}>
                            <FontAwesome5 name="forward" size={16} color="#2e2a72" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Slider with Time Labels */}
                <View>
                    <Slider
                        style={{width: '100%', height: 25}}
                        value={position}
                        minimumValue={0}
                        maximumValue={duration}
                        minimumTrackTintColor="#2e2a72"
                        maximumTrackTintColor="#735DA5"
                        onSlidingComplete={seekSound}
                    />
                    <View className='flex-row justify-between'>
                        <Text className='text-tertiary font-poppinsMedium text-xs'>{formatTime(position)}</Text>
                        <Text className='text-tertiary font-poppinsMedium text-xs'>{formatTime(duration)}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default FloatingPlayer