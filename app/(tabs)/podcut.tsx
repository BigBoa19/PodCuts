import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import icons from '@/constants/icons';
import CustomButton from '../components/CustomButton';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';
import FloatingPlayer from './floatingPlayer';
import { trimAudio } from '../../functions/trimAudio';
import { trimAudioB } from '../../functions/trimAudioBytescale';
import { transcribeUrl } from '../../functions/transcribe';

const PodCut = () => {
    const handleGoBack = () => {router.back()}
    const { id, title, podcastName, image, audioUrl } = useLocalSearchParams<{
        id: string; title: string; podcastName: string; image: any; audioUrl: string;
    }>()
    const playbackState = usePlaybackState(); const currentTrack = useActiveTrack();
    const [isLoading, setIsLoading] = React.useState(false);
    const [transcript, setTranscript] = React.useState("");

    const trimWithServer = async () => {
        const intervals = [
            [0, 30000],
            [30000, 45000],
            [45000, 90000],
            [90000, 140000],
            [140000, 150000]
          ];  // List of intervals in milliseconds
        const trimmedUrls = await trimAudio(audioUrl, intervals);
        console.log('Trimmed audio files:', trimmedUrls);
        let index = 0;
        for (const url of trimmedUrls) {
            await TrackPlayer.add({
                id: index,
                url: url,
                title: title,
                artist: podcastName,
                duration: intervals[index][1] - intervals[index][0],
                artwork: image || "",
            });
            index++;
        }
    }
    const trimWithApi = async () => {
        const res = await fetch(audioUrl || "");
        const trimmedUrl = await trimAudioB(res.url, 10, 15);
        console.log('Trimmed audio file:', trimmedUrl);
        await TrackPlayer.add({
            id: 0,
            url: trimmedUrl,
            title: title,
            artist: podcastName,
            duration: 5000,
            artwork: image || "",
        });
    }


    const toggleSound = async () => {
        if (currentTrack && currentTrack.artist === podcastName) {
            if (playbackState.state === State.Playing) {
                await TrackPlayer.pause();
            } else {
                try {
                    await TrackPlayer.play();
                } catch (error) {
                    console.error('Error playing track:', error);
                }
            }
        } else {
            await TrackPlayer.reset();
            // await trim();
            await TrackPlayer.play();
        }
    }

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

    const getTranscript = async () => {
        setIsLoading(true);
        setTranscript(await transcribeUrl(audioUrl ? audioUrl : ""))
        setIsLoading(false);
    }

    // React.useEffect(() => {getTranscript();}, []);

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
            <View className="flex-row justify-between">
                <CustomButton title="Trim with API" handlePress={trimWithApi} />
                <CustomButton title="Generate Transcript" handlePress={getTranscript} />
            </View>
            {isLoading ? <ActivityIndicator size="large" color="#111111" className='p-3'/> : 
            <Text numberOfLines={6} className='text-tertiary font-poppinsRegular'>{transcript}</Text>}
            
            <TouchableOpacity onPress={toggleSound} className='p-3'>
                <Image source={(playbackState.state === State.Playing && currentTrack?.artist === podcastName) ? icons.pause : icons.play} resizeMode='contain' className='w-[70px] h-[70px]' tintColor={"#2e2a72"} />
            </TouchableOpacity>
            <Text className='text-tertiary text-2xl font-poppinsBold pt-3 px-4'>Cuts</Text>
            <ScrollView className='px-3'>
                {cuts.map((cut, index) => (
                    <TouchableOpacity key={index} className="my-1 flex-row items-center space-x-4 p-0.5 border-2 border-gray-200 rounded-lg bg-secondary shadow-lg">
                     <View className='flex-row justify-between w-full items-center'>
                        <Text numberOfLines={1} className="text-base font-poppinsSemiBold flex-shrink text-tertiary p-2">{cut.title}</Text>
                        <Text numberOfLines={1} className="text-sm font-poppinsRegular flex-shrink text-tertiary p-2">{cut.from}</Text>
                        <CustomButton title="Show Notes" handlePress={() => {}} />
                      </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <FloatingPlayer />
        </SafeAreaView>
    )
}

export default PodCut