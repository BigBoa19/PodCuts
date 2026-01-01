import React from 'react'; import { UserContext } from '../context';
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import FormField from '../components/FormField'; import FloatingPlayer from './floatingPlayer';
import { router } from 'expo-router';
import { collection, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore'; import { db } from '../firebase';
import CustomButton from '../components/CustomButton';
import { AntDesign, FontAwesome5, FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { PodcastEpisode } from '@/services/getPodcastData';

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
      const episodesData: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      const episodes: any[] = episodesData.map((episode: any) => ({
        id: episode.id || '',
        title: episode.title || '',
        podcastName: episode.podcastName || '',
        image: episode.image || null,
        audioUrl: episode.audioUrl || '',
        transcript: episode.transcript || null,
        datePublished: episode.datePublished || '',
        duration: episode.duration || 0,
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
      <View className='flex-row justify-between items-center pt-4 px-3 py-1 w-full'>
        <View className='flex-row items-center flex-shrink'>
          <Text className="text-tertiary text-2xl font-poppinsBold">Your PodCuts</Text>
          <TouchableOpacity onPress={handleNavigateAdd} className='px-1 ml-1'>
            <FontAwesome6 name="plus" size={20} color="#2e2a72" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleNavigateSettings} className='p-3 flex-shrink-0'>
          <FontAwesome6 name="gear" size={20} color="#2e2a72" />
        </TouchableOpacity>
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
              router.push({
              pathname: '/podcut',
              params: { id: pod.id, title: pod.title, podcastName: pod.podcastName, image: pod.image, audioUrl: pod.audioUrl, transcript: pod.transcript}})}}>
              <Image source={{ uri: pod.image }} className="w-[72px] h-[72px] rounded-lg" />
              <View className='flex-1 justify-center'>
                <Text className="text-sm font-poppinsSemiBold flex-shrink text-tertiary" numberOfLines={2} ellipsizeMode="tail">{pod.title}</Text>
                <Text className="text-sm font-poppinsRegular flex-shrink text-tertiary" numberOfLines={1} ellipsizeMode="tail">{pod.podcastName}</Text>
              </View>
              <TouchableOpacity onPress={showDeleteAlert(pod.id)} className='p-2'>
                <FontAwesome6 name="trash" size={20} color="#A30000" />
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