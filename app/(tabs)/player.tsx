import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react';
import icons from '@/constants/icons';
import TrackPlayer, { useProgress, useActiveTrack, usePlaybackState, State } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { UserContext } from '../context';
import { db } from '../firebase';
import CustomButton from '../components/CustomButton';

const Player = () => {
    const { position, duration } = useProgress();
    const playbackState = usePlaybackState(); 
    const currentTrack = useActiveTrack();
    const { user } = React.useContext(UserContext);
    
    const [episodeData, setEpisodeData] = React.useState<{
        chapters: any[] | null;
    }>({ chapters: null });
    
    // Get episode ID from track metadata
    const episodeId = (currentTrack as any)?.episodeId;

    const toggleSound = async () => {
        if (playbackState.state === State.Playing) {
            await TrackPlayer.pause();
        } else {
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

    const skipForward = async () => {
        try {
            const newPosition = Math.min(position + 15, duration);
            await TrackPlayer.seekTo(newPosition);
        } catch (error) {
            console.error('Failed to seek forward', error);
        }
    }

    const skipBackward = async () => {
        try {
            const newPosition = Math.max(position - 15, 0);
            await TrackPlayer.seekTo(newPosition);
        } catch (error) {
            console.error('Failed to seek backward', error);
        }
    }
    
    const seekToChapter = async (timeInMs: number) => {
        try {
            // Convert milliseconds to seconds for TrackPlayer
            const timeInSeconds = timeInMs / 1000;
            await TrackPlayer.seekTo(timeInSeconds);
        } catch (error) {
            console.error('Failed to seek to chapter:', error);
        }
    }
    
    // Fetch chapters from Firestore
    React.useEffect(() => {
        if (!user || !episodeId) return;

        const usersDocRef = doc(db, 'users', user.uid);
        const episodesCollectionRef = collection(usersDocRef, 'episodes');
        const episodeDocRef = doc(episodesCollectionRef, episodeId);

        const unsubscribe = onSnapshot(episodeDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setEpisodeData({
                    chapters: data.chapters || null,
                });
            }
        }, (error) => {
            console.error('Error listening to episode:', error);
        });

        return () => unsubscribe();
    }, [user, episodeId]);
    
    // Convert seconds to MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    // Convert milliseconds to MM:SS for chapter times
    const formatChapterTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    const cuts = episodeData.chapters || [];

    return (
        <SafeAreaView className='bg-secondary h-full flex-1'>
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
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
                        <TouchableOpacity onPress={skipBackward} className='p-3'>
                            <Image source={icons.previous} resizeMode='contain' className='w-[50px] h-[50px]' tintColor={"#2e2a72"} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleSound} className='p-3'>
                            <Image source={(playbackState.state === State.Playing) ? icons.pause : icons.play} resizeMode='contain' className='w-[70px] h-[70px]' tintColor={"#2e2a72"} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={skipForward} className='p-3'>
                            <Image source={icons.next} resizeMode='contain' className='w-[50px] h-[50px]' tintColor={"#2e2a72"} />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Cuts Section */}
                    {cuts.length > 0 && (
                        <View className='px-4 py-3 pb-32 w-full'>
                            <Text className='text-tertiary text-2xl font-poppinsBold mb-3'>Cuts</Text>
                            {cuts.map((cut, index) => (
                                <TouchableOpacity 
                                    key={index} 
                                    className="my-1 border-2 border-gray-200 rounded-lg bg-secondary shadow-lg"
                                    onPress={() => seekToChapter(cut.start)}
                                >
                                        <View className='flex-row justify-between w-full items-center p-1'>
                                        <Text numberOfLines={1} className="text-base font-poppinsSemiBold flex-shrink text-tertiary p-2">{cut.title}</Text>
                                        <View className='flex-row justify-end items-center'>
                                            <Text className="text-sm font-poppinsRegular flex-shrink text-tertiary p-2">{formatChapterTime(cut.start)}</Text>
                                            <CustomButton title="Notes" containerStyles='p-2' textStyles='text-base' handlePress={() => {}} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Player