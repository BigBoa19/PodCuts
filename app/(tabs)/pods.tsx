import React from 'react'; import { UserContext } from '../context';
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import icons from '@/constants/icons';
import FormField from '../components/FormField'; import FloatingPlayer from './floatingPlayer';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore'; import { db } from '../firebase';
import CustomButton from '../components/CustomButton';

const Pods = () => { 
  const handleNavigateSettings = () => {router.navigate("/settings")}
  const handleNavigateAdd = () => {router.navigate("/add")}
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [podcastEpisodes, setPodcastEpisodes] = React.useState<any[]>([]);
  const [filteredPodcastEpisodes, setFilteredPodcastEpisodes] = React.useState<any[]>([]);
  const navigation = useNavigation();
  const previousScreen = navigation.getState().routes[navigation.getState().index - 1]?.name;
  const { user } = React.useContext(UserContext);
  
  const getUserEpisodes = async () => {
    setIsLoading(true);
    try {
      const usersDocRef = doc(db, 'users', user?.uid || '');
      const episodesCollectionRef = collection(usersDocRef, 'episodes');
      const q = query(episodesCollectionRef);
      const querySnapshot = await getDocs(q);
      const episodes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      return episodes;
    } catch(error) {
      console.error('Error getting documents: ', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const deleteEpisode = (id: string) => async () => {
    try {
      const usersDocRef = doc(db, 'users', user?.uid || '');
      const episodesCollectionRef = collection(usersDocRef, 'episodes');
      const episodeDocRef = doc(episodesCollectionRef, id);
      await deleteDoc(episodeDocRef);
      const updatedEpisodes = podcastEpisodes.filter((episode) => episode.id !== id);
      setPodcastEpisodes(updatedEpisodes);
      setFilteredPodcastEpisodes(updatedEpisodes);
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  }
  
  useFocusEffect(
    React.useCallback(() => {
      if(previousScreen === 'podcast'){
        getUserEpisodes().then((episodes) => {
          setPodcastEpisodes(episodes);
          setFilteredPodcastEpisodes(episodes);
        });
      }
    }, [])
  );

  React.useEffect(() => {
    getUserEpisodes().then((episodes) => {
      setPodcastEpisodes(episodes);
      setFilteredPodcastEpisodes(episodes);
    });
  },[user])


  React.useEffect(() => {
    const newData = podcastEpisodes.filter((item) => {
      const itemData = item.title ? item.title.toUpperCase() : ''.toUpperCase();
      const textData = searchTerm.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    setFilteredPodcastEpisodes(newData);
  }, [searchTerm, podcastEpisodes])
  
  return (
    <SafeAreaView className='flex-1 bg-secondary'>
      {/* Navigation/Title */}
      <View className='flex-row justify-between items-center pt-4'>
        <View className='flex-row items-center justify-between px-3 py-1'>
          <Text className="text-tertiary text-2xl font-poppinsBold">Your PodCuts</Text>
          <TouchableOpacity onPress={handleNavigateAdd} className='px-1'>
            <Image source={icons.plus} resizeMode='contain' className='w-[22px] h-[22px]' style={{tintColor: '#2e2a72'}} />
          </TouchableOpacity>
        </View>
          <TouchableOpacity onPress={handleNavigateSettings} className='p-3'>
            <Image source={icons.settings} resizeMode='contain' className='w-[26px] h-[26px]' style={{tintColor: '#2e2a72'}} />
          </TouchableOpacity>
      </View>
      {/* Search Bar */}
      <FormField
          value={searchTerm} placeholder='Search for Episodes' handleChangeText={(e) => setSearchTerm(e)}
          otherStyles='w-full relative px-2' startCaps={true}
      />
      {/* List */}
      {isLoading ? <ActivityIndicator size="large" color="#2e2a72" className='p-3'/> : 
        <ScrollView className="bg-secondary flex-1 p-3">
          {filteredPodcastEpisodes.map((pod) => ( 
            <TouchableOpacity key={pod.id} className="my-1 flex-row items-center space-x-4 p-0.5 border-2 border-primary rounded-lg bg-secondary shadow-lg" 
            onPress={() => 
              router.push({
              pathname: "/podcut",
              params: { id: pod.id, title: pod.title, podcastName: pod.podcastName, image: pod.image, audioUrl: pod.audioUrl, transcript: pod.transcript}})}>
              <Image source={{ uri: pod.image }} className="w-[72px] h-[72px] rounded-lg" />
              <View className='flex-1 justify-center'>
                <Text className="text-sm font-poppinsSemiBold flex-shrink text-tertiary" numberOfLines={2} ellipsizeMode="tail">{pod.title}</Text>
                <Text className="text-sm font-poppinsRegular flex-shrink text-tertiary" numberOfLines={1} ellipsizeMode="tail">{pod.podcastName}</Text>
              </View>
              <CustomButton title="Delete" textStyles='text-sm' containerStyles='p-1' handlePress={deleteEpisode(pod.id)} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      }
      <FloatingPlayer />
    </SafeAreaView>
  );
}

export default Pods