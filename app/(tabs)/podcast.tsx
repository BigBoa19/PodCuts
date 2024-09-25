import { View, Text, SafeAreaView, TouchableOpacity, Image, FlatList } from 'react-native';
import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import icons from '@/constants/icons';
import getPodcastEpisodes from '@/functions/rssParsing';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore'; import { db } from '../firebase';
import { UserContext } from '../context';
import { transcribeUrl } from '@/functions/transcribe';
import { trimAudio } from '@/functions/trimAudio';
import { load } from 'react-native-track-player/lib/src/trackPlayer';

interface PodcastEpisode {
    title: string;
    audioUrl: string;
    description: string;
    published: string;
}

const Podcast = () => {
    const handleGoBack = () => {router.back()}
    const { user } = React.useContext(UserContext);
    const [episodes, setEpisodes] = React.useState<PodcastEpisode[]>([]);
    const { id, image, podcastName, feedUrl } = useLocalSearchParams<{
        id: string; image: any;
        podcastName: string; feedUrl: string;
    }>()

    const getEpisodes = async () => {
        setEpisodes(await getPodcastEpisodes(feedUrl ? feedUrl : ""));
    }

    React.useEffect(() => {
        getEpisodes();
    }, [feedUrl])

    const limitedEpisodes = episodes.slice(0, 5);

    const getTrimmedUrls = async (audioUrl: string) => {
        const intervals = [
            [0, 35]
        ];
        const res = await fetch(audioUrl || "");
        const trimmedUrls = await trimAudio(res.url, intervals);
        return trimmedUrls;
    }

    const addEpisodeTodb = async (episodeData: PodcastEpisode) => {
        try {
            router.push("/pods");
            const usersDocRef = doc(db, 'users', user?.uid || '');
            const episodesCollectionRef = collection(usersDocRef, 'episodes');
            await setDoc(doc(episodesCollectionRef, episodeData.title), {
                podcastName: podcastName,
                image: image,
                loading: true,
                ...episodeData
            });
            const deepgramResult = await transcribeUrl(episodeData.audioUrl);
            const transcript = deepgramResult.results.channels[0].alternatives[0].transcript
            const trimmedUrls = await getTrimmedUrls(episodeData.audioUrl);
            const docRef = await setDoc(doc(episodesCollectionRef, episodeData.title), {
                podcastName: podcastName,
                image: image,
                loading: false,
                transcript: transcript,
                trimmedUrls: trimmedUrls,
                ...episodeData
            });
            console.log("Document written with ID: ", episodeData.title);
            
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
        <FlatList className='px-2' data={limitedEpisodes}
            keyExtractor={(item) => item.title} renderItem={({ item }) => (
                <TouchableOpacity key={item.title} className="my-1 flex-row items-center space-x-4 p-0.5 border-2 border-gray-200 rounded-lg bg-secondary shadow-lg"
                onPress={() => addEpisodeTodb(item)}>
                    <View className='flex-1 justify-center p-2'>
                        <Text className="text-sm font-poppinsSemiBold flex-shrink text-tertiary" numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
                        <Text className="text-sm font-poppinsSemiBold flex-shrink text-tertiary" numberOfLines={2} ellipsizeMode="tail">{item.published}</Text>
                    </View>
                </TouchableOpacity>
            )}
        />
    </SafeAreaView>
    )
}


export default Podcast