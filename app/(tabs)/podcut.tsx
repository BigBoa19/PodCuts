import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import icons from '@/constants/icons';
import CustomButton from '../components/CustomButton';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';
import FloatingPlayer from './floatingPlayer';
import { collection, doc, getDoc } from 'firebase/firestore';
import { UserContext } from '../context';
import { db } from '../firebase';
import { main } from '../../functions/segment.js'

const PodCut = () => {
    const handleGoBack = () => {router.back()}
    const { user } = React.useContext(UserContext);
    const { id, title, podcastName, image, transcript } = useLocalSearchParams<{
        id: string; title: string; podcastName: string; image: any; audioUrl: string; transcript: string;
    }>()
    const playbackState = usePlaybackState(); const currentTrack = useActiveTrack();

    function extractStartEndTimes(url: string): [number | null, number | null] {
        try {
          const parts = url.split('!');
          if (parts.length < 2) {throw new Error('Invalid URL format');}
          const paramString = parts[1];
      
          const params = new URLSearchParams(paramString);
      
          const startTime = params.get('ts');
          const endTime = params.get('te');
      
          // Convert to numbers, or null if not present
          const start = startTime ? parseInt(startTime, 10) : null;
          const end = endTime ? parseInt(endTime, 10) : null;
      
          return [start, end];
        } catch (error) {
          console.error('Error parsing URL:', error);
          return [null, null];
        }
    }

    const addTrimmedUrls = async () => {
        const usersDocRef = doc(db, 'users', user?.uid || '');
        const episodesCollectionRef = collection(usersDocRef, 'episodes');
        const episodeDocRef = doc(episodesCollectionRef, id);
        const docSnap = await getDoc(episodeDocRef);
        if (docSnap.exists()) {
            const trimmedUrls = docSnap.data().trimmedUrls;
            let index = 0;
            for (const url of trimmedUrls) {
                const [start, end] = extractStartEndTimes(url);
                await TrackPlayer.add({
                    id: index,
                    url: url,
                    title: title,
                    artist: podcastName,
                    duration: (end || 10) - (start || 0),
                    artwork: image || "",
                });
                index++;
            }
        } else {
            console.log('No such document!');
        }
        
    }

    const startPlay = async () => {
        await TrackPlayer.reset();
        await addTrimmedUrls();
        await TrackPlayer.play();
    }

    // useEffect(() => {
    //     main(transcript);
    // }, [])

    const cuts = [
        {
            
            title: "Intro",
            from: "00:00:00",
            to: "00:01:40",
        },
        {
            title: "Sponsor: Spotify",
            from: "00:01:40",
            to: "00:03:30",
        },
        {
            title: "Sponsor: AG1",
            from: "00:03:30",
            to: "00:05:04",
        },
        {
            title: "Welcome to guest Dr. Stuart McGill",
            from: "00:05:04",
            to: "00:07:13",
        },
        {
            title: "Anatomy of the Back",
            from: "00:07:13",
            to: "00:09:15",
        },
        {
            title: "The Mcgill Big 3",
            from: "00:09:15",
            to: "00:11:20",
        },
        {
            title: "Best excersizes for back pain",
            from: "00:11:20",
            to: "00:13:30",
        },
        {
            title: "Research on average life expectancy",
            from: "00:13:30",
            to: "00:16:40",
        },
        {
            title: "The 3 most important things for back health",
            from: "00:16:40",
            to: "00:20:14",
        },
        {
            title: "Outro",
            from: "00:20:14",
            to: "00:21:30",
        }
    ]
    // if transcript === null, then explain and show a preview
    return (
        <SafeAreaView className='bg-secondary h-full'>
            <TouchableOpacity onPress={handleGoBack} className='p-4'>
                <Image source={icons.leftArrow} resizeMode='contain' className='w-[20px] h-[20px]' tintColor={"#2e2a72"} />
            </TouchableOpacity>
            <View className='flex-row items-center justify-center p-3'>
                <Image source={{ uri : image }} resizeMode='contain' className='w-[90px] h-[90px] rounded-lg' />
                <View className='flex-1 items-center justify-start'>
                    <Text className="text-tertiary text-2xl font-poppinsBold">{title}</Text>
                    <Text className='text-tertiary text-lg font-poppinsMedium'>{podcastName}</Text>
                </View>
            </View>
            
            <Text numberOfLines={3} className='text-tertiary font-poppinsRegular'>{transcript}</Text>
            <CustomButton title="Start Playing" containerStyles='p-2 my-3' textStyles='text-base' handlePress={startPlay} />
            
            <Text className='text-tertiary text-2xl font-poppinsBold pt-3 px-4'>Cuts</Text>
            <ScrollView className='px-3'>
                {cuts.map((cut, index) => (
                    <TouchableOpacity key={index} className="my-1 border-2 border-gray-200 rounded-lg bg-secondary shadow-lg">
                     <View className='flex-row justify-between w-full items-center p-1'>
                        <Text numberOfLines={1} className="text-base font-poppinsSemiBold flex-shrink text-tertiary p-2">{cut.title}</Text>
                        <View className='flex-row justify-end items-center'>
                            <Text className="text-sm font-poppinsRegular flex-shrink text-tertiary p-2">{cut.from}</Text>
                            <TouchableOpacity onPress={() => {}} className='pr-1'>
                                <Image source={icons.save} resizeMode='contain' className='w-[24px] h-[24px]' tintColor={"#2e2a72"} />
                            </TouchableOpacity>
                            <CustomButton title="Notes" containerStyles='p-2' textStyles='text-base' handlePress={() => {}} />
                        </View>
                      </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <FloatingPlayer />
        </SafeAreaView>
    )
}

export default PodCut