import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import getPodcastEpisodes from '@/services/getPodcastData';
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { UserContext } from '../context';
import { PodcastEpisode } from '@/services/getPodcastData';
import transcribe from '@/services/transcribe';
import summarize from '@/services/summarize';
import chapterize from '@/services/chapterize';
import { getTranscriptFromSentences } from '@/services/chapterize';
import { AntDesign } from '@expo/vector-icons';

const Podcast = () => {
    const handleGoBack = () => {router.back()}
    const { user } = React.useContext(UserContext);
    const [allEpisodes, setAllEpisodes] = React.useState<PodcastEpisode[]>([]);
    const [displayedCount, setDisplayedCount] = React.useState(10);
    const { id, image, podcastName, description, author, episodeCount, category, newestItemPubdate } = useLocalSearchParams<{
        id: string; image: string; description: string;
        podcastName: string; author: string; episodeCount?: string;
        category?: string; newestItemPubdate?: string;
    }>()

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }

    const formatLastUpdated = (timestamp?: string): string => {
        if (!timestamp) return 'N/A';
        const date = new Date(parseInt(timestamp) * 1000);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays}d ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
        return `${Math.floor(diffInDays / 365)}y ago`;
    }

    const handleLoadMore = () => {
        setDisplayedCount(prev => Math.min(prev + 10, allEpisodes.length));
    }

    React.useEffect(() => {
        const getEpisodes = async () => {
            const episodes: PodcastEpisode[] = await getPodcastEpisodes(id ? id : "")
            setAllEpisodes(episodes);
            setDisplayedCount(10);
        }
        getEpisodes();
    }, [id])

    const processRemainingData = async (episodeId: string, sentences: any[], transcript: string) => {
        try {
            const usersDocRef = doc(db, 'users', user?.uid || '');
            const episodesCollectionRef = collection(usersDocRef, 'episodes');
            const episodeDocRef = doc(episodesCollectionRef, episodeId);

            const [summaryData, chaptersData] = await Promise.all([
                summarize(transcript),
                chapterize(sentences, transcript)
            ]);

            const updateData: any = {};
            if (summaryData) updateData.summary = summaryData;
            if (chaptersData) updateData.chapters = chaptersData;

            await updateDoc(episodeDocRef, updateData);
        } catch (error) {
            console.error("Error processing remaining data: ", error);
        }
    }

    const addEpisodeTodb = async (episodeData: PodcastEpisode) => {
        try {
            const usersDocRef = doc(db, 'users', user?.uid || '');
            const episodesCollectionRef = collection(usersDocRef, 'episodes');
            
            const episodeIdString = String(episodeData.id);
            const episodeDocRef = doc(episodesCollectionRef, episodeIdString);
            
            await setDoc(episodeDocRef, {
                podcastName: podcastName,
                podcastId: id,
                image: image,
                podcastDescription: description,
                podcastAuthor: author,
                podcastEpisodeCount: episodeCount ? parseInt(episodeCount) : undefined,
                podcastCategory: category,
                podcastNewestItemPubdate: newestItemPubdate ? parseInt(newestItemPubdate) : undefined,
                ...episodeData,
                id: episodeIdString
            });
            
            transcribe(episodeData.audioUrl).then(async ({sentences, transcript}) => {
                if (sentences) {
                    // const transcript = getTranscriptFromSentences(sentences)
                    await updateDoc(episodeDocRef, { transcript });
                    await processRemainingData(episodeIdString, sentences, transcript);
                }
            }).catch((error) => console.error("Error transcribing: ", error));

            router.dismissAll();
            setTimeout(() => {
                router.push({
                    pathname: '/podcut',
                    params: {
                        id: episodeIdString,
                        title: episodeData.title,
                        podcastName: podcastName || '',
                        image: image || '',
                        audioUrl: episodeData.audioUrl,
                        description: description || '',
                        playOnMount: 'true'
                    }
                });
            }, 1000);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }


    return (
        <SafeAreaView className='bg-secondary h-full'>
            {/* Header */}
            <View className='flex-row items-center px-4 py-3'>
                <TouchableOpacity onPress={handleGoBack} className='mr-4'>
                    <AntDesign name="arrowleft" size={24} color="#2e2a72" />
                </TouchableOpacity>
            </View>

            <FlatList 
                className='flex-1' 
                data={allEpisodes.slice(0, displayedCount)}
                keyExtractor={(item) => item.title}
                ListHeaderComponent={
                    <View className='px-4 pb-6'>
                        {/* Podcast Image */}
                        <View className='items-center mb-4'>
                            <Image 
                                source={{ uri: image }} 
                                className="w-[180px] h-[180px] rounded-xl shadow-lg"
                            />
                        </View>

                        {/* Podcast Title */}
                        <Text className='text-2xl font-poppinsBold text-tertiary text-center mb-2'>
                            {podcastName}
                        </Text>

                        {/* Author */}
                        {author && (
                            <Text className='text-base font-poppinsMedium text-gray-600 text-center mb-4'>
                                {author}
                            </Text>
                        )}

                        {/* Stats Row */}
                        <View className='flex-row justify-center items-center mb-4'>
                            <View className='items-center mr-4'>
                                <Text className='text-lg font-poppinsBold text-tertiary'>
                                    {episodeCount ? parseInt(episodeCount) : allEpisodes.length}
                                </Text>
                                <Text className='text-xs font-poppinsRegular text-gray-500'>Episodes</Text>
                            </View>
                            <View className='w-px h-6 bg-gray-300 mr-4' />
                            <View className='items-center mr-4'>
                                <Text className='text-base font-poppinsBold text-tertiary' numberOfLines={1}>
                                    {category || 'N/A'}
                                </Text>
                                <Text className='text-xs font-poppinsRegular text-gray-500'>Category</Text>
                            </View>
                            <View className='w-px h-6 bg-gray-300 mr-4' />
                            <View className='items-center'>
                                <Text className='text-base font-poppinsBold text-tertiary'>
                                    {formatLastUpdated(newestItemPubdate)}
                                </Text>
                                <Text className='text-xs font-poppinsRegular text-gray-500'>Last Updated</Text>
                            </View>
                        </View>

                        {/* Description */}
                        {description && (
                            <View className='mb-6'>
                                <Text className='text-sm font-poppinsRegular text-gray-700 leading-5'>
                                    {description}
                                </Text>
                            </View>
                        )}

                        {/* Episodes Section Header */}
                        <View className='mb-3'>
                            <Text className='text-xl font-poppinsBold text-tertiary'>
                                Episodes
                            </Text>
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        key={item.title} 
                        className="mx-4 mb-3 p-4 bg-secondary rounded-xl shadow-sm border-2 border-gray-200"
                        onPress={() => addEpisodeTodb(item)}
                        activeOpacity={0.7}
                    >
                        <Text 
                            className="text-base font-poppinsSemiBold text-tertiary mb-2" 
                            numberOfLines={2} 
                            ellipsizeMode="tail"
                        >
                            {item.title}
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="text-xs font-poppinsRegular text-gray-500 mr-2">
                                {(item.datePublished as string).split(' ').slice(0, 3).join(' ')}
                            </Text>
                            <Text className="text-xs font-poppinsRegular text-gray-400 mr-2">•</Text>
                            <Text className="text-xs font-poppinsRegular text-gray-500">
                                {formatDuration(item.duration)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListFooterComponent={
                    displayedCount < allEpisodes.length ? (
                        <TouchableOpacity 
                            onPress={handleLoadMore}
                            className="my-4 mx-auto px-8 py-3 bg-tertiary rounded-lg shadow-sm"
                            activeOpacity={0.8}
                        >
                            <Text className="text-sm font-poppinsSemiBold text-white">Load More</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className='h-6' />
                    )
                }
            />
        </SafeAreaView>
    )
}


export default Podcast