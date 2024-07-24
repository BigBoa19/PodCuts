import { db } from '../app/firebase';
import { addDoc, collection, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export const addEpisodeToUser = async (user: User | null, episodeData: object) => {
    try {
      const usersDocRef = doc(db, 'users', user?.uid || '');
      const episodesCollectionRef = collection(usersDocRef, 'episodes');
      const docRef = await addDoc(episodesCollectionRef, {
        episodeData,
        user: user?.uid
    });
      console.log('Document written with ID: ', docRef.id);
    } catch(error) {
      console.error('Error adding episode: ', error);
    }
  };
  