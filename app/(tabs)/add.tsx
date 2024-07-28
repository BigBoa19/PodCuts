import { View, Text, SafeAreaView, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import React from 'react'
import fetchPodcastData from '@/functions/fetchPodcastData';
import icons from '@/constants/icons';
import { router } from 'expo-router';
import FormField from '../components/FormField';

const Add = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [podcasts, setPodcasts] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleGoBack = () => {router.back()}

    const getPodcasts = async () => {
        setIsLoading(true);
        setPodcasts(await fetchPodcastData(searchTerm));
        setIsLoading(false);
    }

    return (
        <SafeAreaView className='flex-1 bg-secondary'>
            {/* Back Button */}
            <View className='flex-row items-center justify-between pt-2'>
                <TouchableOpacity onPress={handleGoBack} className='px-4 absolute pt-2'>
                    <Image source={icons.leftArrow} resizeMode='contain' className='w-[20px] h-[20px]' tintColor={"#2e2a72"} />
                </TouchableOpacity>
                <Text className="text-2xl text-tertiary font-poppinsBold mx-auto py-2">Add Podcasts</Text>
            </View>
            
            {/* Title */}
            
            {/* Search Bar */}
            <View className='px-1 flex-row justify-end items-center'>
                <FormField
                    value={searchTerm}
                    placeholder='Search for Podcasts'
                    handleChangeText={(e) => setSearchTerm(e)}
                    otherStyles='mt-2 w-full relative'
                    startCaps={true}
                />
                <TouchableOpacity onPress={() => {getPodcasts()}} className='absolute'>
                    <Image source={icons.search} resizeMode='contain' className='w-5 h-5 mt-2 right-5' tintColor={"#2e2a72"}/>
                </TouchableOpacity>
            </View>
            {/* List of Podcasts */}
            {isLoading ? <ActivityIndicator size="large" color="#2e2a72" className='p-3'/> :
                <FlatList className='px-2'
                    data={podcasts}
                    keyExtractor={(item) => item.trackId.toString()}
                    renderItem={({ item }) => (
                    <View>
                        <PodcastCard item={item} />
                    </View>
                    )}
                />
            }
        </SafeAreaView>
    )
}

const PodcastCard = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity key={item.trackId} className="my-1 flex-row items-center space-x-4 p-0.5 border-2 border-gray-200 rounded-lg bg-secondary shadow-lg"
      onPress={() => {
        router.push({
          pathname: "/podcast",
          params: { id: item.trackId, image: item.artworkUrl600, podcastName: item.trackName, feedUrl: item.feedUrl}})}}>
        <Image source={{ uri: item.artworkUrl600 }} className="w-[72px] h-[72px] rounded-lg" />
        <View className='flex-1 justify-center'>
          <Text className="text-sm font-poppinsSemiBold flex-shrink text-tertiary" numberOfLines={2} ellipsizeMode="tail">{item.trackName}</Text>
        </View>
      </TouchableOpacity>
    );
};

export default Add