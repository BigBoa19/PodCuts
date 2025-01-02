import { View, Text, SafeAreaView, TouchableOpacity, Image, FlatList } from 'react-native';
import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import icons from '@/constants/icons';
import getPodcastEpisodes from '@/functions/rssParsing';
import { collection, doc, setDoc } from 'firebase/firestore'; import { db } from '../firebase';
import { UserContext } from '../context';
import { transcribeUrl } from '@/functions/transcribe';
import { trimAudio } from '@/functions/trimAudio';
import { segment } from '@/functions/segment';
import { callTrimAudioEndpoint } from '@/functions/newTrimAudio';

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

    const limitedEpisodes = episodes.slice(0, 20);
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
            const deepgramResult = await transcribeUrl(episodeData.audioUrl); //getting transcript and map of sentences
            const transcript = deepgramResult?.result.results.channels[0].alternatives[0].transcript //transcript
            const deepgramMap = deepgramResult?.extractedData; //map of sentences to time

            const segmentResult = await segment(transcript); //getting topic and starting sentences
            const startingSentences = segmentResult?.starting_sentences; //starting sentences
            const topicNames = segmentResult?.topics; //topics
            const notes = segmentResult?.notes; //notes
            const startingTimes: number[] = [];
            if(startingSentences){
                for (const startingSentence of startingSentences){
                    if(startingSentence.split('.').length - 1 === 1){
                        startingTimes.push(deepgramMap?.get(startingSentence) ? deepgramMap?.get(startingSentence) : -1);
                    }
                    else {
                        const splitSentences = startingSentence.split('.');
                        let time = 0;
                        for (const sentence of splitSentences){
                            time = deepgramMap?.get(sentence) ? deepgramMap?.get(sentence) : -1;
                            if(time !== -1){
                                startingTimes.push(time);
                                break;
                            }
                        }
                    }
                }
            }
            const roundedStartingTimes = startingTimes.map(time => Math.round(time * 100) / 100);

            console.log(topicNames);
            console.log(startingSentences);
            console.log(roundedStartingTimes);
            
            //const trimmedUrls = await getTrimmedUrls(episodeData.audioUrl, roundedStartingTimes);
            const trimmedUrls = await callTrimAudioEndpoint(episodeData.audioUrl, []);
            const combinedArray = topicNames?.map((topicName, index) => {
                return {
                    topicName: topicName,
                    trimmedUrl: trimmedUrls ? trimmedUrls[index] : undefined,
                    notes: notes ? notes[index] : ''
                };
            });
            await setDoc(doc(episodesCollectionRef, episodeData.title), {
                podcastName: podcastName || null,
                image: image || null,
                loading: false,
                transcript: transcript || null,
                // topics: combinedArray || [],
                trimmedUrls: trimmedUrls || [],
                //notes: notes || null,
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