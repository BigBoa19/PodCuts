import React from 'react'; import { UserContext } from '../context';
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import icons from '@/constants/icons';
import FormField from '../components/FormField'; import FloatingPlayer from './floatingPlayer';
import { router } from 'expo-router';
import { collection, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore'; import { db } from '../firebase';
import CustomButton from '../components/CustomButton';
import TrackPlayer from 'react-native-track-player';

const Pods = () => { 
  const handleNavigateSettings = () => {router.push("/settings")}
  const handleNavigateAdd = () => {router.push("/add")}
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [podcastEpisodes, setPodcastEpisodes] = React.useState<any[]>([]);
  const [filteredPodcastEpisodes, setFilteredPodcastEpisodes] = React.useState<any[]>([]);
  const { user } = React.useContext(UserContext);

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

  const showDeleteAlert = (id: string) => {
    return () => {
      Alert.alert(
        "Delete Episode",
        "Are you sure you want to delete this episode?",
        [
          {
            text: "Cancel",
            onPress: () => {},
            style: "cancel"
          },
          { text: "Delete", onPress: deleteEpisode(id) }
        ]
      );
    }
  }

  React.useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const usersDocRef = doc(db, 'users', user?.uid || '');
    const episodesCollectionRef = collection(usersDocRef, 'episodes');
    const q = query(episodesCollectionRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const episodes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPodcastEpisodes(episodes);
      setFilteredPodcastEpisodes(episodes);
      setIsLoading(false);
    }, (error) => {
      console.error('Error getting documents: ', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);


  React.useEffect(() => {
    const newData = podcastEpisodes.filter((item) => {
      const itemData = item.title ? item.title.toUpperCase() : ''.toUpperCase();
      const textData = searchTerm.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    setFilteredPodcastEpisodes(newData);
  }, [searchTerm, podcastEpisodes])
  
  return (
    <SafeAreaView className='flex-1 bg-secondary items-center'>
      {/* Navigation/Title */}
      <View className='flex-row justify-between items-center pt-4'>
        <View className='flex-row items-center justify-between px-3 py-1'>
          <Text className="text-tertiary text-2xl font-poppinsBold">Your PodCuts!</Text>
          <TouchableOpacity onPress={handleNavigateAdd} className='px-1'>
            <Image source={icons.plus} resizeMode='contain' className='w-[22px] h-[22px]' style={{tintColor: '#2e2a72'}} />
          </TouchableOpacity>
        </View>
          <View className='flex-row items-center justify-end'>
            <CustomButton title="View Saved" textStyles='text-base' containerStyles='p-2' handlePress={() => {router.push("/saved")}} />
            <TouchableOpacity onPress={handleNavigateSettings} className='p-3'>
              <Image source={icons.settings} resizeMode='contain' className='w-[26px] h-[26px]' style={{tintColor: '#2e2a72'}} />
            </TouchableOpacity>
          </View>
      </View>
      {/* Search Bar */}
      <FormField
          value={searchTerm} placeholder='Search for Episodes' handleChangeText={(e) => setSearchTerm(e)}
          otherStyles='w-full relative px-2' startCaps={true}
      />
      {(filteredPodcastEpisodes.length === 0 && !isLoading ) && <Text className='text-center text-tertiary font-poppinsRegular'>No Episodes Found</Text>}
      {/* List */}
      {isLoading ? <ActivityIndicator size="large" color="#2e2a72" className='p-3'/> : 
        <ScrollView className="bg-secondary flex-1 p-3 w-full pb-10">
          {filteredPodcastEpisodes.map((pod) => ( 
            <TouchableOpacity key={pod.id} className="my-1 flex-row items-center space-x-4 p-0.5 border-2 border-primary rounded-lg bg-secondary shadow-lg" 
            onPress={() => {
              if (pod.loading) return;
              router.push({
              pathname: "/podcut",
              params: { id: pod.id, title: pod.title, podcastName: pod.podcastName, image: pod.image, audioUrl: pod.audioUrl, transcript: pod.transcript}})}}>
              <Image source={{ uri: pod.image }} className="w-[72px] h-[72px] rounded-lg" />
              <View className='flex-1 justify-center'>
                <Text className="text-sm font-poppinsSemiBold flex-shrink text-tertiary" numberOfLines={2} ellipsizeMode="tail">{pod.title}</Text>
                <Text className="text-sm font-poppinsRegular flex-shrink text-tertiary" numberOfLines={1} ellipsizeMode="tail">{pod.podcastName}</Text>
                
                {pod.loading && 
                <View className='flex-row'>
                  <Text className="text-sm font-poppinsBold flex-shrink text-tertiary">Preparing Cuts...</Text>
                  <CustomButton title="Listen to episode" containerStyles='p-2' textStyles='text-sm' handlePress={() => {
                    TrackPlayer.reset();
                    TrackPlayer.add({
                        id: 0,
                        url: pod.audioUrl,
                        title: pod.title,
                        artist: pod.podcastName,
                        artwork: pod.image || "",
                    });
                    TrackPlayer.play();
                  }} />
                </View>
                }
              </View>
              <TouchableOpacity onPress={showDeleteAlert(pod.id)} className='p-2'>
                <Image source={icons.trash} resizeMode='contain' className='w-[22px] h-[22px]' style={{tintColor: '#A30000'}} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <Text className='text-3xl opacity-0'>Invisible Padding{'\n'}Invisible Padding</Text>
        </ScrollView>
      }
      <FloatingPlayer />
    </SafeAreaView>
  );
}

export default Pods