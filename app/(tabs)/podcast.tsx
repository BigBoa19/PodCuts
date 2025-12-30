import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import icons from '@/constants/icons';
import getPodcastEpisodes from '@/services/getPodcastData';
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { UserContext } from '../context';
import { PodcastEpisode } from '@/services/getPodcastData';
import transcribe from '@/services/transcribe';
import summarize from '@/services/summarize';
import chapterize from '@/services/chapterize';
import { getTranscriptFromSentences } from '@/services/chapterize';

const Podcast = () => {
    const handleGoBack = () => {router.back()}
    const { user } = React.useContext(UserContext);
    const [episodes, setEpisodes] = React.useState<PodcastEpisode[]>([]);
    const { id, image, podcastName, description, author } = useLocalSearchParams<{
        id: string; image: string; description: string;
        podcastName: string; author: string;
    }>()


    React.useEffect(() => {
        const getEpisodes = async () => {
            const episodes: PodcastEpisode[] = await getPodcastEpisodes(id ? id : "")
            setEpisodes(episodes.slice(0, 10));
        }
        getEpisodes();
    }, [id])

    const processRemainingData = async (episodeId: string, sentences: any[], transcript: string) => {
        try {
            const usersDocRef = doc(db, 'users', user?.uid || '');
            const episodesCollectionRef = collection(usersDocRef, 'episodes');
            const episodeDocRef = doc(episodesCollectionRef, episodeId);

            const [chaptersData] = await Promise.all([
                // summarize(audioUrl),
                chapterize(sentences, transcript)
            ]);

            const updateData: any = {};
            // if (summaryData) updateData.summary = summaryData;
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
                image: image,
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
        <TouchableOpacity onPress={handleGoBack} className='p-4'>
            <Image source={icons.leftArrow} resizeMode='contain' className='w-[20px] h-[20px]' tintColor={"#2e2a72"} />
        </TouchableOpacity>
        <Image source={{ uri: image }} className="w-[200px] h-[200px] rounded-lg mx-auto mt-6"/>
        <View className='flex-1 items-center'>
            <Text className='text-2xl font-poppinsBold text-tertiary mt-2'>{podcastName}</Text>
        </View>
        <FlatList className='px-2' data={episodes}
            keyExtractor={(item) => item.title} renderItem={({ item }) => (
                <TouchableOpacity key={item.title} className="my-1 flex-row items-center space-x-4 p-0.5 border-2 border-gray-200 rounded-lg bg-secondary shadow-lg"
                onPress={() => addEpisodeTodb(item)}>
                    <View className='flex-1 justify-center p-2'>
                        <Text className="text-sm font-poppinsSemiBold flex-shrink text-tertiary" numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
                        <Text className="text-sm font-poppinsSemiBold flex-shrink text-tertiary" numberOfLines={2} ellipsizeMode="tail">{item.datePublished}</Text>
                    </View>
                </TouchableOpacity>
            )}
        />
    </SafeAreaView>
    )
}


export default Podcast