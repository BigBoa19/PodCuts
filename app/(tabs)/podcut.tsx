import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView, Animated } from 'react-native'
import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import icons from '@/constants/icons';
import CustomButton from '../components/CustomButton';
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from 'react-native-track-player';
import FloatingPlayer from './floatingPlayer';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { UserContext } from '../context';
import { db } from '../firebase';

const PodCut = () => {
    const handleGoBack = () => {router.back()}
    const { user } = React.useContext(UserContext);
    const { id, title, podcastName, image, audioUrl, description, playOnMount } = useLocalSearchParams<{
        id: string; title: string; podcastName: string; image: any; audioUrl: string; description: string;
        playOnMount: string;
    }>()
    
    const [episodeData, setEpisodeData] = React.useState<{
        transcript: string | null;
        summary: string | null;
        chapters: any[] | null;
        description: string | null;
    }>({ transcript: null, summary: null, chapters: null, description: null })
    
    const [activeTab, setActiveTab] = React.useState<'summary' | 'transcript' | 'description'>('summary')
    const [tabContainerWidth, setTabContainerWidth] = React.useState(0)
    const indicatorPosition = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
        if (tabContainerWidth === 0) return
        
        const tabIndex = activeTab === 'summary' ? 0 : activeTab === 'transcript' ? 1 : 2
        const targetPosition = (tabContainerWidth / 3) * tabIndex
        
        Animated.timing(indicatorPosition, {
            toValue: targetPosition,
            duration: 250,
            useNativeDriver: true,
        }).start()
    }, [activeTab, tabContainerWidth])

    React.useEffect(() => {
        if (!user || !id) return;

        const usersDocRef = doc(db, 'users', user.uid);
        const episodesCollectionRef = collection(usersDocRef, 'episodes');
        const episodeDocRef = doc(episodesCollectionRef, id);

        const unsubscribe = onSnapshot(episodeDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setEpisodeData({
                    transcript: data.transcript || null,
                    summary: data.summary || null,
                    chapters: data.chapters || null,
                    description: data.description || null,
                });
            }
        }, (error) => {
            console.error('Error listening to episode:', error);
        });

        return () => unsubscribe();
    }, [user, id]);

    React.useEffect(() => {
        if (playOnMount === 'true') {
            startPlay();
        }
    }, []);

    const startPlay = async () => {
        await TrackPlayer.reset();
        await TrackPlayer.add({
            url: audioUrl,
            title: title,
            artist: podcastName,
            artwork: image || "",
            episodeId: id,
        });
        await TrackPlayer.play();
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

    const cuts = episodeData.chapters || []
    return (
        <SafeAreaView className='bg-secondary h-full'>
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                {/* Header */}
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
                
                <CustomButton title="Start Playing" containerStyles='p-2 my-3 mx-4' textStyles='text-base' handlePress={startPlay} />
                
                {/* Tabs Navigation */}
                <View 
                    className='flex-row mx-4 mb-2 border-b-2 border-gray-200 relative'
                    onLayout={(event) => {
                        const { width } = event.nativeEvent.layout
                        if (width > 0 && width !== tabContainerWidth) {
                            setTabContainerWidth(width)
                            const tabIndex = activeTab === 'summary' ? 0 : activeTab === 'transcript' ? 1 : 2
                            indicatorPosition.setValue((width / 3) * tabIndex)
                        }
                    }}
                >
                    <TouchableOpacity 
                        onPress={() => setActiveTab('summary')} 
                        className='flex-1 py-3 px-2'
                    >
                        <Text className={`text-center font-poppinsSemiBold text-base ${activeTab === 'summary' ? 'text-[#2e2a72]' : 'text-gray-500'}`}>
                            Summary
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setActiveTab('transcript')} 
                        className='flex-1 py-3 px-2'
                    >
                        <Text className={`text-center font-poppinsSemiBold text-base ${activeTab === 'transcript' ? 'text-[#2e2a72]' : 'text-gray-500'}`}>
                            Transcript
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setActiveTab('description')} 
                        className='flex-1 py-3 px-2'
                    >
                        <Text className={`text-center font-poppinsSemiBold text-base ${activeTab === 'description' ? 'text-[#2e2a72]' : 'text-gray-500'}`}>
                            Description
                        </Text>
                    </TouchableOpacity>
                    <Animated.View
                        style={{
                            position: 'absolute',
                            bottom: -2,
                            left: 0,
                            width: tabContainerWidth / 3,
                            height: 2,
                            backgroundColor: '#2e2a72',
                            transform: [{ translateX: indicatorPosition }],
                        }}
                    />
                </View>
                
                {/* Tab Content */}
                {activeTab === 'summary' && (
                    <>
                        {/* Summary Section */}
                        <View className='px-4 py-3'>
                            <Text className='text-tertiary text-2xl font-poppinsBold mb-3'>Summary</Text>
                            <View className='rounded-lg p-4 border-2 border-gray-200'>
                                {episodeData.summary ? (
                                    <Text className='text-tertiary font-poppinsRegular text-base'>{episodeData.summary}</Text>
                                ) : (
                                    <Text className='text-tertiary font-poppinsRegular text-base'>Loading summary...</Text>
                                )}
                            </View>
                        </View>
                        
                        {/* Cuts Section */}
                        <View className='px-4 py-3 pb-32'>
                            <Text className='text-tertiary text-2xl font-poppinsBold mb-3'>Cuts</Text>
                            {cuts.length > 0 ? (
                                cuts.map((cut, index) => (
                                    <TouchableOpacity 
                                        key={index} 
                                        className="my-1 border-2 border-gray-200 rounded-lg bg-secondary shadow-lg"
                                        onPress={() => seekToChapter(cut.start)}
                                    >
                                        <View className='flex-row justify-between w-full items-center p-1'>
                                            <Text numberOfLines={1} className="text-base font-poppinsSemiBold flex-shrink text-tertiary p-2">{cut.title}</Text>
                                            <View className='flex-row justify-end items-center'>
                                                <Text className="text-sm font-poppinsRegular flex-shrink text-tertiary p-2">{cut.from}</Text>

                                                <CustomButton title="Notes" containerStyles='p-2' textStyles='text-base' handlePress={() => {}} />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text className='text-tertiary font-poppinsRegular text-base'>Loading cuts...</Text>
                            )}
                        </View>
                    </>
                )}
                
                {activeTab === 'transcript' && (
                    <View className='px-4 py-3 pb-32'>
                        <Text className='text-tertiary text-2xl font-poppinsBold mb-3'>Transcript</Text>
                        <View className='rounded-lg p-4 border-2 border-gray-200'>
                            {episodeData.transcript ? (
                                <Text className='text-tertiary font-poppinsRegular text-base'>{episodeData.transcript}</Text>
                            ) : (
                                <Text className='text-tertiary font-poppinsRegular text-base'>Loading transcript...</Text>
                            )}
                        </View>
                    </View>
                )}

                {activeTab === 'description' && (
                    <View className='px-4 py-3 pb-32'>
                        <Text className='text-tertiary text-2xl font-poppinsBold mb-3'>Description</Text>
                        <View className='rounded-lg p-4 border-2 border-gray-200'>
                            {episodeData.description ? (
                                <Text className='text-tertiary font-poppinsRegular text-base'>{episodeData.description}</Text>
                            ) : (
                                <Text className='text-tertiary font-poppinsRegular text-base'>Loading description...</Text>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
            <FloatingPlayer />
        </SafeAreaView>
    )
}

export default PodCut