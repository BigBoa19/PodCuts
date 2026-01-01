import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView, Animated, Dimensions, FlatList } from 'react-native'
import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import CustomButton from '../components/CustomButton';
import TrackPlayer, { State, useProgress, useActiveTrack } from 'react-native-track-player';
import FloatingPlayer from './floatingPlayer';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { UserContext } from '../context';
import { db } from '../firebase';
import { AntDesign } from '@expo/vector-icons';
import getPodcastEpisodes from '@/services/getPodcastData';
import RenderHTML from 'react-native-render-html';
import Markdown from 'react-native-markdown-display';
import { getPodcastData } from '@/services/searchPodcasts';

const PodCut = () => {
    const handleGoBack = () => {router.back()}
    const { user } = React.useContext(UserContext);
    const { id, title, podcastName, image, audioUrl, playOnMount } = useLocalSearchParams<{
        id: string; title: string; podcastName: string; image: any; audioUrl: string; 
        playOnMount: string;
    }>()
    
    const [episodeData, setEpisodeData] = React.useState<{
        transcript: Array<{ text: string; start: number; end: number }> | null;
        summary: string | null;
        chapters: any[] | null;
        description: string | null;
    }>({ transcript: null, summary: null, chapters: null, description: null })
    
    const [podcastId, setPodcastId] = React.useState<string | null>(null)
    const [podcastMetadata, setPodcastMetadata] = React.useState<{
        description: string | null;
        author: string | null;
        episodeCount: number | null;
        category: string | null;
        newestItemPubdate: number | null;
    }>({ description: null, author: null, episodeCount: null, category: null, newestItemPubdate: null })
    
    const [activeTab, setActiveTab] = React.useState<'summary' | 'transcript' | 'description'>('summary')
    const [tabContainerWidth, setTabContainerWidth] = React.useState(0)
    const indicatorPosition = React.useRef(new Animated.Value(0)).current
    const [expandedNotesIndex, setExpandedNotesIndex] = React.useState<number | null>(null)
    const [isSummaryExpanded, setIsSummaryExpanded] = React.useState(true)
    const { position } = useProgress(150) // Update every 150ms - balance between responsiveness and performance
    const activeTrack = useActiveTrack()
    const mainScrollViewRef = React.useRef<ScrollView>(null)
    const transcriptFlatListRef = React.useRef<FlatList>(null)
    const sentenceHeights = React.useRef<{ [key: number]: number }>({})
    const [activeSentenceIndex, setActiveSentenceIndex] = React.useState<number | null>(null)
    const lastScrollIndex = React.useRef<number | null>(null)

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
                const sentences = 'sentences' in data ? data.sentences : null;
                setEpisodeData(prev => ({
                    ...prev,
                    transcript: sentences,
                    summary: 'summary' in data ? data.summary : prev.summary,
                    chapters: 'chapters' in data ? data.chapters : prev.chapters,
                }));
                if (data.podcastId) {
                    setPodcastId(data.podcastId);
                }
            }
        }, (error) => {
            console.error('Error listening to episode:', error);
        });

        return () => unsubscribe();
    }, [user, id]);

    // Fetch podcast data from API
    React.useEffect(() => {
        const fetchEpisodeData = async () => {
            if (!podcastId || !id) return;

            try {
                const episodes = await getPodcastEpisodes(podcastId);
                const podcastData = await getPodcastData(podcastId);
                setPodcastMetadata({
                    description: podcastData?.description || '',
                    author: podcastData?.author || '',
                    episodeCount: podcastData?.episodeCount ?? null,
                    category: podcastData?.category || '',
                    newestItemPubdate: podcastData?.newestItemPubdate ?? null,
                });
                const matchingEpisode = episodes.find(ep => String(ep.id) === String(id));
                
                if (matchingEpisode && matchingEpisode.description) {
                    setEpisodeData(prev => ({
                        ...prev,
                        description: matchingEpisode.description || prev.description,
                    }));
                }
            } catch (error) {
                console.error('Error fetching episode data from API:', error);
            }
        };

        fetchEpisodeData();
    }, [podcastId, id]);

    React.useEffect(() => {
        if (playOnMount === 'true') {
            startPlay();
        }
    }, []);

    // Find the active sentence based on current playback position
    React.useEffect(() => {
        if (!episodeData.transcript || !Array.isArray(episodeData.transcript) || episodeData.transcript.length === 0) {
            setActiveSentenceIndex(null);
            return;
        }

        // Check if the current track matches this episode
        const currentEpisodeId = (activeTrack as any)?.episodeId;
        if (currentEpisodeId !== id) {
            setActiveSentenceIndex(null);
            return;
        }

        // Position is already in seconds, and sentence.start/end are also in seconds
        const currentTimeSeconds = position;

        // Find the sentence that contains the current time
        const activeIndex = episodeData.transcript.findIndex(
            (sentence) => currentTimeSeconds >= sentence.start && currentTimeSeconds <= sentence.end
        );

        if (activeIndex !== -1 && activeIndex !== activeSentenceIndex) {
            setActiveSentenceIndex(activeIndex);
            
            // Auto-scroll to the active sentence when transcript tab is active
            // Only scroll if it's a different sentence to avoid unnecessary scrolls
            if (activeTab === 'transcript' && lastScrollIndex.current !== activeIndex) {
                lastScrollIndex.current = activeIndex;
                // Use requestAnimationFrame for smoother scrolling
                requestAnimationFrame(() => {
                    transcriptFlatListRef.current?.scrollToIndex({
                        index: activeIndex,
                        animated: true,
                        viewPosition: 0.3, // Position sentence at 30% from top of viewport
                    });
                });
            }
        } else if (activeIndex === -1) {
            setActiveSentenceIndex(null);
            lastScrollIndex.current = null;
        }
    }, [position, episodeData.transcript, activeTrack, id, activeTab, activeSentenceIndex]);

    const formatChapterTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
            // Check if a track is added
            const activeTrack = await TrackPlayer.getActiveTrack();
            const queue = await TrackPlayer.getQueue();
            
            // Check if we need to switch podcasts (different episodeId)
            const needsToSwitchPodcast = activeTrack && activeTrack.episodeId !== id;
            
            if ((!activeTrack && queue.length === 0) || needsToSwitchPodcast) {
                await TrackPlayer.reset();
                await TrackPlayer.add({
                    url: audioUrl,
                    title: title,
                    artist: podcastName,
                    artwork: image || "",
                    episodeId: id,
                });
            }
            
            const state = (await TrackPlayer.getPlaybackState()).state;
            if (state !== State.Playing) {
                await TrackPlayer.play();
            }
            
            const timeInSeconds = timeInMs / 1000;
            await TrackPlayer.seekTo(timeInSeconds);
        } catch (error) {
            console.error('Failed to seek to chapter:', error);
        }
    }

    const showNotesDropdown = (index: number) => {
        setExpandedNotesIndex(expandedNotesIndex === index ? null : index);
    }

    const seekToSentence = async (timeInSeconds: number) => {
        try {
            const activeTrack = await TrackPlayer.getActiveTrack();
            const queue = await TrackPlayer.getQueue();
            
            const needsToSwitchPodcast = activeTrack && activeTrack.episodeId !== id;
            
            if ((!activeTrack && queue.length === 0) || needsToSwitchPodcast) {
                await TrackPlayer.reset();
                await TrackPlayer.add({
                    url: audioUrl,
                    title: title,
                    artist: podcastName,
                    artwork: image || "",
                    episodeId: id,
                });
                // Wait a bit for track to be ready
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            const state = (await TrackPlayer.getPlaybackState()).state;
            if (state !== State.Playing) {
                await TrackPlayer.play();
            }
            
            // timeInSeconds is already in seconds, no conversion needed
            await TrackPlayer.seekTo(timeInSeconds);
        } catch (error) {
            console.error('Failed to seek to sentence:', error);
        }
    }

    // Memoized sentence component to prevent unnecessary re-renders
    const SentenceItem = React.memo(({ sentence, index, isActive, onPress, onLayout }: {
        sentence: { text: string; start: number; end: number };
        index: number;
        isActive: boolean;
        onPress: (timeInSeconds: number) => void;
        onLayout: (index: number, height: number) => void;
    }) => {
        return (
            <TouchableOpacity
                onPress={() => onPress(sentence.start)}
                activeOpacity={0.7}
            >
                <View
                    onLayout={(event) => {
                        const { height } = event.nativeEvent.layout;
                        onLayout(index, height);
                    }}
                    className="py-2 px-1"
                >
                    <Text
                        className={`text-base ${
                            isActive 
                                ? 'text-tertiary font-poppinsBold' 
                                : 'text-tertiary font-poppinsRegular'
                        }`}
                    >
                        {sentence.text}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }, (prevProps, nextProps) => {
        // Only re-render if active state changes or text changes
        return prevProps.isActive === nextProps.isActive && 
               prevProps.sentence.text === nextProps.sentence.text;
    });

    const handleSentenceLayout = React.useCallback((index: number, height: number) => {
        sentenceHeights.current[index] = height;
    }, []);

    const seekToSentenceRef = React.useRef(seekToSentence);
    React.useEffect(() => {
        seekToSentenceRef.current = seekToSentence;
    }, [seekToSentence]);

    const handleSeekToSentence = React.useCallback((timeInSeconds: number) => {
        seekToSentenceRef.current(timeInSeconds);
    }, []);

    const renderSentence = React.useCallback(({ item, index }: { item: { text: string; start: number; end: number }; index: number }) => {
        return (
            <SentenceItem
                sentence={item}
                index={index}
                isActive={activeSentenceIndex === index}
                onPress={handleSeekToSentence}
                onLayout={handleSentenceLayout}
            />
        );
    }, [activeSentenceIndex, handleSeekToSentence, handleSentenceLayout]);

    const getItemLayout = React.useCallback((data: any, index: number) => {
        const height = sentenceHeights.current[index] || 50; // Default height estimate
        return {
            length: height,
            offset: Object.values(sentenceHeights.current)
                .slice(0, index)
                .reduce((sum, h) => sum + (h || 50), 0),
            index,
        };
    }, []);

    const cuts = episodeData.chapters || []
    const sentences = episodeData.transcript || []
    return (
        <SafeAreaView className='bg-secondary h-full'>
            <ScrollView 
                ref={mainScrollViewRef}
                className='flex-1' 
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <TouchableOpacity onPress={handleGoBack} className='p-4'>
                    <AntDesign name="arrowleft" size={24} color="#2e2a72" />
                </TouchableOpacity>
                <View className='flex-row items-center justify-center p-3'>
                    <Image source={{ uri : image }} resizeMode='contain' className='w-[90px] h-[90px] rounded-lg' />
                    <View className='flex-1 items-center justify-start'>
                        <Text className="text-tertiary text-xl font-poppinsMedium">{title}</Text>
                        <TouchableOpacity 
                            onPress={() => {
                                if (!podcastId || podcastMetadata.category === null) {
                                    console.warn('Podcast ID not available yet');
                                    return;
                                }
                                router.push({
                                    pathname: '/podcast',
                                    params: {
                                        id: podcastId,
                                        image: image || '',
                                        podcastName: podcastName || '',
                                        description: podcastMetadata.description || '',
                                        author: podcastMetadata.author || '',
                                        episodeCount: podcastMetadata.episodeCount || '',
                                        category: podcastMetadata.category || '',
                                        newestItemPubdate: podcastMetadata.newestItemPubdate || '',
                                    }
                                });
                            }}
                            disabled={!podcastId}
                        >
                            <Text className={`text-tertiary text-lg ${podcastMetadata.category ? 'font-poppinsBold' : 'font-poppinsRegular'} ${!podcastId ? 'opacity-50' : ''}`}>
                                {podcastName}
                            </Text>
                        </TouchableOpacity>
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
                            <View className='flex-row items-center justify-between mb-3'>
                                <Text className='text-tertiary text-2xl font-poppinsBold'>Summary</Text>
                                <TouchableOpacity 
                                    onPress={() => setIsSummaryExpanded(!isSummaryExpanded)}
                                    className='p-2'
                                >
                                    <AntDesign 
                                        name={isSummaryExpanded ? "up" : "down"} 
                                        size={20} 
                                        color="#2e2a72" 
                                    />
                                </TouchableOpacity>
                            </View>
                            {isSummaryExpanded && (
                                <View className='rounded-lg p-4 border-2 border-gray-200'>
                                    {episodeData.summary ? (
                                        <Markdown
                                            style={{
                                                body: {
                                                    color: '#2e2a72',
                                                    fontSize: 16,
                                                    fontFamily: 'Poppins-Regular',
                                                },
                                                paragraph: {
                                                    marginBottom: 8,
                                                    marginTop: 0,
                                                },
                                            }}
                                        >
                                            {episodeData.summary}
                                        </Markdown>
                                    ) : (
                                        <Text className='text-tertiary font-poppinsRegular text-base'>Loading summary...</Text>
                                    )}
                                </View>
                            )}
                        </View>
                        
                        {/* Cuts Section */}
                        <View className='px-4 py-3 pb-32'>
                            <Text className='text-tertiary text-2xl font-poppinsBold mb-3'>Cuts</Text>
                            {cuts.length > 0 ? (
                                cuts.map((cut, index) => (
                                    <View key={index} className="my-1">
                                        <View className="border-2 border-gray-200 rounded-lg bg-secondary shadow-lg">
                                            <View className='flex-row justify-between w-full items-center p-1'>
                                                <TouchableOpacity 
                                                    onPress={() => seekToChapter(cut.start)}
                                                    className='flex-1'
                                                >
                                                    <Text numberOfLines={1} className="text-base font-poppinsSemiBold flex-shrink text-tertiary p-2">{cut.title}</Text>
                                                </TouchableOpacity>
                                                <View className='flex-row justify-end items-center'>
                                                    <Text className="text-sm font-poppinsRegular flex-shrink text-tertiary p-2">{formatChapterTime(cut.start)}</Text>
                                                    <TouchableOpacity 
                                                        onPress={() => showNotesDropdown(index)}
                                                        className='p-2'
                                                    >
                                                        <Text className='text-[#2e2a72] font-poppinsSemiBold text-base'>Notes</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                        {expandedNotesIndex === index && cut.summary && (
                                            <View className='mt-1 border-2 border-gray-200 rounded-lg bg-secondary p-4'>
                                                <Text className='text-tertiary font-poppinsRegular text-base'>{cut.summary}</Text>
                                            </View>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <Text className='text-tertiary font-poppinsRegular text-base'>Loading cuts...( this could take a minute or two )</Text>
                            )}
                        </View>
                    </>
                )}
                
                {activeTab === 'transcript' && (
                    <View className='px-4 py-3 pb-32'>
                        <Text className='text-tertiary text-2xl font-poppinsBold mb-3'>Transcript</Text>
                        <View className='rounded-lg border-2 border-gray-200 overflow-hidden'>
                            {sentences.length > 0 ? (
                                <FlatList
                                    ref={transcriptFlatListRef}
                                    data={sentences}
                                    renderItem={renderSentence}
                                    keyExtractor={(item, index) => `sentence-${index}`}
                                    getItemLayout={getItemLayout}
                                    style={{ maxHeight: Dimensions.get('window').height * 0.5 }}
                                    contentContainerStyle={{ padding: 16 }}
                                    showsVerticalScrollIndicator={true}
                                    nestedScrollEnabled={true}
                                    removeClippedSubviews={true}
                                    maxToRenderPerBatch={10}
                                    updateCellsBatchingPeriod={50}
                                    initialNumToRender={15}
                                    windowSize={5}
                                    onScrollToIndexFailed={(info) => {
                                        // Fallback if scroll fails
                                        setTimeout(() => {
                                            transcriptFlatListRef.current?.scrollToIndex({
                                                index: info.index,
                                                animated: true,
                                                viewPosition: 0.3,
                                            });
                                        }, 100);
                                    }}
                                />
                            ) : (
                                <View style={{ maxHeight: Dimensions.get('window').height * 0.5 }} className='p-4'>
                                    <Text className='text-tertiary font-poppinsRegular text-base'>Loading transcript...</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {activeTab === 'description' && (
                    <View className='px-4 py-3 pb-32'>
                        <Text className='text-tertiary text-2xl font-poppinsBold mb-3'>Description</Text>
                        <View className='rounded-lg p-4 border-2 border-gray-200'>
                            {episodeData.description ? (
                                <RenderHTML
                                    contentWidth={Dimensions.get('window').width - 64}
                                    source={{ html: episodeData.description }}
                                    baseStyle={{
                                        color: '#2e2a72',
                                        fontSize: 16,
                                        fontFamily: 'Poppins-Regular',
                                    }}
                                    tagsStyles={{
                                        p: {
                                            marginBottom: 8,
                                            marginTop: 0,
                                        },
                                        br: {
                                            marginBottom: 4,
                                        },
                                    }}
                                />
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