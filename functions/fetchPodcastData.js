import axios from 'axios'

const fetchPodcastData = async (searchTerm) => {
    try {
        const response = await axios.get(`https://itunes.apple.com/search?term=${searchTerm}&entity=podcast`);
        return response.data.results;
    } catch (error) {
        console.error('Error searching podcasts:', error);
        return null
    }
};

export default fetchPodcastData;
